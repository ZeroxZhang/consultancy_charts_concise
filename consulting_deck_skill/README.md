# consulting_deck_skill · v9.3.1

以业务问题组织原始数据、研究和访谈，通过分析、叙事与视觉设计交付自包含HTML和同版分页PDF。入口是 [SKILL.md](SKILL.md)。v9让优秀模型自由选择方法、图型、布局和实现方式，同时保留事实、计算、可读性与版本一致性。

## 这轮改变什么

S4–S5按需派子代理执行独立维护的 `echarts-viz-planner`，主会话负责分析、数据与成稿。选型返回决策规格，表格/机制图也有可制作语义；已有清晰选择保持轻量路径。见 [可视化专家协作](references/viz_planner_integration.md)。

v9.3.1正式采用藏青`#000080`作为McKinsey标题及主强调、`#D9D9EC`作为辅助底纹；次级灰字适度加深以保证底纹上可读。延续真实粗标题及常规数据/正文角色，避免换色顺带改变排版层级。见项目[验证与同内容样稿](../iteration_v9_3_1_navy/validation.md)。

只复制本技能目录也可用：`node scripts/load_viz_planner.cjs`优先查兼容的本地安装，缺失时校验并解包`dependencies/`随包快照到缓存，离线可用；代理读取返回的`skill_file`即可执行，无需全局安装或重启。外部源码独立维护，快照由`pack_viz_planner.cjs`生成。分发时保留整个技能目录及`dependencies/`，不要只复制SKILL.md。

沿用 [轻量页面母版](references/page_frame.md)：中性标题细线与页边标记，按正文选择 line / integrated / space，或逐页关闭。


- S0–S8是工作依赖，可合并、返回和迭代；不要求九次审批、固定候选数、完整编号或逐页评分。
- 方法与图型索引是工具箱。支持现有配方之外的原生/custom ECharts、专用SVG、HTML/CSS及按需引入的可视化工具；新图型不需要先注册编号。
- 扩展经典框架检索和实际分析路径，增加节点／边／分组SVG渲染器；以材料与关系决定图示复杂度。
- 建议字号、标题行数作为提示；明显不可读、错误几何、打印丢图、未复核内容与交付旧版本不能伪装通过。
- 正式交付记录一份 `review.json`，绑定实际复核的HTML/PDF；`--preview`明确输出预览。普通制稿不重跑整个组件测试库。

## 按需查阅

| 任务 | 入口 |
|---|---|
| 调整默认、选择测试范围 | [开放创作](references/open_authoring.md) |
| 原材料、研究与分析 | [分析规划](references/analysis_planning.md)、[方法路由](references/framework_router.md)、[扩展框架](references/framework_extensions.md) |
| 从发现到论证 | [storyline](references/storyline_method.md)、[分析复核](references/analysis_review.md) |
| 专家选型与动态加载 | [planner协作](references/viz_planner_integration.md) |
| 证据与实现路线 | [deck适配](references/chart_matching.md)、[现有展品](references/exhibit_system.md)、[自定义图示](references/custom_exhibits.md) |
| 字体、主题、布局 | [字体](references/typography_system.md)、[主题依据](references/theme_research.md)、[布局](references/layout_templates.md) |
| 成稿检查与打包 | [QA](references/workflow_qa.md)、[交付契约](references/delivery_system.md) |

## 构建与交付

构建需要Node、Chrome、Playwright、PDF工具（pdfinfo/pdffonts/pdftotext）及Python字体依赖。成稿在浏览器打开无需安装这些工具。

```bash
npm ci
python3 -m venv .font-venv
.font-venv/bin/pip install -r scripts/requirements-fonts.txt
export FONT_PYTHON="$PWD/.font-venv/bin/python"
# 若Playwright未在Node默认路径，设置PLAYWRIGHT_MODULE为其绝对模块目录
node scripts/apply_theme.cjs assets/deck_engine.html draft.html mckinsey serif-report-bold
# 编辑页面；按需内联静态SVG与consulting-layouts.css
# 新页保留 slide__header 标题组与 slide__frame 空节点；按正文选择边界
node scripts/pack_fonts.cjs draft.html deck.html serif-report-bold
node scripts/qa_deck.cjs deck.html renders
# 实际复核分析、证据、逐页截图及PDF；据此写renders/review.json
node scripts/package_delivery.cjs deck.html renders/deck.pdf delivery 报告名
```

主题默认mckinsey，可选bcg/accenture；字体与配色独立，reading默认serif-report-bold（中文Noto Serif SC700＋西文Playfair700），现场演示默认sans-presentation，旧serif-report与serif-playfair保留原含义。正文仍为Noto Sans SC／Inter，已有选择继承。三个品牌风格来自公开资料的独立适配，并非官方内部模板。

HTML含同版PDF的离线下载入口，保留打印、导航、缩放、深链；支持16:9和4:3，后者需要重排。引擎源文件使用在线ECharts入口，正式离线稿需内联静态展品或所需运行库。`assets/reference_deck.html`已静态内联；其中旧研究材料仅演示结构，不能用作新项目的研究事实。

## 能力与验证边界

已有9种ECharts配方、10种SVG分析组件和HTML比较表；它们提供特定图型的输入校验、字体测量、容量回退和真实渲染检查。新增 `render_diagram.cjs`提供任意数量节点、边、分组和注释的布局入口，作者控制位置与关系；不会自动做业务分析、避开所有交叉或保证每幅图优美。

构建示例：`build_reference_deck.cjs`、`build_analysis_reference.cjs`、`build_dense_reference.cjs`。单图渲染：`render_echarts_svg.cjs`、`render_diagram.cjs`。

开发回归按变更选择：引擎用`test_engine.cjs`；母版用`test_frame.cjs`；交付用`test_delivery.cjs`；本轮QA策略用`test_qa_policy.cjs`；图示用`test_diagram.cjs`。字体、主题、原配方修改时使用其对应测试。自动检查提供工程证据，不能替代实际看图和商业判断。

选型接入与仅安装主技能的实际验证见项目 [v9.2验证记录](../iteration_v9_2_viz_planner/validation.md)。此前丰富材料案例见 [v9验证记录](../iteration_v9_open/validation.md)。新框架检索及自定义实现路线不等于每个框架／图型都有独立完整验证；一个案例通过也不足以证明普遍达到顶级咨询交付水平。

母版实施与成稿见 [v9.1验证记录](../iteration_v9_1_frame/validation.md)。

流程9.3.1；运行包仍为9.1.0，母版1.0.0；ECharts6.1.0、ChartRuntime2.0.0不变。McKinsey主题3.2.0，其他主题3.0.0；字体配置/资源清单1.1.0。历史v1–v8记录保留在项目归档。
