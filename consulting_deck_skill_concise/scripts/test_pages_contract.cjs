/* pages 合同：结构、封闭枚举、成稿对账，以及"枚举里的每条形式都真的存在"。不依赖浏览器。 */
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const C = require('./check_pages.cjs');
const forms = require('../assets/deck-forms.js');
const kit = require('../assets/exhibit-kit.js');
const recipes = require('../assets/echarts-recipes.js');
const precision = require('./render_precision_exhibit.cjs');
const diagram = require('./render_diagram.cjs');
const palette = require('../assets/deck-themes.js').palette('mckinsey');
const results = {};

const page = (over = {}) => Object.assign({ page: 1, proves: '本页要让读者看出的关系', form: 'html.text' }, over);

// 1. 枚举自身必须完整：每个 form 有族、标签、画法、容量。
for (const form of forms.list()) {
  const entry = forms.get(form);
  assert.ok(entry.family && forms.familyLabels[entry.family], form + ' 缺少已登记的分析族');
  assert.ok(entry.label && entry.capacity, form + ' 缺少标签或容量边界');
  assert.ok(['svg', 'html'].includes(entry.kind), form + ' kind 须为 svg/html');
  assert.ok([null, 'layer', 'comparisons'].includes(entry.annotation), form + ' annotation 入口无效');
}
results.enum_complete = forms.list().length;

// 2. 枚举必须与真实实现一一对应，不能登记渲染不出来的名字。
for (const form of forms.list()) {
  const entry = forms.get(form);
  if (entry.module === 'exhibit-kit') assert.equal(typeof kit[entry.export], 'function', form + ' 在 exhibit-kit 中不存在');
  else if (entry.module === 'echarts-recipes') assert.equal(typeof recipes[entry.export], 'function', form + ' 在 echarts-recipes 中不存在');
  else if (entry.module === 'diagram') { assert.equal(typeof diagram.layout, 'function'); assert.equal(typeof diagram.render, 'function'); }
  else if (entry.module === 'precision') {
    const sample = entry.type === 'stacked'
      ? [{ id: 'a', label: '列', segments: [{ id: 's', label: '段', value: 10 }] }]
      : entry.type === 'waterfall'
        ? [{ id: 'a', label: '起点', type: 'total', value: 10 }, { id: 'b', label: '变化', type: 'delta', value: -3 }, { id: 'c', label: '期末', type: 'total', value: 7 }]
        : [{ id: 'a', label: '项', value: 10 }, { id: 'b', label: '项二', value: 4 }];
    assert.doesNotThrow(() => precision.normalize({ type: entry.type, items: sample, width: 400, height: 260 }), form + ' 的 type 未被精度入口接受');
  }
}
results.enum_matches_implementation = true;

// 3. annotation='layer' 的形式必须真的能出引线标注，不能只是声明。
const annotated = [];
const base = { palette, typography_id: 'serif-report-bold', width: 720, height: 400 };
const kitCases = {
  'kit.waterfall': ['waterfall', { items: [{ label: '期初', type: 'total', value: 10 }, { label: '变化', type: 'delta', value: -3 }, { label: '期末', type: 'total', value: 7 }], annotations: [{ on: 'bar:变化', kind: 'delta', text: '主要拖累 {value}' }] }],
  'kit.dumbbell': ['dumbbell', { items: [{ label: '甲', start: 6, end: 5 }, { label: '乙', start: 2, end: 3 }], annotations: [{ on: 'end:甲', kind: 'delta', from: 'start:甲', text: '{label} {delta}（{rate}）' }] }],
  'kit.slope': ['slope', { items: [{ label: '甲', start: 6, end: 5 }, { label: '乙', start: 2, end: 3 }], annotations: [{ on: 'end:乙', kind: 'delta', from: 'start:乙' }] }],
  'kit.bullet': ['bullet', { items: [{ label: '达成率%', value: 76, target: 90, max: 100 }], annotations: [{ on: 'value:达成率%', kind: 'delta', from: 'target:达成率%', text: '缺口 {delta}' }] }],
  'kit.heatmap': ['heatmap', { rows: ['北区', '南区'], columns: ['Q1', 'Q2', 'Q3'], values: [[88, 91, 76], [64, 70, 78]], domain: [60, 100], annotations: [{ on: 'cell:北区|Q2', kind: 'value', text: '最高 {value}' }] }],
  'kit.mekko': ['mekko', { items: [{ label: '东区', segments: [{ label: '核心', value: 60 }, { label: '新业务', value: 40 }] }, { label: '南区', segments: [{ label: '核心', value: 30 }, { label: '新业务', value: 70 }] }], annotations: [{ on: 'seg:南区|新业务', kind: 'share', text: '{label} 占该区 {value}' }] }],
  'kit.stacked': ['stacked', { items: [{ label: '东区', segments: [{ label: '核心', value: 60 }, { label: '新业务', value: 40 }] }, { label: '南区', segments: [{ label: '核心', value: 30 }, { label: '新业务', value: 70 }] }], annotations: [{ on: 'seg:东区|核心', kind: 'share', text: '{label} {value}' }] }]
};
for (const form of forms.list().filter(f => forms.annotationEntry(f) === 'layer')) {
  if (kitCases[form]) {
    const [fn, spec] = kitCases[form];
    const svg = kit[fn](Object.assign({}, base, spec));
    assert.match(svg, /data-role="annotation"/, form + ' 声明可标注却没有输出标注文字');
    assert.match(svg, /data-role="leader"/, form + ' 外置标注必须带引线');
    assert.match(svg, /data-requested-size="\d+×\d+" data-actual-size="\d+×\d+"/, form + ' 缺少 requested/actual 尺寸回传');
    assert.match(svg, /data-anchor-id=/, form + ' 缺少统一锚点契约');
  } else {
    const entry = forms.get(form);
    const items = entry.type === 'stacked'
      ? [{ id: 'a', label: '列', segments: [{ id: 's1', label: '段一', value: 30 }, { id: 's2', label: '段二', value: 20 }] }]
      : entry.type === 'waterfall'
        ? [{ id: 'a', label: '起点', type: 'total', value: 10 }, { id: 'b', label: '变化', type: 'delta', value: -3 }, { id: 'c', label: '期末', type: 'total', value: 7 }]
        : [{ id: 'a', label: '甲', value: 42 }, { id: 'b', label: '乙', value: 31 }];
    const target = entry.type === 'stacked' ? 'a::s2' : entry.type === 'waterfall' ? 'b' : 'b';
    const svg = precision.render({ type: entry.type, width: 720, height: 400, items, annotations: [{ on: target, kind: 'value', text: '读数 {value}' }] });
    assert.match(svg, /data-role="annotation"/, form + ' 声明可标注却没有输出标注文字');
    assert.match(svg, /data-anchor-id=/, form + ' 缺少统一锚点契约');
  }
  annotated.push(form);
}
results.annotation_entries_work = annotated.length;

// 4. 未接入标注层的形式必须被明确拒绝，不能静默忽略。
{
  const refused = C.check({ version: 1, pages: [page({ form: 'kit.tree', annotations: [{ on: 'x', kind: 'value' }] })] });
  assert.equal(refused.status, 'FAIL');
  assert.ok(refused.errors.some(e => /尚未接入通用标注层/.test(e)), JSON.stringify(refused.errors));
  results.unannotatable_refused = true;
}

// 5. 结构与语义校验。
{
  assert.equal(C.check({ version: 1, pages: [page()] }).status, 'PASS');
  const cases = [
    [{ version: 2, pages: [page()] }, /version/],
    [{ version: 1, pages: [] }, /非空数组/],
    [{ version: 1, pages: [page({ proves: '  ' })] }, /缺少 proves/],
    [{ version: 1, pages: [page({ form: 'kit.donut' })] }, /未知图示形式/],
    [{ version: 1, pages: [page({ page: 1 }), page({ page: 1 })] }, /序号重复/],
    [{ version: 1, pages: [page({ page: 2 })] }, /不连续/],
    [{ version: 1, pages: [page({ form: 'kit.bullet', annotations: [{ on: 'a', kind: 'note' }] })] }, /必须给 text/],
    [{ version: 1, pages: [page({ form: 'kit.bullet', annotations: [{ on: 'a', kind: 'bracket' }] })] }, /必须给 from/],
    [{ version: 1, pages: [page({ form: 'kit.bullet', annotations: [{ on: 'a', kind: 'nope' }] })] }, /kind 须为/],
    [{ version: 1, pages: [page({ form: 'kit.bullet', annotations: [{ kind: 'value' }] })] }, /缺少 on/],
    [{ version: 1, pages: [page({ regions: [{ slot: 'left', span: 5, form: 'kit.mekko', role: 'support' }] })] }, /恰好有一个 role="primary"/],
    [{ version: 1, pages: [page({ regions: [{ slot: 'left', span: 5, form: 'kit.mekko', role: 'primary' }] })] }, /主区形式与 page.form 不一致/],
    [{ version: 1, pages: [page({ fallback: { if: '容量不足' } })] }, /fallback/]
  ];
  for (const [doc, pattern] of cases) { const out = C.check(doc); assert.equal(out.status, 'FAIL'); assert.ok(out.errors.some(e => pattern.test(e)), JSON.stringify(doc) + ' → ' + JSON.stringify(out.errors)); }
  results.schema_negatives = cases.length;
}

// 6. 反单调：同一形式第 3 次起、连续 3 页同形式，都必须写理由；这不是图型配额。
{
  const three = [page({ page: 1, form: 'kit.bullet' }), page({ page: 2, form: 'kit.bullet' }), page({ page: 3, form: 'kit.bullet' })];
  const out = C.check({ version: 1, pages: three });
  assert.equal(out.status, 'FAIL');
  assert.ok(out.errors.some(e => /第 3 次出现/.test(e)));
  assert.ok(out.errors.some(e => /连续三页同形式/.test(e)));
  const explained = C.check({ version: 1, pages: [three[0], three[1], page({ page: 3, form: 'kit.bullet', repetitionReason: '三张卡片本就是同一指标的分组复核' })] });
  assert.equal(explained.status, 'PASS', JSON.stringify(explained.errors));
  const twice = C.check({ version: 1, pages: [page({ page: 1, form: 'kit.bullet' }), page({ page: 2, form: 'kit.bullet' })] });
  assert.equal(twice.status, 'PASS', '只重复两次不强制解释，避免变成配额');
  results.repetition_gate = true;
}

// 7. 形式清单：计数、族分布、连续段。
{
  const inv = C.inventory({ version: 1, pages: [page({ page: 1, form: 'kit.dumbbell' }), page({ page: 2, form: 'kit.mekko' }), page({ page: 3, form: 'kit.mekko' }), page({ page: 4, form: 'kit.bullet' })] });
  assert.deepEqual(inv.forms, { 'kit.mekko': 2, 'kit.dumbbell': 1, 'kit.bullet': 1 });
  assert.equal(inv.families.composition, 2);
  assert.equal(inv.distinctForms, 3);
  assert.equal(inv.longestRun, 2);
  assert.deepEqual(inv.runs, [{ form: 'kit.mekko', pages: [2, 3], length: 2 }]);
  results.inventory = true;
}

// 8. 与成稿对账：页数、顺序、逐页 form，以及可选的 data-proves。
{
  const doc = { version: 1, pages: [page({ page: 1, form: 'kit.dumbbell', proves: '甲下降最多' }), page({ page: 2, form: 'html.text', proves: '边界说明' })] };
  const slides = [{ page: 1, form: 'kit.dumbbell', proves: '甲下降最多', role: null }, { page: 2, form: 'html.text', proves: '边界说明', role: null }];
  assert.deepEqual(C.verifyDeck(doc, slides), []);
  assert.ok(C.verifyDeck(doc, slides.slice(0, 1)).some(e => /成稿有 1 页正文/.test(e)));
  assert.ok(C.verifyDeck(doc, [slides[0], { ...slides[1], form: null }]).some(e => /缺少 data-form/.test(e)));
  assert.ok(C.verifyDeck(doc, [slides[0], { ...slides[1], form: 'html.table' }]).some(e => /不一致/.test(e)));
  assert.ok(C.verifyDeck(doc, [slides[0], { ...slides[1], proves: '别的说法' }]).some(e => /data-proves/.test(e)));
  assert.deepEqual(C.verifyDeck(doc, [...slides, { page: 3, form: null, proves: '', role: 'cover' }]), [], '封面不承担证明责任，不参与对账');
  results.deck_reconciliation = true;
}

// 9. 文件往返与摘要绑定。
{
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pages-contract-'));
  try {
    const file = path.join(dir, 'pages.json');
    fs.writeFileSync(file, JSON.stringify({ version: 1, pages: [page({ form: 'kit.bullet' })] }));
    const loaded = C.load(file);
    assert.equal(loaded.sha256, C.fileHash(file));
    assert.equal(loaded.inventory.pages, 1);
    fs.writeFileSync(file, JSON.stringify({ version: 1, pages: [page({ form: 'kit.donut' })] }));
    assert.throws(() => C.load(file), /未知图示形式/);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
  results.roundtrip = true;
}

// 10. 遍历入口：目录解析、覆盖统计与能力漂移都必须可核对。
{
  const sweep = require('./sweep_forms.cjs').sweep();
  assert.ok(sweep.families.length >= 10, '遍历必须覆盖全部已登记的分析族');
  assert.equal(sweep.families.reduce((n, group) => n + group.forms.length, 0), forms.list().length, '每条形式都应出现在某个族里');
  if (sweep.plannerCoverage.total) {
    assert.ok(sweep.plannerCoverage.implemented > 0 && sweep.plannerCoverage.implemented <= sweep.plannerCoverage.total);
    assert.equal(sweep.plannerCoverage.implemented + sweep.plannerCoverage.unimplemented.length, sweep.plannerCoverage.total);
  }
  assert.deepEqual(sweep.drift, [], '枚举里的 planner 能力必须仍存在于当前目录：' + JSON.stringify(sweep.drift));
  results.sweep = { plannerCapabilities: sweep.plannerCoverage.total, implemented: sweep.plannerCoverage.implemented, gaps: sweep.plannerCoverage.unimplemented.length };
}

console.log(JSON.stringify({ pass: true, forms: forms.list().length, ...results }));
