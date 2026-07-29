export interface PieceTarget {
  square: string;
  pieceType: string;
  color: 'w' | 'b';
  value: number;
}

export interface LoosePieceInfo {
  square: string;
  pieceType: string;
  color: 'w' | 'b';
  value: number;
  attackersCount: number;
  defendersCount: number;
}

export interface PinInfo {
  pinnedSquare: string;
  pinningSquare: string;
  targetSquare: string; // King or High-Value piece
  isAbsolute: boolean;
}

export interface ForkInfo {
  forkingSquare: string;
  targetedSquares: string[];
  targetedPieceTypes: string[];
}

export interface KingSafetyInfo {
  color: 'w' | 'b';
  kingSquare: string;
  pawnShieldCount: number;
  openFilesNearKing: number;
  attackersNearKing: number;
  safetyScore: number; // 0 to 100
}

export interface PositionFeatures {
  fen: string;
  turn: 'w' | 'b';
  loosePieces: LoosePieceInfo[];
  pins: PinInfo[];
  forks: ForkInfo[];
  kingSafety: {
    white: KingSafetyInfo;
    black: KingSafetyInfo;
  };
  openFiles: number[]; // file indices 0-7 (a-h)
  passedPawns: { square: string; color: 'w' | 'b' }[];
  isCastled: { white: boolean; black: boolean };
  unmovedMinorPiecesCount: { white: number; black: number };
}
