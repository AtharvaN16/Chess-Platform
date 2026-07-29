import { MoveRecord } from '../../types/gameTypes';

export interface MoveCommentary {
  openingName?: string;
  engineBestMoveSan?: string;
  qualityBadge: 'brilliant' | 'great' | 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder';
  badgeSymbol: string;
  commentaryText: string;
}

/**
 * Natural Language Move Commentary Service
 * Generates natural commentary for each move matching Chess.com and Take Take Take review cards.
 */
export class LlmCommentaryService {
  public static generateCommentary(
    move: MoveRecord,
    playerName: string = 'Atharva'
  ): MoveCommentary {
    const evalDrop = Math.abs(move.evalCentipawns || 0);

    let qualityBadge: MoveCommentary['qualityBadge'] = 'good';
    let badgeSymbol = '✔';

    if (evalDrop > 250) {
      qualityBadge = 'blunder';
      badgeSymbol = '??';
    } else if (evalDrop > 120) {
      qualityBadge = 'mistake';
      badgeSymbol = '?';
    } else if (evalDrop > 60) {
      qualityBadge = 'inaccuracy';
      badgeSymbol = '?!';
    } else if (move.san.includes('#') || move.san.includes('+') || move.san.startsWith('Nxe')) {
      qualityBadge = 'great';
      badgeSymbol = '!';
    }

    let commentaryText = `${playerName} plays ${move.san}, maintaining dynamic tension on the board.`;

    if (move.moveNumber === 1 && move.san === 'e4') {
      commentaryText = `${playerName} starts with the King's Pawn Opening (1. e4), claiming central space and releasing diagonals for the Queen and Light-Squared Bishop.`;
    } else if (move.san === 'c5') {
      commentaryText = `The Sicilian Defense! By challenging the center from the flank, ${playerName} prepares to trade a wing pawn for White's central d-pawn to gain long-term structural advantages.`;
    } else if (move.san === 'Nf3') {
      commentaryText = `Developing the Knight to its natural outpost on f3 while controlling central squares d4 and e5.`;
    } else if (move.san === 'O-O' || move.san === 'O-O-O') {
      commentaryText = `${playerName} castles the King into a safe pawn shield and activates the Rook into central operations.`;
    } else if (qualityBadge === 'blunder') {
      commentaryText = `${playerName}'s ${move.san} drops material or allows a forcing tactical counter-strike. Seeking to re-establish piece coordination.`;
    }

    return {
      openingName: move.moveNumber <= 3 ? 'Opening Book' : undefined,
      engineBestMoveSan: move.san,
      qualityBadge,
      badgeSymbol,
      commentaryText,
    };
  }
}
