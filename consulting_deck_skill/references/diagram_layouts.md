# 图示布局入口与验证范围

`render_diagram.cjs` 保留原显式坐标 `render(spec)` 接口，增加 `layout(spec)`；`render` 收到 `layout` 时先自动布局。输出为自包含 SVG 几何，字体由 HTML/PDF 的现有打包入口嵌入。

```js
const {layout, render} = require('./scripts/render_diagram.cjs');
const spec = {
  width:1080, height:540,
  layout:{direction:'auto', fit:'error', lanes:['客户','团队'], stages:['识别','决策','执行']},
  nodes:[
    {id:'a',title:'需求与约束',lane:'客户',stage:'识别'},
    {id:'b',title:'条件满足？',role:'decision',lane:'团队',stage:'决策'},
    {id:'c',title:'交付',role:'outcome',lane:'团队',stage:'执行'}
  ],
  edges:[{from:'a',to:'b',label:'提交'},{from:'b',to:'c',label:'满足'}]
};
const positioned = layout(spec); // 实际尺寸、节点矩形、resolvedPoints、layout_result
const svg = render(positioned);
```

- `lane`（或 `owner`）编码主体，`stage` 编码阶段。配置清单决定顺序；缺阶段时用无环边自动计算拓扑阶段。循环需标 `role:'feedback'`/`feedback:true` 或显式阶段，不能删边假装树。
- `role:'decision'` 默认菱形，`role:'outcome'` 默认圆角；显式 `shape` 保持优先。类型只是形状入口，不证明决策条件完整。
- `direction:'auto'|'LR'|'TB'`；auto 检查阶段列的可用宽度，窄幅时转为纵向阶段。默认 `minNodeWidth:156`、`margin:24`、`gapX:64`、`gapY:42`、`clearance:10`。gapX/gapY 是最小间距，边标签测量需要时自动扩大通道。字号继承原 18/16，交付字体测量标题与正文换行，不截字、不整体缩字。
- `fit:'grow'`（默认）将不够用的宽高扩到测量需要的最小空间；`layout_result.requested/actual/resized` 明确回传，宿主必须使用真实尺寸，不可固定容器裁切。报告固定正文推荐 `fit:'error'`，容纳失败由作者换方向、调空间或分面。
- 同一 lane/stage 多节点共享单元格并按子行排列；节点高度按文字实际计算。`headers:false` 取消轨道标题；`laneBands:true` 可画低对比泳道底色，默认无全高背景。
- 边按当前节点边界定端口，通过可见性网格作正交路由，避开其他节点。`fromSide/toSide` 可提供端口方向；自动模式重新求点，不沿用旧绝对折线点。显式坐标模式继续支持原 `points`。
- 边标签用真实字体测量候选位置，避开节点与既有标签；找不到空间即失败。原值、作用/条件、假设状态由作者提供；连线默认等宽，不据无量化流程制造流量。

| 关系 | HTML / SVG | PDF | 验证及限制 |
|---|---|---|---|
| lane/stage 轨道、节点文字容量 | 构建时真实字体测量，返回明确矩形与基线文字 | 经浏览器打印静态 SVG | 变尺寸、长标签、多行、混排、字体角色检查；字形以最终浏览器看图为准 |
| 节点边界与连线端点 | `resolvedPoints` 绑定节点；SVG `data-from/data-to` 可核对 | 端点随 SVG 原样打印 | 位移 4px 的反例失败；连线段不穿节点；箭头沿端口方向 |
| 条件/反馈与同格并行 | decision 角色、反馈路由、多节点子行 | 静态保留 | 分支语义与因果证据仍由作者复核 |
| 边标签 | 测量候选并避节点/标签，背景保可读 | 静态保留 | 不保证任意密集图无边交叉或共线；重复/交叉难追踪时分面或调阶段 |

支持以可容纳的阶段流程、泳道、机制与依赖为起点；没有宣称任意复杂网络全自动最优构图。显式坐标路径不自动证明避让，需调用方核对。整个图示仍须实际看 SVG 和最终 PDF。

回归：`node scripts/test_diagram.cjs`（旧接口），`node scripts/test_diagram_layout.cjs`（真实几何、内容/尺寸变化和反例）。前向选型及三种同材料读者任务见本轮 `iteration_v11_reliability/planner/`，不是用加载路径代替实际规划。
