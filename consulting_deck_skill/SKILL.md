---
name: consulting-deck-skill
description: >-
  制作与迭代咨询风格的战略汇报、董事会材料、研究型 reading deck 和商业演示。
  从简报、大量原始数据或文本证据与 storyline 出发，选择并生成高密度复合图表、表格和关系图，
  将输入结构、读者比较任务、图型与渲染路径显式匹配后生成固定尺寸分页 HTML，
  并执行逐页渲染、证据与视觉验收。适用于咨询级 PPT/deck、McKinsey/BCG/Accenture
  风格材料；默认交付 HTML，可打印 PDF，不冒称原生可编辑 PPTX。
---

# 咨询 deck 制作技能 · v5

目标是让决策者能独立读懂、核对并采取行动。公开咨询演示稿是参考样本，
不是内部模板或“顶级质量”的认证。保留现有分页引擎，优先改进论证与信息设计。

## 执行契约

- **一页一个主判断，可以有多个证据模块。** 不把“一页一观点”误写成一图、五条要点或固定两栏。
- **密度是有效证据的密度。** 不靠缩字、重复标题、加装饰图或虚构数字填空。
- **大量输入先结构化再图示化。** 先识别数据表、时间序列、矩阵、层级、节点边、任务责任或文本论证结构，再按读者操作选图；材料多本身不是使用复杂图的理由。
- **分析表达优先。** 借鉴 think-cell 的数据标注、对齐和结构表达；是否采用取决于读者的比较任务，不设风格覆盖率或复杂图配额。
- **数据和判断分开。** 数据记录来源、时间、单位、分母、范围和核验状态；计算记录公式。
  未找到来源的事实保留缺口，不改贴 Illustrative 冒充证据。仅真正合成的数据标“示意数据”；
  作者建议标“建议”，主观评估标“分析判断”，估计值列方法与区间。
- **先写论证再制作；实际看图才可声称视觉验收。** 代码检查和截图像素统计不能替代目视。
- HTML 是当前产品契约；用户明确要求可编辑 PPTX 时先说明当前能力边界，不能改扩展名冒充。
- 既有用户授权和偏好持续有效。用户已授权自主迭代时记录设计决策并继续，不重复索要签字。

## 工作流与门禁

| 阶段 | 输出 | 进入下一阶段的条件 |
|---|---|---|
| S0 简报 | brief.md | 明确受众、要做的决定、reading/presentation、范围、素材、截止日期 |
| S1 证据与输入建模 | source_inventory.json + evidence.json + research_notes.md | 原始材料有清单；主判断有原子证据；输入结构、缺口、推断和口径差异显式列出 |
| S2 视觉系统 | visual_spec.md | 语义色登记表、字号、页面预算、媒介与依赖模式明确 |
| S3 storyline | ghost_deck.md | 主判断→证据→决策的横向链闭合；必要的新方向已向用户确认 |
| S4 分页与选型 | page_plan.md | 每页确定证明责任、证据模块、关系、主视觉、候选图及布局 |
| S5 页面规格 | page_specs.md | 证据充分、几何编码合法、内容预算能装下、无重复占位模块 |
| S6 制作 | deck.html | 复用引擎、运行图示组件、逐页截图与打印检查 |
| S7 独立 QA | qa_report.md + renders/ | 内容、视觉、工程分别验收；Blocking/Major 为零才称通过 |
| S8 交付 | HTML、预览、QA 与限制 | 交付可打开文件，准确说明在线/离线、核验范围与遗留项 |

### S0 · 输入与媒介

先读取已有简报及用户素材，仅追问会改变结果的缺项；不机械重复问卷。
- 深度行业研究、董事会预读：默认 **reading deck**；现场讲解明确时用 presentation。
- 记录：受众、决定、核心问题、素材清单、语言、品牌、页数范围、尺寸、数据截止日期。
- 默认中文跟随用户、16:9 1280×720；页数由论证决定，不为达到10–30页而填充。
- 当前引擎允许 CDN 依赖；S0 区分 online-single-file 与 offline-self-contained。
  前者是单文件入口但需要网络；后者必须把库内联或把图表静态化并断网复测。

### S0a · 配色选择（一次询问，持续沿用）

内置选择恰好三套：**麦肯锡风格（默认） / BCG波士顿咨询风格 / 埃森哲风格**。
- 优先继承用户本次明确选择，其次当前项目已记录主题。已有选择不重复问；不从行业或题材猜主题。
- 尚未选择且未授权默认/自主决定时，在简报中询问一次：“这份 deck 使用哪套配色？麦肯锡风格（默认，深蓝/电蓝）、BCG风格（深绿）、埃森哲风格（深紫）。”可用异步选择工具，研究工作继续，主题相关制作等待选择或允许的默认处理。
- 用户说“默认/你定/直接生成”采用 mckinsey。可选问询被跳过且平台允许继续时，明确告知采用默认并记录 default；不能把沉默写成用户确认。用户明确要求等待其选择时必须等待。
- 既有自定义品牌约束保留；与三套预设冲突时明确说明，记录以哪套为基础及覆盖值并重验，不偷偷映射用户点名的其他公司风格。
- brief.md记录 `theme_id: mckinsey|bcg|accenture`、`theme_version: 3.0.0`、`selection_basis: explicit|inherited|default`、`overrides: {}`。未填写ID默认mckinsey，非法ID报错。
- 中途更改主题：更新brief/visual_spec，保留实体→cat索引，重新生成所有SVG、ECharts、表格、截图/PDF并复验。最终交付锁定一套主题，用户未要求时不额外加界面选择器。

### S1 · 以证明责任组织研究

可并行派2–3个研究代理处理独立主题，使用 `assets/subagent_prompts.md`；主会话核验关键事实。
先列“需要什么证据才能让这个标题成立”，再搜索，不以每主题凑10条事实代替研究。
每个证据项遵守 `references/evidence_design.md` 的契约，尤其检查：
同一期间/范围/指标才可直接排名；公司样本不能替代行业；相关不证明因果。
报告发布日期在截止日期之后的资料不得用于当时视角的事实。

用户提供大量文件时先生成`source_inventory.json`：文件/表/工作表、范围或页码、行列数、字段、单位、时间粒度、主键候选、缺失/异常、可抽取关系与处理状态。文本按主张/证据/反证/边界/来源定位拆分；只有明确语料范围和编码规则后，文本频次才能进入统计图。
对每组可视化候选数据标记`input_shape: I-01..I-15`和`comparability`；未知口径不得进入共轴、排序、相减、份额、流量或同一色阶。

### S2 · 视觉系统

读取 `references/color_and_type.md` 与 `references/slide_anatomy.md`；品牌依据见 `references/theme_research.md`。
从 `assets/deck-themes.js` 读取选定主题，作为CSS、SVG和ECharts唯一色值来源；不得混用三套主题。
锁定品牌、实体、连续值、偏差、状态、强调六类颜色角色；只启用本 deck 用到的角色。
把实体与颜色写进登记表；增长方向与经营好坏分开。标题、图注、Source 要在打印尺寸可读。
先定义标题区/证据区/来源区的几何预算，再选组件；不从一组巨大 KPI 卡开始套版。

### S3 · storyline

读取 `references/storyline_method.md`、必要时 `references/logic_frameworks.md`。
写：受众决定 → 暂定答案 → 3–5个支撑论点 → 每页判断与证据 → 风险/边界 → 行动。
SCQA 是可选叙事框架，不强行用前三页铺背景。
每个标题下标 evidence_id；标题的语气不得超过证据强度。
向用户呈现简洁骨架；已有完整自主制作授权时记录采用的骨架继续，缺少关键方向才等待回答。

### S4 · 分页与图表选型

读取 `references/chart_matching.md`、`references/layout_templates.md`、
`references/exhibit_system.md` 与 `references/analysis_exhibits.md`，按需读取 `references/chart_cards.md` 对应 B 编号。
每页记录：
`页号 | 主判断 | 证明责任 | 证据ID | 输入结构I编号 | 读者操作A编号 | 模块关系 | 候选图型 | render_route | recipe/B编号 | 布局 | 密度与标签计划 | 回退触发器 | 候选/淘汰理由`。

先做可比性门禁，再按`输入结构 → 读者操作 → 候选图型 → 页面组合 → 实现路径 → 容量回退`路由。通常比较2–3种合理图型；唯一明确适配时直接采用。没有柱条线占比、饼图配额或复杂图配额。
主动考虑：哑铃/坡度/子弹图、区间图、Mekko、热力矩阵、小倍数、驱动树、泳道、决策树、
旅程、价值链、因果环、地图流向、带数据条的比较表。复杂度必须由真实关系或变量支撑。
多样性审核用于发现“不同问题被套成同一版式”，不以变换图型本身为目标。
大量文本优先抽取共同维度、关系边、责任/交付/条件或主张—证据—边界；无法形成这些结构时保留高质量表格/文字，不强行信息图。

### S5 · 逐页设计

按 `references/evidence_design.md` 页面规格填写完整数据与解释。
独立页面批次可交2–4个设计代理；主会话统一术语、语义色和数据口径。
每页必须具备：
1. 主判断、可信度、适用范围与读者要回答的问题；
2. 不重复的证据模块，每块的“子结论—数据/机制—来源—含义”；
3. 模块关系（并列/拆解/因果假设/流程/对比）和明确阅读顺序；
4. 内容区各块 x/y/w/h 或显式 Grid 行列预算、字号、标签与连接线空间；
5. 几何契约：字段→位置/长度/面积/颜色/线型；定性图声明档级而非假精度；
6. Source/Note、估计方法、适用边界；评论列、KPI、takeaway 按需要使用，不固定必填。
7. 图表精加工：关键比较的端点与公式、总量/份额的标签位置、标签过密时的回退方式；表格记录列单位和数据条量尺，图示声明箭头含义。
8. 路由契约：`input_shape`、`reader_operation`、`comparability`、`render_route`、`recipe`、候选淘汰理由、项数/系列数/节点数与`fallback_trigger`。

reading 正文通常2–4个证据模块，但单个完整主展品也可以；封面、过渡页不套密度要求。
发现大片空白先判断内容不足还是容器拉伸；补充必要分析、改布局或合页，禁止只加背景块。

### S6 · 制作与验证

1. 用 `node scripts/apply_theme.cjs assets/deck_engine.html deck.html <theme_id>` 生成选定主题引擎，替换其示例页，保留翻页/缩放/总览/打印/深链逻辑。
2. 将 `assets/consulting-layouts.css` 内联到 HTML；按布局变体组装证据区。
3. 高频定量图走`assets/chart-runtime.js`：`prepare`按真实容器预算构建配方，渲染后必须`check`实际文字；若返回新计划，重绘并再次验收。`echarts-recipes.js`只是底层option构建器，单独调用不代表容量或视觉通过。浏览器引擎固定ECharts 6.1.0、SVG renderer，已接入完整路径。
4. offline-self-contained优先`npm ci`安装固定依赖后运行`node scripts/render_echarts_svg.cjs input.json output.svg`，脚本执行同一主题/预算/文字验收。需要多页时显式加`--paginate`并嵌入全部输出；浏览器用`data-recipe-page`逐一安排返回页，不能只显示第一页。完整表也装不下则明确报错，作者继续拆分，不能缩字。
5. `assets/exhibit-kit.js`提供10种零依赖SVG和1种HTML比较表，用于咨询特定校验与静态图示。ECharts原生/custom series处理其他坐标系、统计和关系图；HTML/CSS处理高文本密度表格；D3/ELK/Vega-Lite只按真实需要引入。
6. 图表必须写单位、直接标签、必要图例；按比较任务添加参考线、差异或关键点注释。差异由源数据计算，关键内容不能藏 hover；过密时执行规格中的回退，不缩放数据图形来迁就标签。
7. 用`scripts/test_echarts_recipes.cjs`、`test_theme_browser.cjs`和既有组件测试验证数值几何、主题、浏览器/SSR；大量输入另跑`test_dense_inputs.cjs`。用`qa_deck.cjs`渲染每页、检查越界/有效数据字号、PDF标题与页数、离线内容一致性；用可用图片工具实际逐页看图。自动文字验收不能代替证据核验、数据点遮挡或整体视觉判断。
8. 引擎改动额外检验1280×720与1024×768、#3深链、G/ESC、键盘、缩放、全屏、打印页数和断网。

### S7 · 独立质量验收

交给未参与制作的 QA 代理：成稿、证据库、视觉规范、`references/workflow_qa.md`、截图和PDF。
不给作者自评分或“已经修好”的结论。代理必须独立阅读图像；工具看不到图时视觉状态为“未验收”。
每页评估：证据充分性、阅读层级、布局/重心、编码与配色、图表完成度（评分锚点见QA）。
按 `references/analysis_exhibits.md` 检查表达收益、注释计算与小片标签完整性；“很像think-cell”不能替代正确与可读。
数字一致只是最低条件。数据排名误导、虚构精度、文字截断、重要证据缺失都是阻断项。
Blocking/Major 修复后复验；无法修复则明确不通过，不将未目视改称有条件通过。
若环境无子代理能力，如实标“作者自检，独立QA未执行”，不冒称独立通过。

## 按需参考

- 证据与密度：`references/evidence_design.md`；`references/slide_anatomy.md`
- 布局与组件：`references/layout_templates.md`；`references/exhibit_system.md`
- 高密度输入、选图与编码：`references/chart_matching.md`；`references/chart_cards.md`
- 分析语法与示例：`references/analysis_exhibits.md`；`assets/analysis_reference_deck.html`（六页合成数据，含v3前后对照及纯表格反例）
- 语义配色：`references/color_and_type.md`
- 论证：`references/storyline_method.md`；`references/logic_frameworks.md`
- 样例：`references/worked_example.md`（原始数据示例）；`assets/reference_deck.html`（v2复合页实物）
- 大量输入实测：`assets/dense-input-example/`；`scripts/build_dense_reference.cjs <输出目录>`生成六页离线样稿及来源清单、原子证据、派生公式、选型计划。固定合成夹具，非通用文件抽取器；文本编码和选型仍由作者判断。
- 验收：`references/workflow_qa.md`；`assets/subagent_prompts.md`
- 对标证据与边界：`references/benchmark_findings.md`
