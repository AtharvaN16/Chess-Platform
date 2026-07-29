export type Level2ThinkingStep = 
  | 'Threat Scan' 
  | 'Safety Scan' 
  | 'Candidate Generation' 
  | 'Calculation' 
  | 'Evaluation' 
  | 'Planning';

export interface Diagnosis {
  ruleId: string;
  ruleName: string;
  level1Mistake: string;
  level2ThinkingStep: Level2ThinkingStep;
  habitTag: string;
  evalDropCentipawns: number;
  explanation: string;
  recommendedDrill: string;
  confidenceScore: number; // 0.0 to 1.0
}

export interface MoveContext {
  fenBefore: string;
  fenAfter: string;
  playedMoveSan: string;
  playedMoveUci: string;
  playerColor: 'w' | 'b';
  evalDropCp: number; // Positive centipawn drop (e.g. 150 = lost 1.5 pawns)
  bestMoveSan?: string;
  timeSpentMs?: number;
  moveNumber: number;
}
