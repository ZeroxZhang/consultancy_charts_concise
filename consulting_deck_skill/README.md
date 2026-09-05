# consulting_deck_skill · v5

论证驱动的咨询reading deck技能。默认交付固定尺寸分页HTML，可打印PDF；不输出原生可编辑PPTX。

核心入口：`SKILL.md`。先读用户简报，再做证据、storyline、语义色、复合页、制作及独立目视QA。

核心资源：
- `references/evidence_design.md`：证据与页面规格契约。
- `references/chart_matching.md`：15类输入结构、16类读者操作、文本结构与实现路径的高密度可视化路由。
- `references/exhibit_system.md`：ECharts 6配方、SSR与10个SVG、1个HTML比较表API。
- `references/analysis_exhibits.md`：分析表达语法、注释计算、标签回退与简单图表反例。
- `assets/echarts-recipes.js`：9种带输入校验和容量边界的ECharts option配方。
- `assets/chart-runtime.js`：浏览器/SSR共用真实画布、主题、文字验收和完整表格分页；生产使用此层，不以option构建成功充当验收。
- `assets/dense-input-example/`：1,152条合成明细、42段文本和6案例编码；配套端到端构建与测试。
- `assets/analysis_reference_deck.html`：6页合成数据样稿，含同数据前后对照。
- `assets/consulting-layouts.css`：阅读型复合布局。
- `assets/reference_deck.html`：9页可离线打开样稿（6页旧材料改版 + 3页合成图示）。
- `scripts/build_reference_deck.cjs`：重新构建样稿。
- `scripts/qa_deck.cjs`：逐页渲染、几何审计、PDF；目視另做。

```bash
node scripts/test_exhibit_kit.cjs
node scripts/test_analysis_exhibits.cjs
node scripts/test_echarts_recipes.cjs
node scripts/test_dense_inputs.cjs
node scripts/test_theme_browser.cjs
node scripts/build_dense_reference.cjs dense-output
node scripts/build_analysis_reference.cjs
node scripts/test_engine.cjs
node scripts/build_reference_deck.cjs
node scripts/qa_deck.cjs assets/reference_deck.html renders
```

浏览器脚本需要Node、Playwright和Chrome；`PLAYWRIGHT_MODULE`可指定模块路径（engine测试兼容`PLAYWRIGHT_PATH`）。
默认模板固定ECharts 6.1.0并需要联网；生成的reference_deck全部静态内联，断网完整可读。
offline交付可在本目录运行`npm install`后，用`render_echarts_svg.cjs`把ECharts配方构建为静态SVG。
安装时将本目录复制到支持Agent Skills的目录，或以软链关联项目；更新复制副本需要同步。

不再使用统一120–180字/每页5要点、柱条线配额、全篇单强调色或增绿减红的硬规则。
A/B/D/E/M编号保留；v2解释见对应references，历史调研留在项目report与research_notes。

## 可选主题

简报询问一次麦肯锡（默认）、BCG、埃森哲；已有选择继承。三套是基于公开视觉资料的独立适配，并非官方内部模板。
唯一色值源：assets/deck-themes.js；设计依据：references/theme_research.md。

```bash
node scripts/apply_theme.cjs assets/deck_engine.html deck.html bcg
node scripts/build_reference_deck.cjs sample-bcg.html --theme=bcg
node scripts/build_reference_deck.cjs sample-accenture.html --theme=accenture
node scripts/test_themes.cjs
```

apply_theme初始化引擎主题并内联配方与运行层；已生成静态图必须从规格和数据重新构建。

## v4分析表达

借鉴think-cell的标注、对齐和结构表达，按信息任务取舍。增强瀑布与Mekko，新增普通/100%堆积、比较表、阶段门禁流程；保留三套主题与既有引擎。
差额/增长率/百分点/CAGR从原值派生；窄片和零值通过完整表格保留。遇到容量不足会报错，需要扩容、改表或拆页。
六页样稿可用 `node scripts/build_analysis_reference.cjs sample.html --theme=bcg` 重建，完全离线。
`assets/analysis_baseline.json`保存v3组件的合成数据与三主题SVG快照，仅用于前后对照。
当前没有任意标签自动避让、堆积瀑布、单位轴Mekko或think-cell/PPTX编辑集成；能力边界见exhibit_system。

## v5高密度可视化路由

大量数据或文本先标记为I-01…I-15输入结构，再确定A-01…A-16读者操作；每个主要展品记录可比性、候选图、`render_route`、配方、密度预算和回退触发器。高频定量图优先使用EChartsRecipes，咨询特定展品保留ExhibitKit，高文本结构保留HTML/CSS/SVG。

```bash
npm install
node scripts/test_echarts_recipes.cjs
node scripts/render_echarts_svg.cjs assets/echarts-recipe-example.json chart.svg
```

静态渲染和浏览器渲染使用同一配方与主题token。图型丰富度不替代口径、证据和关系检查；输入不满足图型前提时回退表格或结构化文字。

本轮补齐运行契约：真实渲染后的文字验收、小画布全量表格/分页、零值与负值、比例几何、桑基闭合和三主题热力反差。CLI多页需`--paginate`，浏览器需安排所有`data-recipe-page`；表也装不下时明确报错，不丢掉记录。
六页大量输入样稿包含原子证据、派生公式和最终选型理由；它是固定合成材料的端到端验收，不是通用文件抽取或自动语义推荐器。粗映射仍由作者按实际材料和读者任务应用。
