import { AdaptiveLesson } from './lessonTypes';
import { HabitCandidate } from '../mining/habitTypes';

/**
 * Adaptive Lesson Generator
 * Generates custom interactive drills with Cognitive Forcing Functions (CFFs) targeting the user's top acute leak.
 */
export class LessonGenerator {
  public static generateLessonForLeak(topLeak: HabitCandidate | null, userElo: number = 850): AdaptiveLesson {
    const leakTag = topLeak?.habitTag || 'loose-piece-awareness-failure';

    if (leakTag === 'loose-piece-awareness-failure') {
      return {
        id: 'lesson_lpdo_safety_scan',
        title: 'Loose Piece Safety Scan Protocol (LPDO)',
        description: 'Train your brain to run a mandatory Safety Scan to detect undefended pieces before every move.',
        targetThinkingStep: 'Safety Scan',
        habitTag: leakTag,
        difficultyElo: userElo,
        positions: [
          {
            id: 'pos_lpdo_1',
            fen: 'r1bqk2r/pppp1ppp/2n2n2/4p3/1b2P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 4 4',
            targetThinkingStep: 'Safety Scan',
            correctMoveSan: 'd3',
            correctMoveUci: 'd2d3',
            reflectionQuestion: 'Before calculating attacks, check if e4 pawn or c3 knight has defenders.',
            explanation: 'Playing d3 defends the e4 pawn and consolidates the center before continuing development.',
          },
          {
            id: 'pos_lpdo_2',
            fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
            targetThinkingStep: 'Safety Scan',
            correctMoveSan: 'Bc4',
            correctMoveUci: 'f1c4',
            reflectionQuestion: 'Run a Safety Scan: Is f1 bishop safe to develop without leaving loose pieces behind?',
            explanation: 'Bc4 develops a minor piece while keeping all friendly pieces defended.',
          },
        ],
      };
    }

    if (leakTag === 'castling-neglect') {
      return {
        id: 'lesson_castling_safety',
        title: 'Opening King Safety & Castling Priority',
        description: 'Prioritize castling your King to safety before launching central attacks.',
        targetThinkingStep: 'Safety Scan',
        habitTag: leakTag,
        difficultyElo: userElo,
        positions: [
          {
            id: 'pos_castle_1',
            fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 4 5',
            targetThinkingStep: 'Safety Scan',
            correctMoveSan: 'O-O',
            correctMoveUci: 'e1g1',
            reflectionQuestion: 'Your King is still in the central e-file. What is your highest priority move?',
            explanation: 'O-O castles your King into a safe pawn shield and activates your Rook.',
          },
        ],
      };
    }

    // Default Threat Scan Protocol Lesson
    return {
      id: 'lesson_threat_scan_protocol',
      title: 'Mandatory Opponent Threat Scan Protocol',
      description: 'Force your mind to identify your opponent\'s direct threats before initiating your own attack.',
      targetThinkingStep: 'Threat Scan',
      habitTag: 'ignored-threat-hopium',
      difficultyElo: userElo,
      positions: [
        {
          id: 'pos_threat_1',
          fen: 'r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
          targetThinkingStep: 'Threat Scan',
          correctMoveSan: 'O-O',
          correctMoveUci: 'e1g1',
          reflectionQuestion: 'What is your opponent threatening with their last move (Bc5)?',
          explanation: 'Opponent aims at f2. Castling secures King safety before counter-attacking.',
        },
      ],
    };
  }
}
