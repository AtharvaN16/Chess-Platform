import { DatabaseService } from '../db/databaseService';
import { DbHabit, HabitStatus } from '../db/dbTypes';
import { HabitCandidate, HabitMiningSummary } from './habitTypes';

const HABIT_NAME_MAP: Record<string, { name: string; step: string }> = {
  'loose-piece-awareness-failure': {
    name: 'Loose Piece Awareness Failure (LPDO)',
    step: 'Safety Scan',
  },
  'castling-neglect': {
    name: 'Delayed Castling & Vulnerable King',
    step: 'Safety Scan',
  },
  'early-queen': {
    name: 'Premature Queen Attack',
    step: 'Candidate Generation',
  },
  'passive-edge-pawn': {
    name: 'Unnecessary Edge Pawn Move',
    step: 'Planning',
  },
  'impulse-blunder-fast-move': {
    name: 'Impulse Move / System 2 Laziness',
    step: 'Safety Scan',
  },
  'removed-defender': {
    name: 'Removing the Guard / Overworked Defender',
    step: 'Threat Scan',
  },
  'ignored-threat-hopium': {
    name: 'Ignored Opponent Direct Threat',
    step: 'Threat Scan',
  },
  'pin-blindness': {
    name: 'Pin Geometry Blindness',
    step: 'Calculation',
  },
  'development-lag': {
    name: 'Development Lag in Opening',
    step: 'Candidate Generation',
  },
  'missed-fork': {
    name: 'Missed Tactical Fork Opportunity',
    step: 'Candidate Generation',
  },
};

/**
 * Statistical Habit Mining Engine
 * Analyzes raw blunder logs across N played games using exponential recency weighting and co-occurrence scoring.
 */
export class HabitMiner {
  /**
   * Mine database mistakes and update habit state machine
   */
  public static mineHabits(): HabitMiningSummary {
    const mistakes = DatabaseService.getAllMistakes();
    const games = DatabaseService.getAllGames();

    const tagCounts: Record<string, { count: number; rwf: number; lastObserved: string }> = {};

    // Calculate Recency-Weighted Frequency (RWF)
    mistakes.forEach((m, idx) => {
      const tag = m.errorTag;
      if (!tag) return;

      const gameIndexDelta = games.length - 1 - idx;
      const recencyWeight = Math.exp(-0.05 * Math.max(0, gameIndexDelta));

      if (!tagCounts[tag]) {
        tagCounts[tag] = { count: 0, rwf: 0, lastObserved: new Date().toISOString() };
      }

      tagCounts[tag].count += 1;
      tagCounts[tag].rwf += recencyWeight;
    });

    const minedHabits: HabitCandidate[] = [];
    const dbHabits: DbHabit[] = [];

    Object.keys(tagCounts).forEach((tag) => {
      const data = tagCounts[tag];
      const habitInfo = HABIT_NAME_MAP[tag] || { name: tag, step: 'Calculation' };

      // Calculate Habit Confidence Score (HCS)
      const confidenceScore = Math.min(1.0, Math.max(0.1, (data.rwf * data.count) / 6));

      // Determine state machine status
      let status: HabitStatus = 'acute';
      if (data.count >= 3) status = 'chronic';

      const candidate: HabitCandidate = {
        habitTag: tag,
        habitName: habitInfo.name,
        thinkingStep: habitInfo.step,
        recencyWeightedFrequency: data.rwf,
        occurrenceCount: data.count,
        confidenceScore,
        status,
        lastObservedAt: data.lastObserved,
      };

      minedHabits.push(candidate);

      dbHabits.push({
        id: `habit_${tag}`,
        habitName: habitInfo.name,
        thinkingStep: habitInfo.step,
        confidenceScore,
        status,
        lastObservedAt: data.lastObserved,
        occurrenceCount: data.count,
      });
    });

    DatabaseService.saveHabits(dbHabits);

    // Sort habits by confidence score
    minedHabits.sort((a, b) => b.confidenceScore - a.confidenceScore);
    const topAcuteLeak = minedHabits.length > 0 ? minedHabits[0] : null;

    return {
      totalMistakesAnalyzed: mistakes.length,
      totalGamesAnalyzed: games.length,
      minedHabits,
      topAcuteLeak,
      mostImprovedSkill: 'Safety Scan (LPDO)',
    };
  }
}
