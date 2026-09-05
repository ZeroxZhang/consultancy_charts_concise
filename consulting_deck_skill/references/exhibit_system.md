# 展品系统：选型、实现与能力边界

## 实现路由

| 任务族 | 可用类型 | 实现与成熟度 |
|---|---|---|
| 比较/差距 | 条形、点图、哑铃、坡度、子弹、区间/森林图、tornado | 前3种常规图ECharts；kit提供dumbbell/slope/bullet，区间custom |
| 变化/贡献 | 瀑布、桥图、指数化、小倍数、堆积面积 | kit waterfall；其他ECharts；注释单独规划 |
| 构成/结构 | Mekko、100%堆积、treemap、sunburst、waffle | kit mekko；其他ECharts/SVG；核对整体和分母 |
| 分布/不确定性 | histogram、boxplot、strip、violin、区间带 | ECharts或Vega-Lite；需要原始分布，不能由均值伪造 |
| 关系/流向 | scatter、bubble、Sankey、network、map flows | ECharts/D3；需真实节点/边/经纬度及尺寸图例 |
| 评估/表格 | 热力、Harvey、RACI、决策表、数据条/迷你趋势表 | kit heatmap；HTML表+CSS；定性等级需定义 |
| 层级/机制 | 驱动树、议题树、决策树、战略屋、价值链、鱼骨 | kit tree用于树；SVG/CSS按关系生成，其余需专项目视 |
| 执行/责任 | 泳道、甘特、旅程、roadmap、依赖图 | kit swimlane；HTML时间网格；复杂依赖可用ELK |

现有B-01…B-56保持选型索引；“列入名录”不等于有现成组件。
kit为经过数值测试的8种基础实现；更复杂的标签避让和连接路由仍需逐图渲染验收。
不为展示类型而放radar/桑基；同一数据不支持关系时回到诚实表格。

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
| mekko | items:[{label,segments:[{label,value}]}] |
| tree | root:{label,children:[递归节点]} |
| swimlane | lanes:[标签],stages:[标签],items:[{id,label,lane,stage}],edges:[{from,to}] |

数据和SVG绑定，不写死坐标伪装测量。库拒绝非有限值与结构错误；某些定性字段仍要作者验证。
源数据证据由页面Source承载，不由组件虚构。SVG内文字必须转义。

## 开源技术取舍

- [lieflat-charts](https://github.com/larashero3-dotcom/lieflat-charts)：借鉴数据形状→候选→真实模板→颜色锁定。
  不移植其低字号、hover承载关键信息、圆角卡片和动效偏好到reading deck。
- [diagram-design](https://github.com/cathrynlavery/diagram-design)：借鉴关系语义与布局类型分离、品牌token、节点/边有意义。
  其默认低密度与节点预算不是咨询阅读页通用规定。
- [Apache ECharts](https://echarts.apache.org/handbook/en/concepts/style/)：沿用现有5.5.1，主题与series显式一致；静态SVG优先打印。
- [D3](https://d3js.org/)：几何与自定义标记；需要自担标签布局。
- [Vega-Lite](https://vega.github.io/vega-lite/docs/)：分面、统计转换和声明式编码；输出SVG后内联。
- [ELK](https://github.com/kieler/elkjs)：复杂有向图自动布局；不要把整个关系图变成小字线路板。

本版kit与CSS为原创实现，未复制上述仓库代码。未来实际复用代码应核对所取commit及LICENSE，保留必要声明。
每项外部依赖固定版本并记录体积、离线策略、打印路径；无需引入所有库。

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
- Mekko小片可能省略内部标签，作者必须补外置标签/相邻表，不允许关键信息消失。
- 仅数值与已覆盖结构字段经过脚本验证；任意调色、尺寸和数据组合仍需目视检查。
  heatmap对合成白底计算文本对比；其他组件自定义色板也需逐项检查。

热力表用于对比度计算的颜色格式支持#RGB、#RRGGBB或rgb(r,g,b)，不接受CSS变量字符串；请先解析token。

## v3主题传递

Node读取assets/deck-themes.js；浏览器制作时先加载DeckThemes，所有8个组件均传入同一palette。
positive/negative是组件历史API名，主题适配器把它们映射到数学delta角色，不映射good/risk。
默认快照由scripts/sync_theme_defaults.cjs生成，修改色板后重建并跑test_themes.cjs。
heatmap使用sequential连续插值，叠字根据实际底色选择；仅提供自定义accent而未提供sequential时保留旧版透明度色阶兼容。
