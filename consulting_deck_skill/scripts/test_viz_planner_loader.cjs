#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const zlib = require('node:zlib');
const { loadPlanner, readBundle, describe, sha, git, collect } = require('./load_viz_planner.cjs');
const { packPlanner } = require('./pack_viz_planner.cjs');

const temp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'test-viz-planner-')));
let checks = 0;
function check(label, run) { run(); checks++; console.log(`PASS ${label}`); }
function put(root, relative, value) {
  fs.mkdirSync(path.dirname(path.join(root, relative)), { recursive: true });
  fs.writeFileSync(path.join(root, relative), value);
}
function fixture(name, modern = true) {
  const root = path.join(temp, name);
  put(root, 'SKILL.md', '# Planner\nRead references/api-contract.md.\n');
  put(root, 'capabilities.json', JSON.stringify({ name: 'echarts-viz-planner', contract_versions: modern ? ['1.0', '1.1'] : ['1.0'], output_levels: modern ? ['implementation', 'decision'] : ['implementation'], echarts_version: '6.1.0', required_files: ['catalog/details/comparison.yaml','references/selection.md'] }));
  for (const p of ['catalog/index.md', 'references/api-contract.md', 'schemas/plan.schema.json', 'scripts/validate_plan.py']) put(root, p, '# fixture\n');
  for (const p of ['catalog/details/comparison.yaml','references/selection.md']) put(root, p, '# runtime resource\n');
  return root;
}
try {
  const source = fixture('source');
  const skillRoot = path.join(temp, 'standalone-main-skill');
  const deps = path.join(skillRoot, 'dependencies');
  const home = path.join(temp, 'empty-home');
  const options = { home, skillRoot, env: {}, offline: true, searchPaths: [] };
  const packed = packPlanner({ source, outputDir: deps });
  const bundleFile = path.join(deps, 'echarts-viz-planner.bundle.json.gz');
  const lockFile = path.join(deps, 'echarts-viz-planner.lock.json');
  const originalBundle = fs.readFileSync(bundleFile);
  let result;
  check('仅安装主技能，空 home、空本地入口、离线解包成功', () => {
    result = loadPlanner(options);
    assert.equal(result.status, 'ok'); assert.equal(result.origin, 'bundled-snapshot');
    assert.ok(fs.existsSync(result.skill_file)); assert.equal(result.source_sha256, packed.source_sha256);
  });
  check('缓存复用前读取实际文件', () => {
    assert.equal(loadPlanner(options).origin, 'cache');
    fs.writeFileSync(path.join(result.skill_root, 'SKILL.md'), 'corrupted');
    const repaired = loadPlanner(options);
    assert.equal(repaired.origin, 'bundled-snapshot');
    assert.ok(repaired.attempts.some(a => a.origin === 'cache' && a.status === 'invalid'));
    assert.equal(fs.readFileSync(repaired.skill_file, 'utf8'), fs.readFileSync(path.join(source, 'SKILL.md'), 'utf8'));
  });
  check('兼容显式路径优先，环境入口次之，不写原技能', () => {
    const explicit = fixture('explicit');
    assert.equal(loadPlanner({ ...options, planner: explicit }).skill_root, explicit);
    assert.equal(loadPlanner({ ...options, env: { ECHARTS_VIZ_PLANNER_PATH: source } }).origin, 'environment');
    assert.equal(loadPlanner({ ...options, planner: explicit, env: { ECHARTS_VIZ_PLANNER_PATH: source } }).origin, 'explicit');
  });
  check('旧本地契约与不兼容显式路径有记录并退回快照', () => {
    const old = fixture('old', false);
    const fallback = loadPlanner({ ...options, planner: old, searchPaths: [old] });
    assert.equal(fallback.status, 'ok'); assert.equal(fallback.origin, 'cache');
    assert.ok(fallback.attempts.some(a => a.origin === 'explicit' && a.status === 'incompatible'));
    assert.equal(JSON.parse(fs.readFileSync(path.join(old, 'capabilities.json'))).contract_versions.length, 1);
  });
  check('残缺本地安装不能遮蔽完整快照', () => {
    const incomplete = fixture('incomplete');
    fs.unlinkSync(path.join(incomplete, 'catalog/details/comparison.yaml'));
    const fallback = loadPlanner({ ...options, planner: incomplete });
    assert.equal(fallback.origin, 'cache');
    assert.ok(fallback.attempts.some(a => a.status === 'incompatible' && a.reason.includes('catalog/details/comparison.yaml')));
    const missingManifest = fixture('missing-manifest');
    const meta = JSON.parse(fs.readFileSync(path.join(missingManifest, 'capabilities.json')));
    delete meta.required_files;
    put(missingManifest, 'capabilities.json', JSON.stringify(meta));
    assert.equal(loadPlanner({ ...options, planner: missingManifest }).origin, 'cache');
  });
  check('跨工具入口支持 symlink，仅解析不复制原入口', () => {
    const local = path.join(home, '.claude', 'skills', 'echarts-viz-planner');
    fs.mkdirSync(path.dirname(local), { recursive: true }); fs.symlinkSync(source, local, 'dir');
    assert.equal(loadPlanner({ ...options, searchPaths: undefined }).skill_root, source);
    fs.unlinkSync(local);
  });
  check('包重复生成字节一致、只打包运行源码', () => {
    put(source, 'tests/private.csv', 'secret fixture'); put(source, 'node_modules/pkg/index.js', 'ignored');
    packPlanner({ source, outputDir: deps });
    assert.deepEqual(fs.readFileSync(bundleFile), originalBundle);
    assert.equal(packed.fetch_revision, null);
    assert.throws(() => packPlanner({ source, outputDir: path.join(source, 'nested') }), /上游源码内部/);
  });
  check('拒绝快照路径逃逸和被篡改的压缩内容', () => {
    const malicious = path.join(temp, 'malicious.gz');
    const raw = zlib.gzipSync(JSON.stringify({ format: 1, files: { '../escaped.txt': 'escape' } }));
    fs.writeFileSync(malicious, raw);
    const lock = JSON.parse(fs.readFileSync(lockFile)); lock.bundle_sha256 = sha(raw);
    assert.throws(() => readBundle(malicious, lock), /非法快照路径/);
    const corrupted = Buffer.from(originalBundle); corrupted[corrupted.length - 1] ^= 1;
    fs.writeFileSync(bundleFile, corrupted);
    const unavailable = loadPlanner({ ...options, cacheDir: path.join(temp, 'fresh-corrupt-cache') });
    assert.equal(unavailable.status, 'unavailable');
    assert.ok(unavailable.attempts.some(a => a.reason && a.reason.includes('摘要不匹配')));
    fs.writeFileSync(bundleFile, originalBundle);
  });
  check('拒绝运行文件 symlink 和超限内容', () => {
    const linkSource = fixture('link-source');
    fs.unlinkSync(path.join(linkSource, 'catalog/index.md'));
    fs.symlinkSync(path.join(source, 'catalog/index.md'), path.join(linkSource, 'catalog/index.md'));
    assert.throws(() => collect(linkSource), /符号链接/);
    const large = fixture('large'); fs.writeFileSync(path.join(large, 'catalog/large.md'), Buffer.alloc(24 * 1024 * 1024 + 1));
    assert.throws(() => collect(large), /超过/);
  });
  check('无包无网络返回合法失败，旧显式入口返回 incompatible', () => {
    const empty = { ...options, skillRoot: path.join(temp, 'missing-main-skill') };
    assert.equal(loadPlanner(empty).status, 'unavailable');
    assert.equal(loadPlanner({ ...empty, planner: path.join(temp, 'old') }).status, 'incompatible');
    fs.renameSync(bundleFile, bundleFile + '.saved');
    const missingBundle = loadPlanner({ ...options, cacheDir: path.join(temp, 'fresh-missing-cache') });
    assert.equal(missingBundle.status, 'unavailable');
    assert.ok(missingBundle.attempts.some(a => a.reason === 'offline 模式'));
    fs.renameSync(bundleFile + '.saved', bundleFile);
  });
  check('固定提交取源码：本地 git 夹具，无网络、无 HEAD 猜测', () => {
    const repository = fixture('repository');
    git(['init', '--quiet'], repository);
    git(['add', '.'], repository);
    git(['-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', '-c', 'commit.gpgsign=false', 'commit', '--quiet', '-m', 'fixture'], repository);
    const fetchRoot = path.join(temp, 'fetch-main-skill');
    const fetchDeps = path.join(fetchRoot, 'dependencies');
    const clean = packPlanner({ source: repository, outputDir: fetchDeps });
    assert.match(clean.fetch_revision, /^[a-f0-9]{40}$/); assert.equal(clean.source_dirty, false);
    const fetchedLockFile = path.join(fetchDeps, 'echarts-viz-planner.lock.json');
    const lock = JSON.parse(fs.readFileSync(fetchedLockFile)); lock.repository = repository;
    fs.writeFileSync(fetchedLockFile, JSON.stringify(lock));
    fs.unlinkSync(path.join(fetchDeps, 'echarts-viz-planner.bundle.json.gz'));
    const fetched = loadPlanner({ ...options, skillRoot: fetchRoot, cacheDir: path.join(temp, 'fetch-cache'), offline: false });
    assert.equal(fetched.status, 'ok', JSON.stringify(fetched)); assert.equal(fetched.origin, 'pinned-source');
    put(repository, 'SKILL.md', '# locally edited\n');
    const dirty = packPlanner({ source: repository, outputDir: fetchDeps });
    assert.equal(dirty.source_dirty, true); assert.equal(dirty.fetch_revision, null);
  });
  check('解压后内容即使压缩摘要正确仍须匹配每个文件', () => {
    const lock = JSON.parse(fs.readFileSync(lockFile));
    const files = collect(source); files['SKILL.md'] += 'tamper';
    const raw = zlib.gzipSync(JSON.stringify({ format: 1, files })); lock.bundle_sha256 = sha(raw);
    const file = path.join(temp, 'wrong-content.gz'); fs.writeFileSync(file, raw);
    assert.throws(() => readBundle(file, lock), /内容与 lock 不一致/);
    assert.notEqual(describe(files).source_sha256, lock.source_sha256);
  });
  console.log(`${checks} loader checks passed; temporary files cleaned.`);
} finally { fs.rmSync(temp, { recursive: true, force: true }); }
