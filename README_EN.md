> Language: [English](README_EN.md) · [简体中文](README.md)

# Consulting Deck Skill · v9.1

Turn a brief and rich source material into an evidence-based consulting deck, delivered as self-contained HTML and a matching paginated PDF.

The skill works with Agent Skills-compatible tools. Analysis, argument and visual design determine the result. Method cards, chart recipes and layouts are reusable starting points; the author can extend them or choose a custom implementation. HTML includes navigation, scaling, fullscreen, deep links and offline download of the same PDF.

v9.1 adds a quiet neutral page frame, with per-slide boundary integration or omission. See [frame guidance](consulting_deck_skill/references/page_frame.md) and [implementation and validated artifacts](iteration_v9_1_frame/validation.md).

## Live samples

The screenshots below are the current samples (v9.1 frame). Open them in a browser — navigation, zoom, fullscreen and deep links included; click an image to jump to that slide.

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

Build dependencies and commands are in the [skill README](consulting_deck_skill/README.md). Finished artifacts need no build tools to open.

## Project references

- [Skill workflow](consulting_deck_skill/SKILL.md)
- [Authoring freedom and proportionate checks](consulting_deck_skill/references/open_authoring.md)
- [Framework extensions](consulting_deck_skill/references/framework_extensions.md)
- [Custom charts and diagrams](consulting_deck_skill/references/custom_exhibits.md)
- [v9 implementation and validation](iteration_v9_open/validation.md)
- [Adversarial review](review_partner_2026-09-06/review_report.md)
- [Current project rules](AGENTS.md)

Themes inspired by public McKinsey, BCG and Accenture visual materials are independent adaptations, not official internal templates. The project focuses on HTML and PDF. Component tests and individual case checks have limited scope; passing them does not prove top-tier consulting quality for every assignment.

Historical iterations remain archived: v1 workflow/engine, v2 SVG/references, v3 themes, v4 analytical exhibits, v5 dense-input routing, v6 analytical planning, v7 typography, v8 paired delivery, v9 open analysis/authoring and proportionate validation. `report/` and `research_notes/` preserve earlier methodology research.
