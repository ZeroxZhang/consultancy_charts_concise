# 子代理任务模板 · v9.2

按任务复杂度使用当前环境实际提供的代理工具，不设固定人数。下列完整字段是复杂任务的参考，简单任务可合并、省略重复台账；检查实质保留。任务按可独立完成的议题或页面拆分，不依赖特定CLI的Agent参数；无代理能力时由主会话执行并如实记录独立审查未执行。
模板中的占位符在派发时替换。约定独立输出路径，避免多人改同一文件。主会话统一议题、口径、语义色与最终结论，并抽查返回依据。

## A · 证据研究（S1/S2）

```text
请围绕以下问题补充证据：{Q/T编号、具体问题、工作假设及竞争解释}。
任务边界：{地域、对象、指标、时期/截止日、允许的来源和工具}。
已有输入：{brief、source_inventory、已有evidence、必要原材料}。
先读{skill}/references/evidence_design.md及analysis_plan对应任务。

请同时寻找支持、反证、基准与边界，避免重复转述同一来源当独立证据。
关键数字记录数值、单位、期间、范围、分母、原文页/表/段、来源及核验状态；
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

按影响选用AQ-01…10，给具体依据；重算关键派生值，核对方法假设和原文。
不要只看分析者摘要，检查竞争解释、重要反证、目标/预测、选项与资源条件。
允许“有依据的未知”和合理轻量路径；未执行检查写not_reviewed。
输出检查结论、Blocking/Major/Minor、允许结论与限制，判定ready、
ready_with_limits或rework。没有看到的事实、计算或页面不能宣称已核验。
```

## V · 可视化选型（S4–S5）

主会话先按`references/viz_planner_integration.md`解析可用路径；本地未安装时可使用随包快照，需在线获取时从[官方仓库](https://github.com/ZeroxZhang/echarts-viz-planner)下载完整技能并校验。准备好实际路径后再委派，避免每个子代理重复下载；记录实际采用来源，不以下载成功代替兼容性检查。

```text
使用 echarts-viz-planner skill，解决{读者问题/相关页面组}的可视化匹配。
技能位置由主会话load_viz_planner.cjs返回：{planner_root}。
该位置可能是本地安装、随包缓存或已校验下载版；不要求它出现在全局技能列表。
先读取该路径SKILL.md，再按其流程读取catalog与相关references，不能只凭技能名猜流程。
输入：{数据/分析结果、必要明细、相关原文定位、发现与结论类型、边界与反证}；
上下文：{读者任务、相邻论证、正文区域、主题字体及既有角色层级/视觉基线、静态/离线约束、实际依赖}。
mode=api，contract_version=1.1，output_level=decision，data.transform_policy=propose。

按技能完成选型与映射，给理由、局部组合与阅读顺序、必要疑点；已有观点需核查表达前提。
不重新开展无关研究，不修改原始或标准数据，不冻结全篇结论，不继续派发其他技能任务。
缺口返回合法status/missing；高影响假设完整交回，不能以api不提问为由默认解决。
表格、文字、机制与信息图参与匹配，给可制作语义，不强制转换为ECharts。

输出{独立目录}/plan.json；复杂spec_ref文件写在同目录并保持可定位。
用{planner_root}/scripts/validate_plan.py plan.json --schema实际校验，按返回内容修正。
最后给主会话plan路径、读取的关键资源与实际检查结果；不冒称已渲染或通过成稿QA。
```

## B · 页面规格（S5）

```text
请完成{页面范围}的页面规格，输出{目录}/page_specs_{批次}.md。
输入：{brief、visual_spec、ghost_deck、findings、对应证据、content_map、page_plan、已采纳planner结果（如有）}。
先读{skill}/references/evidence_design.md、chart_matching.md、layout_templates.md、
slide_anatomy.md、exhibit_system.md；按需要读chart_cards与analysis_exhibits。

分析任务保留Q/F/E引用，editorial保留原文定位与必要计算；两者均保留证据边界和主题登记。复杂页按需写主判断、证明责任、互补模块及关系、
阅读顺序、完整数据/公式、input_shape、reader_operation、comparability、
已采纳选型的引用与重要调整、render_route/recipe、标签预算、几何编码、x/y/w/h或Grid、回退。
已有planner结果时先读取spec/spec_ref与bindings，进入页面设计，不重复跑一遍候选选择；
出现新的实质选型问题才交回主会话安排V任务。简单页不要求增加选型产物。
继承typography_id/version，按typography_system.md区分主标题、模块、正文、备注与数据，记录真实字重/行高；不在单页自行换字体。
已有认可基线时连同角色字号、数字特性和强调用途继承；选型建议中的尺寸在该载体内适配。常规查数表不因换图型自动变成大号KPI；有意改变层级时说明阅读任务依据。
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
先读{skill}/references/workflow_qa.md、page_frame.md、analysis_review.md、color_and_type.md，
完整报告另读report_bookends.md，检查首尾页职责、元信息、单页书目及节选规则；按需读取图表/组件契约。editorial以原文定位和必要核对记录替代完整分析台账，不为验收反向补建编号体系。未看到的输入与未执行的检查如实写明。

分别报告分析、证据、视觉、工程状态：
分析/证据：从最终标题回溯F/T/E及原文，复算关键派生数；检查重要反证、
目标与预测、时期/单位/范围、建议条件是否保留；查content_map中的重要材料去向。
视觉：实际读取每页原尺寸图、总览与打印，判断读者能否理解关键证据与具体缺陷，评分可选。
母版与组件合规必查（workflow_qa.md 的 E-V01…04）：每页 boundary 显式声明、标题灰线与正文首排顶线不并存、注释/判断条与左边界条之间的内边距（文字不贴边条）、页边识别不被遮挡；先按 page_frame.md「检查与交付」逐项核对。
完整报告首尾：封面/封底成对检查，参考资料紧邻封底且仅一页；核对真实来源、语义去重、摘选优先级与完整出处去向，逐项PDF书目和链接实际复核，不用动作标题或图表密度评价功能页。
工程：按workflow_qa执行实际浏览器/打印/离线检查；使用qa_deck输出作证据，
自动PASS与文字存在不等于视觉或PDF图形完整。没有看图就写视觉未验收。

所有CSS、SVG、ECharts、表格使用同一主题及实体索引；不只检查主题变量名，
需检查实际颜色、有效字号、标签、数值几何、遮挡和完整回退。
另按typography_system.md检查实际字体/字重、字体就绪、PDF嵌入、冷缓存断网和混排数字；CSS名字与document.fonts.ready本身不足以证明字体身份。记录缺字、伪粗、意外回退与未验收项。
涉及样式变化时读取{认可基线、明确新增偏好}，在相同内容和显示比例下比较角色层级与强调范围；不要把工程PASS当成风格继承已验收。
输出检查范围、具体依据、有问题的页号/严重级/影响/修复建议，及未验收项。
Blocking/Major未清零不得称通过；作者已修复的说法不能替代复验。
```

## 主会话编排

- 独立证据任务与独立分析任务可以并行，依赖输入到齐后再执行相关计算；制作依赖的结论需先完成相应分析，必要时返回修订。
- 主会话保留综合责任；代理可以质疑假设与结论，不能通过角色资历压制证据。
- S2的独立分析审查与S7的独立成稿QA承担不同职责；复杂任务都需要，简单editorial可先由作者核对并记录范围。
- 修复后只复验受影响任务与传播到的页面；若新问题显示系统性缺陷则扩大检查。
- 过程底稿按任务复杂度合并或分文件，随交付保留可追溯路径；没有文件工具时如实交付可保存的结构化内容，不冒称已落盘。

## v9编排补充

复杂新deck或重大建议安排独立审查，普通局部编辑可作者核对。S7实际看图后写简短review.json绑定当前audit哈希，格式见delivery_system.md；不得由自动脚本伪造目视结论。方法、图型、布局和建议字号可自主调整，不因未填写候选表/编号/评分退回；客观错误和关键遗漏才阻断。
