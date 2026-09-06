> 🌐 Language · 语言：[English](README_EN.md) · [简体中文](README.md)

# Consulting Deck Skill

**Turn a brief into a consulting-grade deck — delivered as a single HTML file.**
*把一份简报，变成一份咨询级的演示文稿。*

![version](https://img.shields.io/badge/version-v7.0-2251FF)
![claude-code](https://img.shields.io/badge/Claude%20Code-Agent%20Skill-D97757)
![deliverable](https://img.shields.io/badge/deliverable-single%20HTML-E34F26)
![echarts](https://img.shields.io/badge/ECharts-6.1.0-AA344D)
![themes](https://img.shields.io/badge/themes-3%20built--in-6C5CE7)
![print](https://img.shields.io/badge/print-PDF-374151)
![offline](https://img.shields.io/badge/offline-ready-0E9F6E)

`consulting_deck_skill` is a Claude Code Agent Skill: give it a brief and your raw materials, and it runs the full **analysis → storyline → visual design → build → independent QA** pipeline, delivering **one self-contained HTML deck** — 16:9 or 4:3, paging/zoom/presentation mode, deep links, and print-to-PDF page by page.

![Sample deck preview](docs/showcase/overview-mckinsey.png)

The overview and theme thumbnails retain historical layouts. See the [v7 typography sample](iteration_v7_typography/comparison/serif-report.html) for the new fonts; both bundled HTML reference decks have been upgraded.

## Why use it

| Without it | With it |
|---|---|
| Content, analysis, layout, and charts bounce between multiple tools | One brief in, analysis-to-delivery out |
| Charts drawn by intuition; numbers can't be traced to sources | Every number traces to a source; gaps stay visible |
| PPTX requires Office; fonts and layouts break everywhere | One HTML file, opens in any browser, prints to PDF |

## Key capabilities

- 🧭 **S0–S8 gated workflow** — brief, evidence, analysis, storyline, visual design, build, QA, delivery; every stage has an explicit gate before the next.
- 🔬 **Analysis first, expression second** — problems, methods, actual results, and counter-evidence are established before pages are formed; six method families spanning business/industry, strategy/operations, finance, data, and narrative, with three depth modes: `analytical` (raw materials), `exploratory` (open research), `editorial` (confirmed draft).
- 📊 **Consulting-grade chart engine** — ECharts 6.1.0 with 9 validated recipes (input checks + capacity bounds), 10 SVG analytical components + an HTML comparison table, waterfall, Mekko, and full table fallback.
- 🎨 **Three built-in themes** — McKinsey (default), BCG, Accenture; chosen once, inherited thereafter, colors from a single source of truth.
- 🔤 **Unified typography** — serif main headings, sans-serif reading and data; pinned font assets, subset embedding, real glyph measurement and PDF font checks. Build dependencies are described in the [typography guide](consulting_deck_skill/references/typography_system.md); readers need no font installation.
- 🧾 **Evidence discipline** — every number on a page must come from your materials or research sources; only genuinely synthesized data is marked Illustrative, and analytical judgments are labeled separately from recommendations.
- 🤖 **Multi-agent collaboration** — 2–3 research agents in parallel, 2–4 page designers in parallel, one independent QA agent.
- 📦 **Single-file delivery, offline-readable** — one HTML file; offline scenarios use a static-SVG path for fully self-contained output.
- ✅ **Independent QA** — analysis, evidence, visual, and engineering acceptance; page-by-page renders and print checks; zero Blocking/Major issues required to pass.

## Showcase: same deck, three themes

| McKinsey (default) | BCG | Accenture |
|---|---|---|
| ![McKinsey theme](docs/showcase/theme-mckinsey.png) | ![BCG theme](docs/showcase/theme-bcg.png) | ![Accenture theme](docs/showcase/theme-accenture.png) |

## Quick start

### 1. Install

```bash
cp -R consulting_deck_skill ~/.claude/skills/consulting_deck_skill
```

Or symlink it, so changes to this repo take effect immediately:

```bash
ln -s "$(pwd)/consulting_deck_skill" ~/.claude/skills/consulting_deck_skill
```

### 2. Use it

Run `/consulting_deck_skill` in Claude Code and follow the prompts with your brief — audience, the decision at stake, materials, and deadline. The theme is asked once and inherited from then on.

### 3. See samples first (zero dependencies)

```bash
open consulting_deck_skill/assets/reference_deck.html          # 9-page engine sample, fully readable offline
open consulting_deck_skill/assets/analysis_reference_deck.html # 6-page analytical-exhibit sample
```

## How it works

```
S0 Brief ──→ S1 Evidence & questions ──→ S2 Analysis plan/execution/review ──→ S3 Storyline
──→ S4 Visual & pagination ──→ S5 Page specs ──→ S6 Build ──→ S7 Independent QA ──→ S8 Delivery
```

## What's in this repo

| Directory | What it is |
|---|---|
| [`consulting_deck_skill/`](consulting_deck_skill/) | The skill itself: orchestration in SKILL.md + condensed references + engine/assets + verification scripts |
| [`report/`](report/) | *Consulting Deck Playbook v2.0*: 86,000-character methodology research |
| [`research_notes/`](research_notes/) | Evidence notes: every conclusion = claim + source URL + confidence |
| `task_bak/`, `iteration_v*/` | Task briefs and iteration archives: samples, records, QA |

## Quality assurance

The engine and components ship automated verification: headless-Chrome triple checks (DOM integrity / deep links / one page per print), chart data contracts, theme contrast, SVG value encoding; every iteration is independently QA'd and archived. Engineering details live in [CLAUDE.md](CLAUDE.md) and the [skill README](consulting_deck_skill/README.md). Project documentation is written in Chinese (proper nouns kept in English).

## Release history

- **v1** — base engine and the S0–S8 workflow
- **v2** — original SVG components, 9-page sample deck, browser QA scripts
- **v3** — three built-in color themes
- **v4** — analytical exhibits: derived annotations, stacking, comparison table
- **v5** — dense-input visualization routing and ECharts 6.1.0 recipes
- **v6** — analysis planning, six method families, and argument synthesis
- **v7** (current) — unified typography roles, pinned font resources, offline subsets, real glyph measurement and font QA

See the `iteration_v*/` archives for details.

## Disclaimer

The three themes are independent adaptations based on **public visual materials**, not official internal templates of any consulting firm. This repository delivers HTML (printable to PDF) and does not claim native editable PPTX output.
