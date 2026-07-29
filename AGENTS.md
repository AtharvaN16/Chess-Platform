# AGENTS.md — Personal AI Chess Coach Project Guide

Welcome AI Agent / Developer! This document serves as the sitemap, design principles, and guidelines for working on the **Personal AI Chess Coach** codebase.

---

## 1. Core Philosophy
> **Stockfish already knows how to play chess. We want the app to know how you think.**

Traditional chess software answers: *"What was the best move?"*  
This application answers: *"Why did I make the move I made, and what cognitive thinking process failed that caused this mistake?"*

---

## 2. Master Architecture & Roadmap
The complete architectural blueprint, feature extractor math, 30+ deterministic rules, cognitive science models, database schemas, and 5-phase roadmap are located at:

👉 [Master Architecture & Roadmap Document](docs/architecture/master_architecture_and_roadmap.md)

---

## 3. Key Architectural Guidelines for AI Agents

1. **Strictly Offline & Local-First**:
   - Zero external cloud servers, zero backend API authentication, zero user accounts.
   - Everything runs on device via Tauri (macOS/desktop) or Vite + WebAssembly + SQLite (`wa-sqlite`/OPFS).

2. **100% Deterministic Diagnostic Engine**:
   - Do NOT use LLMs or machine learning for mistake classification or feature extraction.
   - Stockfish evaluation drops ($\Delta CP$) + Position Feature Extractor + Deterministic Rule Engine generate 100% explainable Level 1 (Board Error), Level 2 (Thinking Fallacy), and Level 3 (Habit) diagnoses.
   - Local LLMs (or template fallbacks) are used strictly as a natural voice synthesizer for structured JSON outputs.

3. **Branching & Git Workflow**:
   - **Active Development Branch**: `dev`
   - **Production Release Branch**: `main`
   - All coding work occurs in `dev`. Merge to `main` only when a milestone passes all automated anti-regression tests.

4. **Testing & Anti-Regression (5-Layer Quality Harness)**:
   - Always run tests (`bun test`) after editing code.
   - Never merge code that drops the 1,000-position Ground Truth benchmark F1 score below 95%.

---

## 4. Installed Skills Reference
- [Engineering Skills (Matt Pocock)](skills/engineering/SKILL.md)
- [Motion Design Principles (Emil Kowalski)](skills/motion/SKILL.md)
- [Impeccable Design System (Rauno Freiberg)](skills/impeccable-design/SKILL.md)
