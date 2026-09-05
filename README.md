# consulting_charts

**把一份简报变成咨询级 HTML 演示文稿的能力工作区 · Turning a brief into consulting-grade HTML decks**

一个「咨询级 HTML 演示文稿」能力的工作区。主交付物是 [`consulting_deck_skill/`](consulting_deck_skill/) —— 一个 Claude Code **Agent Skill**，把用户的简报变成**单个自包含 HTML 文件**（分页、PPT 尺寸、演示模式、ECharts 图表 + IconPark 图标），其方法论沉淀自《咨询公司 Deck 制作手册 v2.0》（[`report/`](report/)，8.6 万字调研成果）。

A workspace for "consulting-grade HTML presentation" capability. The main deliverable is [`consulting_deck_skill/`](consulting_deck_skill/) — a Claude Code **Agent Skill** that turns a user's brief into a **single self-contained HTML file** (pagination, slide dimensions, presentation mode, ECharts charts + IconPark icons), built on the methodology of the *Consulting Deck Playbook v2.0* ([`report/`](report/), an 86,000-character research report).

> 说明文档为中文写作（专有名词保留英文）。Documentation is written in Chinese, with proper nouns kept in English.

## 目录与数据流 · Repository Map

三层沉淀关系 — three layers of sedimentation: evidence → methodology → execution.

```
task_bak/            任务简报归档（只读，不再更新） · brief archives (read-only)
research_notes/      证据底稿：每个事实 = 断言 + 来源 URL + 置信度 + 检索日期（7 份，按主题分文件）
                     evidence notes: every fact = claim + source URL + confidence + retrieval date
report/              《咨询公司 Deck 制作手册 v2.0》：方法论正文 + 8 份附录
                     the playbook: methodology + 8 appendices
consulting_deck_skill/  实战化执行层：SKILL.md 主编排 + references/ 手册浓缩版 + assets/ 引擎与组件 + scripts/ 验证脚本
                     the skill itself: orchestration + condensed references + engine/assets + verification scripts
iteration_v2/        v2 迭代记录、备份、基线截图与验收产物 · v2 iteration records & QA artifacts
iteration_v3_color/  v3 配色迭代记录、三套同内容样稿与独立 QA · v3 color iteration records & QA
```

数据流：`research_notes`（证据）→ `report`（方法论）→ `skill`（执行）。修改下层结论时需沿链检查上层是否受影响。

Data flow: `research_notes` (evidence) → `report` (methodology) → `skill` (execution). Changes at a lower layer must be checked against upper layers.

## 核心特性 · Highlights

- **单个自包含 HTML** / Single self-contained HTML — 16:9（1280×720）或 4:3；分页、缩放、演示模式、打印、URL 深链、离线降级均已实测通过。
- **论证驱动的 8 阶段工作流** / Argument-driven 8-stage workflow — S0 简报 → S1 调研 → S2 视觉规范 → S3 storyline → S4 分页 → S5 逐页设计 → S6 制作 → S7 独立 QA → S8 交付，每阶段有门禁。
- **多 agent 协作** / Multi-agent collaboration — 调研 2–3 并行、页面设计 2–4 并行、QA 独立 1 个（模板见 `assets/subagent_prompts.md`）。
- **证据纪律** / Evidence discipline — 页面上每个数字必须来自用户素材或调研来源，否则保留待核缺口；仅真正合成数据标 Illustrative，分析判断与建议分别标注。
- **图表与图标** / Charts & icons — ECharts 5（瀑布图、Mekko 等复合图表配方内置引擎）；IconPark 图标（ESM 加载，离线降级到引擎内置 SVG 迷你集）。
- **三套配色主题** / Three color themes — 麦肯锡风格（默认）、BCG 风格、埃森哲风格；S0 一次询问，已有选择持续继承。
- **原创 SVG 组件** / Original SVG components — `assets/exhibit-kit.js` 8 种基础 SVG + `assets/consulting-layouts.css` 阅读型复合页样式。
- **离线样稿** / Offline sample deck — `assets/reference_deck.html`：9 页可离线打开的样稿，覆盖全部引擎能力。
- **编号体系** / Shared numbering — A-01…A-11 消息类型匹配矩阵、B-01…B-56 图表卡片、D-01…D-12 页面原型、E-01…E-16 QA 清单、M-01…M-10 流行说法证伪结论；`report/` ↔ `references/` ↔ `SKILL.md` 三处口径一致。

## 快速开始 · Quick Start

```bash
# 双击打开 9 页离线样稿（零依赖，断网完整可读）
open consulting_deck_skill/assets/reference_deck.html

# 引擎三连测：DOM 完整性 / 深链 #3 / 打印每页一张（需 Node + Playwright/Chrome）
node consulting_deck_skill/scripts/test_engine.cjs

# 验证 SVG 组件数值编码（零浏览器依赖）
node consulting_deck_skill/scripts/test_exhibit_kit.cjs
```

安装使用：把 skill 目录复制到支持 Agent Skills 的目录（或软链关联），在 Claude Code 中即可以 `/consulting_deck_skill` 调用。

Install & use: copy (or symlink) the skill directory into your agent's skills directory, then invoke it as `/consulting_deck_skill` in Claude Code.

```bash
cp -R consulting_deck_skill ~/.claude/skills/consulting_deck_skill
```

## 工作流 · Workflow

| 阶段 Stage | 输出 Output | 进入下一阶段的门禁 Gate |
|---|---|---|
| S0 简报 Brief | `brief.md` | 受众、要做的决定、reading/presentation、范围、素材、截止日期明确 |
| S1 证据研究 Evidence | `evidence.json` + `research_notes.md` | 主判断有可追溯证据；缺口、推断、口径差异显式列出 |
| S2 视觉系统 Visual system | `visual_spec.md` | 语义色登记表、字号、页面预算、依赖模式明确 |
| S3 storyline | `ghost_deck.md` | 主判断→证据→决策的横向链闭合 |
| S4 分页与选型 Pagination | `page_plan.md` | 每页证明责任、证据模块、主视觉与候选图确定 |
| S5 页面规格 Page specs | `page_specs.md` | 证据充分、几何编码合法、内容预算可装下 |
| S6 制作 Build | `deck.html` | 复用引擎、逐页截图与打印检查 |
| S7 独立 QA | `qa_report.md` + `renders/` | 内容、视觉、工程分别验收；Blocking/Major 为零才称通过 |
| S8 交付 Deliver | HTML、预览、QA 与限制 | 交付可打开文件，准确说明在线/离线、核验范围与遗留项 |

## 验证脚本 · Verification Scripts

| 脚本 Script | 用途 Purpose |
|---|---|
| `scripts/test_engine.cjs` | 引擎 headless Chrome 三连测（DOM 完整性 / 深链 / 打印） |
| `scripts/test_exhibit_kit.cjs` | SVG 组件数值编码验证 |
| `scripts/build_reference_deck.cjs` | 重建 9 页样稿（`--theme=bcg\|accenture` 切换主题） |
| `scripts/qa_deck.cjs <html> <renders>` | 逐页渲染图与 PDF；自动 PASS 不能替代看图 |
| `scripts/test_themes.cjs` | 主题隔离、对比度与快照验证 |
| `scripts/test_theme_browser.cjs` | 主题实际渲染验证 |
| `scripts/sync_theme_defaults.cjs` | 从 `deck-themes.js` 同步引擎与组件默认快照 |

## 迭代记录 · Iteration History

- **v1** — 基础引擎与 8 阶段工作流（备份、基线与验收产物见 `iteration_v2/`）。Baseline engine & workflow.
- **v2** — 原创 SVG 组件（exhibit-kit）、9 页样稿、浏览器验收脚本；取消统一字数/要点上限，阅读型密度按证明责任。Original SVG components, 9-page sample deck, browser QA scripts; density is evidence-driven.
- **v3** — 三套内置配色主题（mckinsey 默认 / bcg / accenture），`assets/deck-themes.js` 为色值唯一来源；三套同内容样稿与独立 QA 见 `iteration_v3_color/`。Three built-in color themes; `deck-themes.js` is the single source of truth.

## 免责声明 · Disclaimer

三套主题是基于**公开视觉资料**的独立适配，并非任何咨询公司的官方内部模板；本仓库不冒称原生可编辑 PPTX —— 交付物为 HTML（可打印 PDF）。

The three themes are independent adaptations based on **public visual materials**, not official internal templates of any consulting firm. This repository does not claim native editable PPTX output — the deliverable is HTML (printable to PDF).
