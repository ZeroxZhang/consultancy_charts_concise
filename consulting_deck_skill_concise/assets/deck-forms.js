/* 图示形式的封闭枚举：每个 form 必须对应一个真实可执行入口。
   与 planner 的 70 条能力目录不同，这里只登记本技能真的能渲染出来的形式；
   scripts/test_pages_contract.cjs 会核对每一条与实现是否仍然一致。 */
'use strict';

const FORMS = {
  // —— 构建期静态咨询展品（assets/exhibit-kit.js）——
  'kit.waterfall': { family: 'comparison', label: '瀑布图', kind: 'svg', module: 'exhibit-kit', export: 'waterfall', annotation: 'layer', planner: ['bar.waterfall'], capacity: '贡献项 ≤ 8；不闭合不做' },
  'kit.dumbbell': { family: 'comparison', label: '哑铃图', kind: 'svg', module: 'exhibit-kit', export: 'dumbbell', annotation: 'layer', planner: ['comparison.dumbbell'], capacity: '行 ≤ 14；两期同口径同量尺' },
  'kit.slope': { family: 'comparison', label: '坡度图', kind: 'svg', module: 'exhibit-kit', export: 'slope', annotation: 'layer', planner: ['comparison.slope'], capacity: '行 ≤ 10；只比较排序迁移，不比横距' },
  'kit.bullet': { family: 'kpi', label: '子弹图', kind: 'svg', module: 'exhibit-kit', export: 'bullet', annotation: 'layer', planner: ['gauge.bullet'], capacity: '指标 ≤ 6；分档须另有业务定义' },
  'kit.heatmap': { family: 'correlation', label: '矩阵热力图', kind: 'svg', module: 'exhibit-kit', export: 'heatmap', annotation: 'layer', planner: ['heatmap.matrix'], capacity: '≤ 160 格；跨页比较须固定 domain' },
  'kit.mekko': { family: 'composition', label: '百分轴 Mekko', kind: 'svg', module: 'exhibit-kit', export: 'mekko', annotation: 'layer', planner: ['custom.custom'], capacity: '列 ≤ 6；窄列连序号都放不下就改表' },
  'kit.stacked': { family: 'composition', label: '堆积构成', kind: 'svg', module: 'exhibit-kit', export: 'stacked', annotation: 'layer', planner: ['bar.stacked'], capacity: '列 ≤ 12 × 系列 ≤ 6；仅非负组成' },
  'kit.tree': { family: 'hierarchy', label: '层级树', kind: 'svg', module: 'exhibit-kit', export: 'tree', annotation: null, planner: ['tree.tree'], capacity: '≤ 48 节点；每层同一拆分逻辑' },
  'kit.swimlane': { family: 'diagram', label: '泳道图', kind: 'svg', module: 'exhibit-kit', export: 'swimlane', annotation: null, planner: ['infographic.swimlane'], capacity: '单元格仅 1 节点；复杂分支换专门路径' },
  'kit.processFlow': { family: 'diagram', label: '阶段流程', kind: 'svg', module: 'exhibit-kit', export: 'processFlow', annotation: null, planner: ['infographic.process'], capacity: '3–6 段线性；等宽不表示等时长' },
  'kit.comparisonTable': { family: 'table', label: '比较表（HTML）', kind: 'html', module: 'exhibit-kit', export: 'comparisonTable', annotation: null, planner: ['table.detail'], capacity: '高度由内容决定，须自行分页' },

  // —— ECharts 配方（assets/echarts-recipes.js，构建期 SSR 成内联 SVG）——
  'recipe.rankedBar': { family: 'comparison', label: '排序条形', kind: 'svg', module: 'echarts-recipes', export: 'rankedBar', annotation: null, planner: ['bar.rank'], capacity: '≤ 24 项，正文宜更少' },
  'recipe.groupedBar': { family: 'comparison', label: '分组柱状', kind: 'svg', module: 'echarts-recipes', export: 'groupedBar', annotation: null, planner: ['bar.grouped'], capacity: '≤ 12 类 × 4 系列' },
  'recipe.timeSeries': { family: 'trend', label: '时间序列折线', kind: 'svg', module: 'echarts-recipes', export: 'timeSeries', annotation: null, planner: ['line.multi','line.basic'], capacity: '≤ 36 期 × 5 系列，更多分面' },
  'recipe.composition': { family: 'composition', label: '堆积／100% 堆积', kind: 'svg', module: 'echarts-recipes', export: 'composition', annotation: null, planner: ['bar.pct','bar.stacked'], capacity: '≤ 12 类 × 6 系列' },
  'recipe.histogram': { family: 'distribution', label: '直方图', kind: 'svg', module: 'echarts-recipes', export: 'histogram', annotation: null, planner: ['bar.hist'], capacity: '须已正确分箱，不从均值伪造' },
  'recipe.scatter': { family: 'correlation', label: '散点／气泡', kind: 'svg', module: 'echarts-recipes', export: 'scatter', annotation: null, planner: ['scatter.basic','scatter.bubble'], capacity: '> 15 点只标关键点' },
  'recipe.heatmap': { family: 'correlation', label: '连续矩阵热力', kind: 'svg', module: 'echarts-recipes', export: 'heatmap', annotation: null, planner: ['heatmap.matrix'], capacity: '≤ 160 格' },
  'recipe.sankey': { family: 'flow', label: '桑基图', kind: 'svg', module: 'echarts-recipes', export: 'sankey', annotation: null, planner: ['sankey.sankey'], capacity: '≤ 30 节点 / 60 边；须守恒无环' },
  'recipe.tree': { family: 'hierarchy', label: '层级树（ECharts）', kind: 'svg', module: 'echarts-recipes', export: 'tree', annotation: null, planner: ['tree.tree'], capacity: '≤ 48 节点' },

  // —— 专业标注入口（scripts/render_precision_exhibit.cjs）——
  'precision.columns': { family: 'comparison', label: '数值柱（含小计／断轴／Δ）', kind: 'svg', module: 'precision', type: 'columns', annotation: 'layer', planner: ['bar.basic'], capacity: '≥ 400×260；类别 ≤ 4 行' },
  'precision.stacked': { family: 'composition', label: '数值堆积（含层比较）', kind: 'svg', module: 'precision', type: 'stacked', annotation: 'layer', planner: ['bar.stacked'], capacity: '仅非负组成；列内须列全系列' },
  'precision.waterfall': { family: 'comparison', label: '数值瀑布（含累计连接）', kind: 'svg', module: 'precision', type: 'waterfall', annotation: 'layer', planner: ['bar.waterfall'], capacity: '须闭合；累计连接只用于瀑布' },

  // —— 语义图示（scripts/render_diagram.cjs）——
  'diagram.mechanism': { family: 'diagram', label: '机制／反馈图', kind: 'svg', module: 'diagram', annotation: null, planner: ['infographic.mechanism'], capacity: '边须写含义与证据状态；循环标反馈' },
  'diagram.process': { family: 'flow', label: '流程与资金转移', kind: 'svg', module: 'diagram', annotation: null, planner: ['infographic.process'], capacity: '无量化就不给连线加宽度' },
  'diagram.swimlane': { family: 'diagram', label: '多主体泳道', kind: 'svg', module: 'diagram', annotation: null, planner: ['infographic.swimlane'], capacity: 'lane 编码主体、stage 编码阶段' },
  'diagram.hierarchy': { family: 'hierarchy', label: '能力／层级地图', kind: 'svg', module: 'diagram', annotation: null, planner: ['infographic.capability'], capacity: '区分包含、依赖、必要条件' },
  'diagram.condition': { family: 'diagram', label: '条件与决策树', kind: 'svg', module: 'diagram', annotation: null, planner: ['infographic.condition'], capacity: '决策节点与结果分开；概率缺依据就保留分支' },

  // —— 作者手写结构 ——
  'html.table': { family: 'table', label: '精确数据表', kind: 'html', annotation: null, planner: ['table.detail'], capacity: '一列一种单位；总计由作者提供' },
  'html.matrix': { family: 'table', label: '评估矩阵／RACI', kind: 'html', annotation: null, planner: ['table.pivot'], capacity: '权重与评分锚点须透明' },
  'html.kpi': { family: 'kpi', label: 'KPI 卡组', kind: 'html', annotation: null, planner: ['kpi.card'], capacity: '≤ 5 张卡；每张须有目标线' },
  'html.text': { family: 'text', label: '结构化文字／证据组', kind: 'html', annotation: null, planner: ['text.conclusion'], capacity: '无共同维度时保留结构化文字' },
  'svg.custom': { family: 'diagram', label: '自定义矢量构图', kind: 'svg', annotation: null, planner: ['custom.custom'], capacity: '几何与语义由作者负责，须实际看图' },
};

const FAMILY_LABELS = {
  comparison: '比较与排名', trend: '趋势', composition: '构成', distribution: '分布',
  correlation: '相关与矩阵', flow: '流向', hierarchy: '层级', kpi: '达成度',
  diagram: '机制与流程', table: '精确查数', text: '结构化文字'
};

const list = () => Object.keys(FORMS);
const get = form => {
  const entry = FORMS[form];
  if (!entry) throw new Error('未知图示形式: ' + form + '（可用：' + list().join('、') + '）');
  return Object.assign({ form }, entry);
};
const familyOf = form => get(form).family;
/* 旁解读入口：'layer' 走通用标注层（annotations），'comparisons' 用该形式自带的 Δ 入口，null 表示尚未接入。 */
const annotationEntry = form => get(form).annotation || null;
/* 与 planner 能力目录的对应关系：同一能力可由多种形式实现，一种形式也可服务多种能力。 */
const capabilityOf = form => (get(form).planner || []).slice();
const formsFor = capabilityId => list().filter(form => capabilityOf(form).includes(capabilityId));
const canImplement = (form, capabilityId) => capabilityOf(form).includes(capabilityId);
const byFamily = () => list().reduce((groups, form) => {
  const family = FORMS[form].family;
  (groups[family] = groups[family] || []).push(form);
  return groups;
}, {});

module.exports = { version: '1.0.0', forms: FORMS, familyLabels: FAMILY_LABELS, list, get, familyOf, annotationEntry, capabilityOf, formsFor, canImplement, byFamily };
