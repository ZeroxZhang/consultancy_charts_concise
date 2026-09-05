# consulting_deck_skill · v4

论证驱动的咨询reading deck技能。默认交付固定尺寸分页HTML，可打印PDF；不输出原生可编辑PPTX。

核心入口：`SKILL.md`。先读用户简报，再做证据、storyline、语义色、复合页、制作及独立目视QA。

新增资源：
- `references/evidence_design.md`：证据与页面规格契约。
- `references/exhibit_system.md`：选型路由与10个SVG、1个HTML比较表API。
- `references/analysis_exhibits.md`：分析表达语法、注释计算、标签回退与简单图表反例。
- `assets/analysis_reference_deck.html`：6页合成数据样稿，含同数据前后对照。
- `assets/consulting-layouts.css`：阅读型复合布局。
- `assets/reference_deck.html`：9页可离线打开样稿（6页旧材料改版 + 3页合成图示）。
- `scripts/build_reference_deck.cjs`：重新构建样稿。
- `scripts/qa_deck.cjs`：逐页渲染、几何审计、PDF；目視另做。

```bash
node scripts/test_exhibit_kit.cjs
node scripts/test_analysis_exhibits.cjs
node scripts/build_analysis_reference.cjs
node scripts/test_engine.cjs
node scripts/build_reference_deck.cjs
node scripts/qa_deck.cjs assets/reference_deck.html renders
```

浏览器脚本需要Node、Playwright和Chrome；`PLAYWRIGHT_MODULE`可指定模块路径（engine测试兼容`PLAYWRIGHT_PATH`）。
默认模板的ECharts需要联网；生成的reference_deck全部静态内联，断网完整可读。
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

apply_theme只初始化引擎主题；已生成静态图必须从规格和数据重新构建。

## v4分析表达

借鉴think-cell的标注、对齐和结构表达，按信息任务取舍。增强瀑布与Mekko，新增普通/100%堆积、比较表、阶段门禁流程；保留三套主题与既有引擎。
差额/增长率/百分点/CAGR从原值派生；窄片和零值通过完整表格保留。遇到容量不足会报错，需要扩容、改表或拆页。
六页样稿可用 `node scripts/build_analysis_reference.cjs sample.html --theme=bcg` 重建，完全离线。
`assets/analysis_baseline.json`保存v3组件的合成数据与三主题SVG快照，仅用于前后对照。
当前没有任意标签自动避让、堆积瀑布、单位轴Mekko或think-cell/PPTX编辑集成；能力边界见exhibit_system。
