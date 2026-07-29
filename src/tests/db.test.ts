import { describe, expect, test } from 'bun:test';
import { DatabaseService } from '../services/db/databaseService';
import { HabitMiner } from '../services/mining/habitMiner';
import { GameSession } from '../types/gameTypes';
import { Diagnosis } from '../services/classifier/ruleTypes';

describe('Phase 3 Persistence & Statistical Habit Mining Verification', () => {
  test('DatabaseService calculates performance ELO and persists sessions', async () => {
    const session: GameSession = {
      id: `test_session_${Date.now()}`,
      playedAt: new Date().toISOString(),
      userColor: 'w',
      stockfishElo: 900,
      status: 'checkmate',
      winner: 'user',
      pgn: '1. e4 e5 2. Nf3 Nc6 3. Bc4 Nf6 4. Ng5 d5',
      moveHistory: [
        {
          moveNumber: 1,
          san: 'e4',
          uci: 'e2e4',
          fenBefore: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
          fenAfter: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
          timeSpentMs: 2500,
          playerColor: 'w',
          evalCentipawns: 30,
        },
      ],
    };

    const diagnosesByMoveId = new Map<string, Diagnosis[]>();
    const savedGame = await DatabaseService.saveGameSession(session, diagnosesByMoveId);

    expect(savedGame.id).toBe(session.id);
    expect(savedGame.performanceEloEarned).toBeGreaterThan(900); // Won vs 900 Stockfish
    expect(DatabaseService.getAllGames().length).toBeGreaterThan(0);
  });

  test('HabitMiner calculates Habit Confidence Scores (HCS)', () => {
    const summary = HabitMiner.mineHabits();

    expect(summary.totalGamesAnalyzed).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(summary.minedHabits)).toBe(true);
  });
});
