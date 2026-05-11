# Frontend Meta Prompts Engine

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](#)
[![Node](https://img.shields.io/badge/Node.js-%3E%3D18-green)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#)
[![Prettier](https://img.shields.io/badge/code_style-Prettier-ff69b4.svg)](#)
[![CI Quality Gate](https://github.com/volkov85/frontend-meta-prompts/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/volkov85/frontend-meta-prompts/actions/workflows/ci.yml)
[![Lighthouse CI](https://github.com/volkov85/frontend-meta-prompts/actions/workflows/lighthouse.yml/badge.svg?branch=main)](https://github.com/volkov85/frontend-meta-prompts/actions/workflows/lighthouse.yml)
[![Deploy to GitHub Pages](https://github.com/volkov85/frontend-meta-prompts/actions/workflows/deploy-pages.yml/badge.svg?branch=main)](https://github.com/volkov85/frontend-meta-prompts/actions/workflows/deploy-pages.yml)

Structured interview engine for Senior Frontend Engineers
(React, TypeScript, JavaScript, System Design)

Live Demo: https://volkov85.github.io/frontend-meta-prompts/

<p align="center">
  <img src="./docs/assets/app-preview.png" alt="Frontend Meta Prompts web UI screenshot" width="100%" />
</p>

This project helps you run a repeatable interview practice loop:

1. Generate a structured interview prompt
2. Run interview in external LLM/chat
3. Save score and notes back to local session history

## Why this project exists

Interview prep is usually random and hard to track.
This project makes it structured:

- Template-driven interview topics
- Shared prompt composition core for CLI and Web UI
- Session history persistence
- External evaluation recording (LLM/interviewer score + notes)

## Architecture

```text
data/
  interviews.json    # Interview templates and defaults
  sessions.json      # Runtime session history for CLI mode

core/
  composeInterviewPrompt.ts  # Shared prompt builder (single source of truth)
  types.ts                   # Shared interview domain types

engine/
  composeInterviewPrompt.ts  # Re-export of shared prompt builder for CLI imports
  sessionRunner.ts           # Session create/update and persistence

index.ts              # CLI entry point

web-ui/
  src/lib/composePrompt.ts   # Re-export of shared prompt builder for browser mode
  src/lib/types.ts           # Re-export of shared core types for the UI layer
  src/lib/localSessions.ts   # localStorage session persistence
  src/App.tsx                # React UI
```

Separation of concerns:

- Data layer: declarative interview templates
- Core layer: shared prompt generation and domain types
- Engine layer: CLI runtime and filesystem persistence
- Web layer: browser UI and localStorage persistence
- Runtime layer: generated sessions and evaluation results

## Features

Core (CLI + Web):

- Structured interview templates (junior/middle/senior)
- Prompt generation with mode overrides from a shared core module
- Template-level prompt overrides (`promptOverrides`) for per-template tuning
- CLI to list templates and generate interviews; CLI mode to record external LLM evaluation
- Session persistence in JSON (CLI) and `localStorage` (Web UI)

Web UI (Prompt / Charts / Sessions tabs):

- Bilingual interface (`EN` / `RU`) with locale-aware copy and Russian plural helper
- **Prompt tab** — template + level setup, stack/focus/context/timebox/simulation controls,
  generated prompt with copy/share, deep-link `?template=…&level=…` hydration,
  company preset bar, keyboard shortcut to regenerate, persisted setup state
- **Charts tab** — four analytics cards laid out responsively (single column ≤ lg,
  Momentum full-width + Rubric/Streak/Topic in a 2×2 grid at xl ≥ 1536px):
  - **Interview Momentum** — score trend chart with averages and level coverage
  - **Rubric breakdown** — 5-axis radar (correctness, depth, communication,
    trade-offs, practicality), latest session vs. recent average
  - **Practice streak** — current / longest / total-active-days chips plus a
    12 / 26 / 52-week activity heatmap (right-aligned on today)
  - **Topic coverage** — `tag × week` heatmap derived from session templates,
    rows sorted by total volume; click a row to jump to the filtered Sessions tab
- **Sessions tab** — recent sessions list with multi-axis filters (level, score,
  search, tags, date range), per-session rubric / prompt / notes, evaluation editing,
  JSON / Markdown export, JSON import with merge + 5-per-page pagination
- **Next-session recommendation** — dismissible alert that picks the next
  template based on the weakest rubric axis from recent sessions
- **Cross-tab linking** — heatmap row → Sessions filtered by that tag,
  current-streak chip → Sessions filtered by the last N days
- Installable as a Progressive Web App (manifest, icons, theme color)
- Open Graph + Twitter card meta for rich link previews on social platforms

## Shared Core

The project uses a shared `core/` module so CLI and Web UI do not duplicate
prompt-building logic or domain types.

What lives in `core/`:

- `core/composeInterviewPrompt.ts` - canonical prompt builder
- `core/types.ts` - canonical interview config and session types

Benefits:

- One source of truth for prompt generation behavior
- Consistent output across CLI and browser flows
- Lower maintenance cost when adding new template options or modes

## Template Prompt Overrides

Templates in `data/interviews.json` can define `promptOverrides`:

- `followUps` - overrides default follow-up count
- `include` - overrides default output sections
- `plainLanguage` - forces simpler wording and shorter phrasing
- `goodAnswerCriteria` - adds explicit "GOOD ANSWER CRITERIA" block to output

Example:

```json
{
  "id": "junior-javascript-fundamentals",
  "promptOverrides": {
    "followUps": 2,
    "plainLanguage": true,
    "include": ["idealAnswer", "commonMistakes", "edgeCases", "scoringRubric"],
    "goodAnswerCriteria": ["Explains solution in simple, correct steps"]
  }
}
```

Junior templates (`junior-*`) now use softer defaults:

- fewer follow-ups (`2`)
- plain language enabled
- explicit good answer criteria
- reduced include sections (without senior-focused blocks)

## Getting Started

Install:

```bash
npm install
```

Run CLI help:

```bash
npm run interview -- --help
```

Run Web UI in dev mode:

```bash
npm run web
```

Then open `http://localhost:5173`.

Format code:

```bash
npm run format
```

Run full local quality gate:

```bash
npm run check
```

## CLI Usage

### 1) Generate interview prompt

Creates a new session (unless `--no-session`) and prints prompt.

```bash
npm run interview -- --template js-deep-dive-core --level senior
```

Optional flags:

- `--stack react,typescript,javascript`
- `--focus event-loop,closures`
- `--extra "Your company/project context"`
- `--simulation true|false`
- `--timebox 30`
- `--english`
- `--no-session`

### 2) Record external evaluation

Use this after interview is completed in external LLM/chat.

```bash
npm run interview -- --record-eval --session-id <id> --score 8.5 --notes "Strong trade-offs, missed edge cases"
```

Rules:

- `--record-eval` requires `--session-id`
- `--record-eval` requires `--score` (0..10)
- `--notes` is optional and expected to come from external LLM/interviewer

### 3) List templates

```bash
  npm run interview -- --list-templates
```

## Web UI (React + MUI)

The project includes a browser interface powered by React + TypeScript + MUI, built with Vite.
This mode is fully static and GitHub Pages compatible.

Capabilities:

- Three-tab workspace: **Prompt** (setup + generated prompt), **Charts**
  (Momentum, rubric radar, streak calendar, topic heatmap),
  **Sessions** (history + filters + pagination)
- Switch interface language (`EN` / `RU`) in the top bar — persisted
- Generate interview prompt in browser in selected language
- Auto-create session id; save score, 5-axis rubric, and notes into `localStorage`
- Rubric-based recommendation for the next session based on the weakest axis
- Track recent interview momentum, streak, and topic coverage
- Multi-axis filtering of session history (level, score, tags, date range, search)
- Cross-tab linking from charts to filtered Sessions view
- Persist selected UI language and setup form in `localStorage` between reloads
- Export sessions as JSON or Markdown; import JSON with merge

Implementation:

- `web-ui/vite.config.ts` — Vite config and per-chunk split
  (`react-vendor` / `mui-vendor` / `mui-styling` / app entry)
- `web-ui/src/App.tsx` — main UI shell, tabs, cross-tab state
- `web-ui/src/components/` — `InterviewSetupCard`, `EvaluationCard`,
  `ProgressChartCard`, `RubricRadarCard`, `StreakCalendarCard`,
  `TopicHeatmapCard`, `SessionsCard`, `SessionPromptDialog`,
  `RecommendedNextAlert`, `HorizonToggle`
- `web-ui/src/lib/` — pure helpers for prompt composition,
  rubric math, recommendation, streak/calendar, topic heatmap,
  template tag taxonomy, session export/import, deep-link hydration,
  setup persistence, and the `useInterviewAppState` hook
- `web-ui/src/main.tsx` — frontend entry
- `web-ui/src/theme.ts` / `web-ui/src/styles.css` — MUI theme and global styles
- `web-ui/src/lib/localSessions.ts` — `localStorage` persistence for sessions

Production build:

```bash
npm run web:build
npm run web:preview
```

Then open the preview URL printed in terminal.

GitHub Pages build (repo path base):

```bash
VITE_BASE_PATH=/YOUR_REPO_NAME/ npm run web:build
```

## Testing

The project now includes:

- Unit tests for shared prompt composition logic
- Unit tests for browser session persistence (`localStorage`)
- Integration tests for core React UI flows
- End-to-end tests in a real browser with Playwright

Run test suites:

```bash
npm run test
npm run test:watch
npm run test:ui
npm run test:coverage
```

Run e2e:

```bash
npx playwright install chromium
npm run e2e
npm run e2e:ui
```

## Code Quality Gate

Local checks:

- `npm run typecheck`
- `npm run lint`
- `npm run format:check`
- `npm run test`
- `npm run check` (runs all of the above in sequence)

Git hooks:

- `pre-commit` -> `lint-staged` (ESLint + Prettier on staged files)
- `commit-msg` -> `commitlint` with Conventional Commits rules

## CI/CD (GitHub Actions)

Workflows:

- `CI Quality Gate` (`.github/workflows/ci.yml`) — runs three jobs in parallel:
  - `quality-gate`: typecheck + lint + Prettier + Vitest
  - `e2e`: Playwright Chromium against the dev server (uploads `playwright-report/` on failure)
  - `size-limit`: builds the production bundle and enforces gzip size budgets; fails the job if any chunk exceeds its limit
- `Lighthouse CI` (`.github/workflows/lighthouse.yml`) — runs Lighthouse against the production build and uploads the HTML report to temporary public storage. Asserts category scores (perf ≥ 0.9, a11y ≥ 0.9, best-practices ≥ 0.9, SEO ≥ 0.9) at warn level, plus hard-error assertions for `meta-description`, `viewport`, and `document-title` audits.
- `Deploy to GitHub Pages` (`.github/workflows/deploy-pages.yml`)

Pipeline logic:

- Quality gate runs on push and pull request for `main`
- Lighthouse CI runs on push and pull request for `main`
- Deploy runs automatically only after successful `CI Quality Gate` on `main`
- Deploy can also be started manually with `workflow_dispatch`

Bundle size budgets (`size-limit` config in `package.json`, gzip):

| Target            | Budget |
| ----------------- | ------ |
| App entry chunk   | 32 KB  |
| `react-vendor`    | 65 KB  |
| `mui-vendor`      | 85 KB  |
| `mui-styling`     | 38 KB  |
| Total JS (assets) | 210 KB |

`mui-vendor` holds `@mui/material` components; `mui-styling` holds the
emotion runtime and `@mui/system` / `@mui/utils` / `@mui/private-theming`
so component code and styling caches are split across separate chunks.

Run locally:

```bash
npm run size       # build + size-limit checks
npm run size:why   # interactive bundle composition explorer
npm run lhci       # build + Lighthouse CI assertions
```

Test files:

- `web-ui/src/lib/composePrompt.test.ts`
- `web-ui/src/lib/localSessions.test.ts`
- `web-ui/src/App.test.tsx`
- `e2e/app.spec.ts`

## End-to-End Flow (recommended)

1. Generate prompt and create session:

```bash
npm run interview -- --template react-performance-profiling --level senior
```

2. Copy prompt into your interview chat with LLM.
3. After interview, take LLM's final score/notes.
4. Save result:

```bash
npm run interview -- --record-eval --session-id <id> --score 8 --notes "Good depth, improve rollout strategy"
```

## Session Example

```json
{
  "id": "uuid",
  "date": "2026-02-26T12:20:55.985Z",
  "templateId": "react-performance-profiling",
  "level": "senior",
  "score": 8.5,
  "notes": "Strong architecture trade-offs",
  "rubric": {
    "correctness": 9,
    "depth": 8,
    "communication": 8,
    "tradeOffs": 7,
    "practicality": 9
  }
}
```

`rubric` is optional and only populated for sessions evaluated in the Web UI
through the 5-axis Rubric Radar. CLI-only sessions and legacy sessions
without rubric data still render normally; they just sit alongside rated
sessions in the history and contribute to averages where applicable.

## Tech Stack

- TypeScript
- Node.js
- ts-node
- Vite
- Vitest
- React Testing Library
- Playwright
- Prettier
- JSON-driven configuration
