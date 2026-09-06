# 子代理任务模板 · v6

使用当前环境实际提供的代理工具。任务按可独立完成的议题或页面拆分，不依赖特定CLI的Agent参数；无代理能力时由主会话执行并如实记录独立审查未执行。
模板中的占位符在派发时替换。约定独立输出路径，避免多人改同一文件。主会话统一议题、口径、语义色与最终结论，并抽查返回依据。

## A · 证据研究（S1/S2）

```text
请围绕以下问题补充证据：{Q/T编号、具体问题、工作假设及竞争解释}。
任务边界：{地域、对象、指标、时期/截止日、允许的来源和工具}。
已有输入：{brief、source_inventory、已有evidence、必要原材料}。
先读{skill}/references/evidence_design.md及analysis_plan对应任务。

请同时寻找支持、反证、基准与边界，避免重复转述同一来源当独立证据。
每个数字记录数值、单位、期间、范围、分母、原文页/表/段、来源及核验状态；
仅检索摘要不得标verified。用户材料保留user-provided，合成材料保留synthetic。
缺失保留null，不凑事实数量，不把整个文档作为一个证据项。

输出到{目录}/research_{任务ID}.md及evidence_{任务ID}.json：
已核验事实、相反/不一致证据、口径差异、缺口及其对任务的影响。
研究发现若改变问题范围，提出变更及依据；不要自行冻结最终storyline。
```

## D · 分析任务（S2）

```text
请完成{Q/T编号及业务问题}，范围为{范围}，输出到{独立目录}。
输入：{brief、相关原材料、evidence、analysis_plan对应任务}。
先读{skill}/references/analysis_planning.md、framework_router.md及选用方法卡。

先确认方法前提、输入与口径，必要时说明改用另一方法或CUSTOM的理由。
实际执行计算、对照或编码，保存可复算工作表/脚本/公式与结果，不能只列工作计划。
围绕竞争解释寻找支持和推翻证据，处理方法假设、相反材料及不确定性。
输入缺失时完成能做的部分，明确哪些任务blocked、为何不能给确定结论。

输出：分析过程与结果；F发现（Q/T/E引用、claim_type、reasoning、假设状态、
替代解释、可信度/限制、决策影响及改变判断条件）；所用/未用材料及理由。
目标单列，预测有输入与模型；贡献分解不称因果。建议附经济性和执行条件，
无依据时形成验证建议。不要为了符合已有标题隐去相反结果。
```

## E · 独立分析审查（S2）

```text
请独立审查以下分析能否支持当前允许表达的结论。
输入：{原始请求、材料清单、原文、evidence、analysis_plan、计算/编码底稿、
findings、content_map}。输出{目录}/analysis_review.md。
先读{skill}/references/analysis_review.md及相关方法卡。

逐项检查AQ-01…10，给具体依据；重算关键派生值，核对方法假设和原文。
不要只看分析者摘要，检查竞争解释、重要反证、目标/预测、选项与资源条件。
允许“有依据的未知”和合理轻量路径；未执行检查写not_reviewed。
输出逐项结果、Blocking/Major/Minor、允许结论与限制，判定ready、
ready_with_limits或rework。没有看到的事实、计算或页面不能宣称已核验。
```

## B · 页面规格（S5）

```text
请完成{页面范围}的页面规格，输出{目录}/page_specs_{批次}.md。
输入：{brief、visual_spec、ghost_deck、findings、对应证据、content_map、page_plan}。
先读{skill}/references/evidence_design.md、chart_matching.md、layout_templates.md、
slide_anatomy.md、exhibit_system.md；按需要读chart_cards与analysis_exhibits。

分析任务保留Q/F/E引用，editorial保留原文定位与必要计算；两者均保留证据边界和主题登记。每页写主判断、证明责任、互补模块及关系、
阅读顺序、完整数据/公式、input_shape、reader_operation、comparability、
候选图/淘汰理由、render_route/recipe、标签预算、几何编码、x/y/w/h或Grid、回退。
继承typography_id/version，按typography_system.md区分主标题、模块、正文、备注与数据，记录真实字重/行高；不在单页自行换字体。
评论列、KPI、takeaway按是否增加信息使用，不固定必填；一页可以一个完整展品。

若发现标题与证据冲突、因果越界或新缺口，写出受影响F/T、原文依据、
建议收窄/补分析及受影响页面，退回分析层；不得以“禁止改变标题”为由继续包装。
设计修改不自行增加未经分析的战略建议或精确目标。
```

## C · 独立成稿QA（S7）

```text
请独立验收{deck绝对路径}，输出{目录}/qa_report.md。
输入：{brief、分析底稿/审查、findings、content_map、evidence、visual_spec、
page_plan、page_specs、HTML、逐页截图与PDF}。
先读{skill}/references/workflow_qa.md、analysis_review.md、color_and_type.md，
按需读取图表/组件契约。editorial以原文定位和必要核对记录替代完整分析台账，不为验收反向补建编号体系。未看到的输入与未执行的检查如实写明。

分别报告分析、证据、视觉、工程状态：
分析/证据：从最终标题回溯F/T/E及原文，复算关键派生数；检查重要反证、
目标与预测、时期/单位/范围、建议条件是否保留；查content_map中的重要材料去向。
视觉：实际读取每页原尺寸图、总览与打印，评估五维评分与具体缺陷。
工程：按workflow_qa执行实际浏览器/打印/离线检查；使用qa_deck输出作证据，
自动PASS与文字存在不等于视觉或PDF图形完整。没有看图就写视觉未验收。

所有CSS、SVG、ECharts、表格使用同一主题及实体索引；不只检查主题变量名，
需检查实际颜色、有效字号、标签、数值几何、遮挡和完整回退。
另按typography_system.md检查实际字体/字重、字体就绪、PDF嵌入、冷缓存断网和混排数字；CSS名字与document.fonts.ready本身不足以证明字体身份。记录缺字、伪粗、意外回退与未验收项。
输出检查范围、逐项依据、页号+严重级+现象+影响+规则+修复建议，及未验收项。
Blocking/Major未清零不得称通过；作者已修复的说法不能替代复验。
```

## 主会话编排

- 独立证据任务与独立分析任务可以并行，依赖输入到齐后再执行相关计算；分析与设计不跨门禁抢跑。
- 主会话保留综合责任；代理可以质疑假设与结论，不能通过角色资历压制证据。
- S2的独立分析审查与S7的独立成稿QA承担不同职责；复杂任务都需要，简单editorial可先由作者核对并记录范围。
- 修复后只复验受影响任务与传播到的页面；若新问题显示系统性缺陷则扩大检查。
- 过程底稿按任务复杂度合并或分文件，随交付保留可追溯路径；没有文件工具时如实交付可保存的结构化内容，不冒称已落盘。
