# 专业数值标注：共同数据、尺度和测量

本入口服务需要准确端点、微小组成、累计关系或显式断轴的柱图、堆积和瀑布。作者决定证据与构图，工具从原值派生格式、累计量、坐标和标签候选；不逐标签手写偏移。既有 `ExhibitKit` 继续可用，不把新入口的验证结论外推到旧组件。

## 入口与数据

```js
const {render, build} = require('./scripts/render_precision_exhibit.cjs');
const svg = render({
  type: 'columns', width: 960, height: 500, fontSize: 16,
  theme: 'mckinsey', typography_id: 'serif-report-bold', unit: '单位：百万元',
  items: [
    {id: 'before', label: '调整前', value: 80.25},
    {id: 'after', label: '调整后', value: 126.75}
  ],
  comparisons: [{from: 'before', to: 'after'}],
  connections: {mode: 'continuous', style: 'dashed'},
  format: {decimals: 2, axisDecimals: 1}
});
// build(spec) 返回 {svg, geometry, audit}，用于计算审查和变体验证。
```

命令行：`node scripts/render_precision_exhibit.cjs spec.json exhibit.svg`。将 SVG 原样内联到现有 deck，引擎、母版和首尾仍走现有入口；最终 `pack_fonts.cjs` 为 SVG 和正文统一嵌入交付字体，`qa_deck.cjs` 生成最终 HTML 截图与 PDF。原始 SVG 引用 `Deck Inter` / `Deck Noto Sans SC` 字体名，本身不嵌入字体，不能把裸 SVG 的系统回退效果当作已验收风格。

- `columns`：每项 `{id,label,value}`。负值从零基线向下；无序类别默认不连接。`type:'total'|'subtotal'` 必须提供 `sumOf:['前置 id',…]`，原值须等于被引用项之和，不重复引用；总/小计使用真实 600、描边和额外组间空间，不改变数量尺度。
- `waterfall`：每项 `{id,label,type:'total'|'subtotal'|'delta',value}`。首个 total 是起点；delta 逐项累计；后续 total 必须闭合，subtotal 可省略 value，由累计值生成。支持跨零、负值及小数。比较累计量时引用 total/subtotal。
- `stacked`：每项 `{id,label,segments:[{id,label,value},…]}`。当前支持非负绝对组成；各列显式列全系列，零值填 0，未知不当作 0；系列顺序和颜色跨列一致。可选 `total` 必须等于系列之和。总量自动显示，微小片优先取得外置候选；此入口尚不支持负值堆积或百分比归一化。
- `width/height` 是逻辑坐标中的真实绘制容量。改数据、字体、尺寸后重新运行 `render`，全部数据锚点和文字候选随之重算；CSS 等比缩放只改变显示比例，不代替重新布局。画布至少 400×260、文字至少 14px；超出容量明确报错，先增加适当空间、减少同时比较、分面或换表达。

`title` 默认用于可访问名称；需要 SVG 内部标题时用 `showTitle:true`。单位、图例、类别换行和比较说明纳入绘图区预算，最长类别超过 4 行则拒绝拥挤输出。默认主题从 `deck-themes.js` 读取，真实字体从 `deck-typography.js` 读取；字体测量复用 `font_metrics.cjs` 的 fontkit + tnum。标签保守占位采用当前随包正文的 ascent/descent，最终仍检查实际浏览器字形。

## 六类能力及组合边界

| 能力 | 可执行合同 | 当前实际验证 |
|---|---|---|
| 阶梯连接 | `connections:{mode:'continuous'|'cumulative',style:'solid'|'dashed'}`。cumulative 只用于瀑布，连接上一步累计终点与下一 delta 起点；continuous 是作者对连续关系的显式声明。堆积 continuous 须指定 `target:'total'` 或 `series:'系列 id'` | 连续柱图、含负值及小计瀑布；改数、改尺寸；断轴跨区间路径分片 |
| 语义格式 | 原值、差额、增长率、百分点、倍数分开；变化带正负号。非零小值不会被印成 0。零/负基数增长率返回不适用原因，绝对差继续可读 | 小数、负值、微小量、零/负基数、百分点及倍数计算 |
| 合计/小计 | 真实类型与闭合校验；600、描边、间距强调；堆积总量从分量相加 | columns `sumOf`、waterfall 累计、stacked total；错误合计拒绝 |
| Δ 与增长率 | `comparisons:[{from,to,label?,showRelative?,kind?,format?}]`。两柱/总量用 item id；指定堆积层用 `{item:'id',series:'id'}`。两柱/总量从真实顶端引出比较路径；指定层在顶部共用零起点的原值轨道比较，A/B编号与主图真实外置标签对应 | 两期柱图、总量及指定小片层、含负值瀑布；层原值下降时箭头方向与Δ一致 |
| 外置标签与引线 | 先测量后选择柱内、柱外、左右错位候选；避开已有文字、标注线和其他柱片。引线从真实柱片侧边出发；候选穷尽报错，不丢标签 | 0.2/0.5 微小片与 2/5 小片四个引线；数据/画布变化后重算 |
| 显式断轴 | `axisBreaks:[{from,to,gap:20}]`。可见说明列出省略区间，轴/柱片有断层标记；柱片、连续线、比较路径共用变换；data-value 保留原值 | 0–1,000 / 10,000 以上柱图、瀑布组合；实际 SVG 几何及导出的 PDF |

指定堆积层比较使用**同一零起点的小比较轨道**，图形长度和箭头方向均对应层原值；主堆积保留原位及真实累计高度。例如其他层从 0.5 降到 0.2，顶部小轨道的横条缩短到原长 40%，Δ 箭头向左，显示 −0.3 / −60.0%；主图 A/B 外置标签和引线可靠指向各自的真实小片。总量可以同时增加，但使用另一条明确的总量比较路径。

`data-axis-from/to` 在小轨道中表示层原值；`data-from/to-key` 保留原图归属，`data-from/to-anchor-key` 指向原值轨道端点；metadata 中 `layerTracks` 给出共同零点、比例尺和 A/B 引用。不能再把累计边界 82.5→115.2 的方向当作 0.5→0.2 的变化。层与总量混合端点比较明确拒绝，密集标注仍需增加空间或分面。

断轴必须保留零点，区间严格位于域内且不重叠。任何数据端点落入被省略区间会直接报错；跨越断层的柱由真实可见数值段生成多块，跨区间的竖线同步断开并标记。适用性仍需与完整尺度、局部放大或分面对照判断。`domain` 显式给出时不得截断数据或隐去零点。断层 gap 至少 8px，累计不得占绘图区 35% 以上。

## 共享纯函数

`assets/exhibit-geometry.js` 可在 Node `require`，也可在浏览器获得 `ExhibitGeometry`。它不依赖 DOM，不读取系统字体。

```js
semanticFormat(value, {kind:'value'|'delta'|'rate'|'pp'|'multiple', decimals, basis});
change(start, end, {decimals, rateDecimals, kind, basis});
// {delta, deltaLabel, rate, rateStatus:'ok'|'zero-base'|'negative-base', rateLabel}
createScale(domain, range, {breaks:[{from,to,gap}]});
// {map, visible, segments, breaks, unit, domain, range}
rowTracks(rows, {top, fontSize, lineHeight, gap, right});
// 每行 {top,height,center,firstBaseline,lastBaseline,baselines,right}
```

`rate` 接受比率原值（0.15 → +15%）；`pp` 必须声明 `basis:'fraction'|'percent'`。`change` 中 `kind:'pp'` 用百分点显示差额。`rowTracks` 明确区分图形中心和文字基线；HTML 应使用真正共同排版结构，自定义 SVG 按这些轨道设置文字位置。轨道声明本身不是浏览器测量的替代品。

图元提供 `data-item/series/value/from/to/mark-id`，比较和引线另有真实端点键、原值差额、轴值与锚点。`auditLayout` 可检查生成阶段的数值映射、端点归属、文字/图形/标注线碰撞，发现无法布局即报错；metadata 和 `data-baseline` 供定位，不单独构成通过证据。

## 验证与成熟度

| 路径 | 本轮状态 |
|---|---|
| Node → 静态 SVG → 内联 HTML → 嵌入字体 → Chrome | 六个组合样例；实际图元、文字 bbox、字体来源、锚点已测量 |
| 同版 Chrome PDF | 六页样例 PDF 已导出；断轴页经 Poppler 栅格化查看；完整报告由该报告交付审查覆盖 |
| 浏览器运行期动态生成、Canvas、ECharts option | 本入口未提供，不引用此处证据声称支持 |
| 任意数量标注、任意密度/长文本、负值堆积、自动百分比堆积 | 未承诺；按明确数据合同和容量报错处理 |

运行 `node scripts/test_precision_exhibit.cjs` 检查数值、闭合、格式、改数/换尺寸/长中文/混排/负值/小数与目标反例。`test_precision_browser.cjs [样例目录]` 对嵌入字体的 gallery 独立读取实际 SVG：按原 spec 重新累计，通过真实轴线拟合数值尺度，核对真实矩形、比较端点、引线端点和实际文字 bbox。故意把柱、比较路径、引线移动 4px、制造文字碰撞、把层比较接回错误的累计边界、将层条加长 4px、反转层Δ箭头，检查均必须失败；恢复后必须通过。

本轮可审查底稿位于项目 `iteration_v11_reliability/annotations/`：六份 spec、SVG、gallery HTML/PDF、截图与 `browser-measurements.json`。示例是验证用演示数据，不代表业务事实；常规制稿只测受影响成稿与新计算，不为复用这些入口重跑全库。
