> Language: [English](README_EN.md) · [简体中文](README.md)

# Consulting Deck Skill · V11.2

Turn a brief and rich source material into an evidence-based consulting deck, delivered as self-contained HTML and a matching paginated PDF.

The skill works with Agent Skills-compatible tools. Analysis, argument and visual design determine the result. Method cards, chart recipes and layouts are reusable starting points; the author can extend them or choose a custom implementation. HTML includes navigation, scaling, fullscreen, deep links and offline download of the same PDF.

V11.2 unifies authoring and delivery through a task contract, prohibits decorative edge-accent modules, and requires page balance and meaningful alignment. Reviews bind to actual HTML/PDF page evidence; critical qualifiers are checked in the final PDF. Unchanged pages may inherit verified review evidence under strict conditions. See [implementation and validation status](iteration_v11_2_contracts/validation.md). Historical samples may contain decoration that is no longer permitted in new reports.

v9.3.1 unifies McKinsey headings and primary emphasis in `#000080`, with `#D9D9EC` for secondary fills, while retaining true bold headings and the established body text hierarchy. See [validation and the revised sample](iteration_v9_3_1_navy/validation.md).

v9.2 delegates substantive visual selection at S4–S5 to the independently maintained `echarts-viz-planner`. The main skill owns analysis, data, page design and delivery. A verified dependency snapshot supports on-demand loading even when only the main skill is installed, including offline use. See [integration and loading](consulting_deck_skill/references/viz_planner_integration.md) and [validation](iteration_v9_2_viz_planner/validation.md). The v9.1 quiet page frame is retained.

V10 adds coordinated covers, a single-page bibliography and a closing cover. Explicit selection preserves traceability when sources exceed one page. Page-role checks apply to new reports while legacy decks and component collections remain compatible. See [bookend rules](consulting_deck_skill/references/report_bookends.md), the [complete sample](consulting_deck_skill/assets/bookends_example.html), and [V10 validation](iteration_v10_bookends/validation.md).

## Live samples

The screenshots below are retained body/component samples (v9.1 frame). Open them in a browser — navigation, zoom, fullscreen and deep links included; click an image to jump to that slide.

[![Contribution breakdown: supermarkets down ¥110M, e-commerce growth offsetting only ~36%](docs/showcase/demo-waterfall.png)](consulting_deck_skill/assets/reference_deck.html#6)

| [![Judgment cover with evidence ledger](docs/showcase/demo-cover.png)](consulting_deck_skill/assets/reference_deck.html#1) | [![Region size × product mix](docs/showcase/demo-mekko.png)](consulting_deck_skill/assets/reference_deck.html#7) | [![Contribution bridge with annotations](docs/showcase/demo-bridge.png)](consulting_deck_skill/assets/analysis_reference_deck.html#1) |
|---|---|---|
| Judgment cover with evidence ledger | Region size × product mix | Contribution bridge with annotations |

Full samples: [nine-page design and component reference](consulting_deck_skill/assets/reference_deck.html) and [six-page analytical reference](consulting_deck_skill/assets/analysis_reference_deck.html). Sample data illustrates layout and components only — it is not revalidated industry research.

## What changes in v9

- **Open analysis:** choose classical methods or transparent custom analysis around the business question. Work with detailed data, interviews, research and mixed inputs; turn frameworks into findings and choices.
- **Broader visual routes:** retain nine ECharts recipes, ten SVG analytical components and an HTML comparison table; add a node/edge/group diagram renderer. Native/custom ECharts and purpose-built SVG are available directly.
- **Lighter process:** S0–S8 express dependencies and can be combined or revisited. Fixed templates, candidate counts, complete ID registers and per-slide scores are not universal requirements. Complex work receives detailed specifications and independent review where useful.
- **Outcome-based review:** suggested font sizes and title lengths can be adapted. Evidence, calculation, quantitative geometry, readability, print completeness and version identity must hold.
- **Reliable delivery:** three themes, packaged fonts and matching HTML/PDF artifacts. Final packaging binds the actual review to the artifact hashes; unfinished review uses an explicit preview status.

## Use

Copy or link the skill into your tool's skills directory, for example:

```bash
ln -s "$(pwd)/consulting_deck_skill" ~/.codex/skills/consulting_deck_skill
```

Invoke `consulting-deck-skill` with the audience, question, sources and constraints. Choose analytical, exploratory or editorial depth as needed; preserve existing theme and typography preferences. No fixed slide count or quota of charts/frameworks is required.

Copy the complete skill directory, including `dependencies/`. The loader prefers a compatible local planner; otherwise it verifies and extracts the bundled snapshot. The agent reads the resolved SKILL.md directly, with no separate global installation or session restart. Planner source is maintained in its [own repository](https://github.com/ZeroxZhang/echarts-viz-planner); the snapshot is a generated distribution artifact.

Build dependencies and commands are in the [skill README](consulting_deck_skill/README.md). Finished artifacts need no build tools to open.

## Project references

- [Skill workflow](consulting_deck_skill/SKILL.md)
- [Authoring freedom and proportionate checks](consulting_deck_skill/references/open_authoring.md)
- [Framework extensions](consulting_deck_skill/references/framework_extensions.md)
- [Custom charts and diagrams](consulting_deck_skill/references/custom_exhibits.md)
- [v9.2 integration and validation](iteration_v9_2_viz_planner/validation.md)
- [Adversarial review](review_partner_2026-09-06/review_report.md)
- [Current project rules](AGENTS.md)

Themes inspired by public McKinsey, BCG and Accenture visual materials are independent adaptations, not official internal templates. The project focuses on HTML and PDF. Component tests and individual case checks have limited scope; passing them does not prove top-tier consulting quality for every assignment.

Historical iterations remain archived: v1 workflow/engine, v2 SVG/references, v3 themes, v4 analytical exhibits, v5 dense-input routing, v6 analytical planning, v7 typography, v8 paired delivery, v9 open analysis/authoring and proportionate validation. `report/` and `research_notes/` preserve earlier methodology research.
