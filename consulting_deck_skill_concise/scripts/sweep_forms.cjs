#!/usr/bin/env node
/* 图示选择方案的遍历入口：把"本技能真的能画什么"和"planner 认为该画什么"放在一张表上。
   只读枚举与目录，不替作者选型，也不产生任何交付物。 */
'use strict';
const path = require('node:path'), fs = require('node:fs');
const forms = require('../assets/deck-forms.js');
const { loadPlanner } = require('./load_viz_planner.cjs');
const TICK = '\u0060';

function parseCatalog(markdown) {
  const rows = [];
  for (const line of String(markdown).split('\n')) {
    const cells = line.split('|').map(v => v.trim());
    if (cells.length < 7 || cells[1] === 'id' || /^-+$/.test(cells[2] || '')) continue;
    // 能力行：id、族、主分析任务三列都得是标识符形态；扩展准入备忘等表格会被这三条挡掉。
    if (!/^[a-z][a-z0-9._-]*$/.test(cells[1] || '')) continue;
    if (!/^[a-z][a-z0-9_]*$/.test(cells[3] || '') || !/^[a-z][a-z0-9_]*$/.test(cells[5] || '')) continue;
    rows.push({ id: cells[1], label: cells[2], family: cells[3], contract: cells[4], task: cells[5], status: cells[6] });
  }
  return rows;
}

function plannerCatalog() {
  const loaded = loadPlanner({ offline: true });
  if (loaded.status !== 'ok') return { status: loaded.status, attempts: loaded.attempts, rows: [] };
  const indexPath = path.join(loaded.skill_root, 'catalog', 'index.md');
  if (!fs.existsSync(indexPath)) return { status: 'invalid', reason: '缺少 catalog/index.md', rows: [] };
  const rows = parseCatalog(fs.readFileSync(indexPath, 'utf8'));
  return { status: rows.length ? 'ok' : 'invalid', origin: loaded.origin, source_sha256: loaded.source_sha256, contract_version: loaded.contract_version, rows };
}

function sweep() {
  const catalog = plannerCatalog();
  const known = new Set(catalog.rows.map(row => row.id));
  const families = Object.entries(forms.familyLabels).map(([family, label]) => ({
    family, label,
    forms: forms.list().filter(form => forms.familyOf(form) === family).map(form => {
      const entry = forms.get(form);
      return {
        form, label: entry.label, annotation: entry.annotation, capacity: entry.capacity,
        planner: entry.planner || [],
        unknownCapabilities: (entry.planner || []).filter(id => catalog.status === 'ok' && !known.has(id))
      };
    })
  }));
  const implemented = new Set(forms.list().flatMap(form => forms.capabilityOf(form)));
  const unimplemented = catalog.rows.filter(row => !implemented.has(row.id)).map(row => ({ id: row.id, label: row.label, family: row.family, status: row.status }));
  const drift = forms.list().flatMap(form => forms.capabilityOf(form).filter(id => catalog.status === 'ok' && !known.has(id)).map(id => ({ form, capability: id })));
  return {
    generatedFrom: {
      forms: forms.version,
      planner: catalog.status === 'ok'
        ? { origin: catalog.origin, source_sha256: catalog.source_sha256, contract_version: catalog.contract_version }
        : { status: catalog.status, reason: catalog.reason || (catalog.attempts || []).map(a => a.reason).filter(Boolean)[0] }
    },
    families,
    plannerCoverage: { total: catalog.rows.length, implemented: catalog.rows.length - unimplemented.length, unimplemented },
    drift
  };
}

function text(report, onlyFamily) {
  const lines = [];
  lines.push('# 图示候选清单（' + forms.list().length + ' 条可执行形式）');
  lines.push('> 逐页 form 只能取这里的值；每条都有自己的容量边界与旁解读入口。');
  lines.push('');
  for (const group of report.families) {
    if (onlyFamily && group.family !== onlyFamily) continue;
    if (!group.forms.length) continue;
    lines.push('## ' + group.label + '（' + group.family + '）');
    for (const item of group.forms) {
      const mark = item.annotation === 'layer' ? '可旁解读' : item.annotation === 'comparisons' ? '自带Δ入口' : '旁解读未接入';
      lines.push('- ' + TICK + item.form + TICK + ' ' + item.label + ' · ' + mark + ' · ' + item.capacity);
      if (item.planner.length) lines.push('  planner: ' + item.planner.join('、'));
    }
    lines.push('');
  }
  const coverage = report.plannerCoverage;
  lines.push('## planner 覆盖');
  if (coverage.total) {
    lines.push('- planner 目录 ' + coverage.total + ' 条，本技能有实现入口的 ' + coverage.implemented + ' 条');
    if (coverage.unimplemented.length) {
      lines.push('- 目录里有、但本技能没有实现入口的 ' + coverage.unimplemented.length + ' 条（送进 planner 也不会变成成稿）：');
      for (const item of coverage.unimplemented) lines.push('  - ' + TICK + item.id + TICK + ' ' + item.label + '（' + item.family + '）');
    }
  } else {
    lines.push('- planner 不可用（' + JSON.stringify(report.generatedFrom.planner) + '），本节跳过；可执行形式清单不受影响。');
  }
  if (report.drift.length) {
    lines.push('');
    lines.push('## 漂移告警');
    for (const item of report.drift) lines.push('- ' + TICK + item.form + TICK + ' 登记的 ' + item.capability + ' 不在当前 planner 目录里');
  }
  return lines.join('\n');
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const onlyFamily = args.includes('--family') ? args[args.indexOf('--family') + 1] : null;
  if (onlyFamily && !forms.familyLabels[onlyFamily]) { console.error('未知族: ' + onlyFamily + '（可用：' + Object.keys(forms.familyLabels).join('、') + '）'); process.exitCode = 1; }
  else {
    const report = sweep();
    if (args.includes('--json')) console.log(JSON.stringify(report, null, 2));
    else console.log(text(report, onlyFamily));
    if (args.includes('--check') && report.drift.length) { console.error('存在 ' + report.drift.length + ' 条能力漂移，请同步 assets/deck-forms.js'); process.exitCode = 1; }
  }
}
module.exports = { sweep, parseCatalog, text };
