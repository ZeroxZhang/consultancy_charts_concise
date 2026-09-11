#!/usr/bin/env node
'use strict';

// 只解析、校验和解包技能源码；不会执行其中的脚本或进行全局安装。
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const { execFileSync } = require('node:child_process');

const NAME = 'echarts-viz-planner';
const LIMIT = 24 * 1024 * 1024;
const REQUIRED = ['SKILL.md', 'capabilities.json', 'catalog/index.md', 'references/api-contract.md', 'schemas/plan.schema.json', 'scripts/validate_plan.py'];
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const allowed = p => ['SKILL.md', 'capabilities.json', 'LICENSE'].includes(p)
  || /^(catalog|references|schemas|templates)\//.test(p)
  || /^scripts\/(validate_plan|profile_data|check_version)\.py$/.test(p);

function safePath(p) {
  if (typeof p !== 'string' || !p || p.includes('\\') || p.includes('\0') || p.startsWith('/')
      || p.split('/').some(v => !v || v === '.' || v === '..') || !allowed(p)) {
    throw new Error(`非法快照路径：${p}`);
  }
  return p;
}

function plainObject(v) { return !!v && typeof v === 'object' && !Array.isArray(v); }

function collect(source) {
  const root = fs.realpathSync(source);
  const files = {};
  let bytes = 0;
  function walk(relative) {
    const absolute = path.join(root, relative);
    const stat = fs.lstatSync(absolute);
    if (stat.isSymbolicLink()) throw new Error(`分发源码不允许符号链接：${relative}`);
    if (stat.isDirectory()) {
      for (const name of fs.readdirSync(absolute).sort()) walk(relative ? `${relative}/${name}` : name);
    } else if (stat.isFile() && allowed(relative)) {
      safePath(relative);
      if (stat.size > LIMIT || (bytes += stat.size) > LIMIT) throw new Error('源码超过 24 MiB 限制');
      const raw = fs.readFileSync(absolute);
      const value = raw.toString('utf8');
      if (!Buffer.from(value, 'utf8').equals(raw)) throw new Error(`不是 UTF-8 源码：${relative}`);
      files[relative] = value;
    }
  }
  // 只遍历运行依赖，忽略仓库、测试数据、缓存和用户输入。
  for (const name of ['SKILL.md', 'capabilities.json', 'LICENSE', 'catalog', 'references', 'schemas', 'templates', 'scripts']) {
    const absolute = path.join(root, name);
    if (!fs.existsSync(absolute)) continue;
    if (name === 'scripts') {
      if (fs.lstatSync(absolute).isSymbolicLink()) throw new Error('scripts 不允许符号链接');
      for (const script of ['validate_plan.py', 'profile_data.py', 'check_version.py']) {
        if (fs.existsSync(path.join(absolute, script))) walk(`scripts/${script}`);
      }
    } else walk(name);
  }
  return Object.fromEntries(Object.keys(files).sort().map(p => [p, files[p]]));
}

function describe(files) {
  const entries = Object.keys(files).sort().map(p => ({ path: safePath(p), sha256: sha(files[p]), bytes: Buffer.byteLength(files[p]) }));
  return { entries, source_sha256: sha(JSON.stringify(entries)) };
}

function compatible(files) {
  for (const p of REQUIRED) if (!Object.hasOwn(files, p)) throw new Error(`缺少 ${p}`);
  const c = JSON.parse(files['capabilities.json']);
  if (c.name !== NAME || !Array.isArray(c.contract_versions) || !c.contract_versions.includes('1.1')
      || !Array.isArray(c.output_levels) || !c.output_levels.includes('decision') || c.echarts_version !== '6.1.0') {
    throw new Error('需要 echarts-viz-planner 契约 1.1、decision 输出及 ECharts 6.1.0');
  }
  // 运行资源由上游声明，避免残缺安装遮蔽完整快照，也不在主技能复制目录知识。
  if (!Array.isArray(c.required_files) || !c.required_files.length) throw new Error('缺少运行资源清单 required_files');
  for (const p of c.required_files) {
    safePath(p);
    if (!Object.hasOwn(files, p)) throw new Error(`运行资源不完整：缺少 ${p}`);
  }
}

function readLock(file) {
  if (fs.statSync(file).size > 1024 * 1024) throw new Error('lock 超过大小限制');
  const lock = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (lock.format !== 1 || lock.name !== NAME || !Array.isArray(lock.files) || !lock.files.length || lock.files.length > 10000) throw new Error('不支持的 lock 格式');
  const seen = new Set();
  let total = 0;
  for (const item of lock.files) {
    safePath(item.path);
    if (seen.has(item.path) || !/^[a-f0-9]{64}$/.test(item.sha256) || !Number.isSafeInteger(item.bytes) || item.bytes < 0) throw new Error('lock 文件记录不合法');
    seen.add(item.path);
    total += item.bytes;
  }
  if (total > LIMIT || sha(JSON.stringify(lock.files)) !== lock.source_sha256) throw new Error('lock 内容摘要不匹配或超限');
  return lock;
}

function verify(files, lock) {
  compatible(files);
  if (describe(files).source_sha256 !== lock.source_sha256) throw new Error('源码内容与 lock 不一致');
}

function readBundle(file, lock) {
  if (!/^[a-f0-9]{64}$/.test(lock.bundle_sha256) || fs.statSync(file).size > LIMIT) throw new Error('快照摘要缺失或超限');
  const raw = fs.readFileSync(file);
  if (sha(raw) !== lock.bundle_sha256) throw new Error('压缩快照摘要不匹配');
  const bundle = JSON.parse(zlib.gunzipSync(raw, { maxOutputLength: LIMIT }).toString('utf8'));
  if (bundle.format !== 1 || !plainObject(bundle.files)) throw new Error('不支持的快照格式');
  for (const [p, content] of Object.entries(bundle.files)) {
    safePath(p);
    if (typeof content !== 'string') throw new Error(`源码不是文本：${p}`);
  }
  verify(bundle.files, lock);
  return bundle.files;
}

function git(args, cwd, trim = true) {
  // 禁用 checkout hooks 与自动子模块；仅获取固定提交中的源码。
  const result = execFileSync('git', ['-c', 'core.hooksPath=/dev/null', ...args], {
    cwd, encoding: 'utf8', timeout: 60000, maxBuffer: LIMIT,
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0', GIT_CONFIG_NOSYSTEM: '1' }, stdio: ['ignore', 'pipe', 'pipe']
  });
  return trim ? result.trim() : result;
}

function materialize(files, target, lock) {
  const parent = path.dirname(target);
  fs.mkdirSync(parent, { recursive: true, mode: 0o700 });
  const temporary = fs.mkdtempSync(path.join(parent, '.unpack-'));
  try {
    for (const [p, value] of Object.entries(files)) {
      const dest = path.join(temporary, safePath(p));
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, value, { flag: 'wx', mode: 0o600 });
    }
    verify(collect(temporary), lock);
    if (fs.existsSync(target)) {
      try { verify(collect(target), lock); return fs.realpathSync(target); } catch (_) { /* 损坏缓存仅位于私有内容地址下，可重建。 */ }
      fs.rmSync(target, { recursive: true, force: true });
    }
    fs.renameSync(temporary, target);
    return fs.realpathSync(target);
  } finally { fs.rmSync(temporary, { recursive: true, force: true }); }
}

/* 缓存目录可能落在沙箱或容器不可写的位置（$HOME 常被限制）；显式指定时只用它，
   默认则按可写性逐个回退，避免"默认命令必然失败"把选型整段跳过。 */
function cacheBases({ cacheDir, env, home, skillRoot }) {
  const explicit = cacheDir || env.CONSULTING_DECK_CACHE_DIR;
  const bases = [], add = value => { if (!value) return; const resolved = path.resolve(value); if (!bases.includes(resolved)) bases.push(resolved); };
  if (explicit) { add(explicit); return bases; }
  add(path.join(home, '.cache', 'consulting-deck-skill-concise'));
  add(path.join(skillRoot, '.cache'));
  add(path.join(os.tmpdir(), 'consulting-deck-skill-concise-cache'));
  return bases;
}

function findCached(lock, bases, attempts) {
  for (const base of bases) {
    const target = path.join(base, NAME, lock.source_sha256);
    if (!fs.existsSync(target)) continue;
    try { verify(collect(target), lock); return fs.realpathSync(target); }
    catch (error) { attempts.push({ origin: 'cache', path: base, status: 'invalid', reason: error.message }); }
  }
  return null;
}

function materializeInto(files, lock, bases, attempts, origin) {
  let lastError = null;
  for (const base of bases) {
    const target = path.join(base, NAME, lock.source_sha256);
    try { return materialize(files, target, lock); }
    catch (error) { lastError = error; attempts.push({ origin: path.basename(origin), path: base, status: 'unwritable', reason: error.message }); }
  }
  throw lastError || new Error('没有可写的缓存目录');
}

function loadPlanner(options = {}) {
  const home = options.home || os.homedir();
  const env = options.env || process.env;
  const skillRoot = options.skillRoot || path.resolve(__dirname, '..');
  const bases = cacheBases({ cacheDir: options.cacheDir, env, home, skillRoot });
  const attempts = [];
  let hadIncompatible = false;
  const seen = new Set();
  const discovered = options.searchPaths || [
    ...['.agents', '.codex', '.claude'].flatMap(dir => [NAME, 'echarts_viz_planner'].map(name => path.join(home, dir, 'skills', name))),
    ...(env.CODEX_HOME ? [path.join(env.CODEX_HOME, 'skills', NAME)] : []),
    path.join(path.dirname(skillRoot), NAME)
  ];
  const candidates = [
    [options.planner, 'explicit'], [env.ECHARTS_VIZ_PLANNER_PATH, 'environment'],
    ...discovered.map(candidate => [candidate, 'installed'])
  ];
  const success = (root, origin, digest) => ({ status: 'ok', skill_root: root, skill_file: path.join(root, 'SKILL.md'), origin,
    contract_version: '1.1', output_level: 'decision', source_sha256: digest, attempts });
  for (const [candidate, origin] of candidates) {
    if (!candidate || seen.has(path.resolve(candidate))) continue;
    seen.add(path.resolve(candidate));
    if (!fs.existsSync(candidate)) { attempts.push({ origin, path: candidate, status: 'missing' }); continue; }
    try {
      const root = fs.realpathSync(candidate);
      const files = collect(root);
      compatible(files);
      return success(root, origin, describe(files).source_sha256);
    } catch (error) {
      hadIncompatible = true;
      attempts.push({ origin, path: candidate, status: 'incompatible', reason: error.message });
    }
  }
  let lock;
  const deps = path.join(skillRoot, 'dependencies');
  try { lock = readLock(path.join(deps, `${NAME}.lock.json`)); }
  catch (error) { attempts.push({ origin: 'lock', status: 'unavailable', reason: error.message }); }
  if (lock) {
    const cached = findCached(lock, bases, attempts);
    if (cached) return success(cached, 'cache', lock.source_sha256);
    const bundlePath = path.join(deps, `${NAME}.bundle.json.gz`);
    const bundleExists = fs.existsSync(bundlePath);
    if (bundleExists) {
      try {
        const files = readBundle(bundlePath, lock);
        const root = materializeInto(files, lock, bases, attempts, 'bundled-snapshot');
        return success(root, 'bundled-snapshot', lock.source_sha256);
      } catch (error) { attempts.push({ origin: 'bundled-snapshot', status: 'invalid', reason: error.message }); }
    }
    // 存在但损坏的分发产物不被网络静默替换；只有确实缺少快照才使用可核对的固定源版本。
    if (!bundleExists && !options.offline && /^[a-f0-9]{40}$/.test(lock.fetch_revision || '') && typeof lock.repository === 'string') {
      let temporary;
      try {
        const repo = lock.repository;
        if (!/^https:\/\/[A-Za-z0-9.-]+\//.test(repo) && !path.isAbsolute(repo)) throw new Error('固定源码仓库仅允许 HTTPS 或本地绝对路径');
        temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'viz-planner-fetch-'));
        git(['init', '--quiet'], temporary);
        git(['-c', 'protocol.file.allow=always', 'fetch', '--quiet', '--depth=1', '--no-tags', '--', repo, lock.fetch_revision], temporary);
        git(['checkout', '--quiet', '--detach', 'FETCH_HEAD'], temporary);
        if (git(['rev-parse', 'HEAD'], temporary) !== lock.fetch_revision) throw new Error('获取的 revision 不匹配');
        const files = collect(temporary);
        verify(files, lock);
        const root = materializeInto(files, lock, bases, attempts, 'pinned-source');
        return success(root, 'pinned-source', lock.source_sha256);
      } catch (error) { attempts.push({ origin: 'pinned-source', status: 'unavailable', reason: error.message }); }
      finally { if (temporary) fs.rmSync(temporary, { recursive: true, force: true }); }
    } else if (!bundleExists) attempts.push({ origin: 'pinned-source', status: 'skipped', reason: options.offline ? 'offline 模式' : '没有与快照一致且已提交的固定 revision' });
  }
  return { status: hadIncompatible ? 'incompatible' : 'unavailable', attempts,
    reasons: attempts.filter(a => a.reason).map(a => a.reason),
    action: '可恢复主技能完整依赖快照，或在允许联网时从 https://github.com/ZeroxZhang/echarts-viz-planner 下载完整技能，用 --planner <下载目录> 校验契约 1.1、decision 与运行资源，并读取返回的实际来源及 skill_file。下载版不兼容时保留兼容快照；均不可用时说明未调用 planner 并继续主技能可完成的工作，不声称已完成专家委派。' };
}

function parseArgs(argv, switches, flags = []) {
  const result = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (flags.includes(arg)) result[arg.slice(2)] = true;
    else if (switches.includes(arg) && argv[i + 1] && !argv[i + 1].startsWith('--')) result[arg.slice(2)] = argv[++i];
    else throw new Error(`未知参数或缺少值：${arg}`);
  }
  return result;
}

if (require.main === module) {
  try {
    const args = parseArgs(process.argv.slice(2), ['--planner', '--cache-dir'], ['--offline', '--help']);
    if (args.help) console.log('Usage: node scripts/load_viz_planner.cjs [--planner PATH] [--cache-dir PATH] [--offline]');
    else {
      const result = loadPlanner({ planner: args.planner, cacheDir: args['cache-dir'], offline: args.offline });
      console.log(JSON.stringify(result, null, 2));
      process.exitCode = result.status === 'ok' ? 0 : result.status === 'incompatible' ? 3 : 2;
    }
  } catch (error) { console.log(JSON.stringify({ status: 'unavailable', reasons: [error.message], action: '检查命令参数与路径。' })); process.exitCode = 1; }
}

module.exports = { loadPlanner, cacheBases, findCached, materializeInto, collect, describe, compatible, verify, readLock, readBundle, safePath, sha, git, parseArgs };
