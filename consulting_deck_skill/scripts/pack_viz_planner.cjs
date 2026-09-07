#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const { collect, describe, compatible, sha, git, parseArgs } = require('./load_viz_planner.cjs');
const NAME = 'echarts-viz-planner';
const REPOSITORY = 'https://github.com/ZeroxZhang/echarts-viz-planner';

function packPlanner({ source, outputDir }) {
  if (!source || !outputDir) throw new Error('必须提供 --source 与 --output-dir');
  const root = fs.realpathSync(source);
  // 在创建目录或写文件前检查真实父路径，避免从软链入口覆盖源码。
  let ancestor = path.resolve(outputDir);
  const suffix = [];
  while (!fs.existsSync(ancestor)) { suffix.unshift(path.basename(ancestor)); ancestor = path.dirname(ancestor); }
  const out = path.join(fs.realpathSync(ancestor), ...suffix);
  if (out === root || out.startsWith(root + path.sep)) throw new Error('分发输出不能位于上游源码内部');
  const files = collect(root);
  compatible(files);
  const descriptor = describe(files);
  let baseRevision = null;
  let dirty = null;
  let fetchRevision = null;
  try {
    if (fs.realpathSync(git(['rev-parse', '--show-toplevel'], root)) === root) {
      baseRevision = git(['rev-parse', 'HEAD'], root);
      dirty = !!git(['status', '--porcelain', '--untracked-files=all'], root);
      // 干净工作树仍可能包含被忽略的运行文件；逐项与提交内容比较后才允许远程复现。
      if (!dirty && Object.entries(files).every(([p, value]) => {
        try { return git(['show', `${baseRevision}:${p}`], root, false) === value; } catch (_) { return false; }
      })) fetchRevision = baseRevision;
    }
  } catch (_) { /* 无 Git 元数据的安装仍可打包，明确保留来源未知。 */ }
  const bundle = zlib.gzipSync(Buffer.from(JSON.stringify({ format: 1, files })), { level: 9, mtime: 0 });
  const lock = { format: 1, name: NAME, repository: REPOSITORY, base_revision: baseRevision,
    source_dirty: dirty, fetch_revision: fetchRevision, source_sha256: descriptor.source_sha256,
    bundle_sha256: sha(bundle), bundle_bytes: bundle.length, file_count: descriptor.entries.length, files: descriptor.entries };
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, `${NAME}.bundle.json.gz`), bundle);
  fs.writeFileSync(path.join(out, `${NAME}.lock.json`), JSON.stringify(lock, null, 2) + '\n');
  return { status: 'ok', output_dir: out, source_sha256: lock.source_sha256, files: lock.files.length,
    bundle_bytes: bundle.length, base_revision: baseRevision, source_dirty: dirty, fetch_revision: fetchRevision };
}

if (require.main === module) {
  try {
    const args = parseArgs(process.argv.slice(2), ['--source', '--output-dir'], ['--help']);
    if (args.help) console.log('Usage: node scripts/pack_viz_planner.cjs --source PATH --output-dir PATH');
    else console.log(JSON.stringify(packPlanner({ source: args.source, outputDir: args['output-dir'] }), null, 2));
  } catch (error) { console.error(JSON.stringify({ status: 'error', reason: error.message })); process.exitCode = 1; }
}

module.exports = { packPlanner };
