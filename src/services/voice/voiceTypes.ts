import { Diagnosis } from '../classifier/ruleTypes';

export interface CoachingVoiceRequest {
  diagnosis: Diagnosis;
  playedMoveSan: string;
  moveNumber: number;
  playerElo?: number;
  occurrenceCount?: number;
}

export interface CoachingVoiceResponse {
  headline: string;
  bodyAdvice: string;
  encouragement: string;
  source: 'local_llm' | 'deterministic_template';
}
