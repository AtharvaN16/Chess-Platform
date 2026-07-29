# Personal AI Chess Coach

> **Stockfish already knows how to play chess. We want the app to know how you think.**

An offline-first, single-user desktop/web application that operates as a personal cognitive diagnostic system for chess players.

---

## Key Features

- **Calibrated Stockfish Opponent**: Play offline games against Stockfish calibrated from 100 ELO to 3200+ ELO (or relative presets like *My Level - 100*, *My Level + 100*).
- **Guided Metacognitive Review**: Before revealing Stockfish evaluations, self-reflect on your decision-making process (*"Where do you think you went wrong?"*).
- **Multi-Level Cognitive Diagnosis**:
  - **Level 1 (Chess Mistake)**: Board errors (Hung Piece, Poor Exchange).
  - **Level 2 (Thinking Error)**: Process fallacies (Hope Chess, Premature Closure, System 2 Verification Failure, Confirmation Bias).
  - **Level 3 (Habits)**: Mined statistical habits across 10–50 games.
- **Personal Chess DNA**: Track your Estimated Performance ELO, Tactical ELO, Positional ELO, and Endgame ELO.
- **Adaptive Lesson Drills**: Interactive cognitive checklist exercises generated directly from your own game mistakes.

---

## Tech Stack & Architecture

- **Runtime & Package Manager**: [Bun](https://bun.sh)
- **Frontend Framework**: React 19 + TypeScript + Vite
- **Styling & Motion**: Tailwind CSS + Framer Motion (Emil Kowalski & Rauno Freiberg aesthetics)
- **Chess Core**: `chess.js` + `react-chessboard`
- **Desktop & Offline Database**: Tauri + SQLite3 (`wa-sqlite` / OPFS for browser)

---

## Development

```bash
# Install dependencies
bun install

# Start local development server
bun dev

# Run production build
bun run build
```

---

## Project Structure & Documentation

- [`AGENTS.md`](AGENTS.md): Architectural guide and rules for AI subagents.
- [`docs/architecture/master_architecture_and_roadmap.md`](docs/architecture/master_architecture_and_roadmap.md): Complete master architecture document, cognitive science models, database schemas, and 5-phase implementation roadmap.
