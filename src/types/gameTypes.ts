export type GameStatus = 'playing' | 'checkmate' | 'draw' | 'resigned' | 'timeout';
export type GameOutcomeWinner = 'user' | 'stockfish' | 'draw' | null;

export interface TimeControl {
  type: 'bullet' | 'blitz' | 'rapid' | 'custom' | 'unlimited';
  initialMinutes: number;
  incrementSeconds: number;
  name: string;
}

export interface GameSetupOptions {
  userColor: 'w' | 'b' | 'random';
  stockfishElo: number;
  timeControl: TimeControl;
}

export interface MoveRecord {
  moveNumber: number;
  san: string;
  uci: string;
  fenBefore: string;
  fenAfter: string;
  timeSpentMs: number;
  playerColor: 'w' | 'b';
  evalCentipawns?: number;
  moveQuality?: 'brilliant' | 'great' | 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder';
}

export interface GameSession {
  id: string;
  playedAt: string;
  userColor: 'w' | 'b';
  stockfishElo: number;
  timeControlName?: string;
  status: GameStatus;
  winner: GameOutcomeWinner;
  pgn: string;
  moveHistory: MoveRecord[];
  ratingDelta?: number;
  openingName?: string;
  motifsTagged?: string[];
  finalFen?: string;
}
