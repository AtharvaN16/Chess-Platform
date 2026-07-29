import { CoachingVoiceRequest, CoachingVoiceResponse } from './voiceTypes';

/**
 * Local AI Voice Synthesizer
 * Synthesizes structured deterministic JSON diagnoses into encouraging, doctor-like coaching advice.
 * Supports Ollama/WebLLM local API integration with instant deterministic fallback.
 */
export class VoiceSynthesizer {
  private static OLLAMA_ENDPOINT = 'http://localhost:11434/api/generate';

  public static async synthesizeCoachingAdvice(request: CoachingVoiceRequest): Promise<CoachingVoiceResponse> {
    const { diagnosis, playedMoveSan, moveNumber, occurrenceCount = 1 } = request;

    // Attempt local LLM synthesis if Ollama is running
    try {
      const prompt = `You are a warm, highly skilled grandmaster chess coach. Synthesize this mistake into 2 encouraging sentences:
Move: ${playedMoveSan} on move ${moveNumber}
Level 1 Error: ${diagnosis.level1Mistake}
Level 2 Thinking Step: ${diagnosis.level2ThinkingStep}
Habit Tag: ${diagnosis.habitTag} (Occurred ${occurrenceCount} times)`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      const response = await fetch(this.OLLAMA_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model: 'qwen2.5:1.5b',
          prompt,
          stream: false,
        }),
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.response) {
          return {
            headline: `${diagnosis.level1Mistake} (${diagnosis.level2ThinkingStep})`,
            bodyAdvice: data.response.trim(),
            encouragement: 'Every mistake is a window into strengthening your decision-making routine.',
            source: 'local_llm',
          };
        }
      }
    } catch {
      // Offline fallback: Proceed instantly to deterministic template synthesizer
    }

    return this.getDeterministicFallback(request);
  }

  /**
   * 100% Offline Deterministic Voice Synthesizer Fallback
   */
  public static getDeterministicFallback(request: CoachingVoiceRequest): CoachingVoiceResponse {
    const { diagnosis, playedMoveSan, moveNumber, occurrenceCount = 1 } = request;

    let headline = `${diagnosis.level1Mistake} on Move ${moveNumber}`;
    let bodyAdvice = diagnosis.explanation;
    let encouragement = 'Consistent 2-second verification scans eliminate over 80% of tactical leaks.';

    if (diagnosis.habitTag === 'loose-piece-awareness-failure') {
      headline = 'Loose Piece Dropped (LPDO)';
      bodyAdvice = `Playing ${playedMoveSan} left your piece without adequate defender coverage. Always check that target squares have solid protection.`;
      if (occurrenceCount > 1) {
        encouragement = `Notice this is your ${occurrenceCount}th time running into this pattern. Running a Safety Scan before releasing pieces will fix this habit.`;
      }
    } else if (diagnosis.habitTag === 'castling-neglect') {
      headline = 'King Left in Center Rank';
      bodyAdvice = `Playing ${playedMoveSan} delayed castling while central lines were opening up. Secure your King into a safe pawn shield early.`;
      encouragement = 'Castling early frees your rooks and protects your King from central tactics.';
    } else if (diagnosis.habitTag === 'early-queen') {
      headline = 'Premature Queen Attack';
      bodyAdvice = `Moving ${playedMoveSan} brought the Queen out early before minor piece development was complete.`;
      encouragement = 'Develop Knights and Bishops first to maintain positional balance.';
    }

    return {
      headline,
      bodyAdvice,
      encouragement,
      source: 'deterministic_template',
    };
  }
}
