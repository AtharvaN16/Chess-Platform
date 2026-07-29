export interface LessonPosition {
  id: string;
  fen: string;
  targetThinkingStep: string;
  correctMoveSan: string;
  correctMoveUci: string;
  reflectionQuestion: string;
  explanation: string;
}

export interface AdaptiveLesson {
  id: string;
  title: string;
  description: string;
  targetThinkingStep: string;
  habitTag: string;
  positions: LessonPosition[];
  difficultyElo: number;
}
