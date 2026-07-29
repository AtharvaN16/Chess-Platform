import { HabitStatus } from '../db/dbTypes';

export interface HabitCandidate {
  habitTag: string;
  habitName: string;
  thinkingStep: string;
  recencyWeightedFrequency: number;
  occurrenceCount: number;
  confidenceScore: number;
  status: HabitStatus;
  lastObservedAt: string;
}

export interface HabitMiningSummary {
  totalMistakesAnalyzed: number;
  totalGamesAnalyzed: number;
  minedHabits: HabitCandidate[];
  topAcuteLeak: HabitCandidate | null;
  mostImprovedSkill: string;
}
