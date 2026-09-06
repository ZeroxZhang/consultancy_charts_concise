---
name: consulting-deck-skill
description: >-
  制作与迭代咨询风格的战略汇报、董事会材料、研究型 reading deck 和商业演示。
  从简报、原始数据、文本资料或已确认文稿出发，按任务深度规划议题、匹配商业/行业/财务/
  数据分析方法，执行分析并综合证据、反证和结论，再组织 storyline 与全篇内容，
  生成高密度复合图表和固定尺寸分页 HTML，执行分析、证据、视觉与工程验收，并同步交付
  同版分页 PDF。适用于
  咨询级 PPT/deck、McKinsey/BCG/Accenture
  风格材料；默认交付自包含 HTML 与 PDF，HTML 可离线一键下载该 PDF，不冒称原生可编辑 PPTX。
---

# 咨询分析与 deck 制作技能 · v8

目标是让决策者能独立读懂、核对并采取行动。公开咨询演示稿是参考样本，
不是内部模板或“顶级质量”的认证。保留现有分页引擎，优先改进论证与信息设计。

## 执行契约

- **一页一个主判断，可以有多个证据模块。** 不把“一页一观点”误写成一图、五条要点或固定两栏。
- **密度是有效证据的密度。** 不靠缩字、重复标题、加装饰图或虚构数字填空。
- **先明确问题、执行分析，再形成结论与页面。** 研究中的初步答案是可推翻假设；表达时才把有证据的答案前置。贡献分解不等于因果，期望目标不等于预测。
- **方法按业务问题匹配。** 分析方法ID与图型ID分开；不以模型数量、名气或主题品牌决定采用。
- **重要内容有去向。** 来源→议题→分析任务→发现→正文/附录可追溯；不采用有理由，关键反证影响相关结论。
- **大量输入先结构化再图示化。** 先识别数据表、时间序列、矩阵、层级、节点边、任务责任或文本论证结构，再按读者操作选图；材料多本身不是使用复杂图的理由。
- **分析表达优先。** 借鉴 think-cell 的数据标注、对齐和结构表达；是否采用取决于读者的比较任务，不设风格覆盖率或复杂图配额。
- **数据和判断分开。** 数据记录来源、时间、单位、分母、范围和核验状态；计算记录公式。
  未找到来源的事实保留缺口，不改贴 Illustrative 冒充证据。仅真正合成的数据标“示意数据”；
  作者建议标“建议”，主观评估标“分析判断”，估计值列方法与区间。
- **先写论证再制作；实际看图才可声称视觉验收。** 代码检查和截图像素统计不能替代目视。
- **字体是交付资源与排版契约。** 新 reading deck 默认衬线主标题、无衬线阅读与数据；从统一配置加载真实字重，字体就绪后绘图，静态 SVG 不自动等于字体自包含。
- HTML + PDF 是当前产品契约：PDF 是同版分页定稿，HTML 内嵌已验收 PDF 供离线一键下载，并保留浏览器打印入口。用户明确要求可编辑 PPTX 时先说明当前能力边界，不能改扩展名冒充。
- 既有用户授权和偏好持续有效。用户已授权自主迭代时记录设计决策并继续，不重复索要签字。

## 工作流与门禁

| 阶段 | 输出 | 进入下一阶段的条件 |
|---|---|---|
| S0 简报与模式 | brief.md | 明确受众、理解/决策目标、范围、analytical/exploratory/editorial及媒介 |
| S1 资料与初步问题 | source_inventory.json + evidence.json + research_notes.md | 材料可定位、关键口径和未知已识别，足以制定分析计划；定向研究继续迭代 |
| S2 分析规划、执行与审查 | analysis_plan.md + findings.md + content_map.md + analysis_review.md | 方法适配且已执行；结果可复核；关键问题有回答或明确未知；无未解决Blocking/Major |
| S3 综合与storyline | ghost_deck.md | 问题→发现→证据/边界→决策或研究结论闭合；重要材料有去向 |
| S4 视觉系统、分页与选型 | visual_spec.md + page_plan.md | 在内容骨架基础上确定语义色、预算、证明责任、主视觉与布局 |
| S5 页面规格 | page_specs.md | 证据充分、几何编码合法、内容预算能装下、无重复占位模块 |
| S6 制作 | deck.html | 复用引擎、运行图示组件、字体打包、逐页截图与打印检查 |
| S7 独立 QA | qa_report.md + renders/deck.pdf + renders/ | 分析、证据、视觉、工程分别验收；HTML/PDF 同版且 Blocking/Major 为零才称通过 |
| S8 交付 | 同名 HTML + PDF、预览、分析底稿、QA与限制 | HTML 离线可下载随附 PDF；两个文件页数、内容和校验值一致 |

表中完整产物适用于分析任务。editorial仅在标题骨架中记录范围、必要核对/修正/未决项及原文段落到页面去向，不强制议题树、Q/T/F/E台账、逐值JSON或逐行AQ表；小型分析可合并为analysis_brief.md。详见分析规划。阶段是依赖关系，发现新证据可返回受影响任务，不一次冻结所有结论。

### S0 · 输入与媒介

先读取已有简报及用户素材，仅追问会改变结果的缺项；不机械重复问卷。
- 深度行业研究、董事会预读：默认 **reading deck**；现场讲解明确时用 presentation。
- 记录：受众、理解/决策目标、核心问题、素材清单、语言、品牌、页数范围、尺寸、数据截止日期。
- 读取 `references/analysis_planning.md`，按范围选择 `work_mode: analytical|exploratory|editorial`；原始材料走分析，开放研究允许先探索，已确认文稿保留轻量路径。
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

### S0b · 字体选择与继承

- 字体与三套配色独立，优先继承用户明确选择和当前项目记录，不增加每次必答的字体问卷。
- 新 reading 默认 `serif-report`：Noto Serif SC600 + DM Serif Text400 主标题，Noto Sans SC / Inter 阅读与数据；明确选Playfair时使用 `serif-playfair`。新 presentation 默认 `sans-presentation`，用户既有选择优先。
- 旧报告不自动迁移；保留原有配置，未记录时先识别实际字体，可用 `legacy-system` 记录兼容方案，但不声称复刻任意旧稿的像素布局。
- brief/visual_spec记录 `typography_id`、`typography_version: 1.0.0`、`typography_selection_basis: explicit|inherited|default`、`font_delivery: embedded-subset|local-assets|legacy-system`。这不改变 `work_mode` 的分析深度。
- 正式交付默认内嵌最终字体子集，构建依赖见 `references/typography_system.md`；品牌自定义字体需补齐资源、字重、许可与实测，不能只改局部CSS名。

### S1 · 资料盘点与初步问题

可并行派2–3个研究代理处理独立主题，使用 `assets/subagent_prompts.md`；主会话核验关键事实。
围绕理解/决策问题及竞争解释识别已有证据和缺口；定向搜索同时寻找支持与反证。初步答案标工作假设，不用先定标题再挑材料；不以每主题凑事实条数代替分析。
每个证据项遵守 `references/evidence_design.md` 的契约，尤其检查：
同一期间/范围/指标才可直接排名；公司样本不能替代行业；相关不证明因果。
报告发布日期在截止日期之后的资料不得用于当时视角的事实。

用户提供大量文件时先生成`source_inventory.json`：文件/表/工作表、范围或页码、行列数、字段、单位、时间粒度、主键候选、缺失/异常、可抽取关系与处理状态。文本按主张/证据/反证/边界/来源定位拆分；只有明确语料范围和编码规则后，文本频次才能进入统计图。
对每组可视化候选数据标记`input_shape: I-01..I-15`和`comparability`；未知口径不得进入共轴、排序、相减、份额、流量或同一色阶。

### S2 · 分析规划、执行与审查

以下完整步骤用于analytical/exploratory；editorial按分析规划中的最小交付核对已确认内容，只在局部问题需要时使用对应方法。

1. 按 `references/analysis_planning.md` 建立议题Q、分析任务T和优先级；先记录分析蓝图，不要求用户逐阶段签字。
2. 读取 `references/framework_router.md`，按问题、业务机制、数据和假设选方法，只读相关卡。每项任务写输入/口径、步骤、预期输出、反证条件及采用/淘汰理由。
3. 实际执行计算、编码、对比或模型，保存可复算底稿；在findings.md记录发现F、推理、证据、替代解释、可信度、限制和改变判断的条件。资料不足可完成缺口诊断，不能伪造模型结果。
4. content_map.md登记重要资料的议题/发现、作用、正文/附录/待补/不采用去向及理由；S3确定页码。关键反证必须影响结论。
5. 按 `references/analysis_review.md` 执行AQ-01…10；复杂分析或重大建议使用独立分析审查代理，模板见 `assets/subagent_prompts.md`。无独立工具准确记录作者自检。
6. 只有ready或ready_with_limits进入S3；后者意味着限制已写入允许表达的结论，不允许保留依赖未知前提的确定推荐。发现与计算会改变时同步更新下游。

### S3 · storyline

读取 `references/storyline_method.md`，按NT方法选择叙事。
分析任务从已审查的findings综合；editorial从已确认文稿和必要核对结果组织：受众问题 → 有依据的答案/未知 → 支撑论点 → 证据与反证/边界 → 行动或后续研究。没有分析结果时不把计划当结论。
SCQA 是可选叙事框架，不强行用前三页铺背景。
分析任务的关键标题下标 question_id、finding_id、evidence_ids；editorial用原文段落定位和必要计算即可，不要求生成分析编号。标题的语气不得超过证据强度；研究报告允许以开放问题组织未知。
向用户呈现简洁骨架；已有完整自主制作授权时记录采用的骨架继续，缺少关键方向才等待回答。

### S4 · 视觉系统、分页与图表选型

读取 `references/color_and_type.md` 与 `references/slide_anatomy.md`；品牌依据见 `references/theme_research.md`。
读取 `references/typography_system.md`，从 `assets/deck-typography.js` 获取字体、真实字重、字号和行高。衬线只用于封面、章节、页主判断，模块/正文/图注/数据用无衬线。按实际字体重算标题与证据区预算，不靠缩小数据字迁就新标题。
从 `assets/deck-themes.js` 读取选定主题，作为CSS、SVG和ECharts唯一色值来源；不得混用三套主题。
锁定品牌、实体、连续值、偏差、状态、强调六类颜色角色；只启用本 deck 用到的角色。
把实体与颜色写进登记表；增长方向与经营好坏分开。标题、图注、Source 要在打印尺寸可读。
先定义标题区/证据区/来源区的几何预算，再选组件；不从一组巨大 KPI 卡开始套版。

读取 `references/chart_matching.md`、`references/layout_templates.md`、
`references/exhibit_system.md` 与 `references/analysis_exhibits.md`，按需读取 `references/chart_cards.md` 对应 B 编号。
每页记录：
`页号 | 主判断 | 议题/发现ID或editorial原文定位 | 证明责任 | 证据ID | 输入结构I编号 | 读者操作A编号 | 模块关系 | 候选图型 | render_route | recipe/B编号 | 布局 | 密度与标签计划 | 回退触发器 | 候选/淘汰理由`。

先做可比性门禁，再按`输入结构 → 读者操作 → 候选图型 → 页面组合 → 实现路径 → 容量回退`路由。通常比较2–3种合理图型；唯一明确适配时直接采用。没有柱条线占比、饼图配额或复杂图配额。
主动考虑：哑铃/坡度/子弹图、区间图、Mekko、热力矩阵、小倍数、驱动树、泳道、决策树、
旅程、价值链、因果环、地图流向、带数据条的比较表。复杂度必须由真实关系或变量支撑。
多样性审核用于发现“不同问题被套成同一版式”，不以变换图型本身为目标。
大量文本优先抽取共同维度、关系边、责任/交付/条件或主张—证据—边界；无法形成这些结构时保留高质量表格/文字，不强行信息图。

### S5 · 逐页设计

按 `references/evidence_design.md` 页面规格填写完整数据与解释。
独立页面批次可交设计代理；主会话统一术语、语义色和数据口径。发现证据不足或结论矛盾，定位受影响F/T或原文段落退回必要分析/核对，不为“保持标题”强行制作。
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

1. 用 `node scripts/apply_theme.cjs assets/deck_engine.html draft.html <theme_id> <typography_id>` 生成选定主题和字体的引擎，替换其示例页，保留翻页/缩放/总览/打印/深链逻辑。构建时 `FONT_PYTHON` 指向已安装 `scripts/requirements-fonts.txt` 的Python。
2. 将 `assets/consulting-layouts.css` 内联到 HTML；按布局变体组装证据区。
3. 高频定量图走`assets/chart-runtime.js`：`prepare`按真实容器预算构建配方，渲染后必须`check`实际文字；若返回新计划，重绘并再次验收。`echarts-recipes.js`只是底层option构建器，单独调用不代表容量或视觉通过。浏览器引擎固定ECharts 6.1.0、SVG renderer，已接入完整路径。
4. offline-self-contained优先`npm ci`安装固定依赖后运行`node scripts/render_echarts_svg.cjs input.json output.svg`，脚本执行同一主题/预算/文字验收。需要多页时显式加`--paginate`并嵌入全部输出；浏览器用`data-recipe-page`逐一安排返回页，不能只显示第一页。完整表也装不下则明确报错，作者继续拆分，不能缩字。
5. `assets/exhibit-kit.js`提供10种零依赖SVG和1种HTML比较表，用于咨询特定校验与静态图示。ECharts原生/custom series处理其他坐标系、统计和关系图；HTML/CSS处理高文本密度表格；D3/ELK/Vega-Lite只按真实需要引入。
6. 图表必须写单位、直接标签、必要图例；按比较任务添加参考线、差异或关键点注释。差异由源数据计算，关键内容不能藏 hover；过密时执行规格中的回退，不缩放数据图形来迁就标签。
   定稿后运行 `node scripts/pack_fonts.cjs draft.html deck.html <typography_id>` 重新收集全篇字符并嵌入字体；后续改字需重新打包。隐藏页、data-spec/data-opt会纳入，任意脚本生成的额外字符通过pack API的extraText提供。截图、打印前等待window.deckReady，字体失败不能称完成。
7. 用`scripts/test_echarts_recipes.cjs`、`test_theme_browser.cjs`和既有组件测试验证数值几何、主题、浏览器/SSR；大量输入另跑`test_dense_inputs.cjs`。用`qa_deck.cjs`渲染每页、检查越界/有效数据字号、PDF标题与页数、离线内容一致性；用可用图片工具实际逐页看图。自动文字验收不能代替证据核验、数据点遮挡或整体视觉判断。
8. 引擎改动额外检验1280×720与1024×768、#3深链、G/ESC、键盘、缩放、全屏、打印页数和断网。
9. 字体升级另跑test_typography.cjs和test_typography_browser.cjs，检查实际字体、真实字重、数字等宽、缺字/坏资源拒绝、PDF嵌入与冷缓存断网版式。SSR固定字体测宽不替代最终浏览器边界和目视。
10. 交付层改动另跑 `test_delivery.cjs`，检查HTML/PDF页数门禁、离线下载、下载字节一致、打印控件隐藏及页面状态保持。

### S7 · 独立质量验收

交给未参与制作的 QA 代理：成稿、分析底稿与发现、内容覆盖、证据库、视觉规范、`references/workflow_qa.md`、截图和PDF；editorial用原文定位与必要核对记录替代完整分析台账。
复核最终标题是否保留S2的证据边界、关键反证与目标/预测区别；分析状态按AQ报告，不能用视觉通过替代。
不给作者自评分或“已经修好”的结论。代理必须独立阅读图像；工具看不到图时视觉状态为“未验收”。
每页评估：证据充分性、阅读层级、布局/重心、编码与配色、图表完成度（评分锚点见QA）。
按 `references/analysis_exhibits.md` 检查表达收益、注释计算与小片标签完整性；“很像think-cell”不能替代正确与可读。
数字一致只是最低条件。数据排名误导、虚构精度、文字截断、重要证据缺失都是阻断项。
Blocking/Major 修复后复验；无法修复则明确不通过，不将未目视改称有条件通过。
若环境无子代理能力，如实标“作者自检，独立QA未执行”，不冒称独立通过。

### S8 · 双格式交付

读取 `references/delivery_system.md`。S7完成且没有Blocking/Major后，用
`node scripts/package_delivery.cjs deck.html renders/deck.pdf delivery <报告名>` 生成同名 HTML 与 PDF。
HTML 的“下载分页 PDF”必须下载这份已验收 PDF；“打印 / 另存 PDF”仅作为临时打印入口。交付时分别提供两个可打开文件，并报告页数、PDF校验值、验证状态和已知限制。
打包后若修改正文、数据、主题、字体或页序，必须重新生成PDF、复验并打包，不能让HTML内嵌旧版PDF。

## 按需参考

- 分析规划与模式：`references/analysis_planning.md`；模型按问题检索：`references/framework_router.md`
- 方法卡：`references/business_industry_methods.md`、`references/strategy_operations_methods.md`、`references/financial_methods.md`、`references/data_methods.md`（仅按路由读取）
- 分析门禁与行为验证：`references/analysis_review.md`
- 证据与密度：`references/evidence_design.md`；`references/slide_anatomy.md`
- 布局与组件：`references/layout_templates.md`；`references/exhibit_system.md`
- 高密度输入、选图与编码：`references/chart_matching.md`；`references/chart_cards.md`
- 分析语法与示例：`references/analysis_exhibits.md`；`assets/analysis_reference_deck.html`（六页合成数据，含v3前后对照及纯表格反例）
- 语义配色：`references/color_and_type.md`
- 字体角色、资源、打包与兼容：`references/typography_system.md`；唯一配置 `assets/deck-typography.js`
- 双格式交付、内嵌PDF与版本一致性：`references/delivery_system.md`；打包工具 `scripts/package_delivery.cjs`
- 论证：`references/storyline_method.md`；`references/logic_frameworks.md`
- 样例：`references/worked_example.md`（原始数据示例）；`assets/reference_deck.html`（v2复合页实物）
- 大量输入实测：`assets/dense-input-example/`；`scripts/build_dense_reference.cjs <输出目录>`生成六页离线样稿及来源清单、原子证据、派生公式、选型计划。固定合成夹具，非通用文件抽取器；文本编码和选型仍由作者判断。
- 验收：`references/workflow_qa.md`；`assets/subagent_prompts.md`
- 对标证据与边界：`references/benchmark_findings.md`
