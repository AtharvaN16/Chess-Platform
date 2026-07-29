export interface DbGame {
  id: string;
  pgn: string;
  playedAt: string;
  timeControl?: string;
  result: string;
  userColor: 'w' | 'b';
  userRating?: number;
  opponentRating?: number;
  engineEloSetting: number;
  performanceEloEarned: number;
  averageAcpl: number;
}

export interface DbMove {
  id: string;
  gameId: string;
  moveNumber: number;
  playerColor: 'w' | 'b';
  san: string;
  uci: string;
  fenBefore: string;
  fenAfter: string;
  timeSpentMs: number;
  engineEvalCentipawns?: number;
}

export interface DbMistakeEval {
  id: string;
  moveId: string;
  evalDrop: number;
  mistakeType: string;
  expectedBestMove: string;
  aiExplanation?: string;
}

export interface DbCognitiveError {
  id: string;
  mistakeId: string;
  thinkingStep: string; // e.g. "Safety Scan", "Threat Scan"
  errorTag: string; // e.g. "loose-piece-awareness-failure"
  severity: number; // 0.0 to 1.0
}

export type HabitStatus = 'acute' | 'chronic' | 'fixed' | 'relapsed';

export interface DbHabit {
  id: string;
  habitName: string;
  thinkingStep: string;
  confidenceScore: number; // 0.0 to 1.0
  status: HabitStatus;
  lastObservedAt: string;
  occurrenceCount: number;
}
