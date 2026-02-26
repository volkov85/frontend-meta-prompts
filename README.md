# 🧠 Frontend Meta Prompts Engine

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](#)
[![Node](https://img.shields.io/badge/Node.js-%3E%3D18-green)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#)
[![Prettier](https://img.shields.io/badge/code_style-Prettier-ff69b4.svg)](#)

Structured interview engine for **Senior Frontend Engineers**  
(React · TypeScript · JavaScript · System Design)

> A modular prompt generation and session tracking engine designed to simulate real-world senior frontend interviews.

---

## ✨ Why this project exists

Preparing for senior frontend interviews is chaotic:
- random questions
- no structure
- no tracking
- no measurable progress

This project turns preparation into a **system**:
- Structured interview templates
- Prompt composition engine
- Session tracking
- Scoring & evaluation
- Extensible architecture

---

## 🏗 Architecture

data/
  interviews.json ← Interview templates & configuration
  sessions.json ← Session history (runtime)

engine/
  composeInterviewPrompt.ts ← Prompt builder
  sessionRunner.ts ← Session lifecycle manager
  scorer.ts ← Evaluation logic

index.ts ← Entry point

Separation of concerns:
- **Data layer** → declarative interview templates
- **Engine layer** → business logic
- **Runtime layer** → sessions + scoring

---

## 🧩 Features

### 🎯 Structured Interview Templates
- React Performance
- Advanced TypeScript
- JavaScript Deep Dive
- Async & Concurrency
- System Design
- Security & Web Platform
- Observability
- Accessibility
- Architecture & State Management

All configurable via JSON.

---

### 🧠 Prompt Composition Engine

Transforms structured config into production-ready interview prompts.
```ts
const prompt = composeInterviewPrompt(interviews, {
  templateId: "js-deep-dive-core",
  level: "senior",
  mode: { simulation: true, timeboxedMinutes: 30 },
});
```

📊 Session Tracking

Each session is persisted:
```json
{
  "id": "uuid",
  "date": "2026-03-01T12:00:00Z",
  "templateId": "react-performance-profiling",
  "level": "senior",
  "score": 7
}
```

Enables:
- progress tracking
- weakness detection
- adaptive training

🏁 Scoring System
- Basic evaluation logic (extensible to AI scoring):
- Depth
- Trade-off awareness
- Complexity analysis
- Structure & clarity

🚀 Getting Started
Install
- npm install

Run
- npm run dev

Format
- npm run format
  
🛠 Tech Stack
- TypeScript
- Node.js
- Prettier
- JSON-driven configuration
