# Frontend Meta Prompts Engine

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](#)
[![Node](https://img.shields.io/badge/Node.js-%3E%3D18-green)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#)
[![Prettier](https://img.shields.io/badge/code_style-Prettier-ff69b4.svg)](#)

Structured interview engine for Senior Frontend Engineers
(React, TypeScript, JavaScript, System Design)

This project helps you run a repeatable interview practice loop:
1. Generate a structured interview prompt
2. Run interview in external LLM/chat
3. Save score and notes back to local session history

## Why this project exists

Interview prep is usually random and hard to track.
This project makes it structured:
- Template-driven interview topics
- Prompt composition engine
- Session history persistence
- External evaluation recording (LLM/interviewer score + notes)

## Architecture

```text
data/
  interviews.json    # Interview templates and defaults
  sessions.json      # Runtime session history

engine/
  composeInterviewPrompt.ts  # Prompt builder
  sessionRunner.ts           # Session create/update and persistence
  scorer.ts                  # Optional local scorer (not required by CLI flow)

index.ts              # CLI entry point
```

Separation of concerns:
- Data layer: declarative interview templates
- Engine layer: business logic
- Runtime layer: generated sessions and evaluation results

## Features

- Structured interview templates (junior/middle/senior)
- Prompt generation with mode overrides
- CLI to list templates and generate interviews
- CLI mode to record external LLM evaluation
- JSON persistence for session tracking

## Getting Started

Install:
```bash
npm install
```

Run CLI help:
```bash
npm run interview -- --help
```

Format code:
```bash
npm run format
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
  "notes": "Strong architecture trade-offs"
}
```

## Tech Stack

- TypeScript
- Node.js
- ts-node
- Prettier
- JSON-driven configuration
