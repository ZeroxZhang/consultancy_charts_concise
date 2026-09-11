#!/usr/bin/env node
/* 把本机安装的 echarts-viz-planner 同步到随包快照锁定的那一版。
   只写快照里有的文件，不删除目标目录里的其他内容（例如上游仓库的 tests/）；
   写入前先按 lock 校验快照，避免把未核对的源码装到用户机器上。 */
'use strict';
const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const L = require('./load_viz_planner.cjs');

const NAME = 'echarts-viz-planner';

function targets(home, override) {
  if (override) return [path.resolve(override)];
  return [path.join(home, '.agents', 'skills', NAME)];
}

function plan(snapshot, target) {
  const changes = { create: [], update: [], keep: [] };
  for (const [relative, content] of Object.entries(snapshot)) {
    const file = path.join(target, relative);
    if (!fs.existsSync(file)) { changes.create.push(relative); continue; }
    const current = fs.readFileSync(file, 'utf8');
    if (current === content) changes.keep.push(relative);
    else changes.update.push(relative);
  }
  return changes;
}

function sync(options = {}) {
  const home = options.home || os.homedir();
  const deps = options.deps || path.resolve(__dirname, '..', 'dependencies');
  const lock = L.readLock(path.join(deps, NAME + '.lock.json'));
  const snapshot = L.readBundle(path.join(deps, NAME + '.bundle.json.gz'), lock);
  const report = { source_sha256: lock.source_sha256, lock_base_revision: lock.base_revision, targets: [] };
  for (const target of targets(home, options.target)) {
    const exists = fs.existsSync(target);
    if (exists) {
      const entries = fs.readdirSync(target);
      if (entries.length && !fs.existsSync(path.join(target, 'SKILL.md')) && !options.force) {
        report.targets.push({ target, status: 'refused', reason: '目标目录不像 planner 安装（没有 SKILL.md）；确认后加 --force', entries: entries.length });
        continue;
      }
    }
    const changes = plan(snapshot, target);
    if (options.dryRun) { report.targets.push({ target, status: 'dry-run', existed: exists, ...changes, keep: changes.keep.length, create: changes.create, update: changes.update }); continue; }
    for (const [relative, content] of Object.entries(snapshot)) {
      const file = path.join(target, relative);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, content);
    }
    // 写完后立刻复验：目录内容必须与 lock 完全一致，否则这次更新是失败的。
    let verified = 'ok';
    try { L.verify(L.collect(target), lock); }
    catch (error) { verified = error.message; }
    report.targets.push({ target, status: verified === 'ok' ? 'ok' : 'FAIL', created: changes.create, updated: changes.update, untouched: changes.keep.length, files: Object.keys(snapshot).length, verify: verified });
  }
  return report;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const value = flag => { const at = args.indexOf(flag); return at === -1 ? undefined : args[at + 1]; };
  try {
    const report = sync({ target: value('--target'), dryRun: args.includes('--dry-run'), force: args.includes('--force') });
    console.log(JSON.stringify(report, null, 2));
    if (report.targets.some(t => t.status === 'FAIL' || t.status === 'refused')) process.exitCode = 1;
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = { sync, plan, targets };
