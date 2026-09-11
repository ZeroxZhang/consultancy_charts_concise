# Consulting Deck Skill · Concise

**把一堆原始材料，变成一份能直接拿去见客户的咨询报告。**

给它财报、访谈、行业资料、一份写得还不清楚的初稿——它会先做分析，再把结论组织成有主线、有图表、有依据的整册报告，最后交付一份能翻页的 HTML 和一份同版的 PDF。

[![整册总览](../docs/showcase/report-overview.png)](../docs/showcase/report-page-mechanism.png)

## 你会拿到什么

一份**自包含的报告**：单个 HTML 文件，双击就能看，支持翻页、缩放、全屏、深链，并内嵌一键下载的同版 PDF——离线、断网、发给别人都不掉东西。

它不是"帮你把要点排成几页幻灯片"。它是**先把问题想清楚，再决定长什么样**：

| | |
|---|---|
| ![收入机制对比](../docs/showcase/report-page-mechanism.png) | ![榜单信号与成立条件](../docs/showcase/report-page-metric.png) |
| 两条业务线的机制、能力与风险逐项对照，结论落在同一张画布上 | 大数字配点阵直接给出样本信号，右侧展开它的成立条件 |
| ![口径分离](../docs/showcase/report-page-caveats.png) | |
| 两组数字来自不同分母，就分开呈现，不拼成一条假的下降曲线 | |

## 它和"让 AI 画几张图"的区别

**先分析，再表达。** 材料先按明细、分布和口径读懂，围绕问题做真正的计算、比较和机制推理；不是把输入压成几条摘要再配图。贡献不等于因果、样本不等于市场、口径不同不能强比——这些判断写进了流程。

**标题说了什么，图上就得看得见。** 标题声称有"链条、差异、条件"，读者要能在展品里找到对应结构，而不是只在正文里读到。收短模块后必须回到整页重新分配空间，不允许自然高度贴顶就交稿。

**亲眼看过才算完成。** 每页 HTML 截图和最终 PDF 都会被逐页查看并给出具体判断。工具不能看图时如实写"未验收"，不允许用自动检查通过代替。

**关键限制不会被悄悄丢掉。** 分母、期间、否定条件、事实与预测的身份会绑定到页面上的真实对象，并核对它们是否真的出现在最终 PDF 里。

## 适合谁

- 需要**行业研究、战略汇报、经营诊断、投资判断**的咨询、投资、战略与业务分析工作
- 手上材料很多（表格、访谈、报道、财务数据），但**没时间也没把握把它组织成有说服力的报告**
- 已经有一份写好的文稿，需要**变成专业排版的交付物**，而不重写内容

## 怎么用

把技能目录装到你的 Agent 工具的技能目录里（支持 Agent Skills 的工具都可以），然后**像跟人交代工作一样说清楚三件事**：

1. **给谁看、要回答什么问题**（受众和决策）
2. **手上有什么材料**（文件、链接、数据）
3. **有什么硬要求**（页数、风格、必须出现或必须避开的说法）

不需要预先指定页数、图型数量或要套哪个框架——这些由问题决定。已有偏好（配色、字体、风格）会被继承。

三种材料状态都支持：**原始材料**（做完整分析）、**开放研究**（先探索再收敛）、**已确认文稿**（保留事实与结论，只重组表达，不补造数据）。

## 它坚持的几条底线

默认 McKinsey 藏青主题，另备 BCG、Accenture 两套独立适配的视觉方案（来自公开资料的独立设计，**不是任何公司的官方模板**）。深度研究用 reading 模式，现场讲述用 presentation 模式。

报告里不会出现装饰性色条、虚假精确的图表、被截断隐藏的坐标轴，或为填满页面而拉高的空块。图上每个数字都能追回来源。

## 边界

- 交付形态是 **HTML + 同版 PDF**，不产出 PPTX。
- 它做的是**分析与表达**，不替代外部事实核验——原始材料的身份（事实／测算／受访者观点）会被如实保留。
- 自动检查提供工程证据，不能替代商业判断。文案里的"通过"只代表它检查过的范围。

## 安装与运行

构建需要 Node、Chrome、Playwright、Poppler（pdfinfo/pdffonts/pdftotext）与 Python 字体依赖；**成稿在浏览器打开不需要这些**。

```bash
npm ci            # 装配、QA、PDF 导出、几何审计所需的 Node 依赖
npm run setup-fonts   # 建 .font-venv 并装 fontTools（仅构建字体子集需要）
```

`scripts/setup_font_venv.sh` 只往技能的 `.font-venv` 里装依赖，不写系统 Python（PEP 668 环境也适用）。装好后 `pack_fonts.cjs` 与 `probe_capabilities.cjs` 会自动找到它，**不需要再导出 `FONT_PYTHON`**；要从别处指定解释器时该变量仍然优先。不想建 venv 也可以自行准备 fontTools，再用 `FONT_PYTHON` 指向它。

Chrome 走 Playwright 的 `channel: 'chrome'`，需要本机已装 Chrome；用别的浏览器或既有 Playwright 模块时按 [交付契约](references/delivery.md)设 `CHROME_CHANNEL` / `PLAYWRIGHT_MODULE`。

装完先跑一次能力自检，确认最小渲染、字体与真实 PDF 路径都可用：

```bash
node scripts/probe_capabilities.cjs /tmp/deck-probe
```

制稿流程由 Agent 按 [SKILL.md](SKILL.md) 执行；任务合同字段、交付门禁与审查契约见[交付契约](references/delivery.md)。技能内部按需加载 11 份说明文件，入口见 [SKILL.md](SKILL.md)。

```bash
node scripts/assemble_deck.cjs /任务/pages.html /任务/deck.html --css /任务/page.css --title "报告标题" --contract /任务/task.json
node scripts/qa_deck.cjs /任务/deck.html /任务/renders
node scripts/aggregate_reviews.cjs /任务/renders/audit.json /任务/renders/review.json /任务/renders/author.json /任务/renders/independent.json
node scripts/package_delivery.cjs /任务/deck.html /任务/renders/deck.pdf /任务/delivery 报告名
```

选型可接入独立的 [echarts-viz-planner](https://github.com/ZeroxZhang/echarts-viz-planner)；随包已带可离线使用的快照，不装也能跑。维护与回归入口（`test_*`、`sync_*`、`build_*`）不是制稿必需。

---

本页展示的报告内容为演示材料，来源与身份在页面内标注。三套主题为公开视觉资料的独立适配，并非官方内部模板。
