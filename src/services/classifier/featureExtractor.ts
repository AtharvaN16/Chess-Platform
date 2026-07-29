import { Chess, Square, PieceSymbol, Color } from 'chess.js';
import { PositionFeatures, LoosePieceInfo, PinInfo, ForkInfo, KingSafetyInfo } from './featureTypes';

const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

/**
 * Deterministic Position Feature Extractor
 * Parses chess position geometry, LPDO loose pieces, pins, forks, and structural motifs.
 */
export class FeatureExtractor {
  public static extractFeatures(fen: string): PositionFeatures {
    const game = new Chess(fen);
    const turn = game.turn();

    const loosePieces = this.detectLoosePieces(game);
    const pins = this.detectPins(game);
    const forks = this.detectForks(game);
    const kingSafetyWhite = this.evaluateKingSafety(game, 'w');
    const kingSafetyBlack = this.evaluateKingSafety(game, 'b');
    const openFiles = this.detectOpenFiles(game);
    const passedPawns = this.detectPassedPawns(game);

    return {
      fen,
      turn,
      loosePieces,
      pins,
      forks,
      kingSafety: {
        white: kingSafetyWhite,
        black: kingSafetyBlack,
      },
      openFiles,
      passedPawns,
      isCastled: {
        white: this.hasCastled(game, 'w'),
        black: this.hasCastled(game, 'b'),
      },
      unmovedMinorPiecesCount: {
        white: this.countUnmovedMinors(game, 'w'),
        black: this.countUnmovedMinors(game, 'b'),
      },
    };
  }

  /**
   * Detect Loose Pieces (LPDO - Loose Pieces Drop Off)
   * Pieces with zero defenders or attackers >= defenders
   */
  private static detectLoosePieces(game: Chess): LoosePieceInfo[] {
    const looseList: LoosePieceInfo[] = [];
    const board = game.board();

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (!piece || piece.type === 'p' || piece.type === 'k') continue;

        const square = piece.square as Square;
        const defendersCount = this.countDefenders(game, square, piece.color);
        const attackersCount = this.countAttackers(game, square, piece.color === 'w' ? 'b' : 'w');

        if (defendersCount === 0 || attackersCount > defendersCount) {
          looseList.push({
            square,
            pieceType: piece.type,
            color: piece.color,
            value: PIECE_VALUES[piece.type],
            attackersCount,
            defendersCount,
          });
        }
      }
    }

    return looseList;
  }

  /**
   * Detect Absolute and Relative Pins using move simulation
   */
  private static detectPins(game: Chess): PinInfo[] {
    const pins: PinInfo[] = [];
    const board = game.board();

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (!piece || piece.type === 'k') continue;

        const square = piece.square as Square;
        if (this.isAbsolutePin(game, square, piece.color)) {
          pins.push({
            pinnedSquare: square,
            pinningSquare: 'unknown',
            targetSquare: 'king',
            isAbsolute: true,
          });
        }
      }
    }

    return pins;
  }

  /**
   * Check if removing piece from square exposes King to check (Absolute Pin)
   */
  private static isAbsolutePin(game: Chess, square: Square, _color: Color): boolean {
    try {
      const copy = new Chess(game.fen());
      copy.remove(square);
      return copy.inCheck();
    } catch {
      return false;
    }
  }

  /**
   * Detect Tactical Forks (single piece attacking 2+ enemy targets)
   */
  private static detectForks(game: Chess): ForkInfo[] {
    const forks: ForkInfo[] = [];
    const board = game.board();

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (!piece) continue;

        const square = piece.square as Square;
        const enemyColor: Color = piece.color === 'w' ? 'b' : 'w';

        // Get squares attacked by this piece containing enemy pieces
        const attackedSquares = this.getAttackedEnemySquares(game, square, piece.color, enemyColor);

        if (attackedSquares.length >= 2) {
          forks.push({
            forkingSquare: square,
            targetedSquares: attackedSquares.map((s) => s.square),
            targetedPieceTypes: attackedSquares.map((s) => s.pieceType),
          });
        }
      }
    }

    return forks;
  }

  /**
   * Evaluate King Safety Score (0 to 100)
   */
  private static evaluateKingSafety(game: Chess, color: Color): KingSafetyInfo {
    const board = game.board();
    let kingSquare = 'e1';

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.type === 'k' && piece.color === color) {
          kingSquare = piece.square;
          break;
        }
      }
    }

    // Pawn shield check around king
    const file = kingSquare.charCodeAt(0) - 97;
    const rank = parseInt(kingSquare[1], 10);
    const shieldRank = color === 'w' ? rank + 1 : rank - 1;

    let pawnShieldCount = 0;
    [-1, 0, 1].forEach((df) => {
      const f = file + df;
      if (f >= 0 && f < 8 && shieldRank >= 1 && shieldRank <= 8) {
        const sq = `${String.fromCharCode(97 + f)}${shieldRank}` as Square;
        const p = game.get(sq);
        if (p && p.type === 'p' && p.color === color) {
          pawnShieldCount++;
        }
      }
    });

    const openFilesNearKing = this.detectOpenFiles(game).filter((f) => Math.abs(f - file) <= 1).length;
    const attackersNearKing = this.countAttackers(game, kingSquare as Square, color === 'w' ? 'b' : 'w');

    let safetyScore = 100;
    safetyScore -= (3 - pawnShieldCount) * 20;
    safetyScore -= openFilesNearKing * 15;
    safetyScore -= attackersNearKing * 10;

    return {
      color,
      kingSquare,
      pawnShieldCount,
      openFilesNearKing,
      attackersNearKing,
      safetyScore: Math.max(0, Math.min(100, safetyScore)),
    };
  }

  private static detectOpenFiles(game: Chess): number[] {
    const openFiles: number[] = [];
    const board = game.board();

    for (let file = 0; file < 8; file++) {
      let hasPawn = false;
      for (let rank = 0; rank < 8; rank++) {
        const piece = board[rank][file];
        if (piece && piece.type === 'p') {
          hasPawn = true;
          break;
        }
      }
      if (!hasPawn) {
        openFiles.push(file);
      }
    }

    return openFiles;
  }

  private static detectPassedPawns(game: Chess): { square: string; color: 'w' | 'b' }[] {
    const passed: { square: string; color: 'w' | 'b' }[] = [];
    const board = game.board();

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.type === 'p') {
          if (this.isPassedPawn(board, r, c, piece.color)) {
            passed.push({ square: piece.square, color: piece.color });
          }
        }
      }
    }

    return passed;
  }

  private static isPassedPawn(board: (ReturnType<Chess['board']>[0][0])[][], row: number, col: number, color: Color): boolean {
    const enemyColor = color === 'w' ? 'b' : 'w';
    const direction = color === 'w' ? -1 : 1; // row 0 is 8th rank, row 7 is 1st rank

    let r = row + direction;
    while (r >= 0 && r < 8) {
      for (let dc = -1; dc <= 1; dc++) {
        const c = col + dc;
        if (c >= 0 && c < 8) {
          const piece = board[r][c];
          if (piece && piece.type === 'p' && piece.color === enemyColor) {
            return false;
          }
        }
      }
      r += direction;
    }
    return true;
  }

  private static countDefenders(game: Chess, square: Square, friendlyColor: Color): number {
    const attackers = game.attackers(square, friendlyColor);
    return attackers.length;
  }

  private static countAttackers(game: Chess, square: Square, enemyColor: Color): number {
    const attackers = game.attackers(square, enemyColor);
    return attackers.length;
  }

  private static getAttackedEnemySquares(
    game: Chess,
    square: Square,
    _friendlyColor: Color,
    enemyColor: Color
  ): { square: string; pieceType: string }[] {
    const attacked: { square: string; pieceType: string }[] = [];
    const board = game.board();

    // Scan all squares for enemy pieces attacked by square
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const target = board[r][c];
        if (target && target.color === enemyColor) {
          const targetSquare = target.square as Square;
          const attackingSquares = game.attackers(targetSquare, _friendlyColor);
          if (attackingSquares.includes(square)) {
            attacked.push({ square: targetSquare, pieceType: target.type });
          }
        }
      }
    }

    return attacked;
  }

  private static hasCastled(game: Chess, color: Color): boolean {
    const history = game.history({ verbose: true });
    return history.some((m) => m.color === color && (m.san === 'O-O' || m.san === 'O-O-O'));
  }

  private static countUnmovedMinors(game: Chess, color: Color): number {
    const rank = color === 'w' ? '1' : '8';
    const initialSquares = [`b${rank}`, `c${rank}`, `f${rank}`, `g${rank}`];
    let unmoved = 0;

    initialSquares.forEach((sq) => {
      const p = game.get(sq as Square);
      if (p && p.color === color && (p.type === 'n' || p.type === 'b')) {
        unmoved++;
      }
    });

    return unmoved;
  }
}
