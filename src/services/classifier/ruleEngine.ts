import { FeatureExtractor } from './featureExtractor';
import { MoveContext, Diagnosis } from './ruleTypes';

/**
 * 100% Deterministic Rule Engine
 * Evaluates move state transitions and position features to output Level 1, Level 2, and Level 3 cognitive diagnoses.
 */
export class RuleEngine {
  /**
   * Diagnose a move by evaluating position features before/after move execution and evaluation drop.
   */
  public static diagnoseMove(context: MoveContext): Diagnosis[] {
    const diagnoses: Diagnosis[] = [];
    const featuresBefore = FeatureExtractor.extractFeatures(context.fenBefore);
    const featuresAfter = FeatureExtractor.extractFeatures(context.fenAfter);

    const playerColor = context.playerColor;
    const colorKey = playerColor === 'w' ? 'white' : 'black';
    const evalDrop = context.evalDropCp;

    // Only diagnose non-trivial mistake moves (eval drop >= 50 centipawns)
    if (evalDrop < 50) return diagnoses;

    // Rule 1: Hanging a Piece (LPDO / Loose Piece Drop Off)
    const newLoosePieces = featuresAfter.loosePieces.filter(
      (p) => p.color === playerColor && !featuresBefore.loosePieces.some((b) => b.square === p.square)
    );
    if (newLoosePieces.length > 0 && evalDrop >= 150) {
      diagnoses.push({
        ruleId: 'RULE_01_HUNG_PIECE',
        ruleName: 'Hanging a Loose Piece (LPDO)',
        level1Mistake: 'Hung Piece',
        level2ThinkingStep: 'Safety Scan',
        habitTag: 'loose-piece-awareness-failure',
        evalDropCentipawns: evalDrop,
        explanation: `You left your ${newLoosePieces[0].pieceType.toUpperCase()} on ${newLoosePieces[0].square} undefended or inadequately protected.`,
        recommendedDrill: 'LPDO Loose Piece Awareness Drill',
        confidenceScore: 0.98,
      });
    }

    // Rule 2: Missed Tactical Opportunity (Fork)
    if (featuresBefore.forks.length > 0 && featuresBefore.turn === playerColor && evalDrop >= 150) {
      diagnoses.push({
        ruleId: 'RULE_02_MISSED_FORK',
        ruleName: 'Missed Tactical Fork Opportunity',
        level1Mistake: 'Missed Tactic',
        level2ThinkingStep: 'Candidate Generation',
        habitTag: 'missed-fork',
        evalDropCentipawns: evalDrop,
        explanation: 'There was a tactical fork available in the position that was overlooked.',
        recommendedDrill: 'Forcing Move Candidate Generation Drill',
        confidenceScore: 0.92,
      });
    }

    // Rule 3: Delayed Castling / King Safety Neglect
    if (
      context.moveNumber >= 10 &&
      !featuresAfter.isCastled[colorKey] &&
      featuresAfter.kingSafety[colorKey].safetyScore < 60 &&
      evalDrop >= 80
    ) {
      diagnoses.push({
        ruleId: 'RULE_03_DELAYED_CASTLING',
        ruleName: 'Delayed Castling & Vulnerable King',
        level1Mistake: 'King Safety Neglect',
        level2ThinkingStep: 'Safety Scan',
        habitTag: 'castling-neglect',
        evalDropCentipawns: evalDrop,
        explanation: `Your King remains in the central rank past move ${context.moveNumber} while open lines exist.`,
        recommendedDrill: 'Opening King Safety Check Drill',
        confidenceScore: 0.90,
      });
    }

    // Rule 4: Premature Queen Sortie
    if (
      context.moveNumber <= 8 &&
      context.playedMoveSan.startsWith('Q') &&
      evalDrop >= 60
    ) {
      diagnoses.push({
        ruleId: 'RULE_04_EARLY_QUEEN',
        ruleName: 'Premature Queen Sortie',
        level1Mistake: 'Premature Queen Attack',
        level2ThinkingStep: 'Candidate Generation',
        habitTag: 'early-queen',
        evalDropCentipawns: evalDrop,
        explanation: 'Brought the Queen out early in the opening before developing minor pieces (Knights & Bishops).',
        recommendedDrill: 'Development Harmony Protocol Drill',
        confidenceScore: 0.88,
      });
    }

    // Rule 5: Unnecessary Edge Pawn Move in Opening
    if (
      context.moveNumber <= 12 &&
      (context.playedMoveSan.startsWith('h') || context.playedMoveSan.startsWith('a')) &&
      evalDrop >= 50
    ) {
      diagnoses.push({
        ruleId: 'RULE_05_PASSIVE_EDGE_PAWN',
        ruleName: 'Unnecessary Edge Pawn Move',
        level1Mistake: 'Positional Error',
        level2ThinkingStep: 'Planning',
        habitTag: 'passive-edge-pawn',
        evalDropCentipawns: evalDrop,
        explanation: 'Pushed an edge pawn (a/h file) in the opening instead of controlling central squares or developing pieces.',
        recommendedDrill: 'Center Control Priority Drill',
        confidenceScore: 0.85,
      });
    }

    // Rule 6: Impulse Move / System 2 Laziness (Fast blunder < 4s)
    if (context.timeSpentMs !== undefined && context.timeSpentMs < 4000 && evalDrop >= 200) {
      diagnoses.push({
        ruleId: 'RULE_06_IMPULSE_BLUNDER',
        ruleName: 'System 2 Verification Failure (Impulse Blunder)',
        level1Mistake: 'Blunder under low calculation time',
        level2ThinkingStep: 'Safety Scan',
        habitTag: 'impulse-blunder-fast-move',
        evalDropCentipawns: evalDrop,
        explanation: `Made a critical mistake in only ${(context.timeSpentMs / 1000).toFixed(1)}s without running a mandatory Threat & Safety Scan.`,
        recommendedDrill: '3-Second Speed-Bump Verification Drill',
        confidenceScore: 0.95,
      });
    }

    // Rule 7: Removed Defender / Removing the Guard
    if (featuresBefore.loosePieces.filter((p) => p.color === playerColor).length <
        featuresAfter.loosePieces.filter((p) => p.color === playerColor).length &&
        evalDrop >= 120) {
      diagnoses.push({
        ruleId: 'RULE_07_REMOVED_DEFENDER',
        ruleName: 'Removing the Guard / Overworked Defender',
        level1Mistake: 'Defense Failure',
        level2ThinkingStep: 'Threat Scan',
        habitTag: 'removed-defender',
        evalDropCentipawns: evalDrop,
        explanation: 'Moved a piece that was acting as the sole defender of another piece on the board.',
        recommendedDrill: 'Defender Dependency Scan Drill',
        confidenceScore: 0.89,
      });
    }

    // Rule 8: Ignored Opponent Threat
    if (featuresAfter.kingSafety[colorKey].attackersNearKing > featuresBefore.kingSafety[colorKey].attackersNearKing && evalDrop >= 150) {
      diagnoses.push({
        ruleId: 'RULE_08_IGNORED_THREAT',
        ruleName: 'Ignored Opponent Direct Attack',
        level1Mistake: 'Ignored Threat',
        level2ThinkingStep: 'Threat Scan',
        habitTag: 'ignored-threat-hopium',
        evalDropCentipawns: evalDrop,
        explanation: "Proceeded with an offensive move while ignoring your opponent's forcing threat.",
        recommendedDrill: "Mandatory Opponent's Last Move Scan",
        confidenceScore: 0.91,
      });
    }

    // Rule 9: Pin Blindness
    if (featuresAfter.pins.some((p) => p.pinnedSquare && p.isAbsolute) && evalDrop >= 100) {
      diagnoses.push({
        ruleId: 'RULE_09_PIN_BLINDNESS',
        ruleName: 'Absolute Pin Exploitation',
        level1Mistake: 'Pin Blindness',
        level2ThinkingStep: 'Calculation',
        habitTag: 'pin-blindness',
        evalDropCentipawns: evalDrop,
        explanation: 'Allowed or created a pin alignment that was exploited by your opponent.',
        recommendedDrill: 'Ray Geometry & Pin Recognition Drill',
        confidenceScore: 0.87,
      });
    }

    // Rule 10: Development Deficit
    if (context.moveNumber >= 12 && featuresAfter.unmovedMinorPiecesCount[colorKey] >= 2 && evalDrop >= 70) {
      diagnoses.push({
        ruleId: 'RULE_10_DEVELOPMENT_DEFICIT',
        ruleName: 'Development Lag',
        level1Mistake: 'Opening Principles Failure',
        level2ThinkingStep: 'Candidate Generation',
        habitTag: 'development-lag',
        evalDropCentipawns: evalDrop,
        explanation: `Still have ${featuresAfter.unmovedMinorPiecesCount[colorKey]} unmoved minor pieces by move ${context.moveNumber}.`,
        recommendedDrill: 'Minor Piece Rapid Activation Drill',
        confidenceScore: 0.86,
      });
    }

    // Additional Fallback Rule if no specific rule triggered
    if (diagnoses.length === 0 && evalDrop >= 100) {
      diagnoses.push({
        ruleId: 'RULE_GENERIC_POSITIONAL_DROP',
        ruleName: 'Suboptimal Calculation / Positional Drop',
        level1Mistake: 'Calculation Error',
        level2ThinkingStep: 'Calculation',
        habitTag: 'calculation-inaccuracy',
        evalDropCentipawns: evalDrop,
        explanation: `Evaluation dropped by ${(evalDrop / 100).toFixed(1)} pawns due to a calculation error.`,
        recommendedDrill: 'Candidate Line Deep Calculation Drill',
        confidenceScore: 0.75,
      });
    }

    return diagnoses;
  }
}
