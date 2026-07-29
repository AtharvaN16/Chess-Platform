export interface MoveRecord {
  moveNumber: number;
  san: string;
  uci: string;
  fenBefore: string;
  fenAfter: string;
  timeSpentMs: number;
  playerColor: 'w' | 'b';
  evalCentipawns?: number;
}

export type GameStatus = 'playing' | 'checkmate' | 'draw' | 'resigned';
export type GameOutcomeWinner = 'user' | 'stockfish' | 'draw' | null;

export interface GameSession {
  id: string;
  playedAt: string;
  userColor: 'w' | 'b';
  stockfishElo: number;
  status: GameStatus;
  winner: GameOutcomeWinner;
  pgn: string;
  moveHistory: MoveRecord[];
  averageAcpl?: number;
}
