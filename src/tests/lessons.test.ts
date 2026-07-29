import { describe, expect, test } from 'bun:test';
import { LessonGenerator } from '../services/lessons/lessonGenerator';
import { HabitCandidate } from '../services/mining/habitTypes';

describe('Phase 4 Coaching UX & Adaptive Lessons Verification', () => {
  test('LessonGenerator creates custom drills for top acute leak', () => {
    const topLeak: HabitCandidate = {
      habitTag: 'loose-piece-awareness-failure',
      habitName: 'Loose Piece Awareness Failure (LPDO)',
      thinkingStep: 'Safety Scan',
      recencyWeightedFrequency: 2.5,
      occurrenceCount: 4,
      confidenceScore: 0.9,
      status: 'chronic',
      lastObservedAt: new Date().toISOString(),
    };

    const lesson = LessonGenerator.generateLessonForLeak(topLeak, 900);

    expect(lesson.id).toBe('lesson_lpdo_safety_scan');
    expect(lesson.targetThinkingStep).toBe('Safety Scan');
    expect(lesson.positions.length).toBeGreaterThan(0);
    expect(lesson.positions[0].correctMoveSan).toBeDefined();
    expect(lesson.positions[0].reflectionQuestion).toBeDefined();
  });

  test('LessonGenerator creates castling safety lesson for castling neglect leak', () => {
    const topLeak: HabitCandidate = {
      habitTag: 'castling-neglect',
      habitName: 'Delayed Castling & Vulnerable King',
      thinkingStep: 'Safety Scan',
      recencyWeightedFrequency: 1.8,
      occurrenceCount: 3,
      confidenceScore: 0.8,
      status: 'acute',
      lastObservedAt: new Date().toISOString(),
    };

    const lesson = LessonGenerator.generateLessonForLeak(topLeak, 950);

    expect(lesson.id).toBe('lesson_castling_safety');
    expect(lesson.positions[0].correctMoveSan).toBe('O-O');
  });
});
