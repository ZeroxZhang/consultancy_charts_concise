# 真实样本对标与边界 · 2026-09-05

本版研究区分真实横版演示稿、纵版公开研究报告、开源可视化工具。
不能用公开PDF推断三家公司内部模板，也不能由公司名断言哪家“密度最低”。

| 样本 | 实际检查位置 | 观察与转化 |
|---|---|---|
| [BCG AI-first Executive Perspectives](https://media-publications.bcg.com/BCG-Executive-Perspectives-AI-First-Companies-Win-the-Future-Issue1-10June2025.pdf) | PDF第8页，印刷页7，已看渲染图 | 横版三栏：两组公司例证与综合对比图共同支撑判断；不是三条大KPI。转化：证据表+综合图的复合布局，示意与事实明确分区。 |
| [Bain Global Private Equity Report 2025](https://www.bain.com/globalassets/noindex/2025/bain_report_global-private-equity-report-2025.pdf) | PDF第10页，Figure 3，已看渲染图 | 三个共用类别的比较图；箭头直接标差异；红色代表年份组而非负值。转化：小倍数、直接差值注释、按语义分配色板。这是纵版报告展品，不是横版模板。 |
| [BCG Global Wealth Report 2025](https://web-assets.bcg.com/56/26/ecb7a6634088816480a6c245cc6f/2025-globalwealthreport-june2025.pdf) | PDF第7页，Exhibit 3，已看渲染图 | 地理节点、流向、量值标签、增速可整合为一个展品；需要说明数据层含义。转化：复杂图由真实关系驱动，不能凭类型新颖认定专业。 |
| [McKinsey Global Payments 2024](https://www.mckinsey.com/industries/financial-services/our-insights/global-payments-in-2024-simpler-interfaces-complex-reality) | 正文与Exhibit 1–3说明已读；本次未完成其图片目视 | 结论与分析展品相连，可用于证据结构参考；不据此声称完成McKinsey版面测量。 |

## 测试产物直接证据

- P04四根条形被拉满大块区域，右列事实未形成充分归因。
- P08行业/公司、出货/收入/出口等指标同轴排名；脚注不能消除视觉暗示。
- P16将少量案例归纳为“公式”，主张强于证据；加入反例与验证问题。
- P17异质单位的规模泡、手摆坐标与主观评分混合；改为透明等级矩阵。
- P18三列大空框无法表现赛道×区域×模式组合；改为条件化决策表。
- P19阶段、里程碑与说明重复；改为责任泳道+阶段门禁。
- 原QA明确“未做人眼目测”却通过；新增逐页图像验收及未验收状态。

## 本版选择

保留HTML产品与导航，引入证据台账、媒介密度预算、语义色、10种复合布局变体、
10个可运行SVG组件、1个HTML比较表、9个ECharts配方与自动截图脚本。旧56图型索引继续有效，但不声称56种均已实现。
样稿前6页为用户材料的设计验证，数字未重新核验；后3页合成数据覆盖组件。
这是一次能力迭代与代表页验证，不宣称已经达到某咨询公司的认证或适配所有题材。
