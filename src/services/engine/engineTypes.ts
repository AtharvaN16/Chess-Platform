export type EngineDifficultyPreset = 700 | 900 | 1100 | 1500 | 3200;

export interface StockfishConfig {
  elo: number; // 100 to 3200+ ELO
  depth: number; // Search depth (default 12 for fast local analysis)
  threads: number;
  hashSizeMb: number;
}

export interface EngineEvaluation {
  bestMove: string; // e.g. "e2e4"
  ponderMove?: string; // e.g. "e7e5"
  scoreCp?: number; // Centipawn evaluation relative to side to move
  mateIn?: number; // Moves until checkmate if mate line detected
  depth: number;
  pv: string[]; // Principal variation moves
}

export type EngineStatus = 'uninitialized' | 'loading' | 'ready' | 'thinking' | 'error';
