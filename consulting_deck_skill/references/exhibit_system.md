# 展品系统：选型、实现与能力边界

## v5分层原则

- **ECharts 6优先处理定量坐标系、统计分布、关系与流向。** 高频类型先走`assets/echarts-recipes.js`，尚未封装但原生支持的类型走明确option。
- **ExhibitKit处理咨询特定且需要构建期校验的静态展品。** 例如贡献闭合、Mekko面积、完整标签表回退。
- **HTML/CSS/SVG处理精确表格和高文本密度关系图。** 不为了统一技术栈牺牲换行、列宽、来源定位和分页。
- online模式可在浏览器渲染；offline-self-contained优先用`render_echarts_svg.cjs`把ECharts配方一次性转为静态SVG。

图型选择先读`chart_matching.md`。本文件只回答已经选定的展品如何实现，以及当前能力是否成熟。

## 实现路由

| 任务族 | 可用类型 | 实现与成熟度 |
|---|---|---|
| 比较/差距 | 条形、点图、哑铃、坡度、子弹、区间/森林图、tornado | recipe提供rankedBar/groupedBar；kit提供dumbbell/slope/bullet；区间用v6 custom series |
| 变化/贡献 | 瀑布、桥图、趋势、指数化、小倍数、堆积面积 | recipe提供timeSeries；kit waterfall含数据派生差异括号；其他ECharts |
| 构成/结构 | 普通/100%堆积、Mekko、treemap、sunburst、waffle | recipe提供composition；kit保留带完整表回退的stacked/mekko |
| 分布/不确定性 | histogram、boxplot、strip、violin、区间带 | ECharts或Vega-Lite；需要原始分布，不能由均值伪造 |
| 关系/流向 | scatter、bubble、Sankey、network、map flows | recipe提供scatter/sankey；其他ECharts/D3；需真实节点/边/经纬度及尺寸图例 |
| 评估/表格 | 热力、Harvey、RACI、决策表、数据条/迷你趋势表 | recipe提供数值heatmap；kit comparisonTable与HTML处理精确/定性表 |
| 层级/机制 | 驱动树、议题树、决策树、战略屋、价值链、鱼骨 | recipe/kit均有tree；高文本或专用关系仍用SVG/CSS并目视 |
| 执行/责任 | 泳道、甘特、旅程、roadmap、依赖图 | kit swimlane / processFlow；HTML时间网格；复杂依赖可用ELK |

现有B-01…B-56保持选型索引；“列入名录”不等于有现成组件。
kit提供10种SVG和1种HTML比较表，附数字格式与差异计算工具；更复杂的标签避让和连接路由仍需逐图渲染验收。
不为展示类型而放radar/桑基；同一数据不支持关系时回到诚实表格。

## EChartsRecipes API（ECharts 6 option与SSR共用）

`assets/echarts-recipes.js`（1.1.0）负责基础输入校验和option；`assets/chart-runtime.js`（1.0.0）统一真实画布预算、主题解析、文字对比度、完整表格与分页。浏览器和SSR均使用这个运行层，不依赖不同的默认ECharts主题。

生产调用必须是`prepare → setOption → check → 若换型则重绘并再次check`；只调用`build`或`prepare`不是最终验收。`check`读取实际文字包围盒，检查界外、相互遮挡和小于14px的字；不覆盖所有形状遮挡、语义或美学问题。

```html
<div class="chart" data-recipe="rankedBar" data-spec='{
  "items":[{"label":"甲","value":42,"selected":true},{"label":"乙","value":31}],
  "unit":"亿元","baseline":35,"baselineLabel":"目标"
}'></div>
```

| 配方 | 输入结构 | 主要用途/起始边界 |
|---|---|---|
| rankedBar | items:[{label,value,display?,role?,selected?}] | 排名/差距；最多24项，正文宜更少 |
| groupedBar | categories + series:[{name,values}] | 并列比较；最多12类×4系列 |
| timeSeries | periods + series:[{name,values}] | 趋势；最多36期×5系列，更多时分面 |
| composition | items:[{label,segments}], mode | 普通/100%堆积；最多12类×6系列 |
| histogram | bins:[{label,value}] | 已正确分箱的分布；不从均值伪造 |
| scatter | items:[{label,x,y,size?,selected?}] | 散点/气泡；超过15点只标关键点 |
| heatmap | rows + columns + values | 连续数值矩阵；最多160格 |
| sankey | nodes + links:[{source,target,value}] | 真实流量；最多30节点/60边 |
| tree | root:{label,value?,children} | 层级；最多48节点 |

这些是底层拒绝阈值，不是“该数量一定放得下”的保证，也不是数据分析上限。硬阈值以上先由作者分组；阈值内仍需按真实尺寸验收。24项条形在720×360可转多页表，在1200×800则可能完整成图；不能通过巨大viewBox缩小整个图绕过。

零/小值不省略：气泡无最小尺寸钳制，面积正比于规模；零规模转保留坐标和规模的表。构成小片转原值/份额表；桑基要求无环、节点有效、中间流量闭合，零流量用表。热力按实际连续色阶选择至少4.5:1的文字反差。趋势零基线包含负值，不把负值裁掉。

### 构建期静态SVG

在skill目录安装固定依赖后：

```bash
npm ci
node scripts/render_echarts_svg.cjs assets/echarts-recipe-example.json chart.svg
# 若预算要求多页，必须生成并使用全部文件
node scripts/render_echarts_svg.cjs input.json chart.svg --paginate
```

输入包含`recipe`、`spec`、`width`、`height`和`theme_id`，可设`fontSize`（至少14）。脚本锁定6.1.0并关闭动画/tooltip；多页默认拒绝，`--paginate`输出`chart-p01.svg`等并在stdout报告原因。不会覆盖已有同名SVG。

也可传原生`option`，但没有配方的输入语义校验或保真表格转换；文字验收失败会报错，由作者处理。
浏览器`data-recipe-page="0"`从0起选择逻辑页；作者须安排所有返回页，可按布局并排，不可只留第一页。生成SVG应按其真实逻辑尺寸内联，随后执行截图、PDF和断网复测。

### 两类输入的可复现案例

```bash
node scripts/test_dense_inputs.cjs
node scripts/build_dense_reference.cjs output-dir --theme=mckinsey
node scripts/qa_deck.cjs output-dir/dense_reference_deck.html output-dir/renders
```

输出六页离线HTML、`source_inventory.json`、逐条`evidence.json`、`page_plan.json`及版本清单。覆盖1,152条明细、42段文本与6案例；只读固定合成夹具，验证来源/派生/选型/成图之间的契约。不是通用CSV/Excel/PDF解析器，不自动完成调研、文本编码和语义选图。

## ExhibitKit API（零依赖，可构建时生成静态SVG）

```js
const kit = require('./assets/exhibit-kit.js');
const svg = kit.waterfall({width:740,height:330,items:[
 {label:'期初',type:'total',value:11.2},
 {label:'电商',type:'delta',value:0.4},
 {label:'商超',type:'delta',value:-1.1},
 {label:'经销',type:'delta',value:-0.1},
 {label:'期末',type:'total',value:10.4}
]});
```

共同参数：width/height/fontSize（至少14）、palette=DeckThemes.palette(theme_id)（包含ink,muted,grid,accent,positive,negative,series,sequential,surface,selected,ranges）。
参数是SVG内部逻辑像素；嵌入容器缩小后要重新测有效字号，不能用巨大viewBox偷缩字。

| 函数 | 专用数据字段 |
|---|---|
| waterfall | items:[{label,type:'total'/'delta'/'subtotal',value}] |
| dumbbell / slope | items:[{label,start,end}],startLabel,endLabel |
| bullet | items:[{label,value,target,max,ranges:[递增阈值]}] |
| heatmap | rows:[标签],columns:[标签],values:[[数值]] |
| mekko / stacked | items:[{label,segments:[{label,value}]}]；stacked另有mode |
| comparisonTable | columns:[{key,label,type,unit,format,bar,derive}], rows:[{kind,values}]；输出HTML |
| processFlow | stages:[{label,owner,output,gate}], transitions:[相邻转换条件]；线性流程SVG |
| tree | root:{label,children:[递归节点]} |
| swimlane | lanes:[标签],stages:[标签],items:[{id,label,lane,stage}],edges:[{from,to}] |

数据和SVG绑定，不写死坐标伪装测量。库拒绝非有限值与结构错误；某些定性字段仍要作者验证。
源数据证据由页面Source承载，不由组件虚构。SVG内文字必须转义。

## 开源技术取舍

- [lieflat-charts](https://github.com/larashero3-dotcom/lieflat-charts)：借鉴数据形状→候选→真实模板→颜色锁定。
  不移植其低字号、hover承载关键信息、圆角卡片和动效偏好到reading deck。
- [diagram-design](https://github.com/cathrynlavery/diagram-design)：借鉴关系语义与布局类型分离、品牌token、节点/边有意义。
  其默认低密度与节点预算不是咨询阅读页通用规定。
- [Apache ECharts](https://echarts.apache.org/handbook/en/basics/release-note/v6-feature/)：固定6.1.0；使用SVG renderer、可注册custom series与Node SVG SSR，主题与series显式一致。
- [D3](https://d3js.org/)：几何与自定义标记；需要自担标签布局。
- [Vega-Lite](https://vega.github.io/vega-lite/docs/)：分面、统计转换和声明式编码；输出SVG后内联。
- [ELK](https://github.com/kieler/elkjs)：复杂有向图自动布局；不要把整个关系图变成小字线路板。

本版kit与CSS为原创实现，未复制上述仓库代码。未来实际复用代码应核对所取commit及LICENSE，保留必要声明。
每项外部依赖固定版本并记录体积、离线策略、打印路径；无需引入所有库。升级ECharts后必须跑引擎、配方、三主题、PDF和断网回归，不能只改CDN字符串。

## 参数边界与作者责任

- width默认960、height默认500，最低320×200；fontSize默认14。不同图另有容量检测，过密抛错。
- waterfall/dumbbell/slope/heatmap支持domain:[min,max]；默认由数据且包含0生成，等值时扩张。
  自定义范围不能截断数据；跨页热力比较必须固定同一domain，例如评分[1,5]。
- waterfall起点total可设基线，后续total必须等于累计；subtotal可省value，传入则须闭合。
- bullet的max必填且>0；value/target在[0,max]内；ranges可省，省略仅有单色轨道。
  传入ranges须递增、在范围内；分档必须另外标业务定义。组件不自动发明合格阈值。
- swimlane lane/stage为0起整数，id唯一且必填，同一单元格仅1节点；edges只能引用已有id。
  复杂分支/反馈仍需专门路径规划，当前实现不保证任意网络无交叉。
- label必须给非空、可见文字；长标签需作者换行或缩短。组件不自动完成复杂标签避让。
- v4 Mekko/stacked遇小片或零值自动改用完整标签表；整个画布仍装不下则报错。
- 仅数值与已覆盖结构字段经过脚本验证；任意调色、尺寸和数据组合仍需目视检查。
  heatmap对合成白底计算文本对比；其他组件自定义色板也需逐项检查。

热力表用于对比度计算的颜色格式支持#RGB、#RRGGBB或rgb(r,g,b)，不接受CSS变量字符串；请先解析token。

## v3主题传递

Node读取assets/deck-themes.js；浏览器制作时先加载DeckThemes，所有组件均传入同一palette。
positive/negative是组件历史API名，主题适配器把它们映射到数学delta角色，不映射good/risk。
默认快照由scripts/sync_theme_defaults.cjs生成，修改色板后重建并跑test_themes.cjs。
heatmap使用sequential连续插值，叠字根据实际底色选择；仅提供自定义accent而未提供sequential时保留旧版透明度色阶兼容。


## v4参数与使用示例

设计判断先读 `analysis_exhibits.md`。新增能力不依赖新库；表格需内联 `consulting-layouts.css`。

- `formatNumber(value,{decimals,grouping,signed,suffix})`：decimals为0–6，默认最多8位并去末尾零；grouping默认true。只格式化显示，不修改几何源值。
- `difference(start,end,{mode,decimals,suffix,basis,periods})`：返回 `{value,label}`；mode为absolute（默认）/relative/pp/cagr。pp必填basis=fraction或percent；cagr必填实际年数periods。常规relative不接受零/负起点；cagr不接受非正起止值。
- `waterfall` 新增 `format`、`comparison:{from,to,mode,decimals,suffix,basis,periods,showRelative}`。索引从0起，from < to，比较累计端点；showRelative用于绝对差附带相对变化。单个括号预留图顶空间，非自动生成的装饰。不支持堆积瀑布。
- `stacked` 的mode为absolute（默认）或percent；`mekko`仅支持百分轴。两者的 `labelContent:value|share|both` 默认value；`shareDecimals`默认0。
  `labels:auto|table` 默认auto，标签过密或有零值时使用完整表。每列须列全所有系列，未知不得填0；系列名列内唯一，跨列颜色/顺序固定，第一系列贴零基线。stacked支持同waterfall的comparison，比较的是原始总量。
- `comparisonTable` 的columns中type为text（默认）或number；number可设format与 `bar:{domain:[min,max]}`，domain须递增、含0且覆盖整列。`derive:{from,to,mode,basis,periods}` 引用同一行values的键；format用于结果显示。单位用unit列头呈现。
  `bar.role:value|delta` 可显式指定色义；派生差异列默认delta，普通原值列默认value。delta使用主题数学正负色，value使用强调色，不能把品牌绿当作增长色。
  rows中的kind为data（默认）/group/total；group使用label，其余使用values对象，selected可选。null/undefined显示“—”；总计值显式给定，不擅自汇总比率。非法增长基数会报错，需要改用绝对差或明确文字说明。表格高度由内容决定，需自行分页。
- `processFlow` 用显式stages和transitions表达线性推进，至少2阶段、转换条件数=阶段数−1。stages必填label/owner/output/gate；支持换行，容量不足报错。分支/反馈/跨职能关系用其他图型。

```js
kit.waterfall({width:740,height:360,items,
  format:{decimals:1},
  comparison:{from:0,to:4,decimals:1,suffix:'亿元',showRelative:true}});

kit.comparisonTable({title:'渠道复核',columns:[
  {key:'name',label:'渠道'},
  {key:'start',label:'期初',type:'number',unit:'亿元'},
  {key:'end',label:'期末',type:'number',unit:'亿元'},
  {key:'change',label:'变化',type:'number',unit:'亿元',
   derive:{from:'start',to:'end'},format:{decimals:1},bar:{domain:[-2,2]}}
],rows:[{values:{name:'渠道甲',start:6.4,end:5.3}}]});
```

旧waterfall调用保持兼容，新增标签容量检查可能要求扩容；Mekko不再静默省略小片标签，原来紧凑的画布可能需要增加高度或改表。这是显式的数据完整性门禁。
完整示例构建：`node scripts/build_analysis_reference.cjs`；含v3快照对照的六页HTML为 `assets/analysis_reference_deck.html`。
