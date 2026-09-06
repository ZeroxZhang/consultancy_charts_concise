# 自定义图表、图示与SVG

## 选择实现而非受制于配方

| 表达关系 | 可用视觉 | 实现起点 |
|---|---|---|
| 精确比较与范围 | 点/条、哑铃、子弹、区间/森林图、tornado | ExhibitKit或ECharts原生/custom |
| 趋势、结构和分布 | 小倍数、指数图、堆积面积、Mekko、treemap、sunburst、箱线、分位数带、点带 | ECharts、Vega-Lite或专用SVG；真实观测支持分布 |
| 地理与关系 | 区域地图、流向、network、Sankey、chord、邻接矩阵 | ECharts/D3/ELK；地理/节点边/流量依据真实存在 |
| 分解与策略 | 议题树、驱动树、战略屋、价值链、能力地图、层级金字塔 | Diagram renderer或自由SVG/HTML；布局不冒充数值 |
| 过程与机制 | 流程/分支/循环、服务蓝图、客户旅程、泳道、鱼骨、系统机制 | 节点/边/组的SVG或专用布局；关系写含义和证据状态 |
| 取舍与行动 | 决策树、选项矩阵、RACI、路线图、里程碑、依赖图 | HTML/SVG或复杂图布局；无日期不画精确时长 |
| 解释性信息图 | 结构剖面、价值交换、步骤分解、带注释的矢量插图 | 自由SVG、已有合法图片、图标；数据和装饰作用分明 |

不存在“所有图都必须经过9种配方”的要求。已有render_echarts_svg.cjs也接受原生option：

```js
const {render}=require('./scripts/render_echarts_svg.cjs');
const result=render({width:1000,height:400,theme_id:'mckinsey',option:{
  xAxis:{type:'category',data:['甲','乙']},yAxis:{type:'value'},
  series:[{type:'boxplot',data:[[1,2,3,4,6],[2,3,4,5,8]]}]
}});
```

custom series需要函数时可以在Node中调用同一API，JSON文件不承载JavaScript函数。图形、标签与模型计算都由作者检查，不能因生成SVG成功宣称语义正确。

## 通用图示构建

`node scripts/render_diagram.cjs input.json output.svg` 或Node的`render(spec)`用于节点、边、分组与文字的自由组合。不是封闭的图型库，也不替作者判断业务关系。支持矩形/圆角/椭圆/菱形/文字节点，关系线、正交/折线控制点、组背景和注释。画布和位置由作者决定，文字按交付字体实测换行，空间不足报具体节点；可调整节点尺寸、换行/布局或直接改用专用SVG。

```json
{
  "id":"approval-flow", "width":1000, "height":300,
  "title":"方案在验证成立后进入扩展", "theme_id":"mckinsey",
  "nodes":[
    {"id":"a","x":30,"y":70,"w":220,"h":100,"title":"小范围验证","body":"核对需求与贡献"},
    {"id":"b","x":390,"y":70,"w":220,"h":100,"title":"判断条件","body":"效果与资源符合约束","shape":"round"},
    {"id":"c","x":750,"y":70,"w":220,"h":100,"title":"分阶段扩展","body":"持续观察反证"}
  ],
  "edges":[
    {"from":"a","to":"b","label":"核验","labelX":320,"labelY":115},
    {"from":"b","to":"c","label":"条件成立","labelX":680,"labelY":115}
  ]
}
```

完整字段以脚本和其测试为准：nodes的x/y/w/h是布局坐标；edges引用真实id、可指定fromSide/toSide、points与labelX/Y；groups仅用作语义分区，annotations补充边界。无默认节点数量上限；读不清时按论证分组/拆解。边的交叉和图形遮挡仍需目视。

输出SVG文字依赖宿主的字体：内联到同typography_id且已pack_fonts的HTML后截图/PDF。独立SVG不自动宣称字体自包含。节点大小默认不编码金额；若定量面积/位置有意义，需使用显式数值映射或对应图表，不用手摆冒充。

## 编辑而非仅保全

大量输入可用概览＋细节、分面、聚合、代表案例或全文附录。由作者决定业务分组，保留重要异常和证据去向，不让运行库自动替你决定“其他”。同一展示中计算精度与显示精度分开；极小非零用适当小数或“小于”标签，不强制展示四位小数。

主展品直接呈现主判断需要的比较，标关键差额/分母；标题、lead、注释和页底总结不必重复同一意思。自定义结构依旧沿用主题语义、字体与来源；不增加图型配额。
