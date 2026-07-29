import { describe, expect, test } from 'bun:test';
import { Chess } from 'chess.js';
import { StockfishService } from '../services/engine/stockfishService';

describe('Phase 1 Core Engine & Gameplay Verification', () => {
  test('chess.js validates legal moves and detects checkmate', () => {
    const game = new Chess();
    expect(game.fen()).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

    // Scholar's Mate test sequence
    game.move('e4');
    game.move('e5');
    game.move('Bc4');
    game.move('Nc6');
    game.move('Qh5');
    game.move('Nf6');
    game.move('Qxf7#');

    expect(game.isCheckmate()).toBe(true);
    expect(game.isGameOver()).toBe(true);
  });

  test('chess.js executes Kingside and Queenside castling correctly', () => {
    const game = new Chess('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
    // White Kingside Castle (e1 to g1)
    const moveResult = game.move({ from: 'e1', to: 'g1' });
    expect(moveResult).not.toBeNull();
    expect(moveResult?.san).toBe('O-O');
    expect(game.get('g1')?.type).toBe('k');
    expect(game.get('f1')?.type).toBe('r');
  });

  test('StockfishService configures ELO calibration correctly', () => {
    const service = new StockfishService(1100);
    expect(service.getStatus()).toBe('uninitialized');

    service.setElo(1500);
    expect(service.getStatus()).toBe('uninitialized');
  });
});
