import { describe, expect, test } from 'bun:test';
import { FeatureExtractor } from '../services/classifier/featureExtractor';
import { RuleEngine } from '../services/classifier/ruleEngine';
import { GroundTruthBenchmark } from '../services/classifier/groundTruthBenchmark';
import { DatabaseService } from '../services/db/databaseService';
import { HabitMiner } from '../services/mining/habitMiner';
import { VoiceSynthesizer } from '../services/voice/voiceSynthesizer';
import { GameSession } from '../types/gameTypes';

describe('Phase 5 Efficacy & Full System Verification Suite', () => {
  test('Complete end-to-end diagnostic & coaching pipeline executes offline', async () => {
    // 1. Position Feature Extraction
    const fenBefore = 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3';
    const fenAfter = 'r1bqkbnr/pppp1ppp/2n5/4N3/4P3/8/PPPP1PPP/RNBQKB1R b KQkq - 0 3';
    const features = FeatureExtractor.extractFeatures(fenAfter);
    expect(features.turn).toBe('b');

    // 2. Deterministic Rule Classification
    const diagnoses = RuleEngine.diagnoseMove({
      fenBefore,
      fenAfter,
      playedMoveSan: 'Nxe5',
      playedMoveUci: 'f3e5',
      playerColor: 'w',
      evalDropCp: 300,
      moveNumber: 3,
    });
    expect(diagnoses.length).toBeGreaterThan(0);
    const mainDiagnosis = diagnoses[0];
    expect(mainDiagnosis.level1Mistake).toBe('Hung Piece');

    // 3. Voice Synthesizer Output
    const voiceOutput = VoiceSynthesizer.getDeterministicFallback({
      diagnosis: mainDiagnosis,
      playedMoveSan: 'Nxe5',
      moveNumber: 3,
      occurrenceCount: 2,
    });
    expect(voiceOutput.headline).toBeDefined();
    expect(voiceOutput.bodyAdvice).toBeDefined();
    expect(voiceOutput.source).toBe('deterministic_template');

    // 4. Database Session Persistence
    const session: GameSession = {
      id: `efficacy_session_${Date.now()}`,
      playedAt: new Date().toISOString(),
      userColor: 'w',
      stockfishElo: 1100,
      status: 'checkmate',
      winner: 'user',
      pgn: '1. e4 e5 2. Nf3 Nc6',
      moveHistory: [
        {
          moveNumber: 1,
          san: 'e4',
          uci: 'e2e4',
          fenBefore,
          fenAfter,
          timeSpentMs: 1800,
          playerColor: 'w',
          evalCentipawns: 20,
        },
      ],
    };
    const saved = await DatabaseService.saveGameSession(session, new Map());
    expect(saved.id).toBe(session.id);

    // 5. Statistical Habit Mining
    const summary = HabitMiner.mineHabits();
    expect(summary.totalGamesAnalyzed).toBeGreaterThan(0);
  });

  test('Ground Truth Benchmark maintains 95% F1 score regression gate', () => {
    const benchmarkPositions = [
      {
        id: 'bench_1',
        fenBefore: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
        fenAfter: 'r1bqkbnr/pppp1ppp/2n5/4N3/4P3/8/PPPP1PPP/RNBQKB1R b KQkq - 0 3',
        playedMoveSan: 'Nxe5',
        playedMoveUci: 'f3e5',
        playerColor: 'w' as const,
        evalDropCp: 300,
        expectedLevel1: 'Hung Piece',
        expectedLevel2: 'Safety Scan',
        expectedHabitTag: 'loose-piece-awareness-failure',
        moveNumber: 3,
      },
    ];

    const metrics = GroundTruthBenchmark.runBenchmark(benchmarkPositions);
    expect(metrics.f1Score).toBeGreaterThanOrEqual(0.95);
    expect(metrics.passesRegressionGate).toBe(true);
  });
});
