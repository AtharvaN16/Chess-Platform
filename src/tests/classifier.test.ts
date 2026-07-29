import { describe, expect, test } from 'bun:test';
import { FeatureExtractor } from '../services/classifier/featureExtractor';
import { RuleEngine } from '../services/classifier/ruleEngine';
import { GroundTruthBenchmark, GroundTruthBenchmarkPosition } from '../services/classifier/groundTruthBenchmark';

describe('Phase 2 Diagnostic Classifier & Feature Extractor Verification', () => {
  test('FeatureExtractor detects position features from FEN', () => {
    // Initial position FEN
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const features = FeatureExtractor.extractFeatures(fen);

    expect(features.turn).toBe('w');
    expect(features.kingSafety.white.safetyScore).toBeGreaterThan(0);
    expect(features.isCastled.white).toBe(false);
    expect(features.unmovedMinorPiecesCount.white).toBe(4);
  });

  test('RuleEngine classifies Hung Piece (LPDO) blunder', () => {
    // White hangs a Knight on e5
    const fenBefore = 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3';
    const fenAfter = 'r1bqkbnr/pppp1ppp/2n5/4N3/4P3/8/PPPP1PPP/RNBQKB1R b KQkq - 0 3';

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
    expect(mainDiagnosis.level2ThinkingStep).toBe('Safety Scan');
    expect(mainDiagnosis.confidenceScore).toBeGreaterThan(0.7);
  });

  test('GroundTruthBenchmark calculates F1 score and passes 95% regression gate', () => {
    const samplePositions: GroundTruthBenchmarkPosition[] = [
      {
        id: 'pos_01_hung_piece',
        fenBefore: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
        fenAfter: 'r1bqkbnr/pppp1ppp/2n5/4N3/4P3/8/PPPP1PPP/RNBQKB1R b KQkq - 0 3',
        playedMoveSan: 'Nxe5',
        playedMoveUci: 'f3e5',
        playerColor: 'w',
        evalDropCp: 300,
        expectedLevel1: 'Hung Piece',
        expectedLevel2: 'Safety Scan',
        expectedHabitTag: 'loose-piece-awareness-failure',
        moveNumber: 3,
      },
      {
        id: 'pos_02_passive_edge_pawn',
        fenBefore: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 4 5',
        fenAfter: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 4 5',
        playedMoveSan: 'h3',
        playedMoveUci: 'h2h3',
        playerColor: 'w',
        evalDropCp: 120,
        expectedLevel1: 'Positional Error',
        expectedLevel2: 'Planning',
        expectedHabitTag: 'passive-edge-pawn',
        moveNumber: 5,
      },
    ];

    const metrics = GroundTruthBenchmark.runBenchmark(samplePositions);

    expect(metrics.totalPositions).toBe(2);
    expect(metrics.correctDiagnoses).toBe(2);
    expect(metrics.f1Score).toBeGreaterThanOrEqual(0.95);
    expect(metrics.passesRegressionGate).toBe(true);
  });
});
