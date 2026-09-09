# consulting_deck_skill · V11.2

以业务问题组织原始数据、研究和访谈，通过分析、叙事与视觉设计交付自包含HTML和同版分页PDF。入口是 [SKILL.md](SKILL.md)。作者负责分析与整页创作，工具负责准确实现与导出。

## 当前重点

V11.2统一任务选择、风险复核、真实双媒介证据与有限继承；禁止装饰侧边条、顶部色条卡片，逐页视觉均衡和有效内容对齐是交付要求。关键限定以少量显式声明核对最终PDF。当前实现与验收状态见[V11.2记录](../iteration_v11_2_contracts/validation.md)。

V11.1以材料分析、视觉论证和整页创作为主线：先构思读者要看懂的关系，再组合图表、图示、信息图和文字；局部收束后重新分配整页空间，必要时调整页序或合并。用户明确的风格和密度要求进入成品验收，工程通过不能代替整页质量。入口与各阶段只加载实际需要的细节，不增加固定模板、图型配额或过程台账。

V11已有的共享几何、六类标注、图示布局、planner版本绑定及同版交付继续保留，运行库和依赖未随本次流程重构改变。支持范围见[视觉可靠性](references/visual_reliability.md)、[专业标注](references/precision_exhibits.md)。V11.0.1旧11页报告的整页构图通过结论已撤回，不再作为成功基线；历史证据见[V11记录](../iteration_v11_reliability/validation.md)，此前实际结果见[V11.1记录](../iteration_v11_1_authoring/validation.md)。

独立planner负责局部选型，主会话负责全篇与整页；有实质取舍时读取实际加载资源，简单清晰的选择直接制作。加载器可使用兼容本地安装、缓存或随包快照，无须预装第二个技能；获取、绑定与维护按需见[planner接入](references/viz_planner_integration.md)。独立源及dependencies快照机制不变。

沿用McKinsey藏青主题、已认可字体角色、quiet母版和[首尾规则](references/report_bookends.md)，保留导航、缩放、深链、打印与离线PDF下载。技能更新直接作用于实际源目录，只有用户要求分发时才另外生成ZIP或安装副本。

## 按需查阅

| 任务 | 入口 |
|---|---|
| 调整默认、选择测试范围 | [开放创作](references/open_authoring.md) |
| 原材料、研究与分析 | [分析规划](references/analysis_planning.md)、[方法路由](references/framework_router.md)、[扩展框架](references/framework_extensions.md) |
| 从发现到论证 | [storyline](references/storyline_method.md)、[分析复核](references/analysis_review.md) |
| 专家选型与动态加载 | [planner协作](references/viz_planner_integration.md) |
| 证据与实现路线 | [deck适配](references/chart_matching.md)、[现有展品](references/exhibit_system.md)、[自定义图示](references/custom_exhibits.md) |
| 字体、主题、布局 | [字体](references/typography_system.md)、[主题依据](references/theme_research.md)、[布局](references/layout_templates.md) |
| 封面、单页参考资料、封底 | [首尾规则与制作入口](references/report_bookends.md) |
| 成品判断与同版交付 | [QA](references/workflow_qa.md)、[交付契约](references/delivery_system.md) |

## 构建与交付

构建需要Node、Chrome、Playwright、PDF工具（pdfinfo/pdffonts/pdftotext）及Python字体依赖；实际PDF栅格和文字坐标还需pdfjs-dist与@napi-rs/canvas，可用PDFJS_MODULE/PDF_CANVAS_MODULE指向已有模块。成稿在浏览器打开无需安装这些工具。

```bash
npm ci
python3 -m venv .font-venv
.font-venv/bin/pip install -r scripts/requirements-fonts.txt
export FONT_PYTHON="$PWD/.font-venv/bin/python"
# 若Playwright未在Node默认路径，设置PLAYWRIGHT_MODULE为其绝对模块目录
# 按references/delivery_system.md保存task.json，再编写pages.html及page.css
node scripts/assemble_deck.cjs pages.html deck.html --css page.css --title "报告标题" --contract task.json
# 完整稿声明 data-deck-kind="report"，按 report_bookends.md 安排首尾页
# 新页保留 slide__header 标题组与 slide__frame 空节点；按正文选择边界
node scripts/qa_deck.cjs deck.html renders
# 实际复核分析、证据、逐页截图及PDF；据此写schemaVersion 3作者与独立结果，并aggregate_reviews.cjs合并renders/review.json
node scripts/package_delivery.cjs deck.html renders/deck.pdf delivery 报告名
```

动态稿仍用`apply_theme.cjs assets/deck_engine.html draft.html --contract task.json`初始化，在编辑、SSR或资源内联后用`pack_fonts.cjs draft.html deck.html serif-report-bold`定稿，再执行QA与交付。静态装配的参数和边界见[页面装配](references/deck_assembly.md)，它不替代分析、构图或视觉审查。

主题默认mckinsey，可选bcg/accenture；字体与配色独立，reading默认serif-report-bold（中文Noto Serif SC700＋西文Playfair700），现场演示默认sans-presentation，旧serif-report与serif-playfair保留原含义。正文仍为Noto Sans SC／Inter，已有选择继承。三个品牌风格来自公开资料的独立适配，并非官方内部模板。

HTML含同版PDF的离线下载入口，保留打印、导航、缩放、深链；支持16:9和4:3，后者需要重排。引擎源文件使用在线ECharts入口，正式离线稿需内联静态展品或所需运行库。`assets/reference_deck.html`已静态内联；其中旧研究材料仅演示结构，不能用作新项目的研究事实。

## 能力与验证边界

已有9种ECharts配方、10种SVG分析组件和HTML比较表；它们提供特定图型的输入校验、字体测量、容量回退和真实渲染检查。新增 `render_diagram.cjs`提供任意数量节点、边、分组和注释的布局入口，支持显式坐标与按阶段/泳道自动布局；作者控制关系与阅读问题，不会自动做业务分析、避开所有交叉或保证每幅图优美。

构建示例：`build_reference_deck.cjs`、`build_analysis_reference.cjs`、`build_dense_reference.cjs`。单图渲染：`render_echarts_svg.cjs`、`render_diagram.cjs`。

开发回归按变更选择：引擎用`test_engine.cjs`；母版用`test_frame.cjs`；交付用`test_delivery.cjs`；QA策略用`test_qa_policy.cjs`；首尾页用`test_bookends.cjs`；图示用`test_diagram.cjs`。字体、主题、原配方修改时使用其对应测试。自动检查提供工程证据，不能替代实际看图和商业判断。

选型接入与仅安装主技能的实际验证见项目 [v9.2验证记录](../iteration_v9_2_viz_planner/validation.md)。此前丰富材料案例见 [v9验证记录](../iteration_v9_open/validation.md)。新框架检索及自定义实现路线不等于每个框架／图型都有独立完整验证；一个案例通过也不足以证明普遍达到顶级咨询交付水平。

母版实施与成稿见 [v9.1验证记录](../iteration_v9_1_frame/validation.md)。

流程V11.2；首尾页资源1.0.0；运行包11.2.0，母版1.0.0；ECharts6.1.0、ChartRuntime2.0.0不变。McKinsey主题3.2.0，其他主题3.0.0；字体配置/资源清单1.1.0。历史v1–v8记录保留在项目归档。

V11定向回归：`test_reliability.cjs`（HTML基线/反例/初始化）、`test_execution_contracts.cjs`（真实执行结果与版本）、`test_precision_exhibit.cjs`＋`test_precision_browser.cjs`（六类专业标注）、`test_diagram_layout.cjs`（图示轨道/端点）。最终PDF文字对象可用`audit_pdf_geometry.cjs`，需Node可解析pdfjs-dist与@napi-rs/canvas；它与实际PDF逐页看图互补。

打包复制时排除node_modules、.font-venv及目录软链，保留assets/fonts和dependencies；安装入口可能是软链，先readlink确认，避免自递归复制。

V11.2定向回归：`test_task_contract.cjs`、`test_visual_policy.cjs`、`test_qa_v12.cjs`、`test_review_delivery_v3.cjs`、`test_review_inheritance.cjs`。新report/fragment正文媒介须与任务一致，首尾特殊页及collection演示除外；历史已生成稿保持legacy检查路径，不能删版本降级规避验收。
