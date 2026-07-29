import { useState } from 'react';
import { useChessGame } from '../../hooks/useChessGame';
import { Eye, CaretRight, ShieldWarning, ArrowCounterClockwise, CheckCircle } from '@phosphor-icons/react';

export function GuidedReviewView() {
  const { gameSessions } = useChessGame();
  const [selectedHypothesis, setSelectedHypothesis] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);

  const currentSession = gameSessions.length > 0 ? gameSessions[0] : null;

  const handleSelectHypothesis = (hypothesis: string) => {
    setSelectedHypothesis(hypothesis);
    setIsRevealed(true);
  };

  const handleResetReview = () => {
    setSelectedHypothesis(null);
    setIsRevealed(false);
  };

  return (
    <div className="max-w-4xl mx-auto w-full space-y-6 my-auto">
      <div className="surface-card rounded-2xl p-8 space-y-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
          <Eye className="w-6 h-6" weight="bold" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight">Guided Metacognitive Review</h2>
          <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
            Before revealing Stockfish evaluation lines, identify where your decision-making process failed.
          </p>
        </div>

        {!currentSession ? (
          <div className="p-8 rounded-2xl bg-[var(--bg-subtle)] text-xs text-[var(--text-secondary)] italic">
            No game sessions recorded yet. Play a game vs Stockfish to generate session logs.
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-[var(--bg-subtle)] text-left max-w-xl mx-auto space-y-5">
            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-mono">
              <span>Session ID: {currentSession.id.slice(-8)}</span>
              <span className="text-indigo-500 font-semibold">{currentSession.moveHistory.length} moves</span>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-mono text-red-500 uppercase tracking-wider font-semibold">
                Critical Turning Point • Move 14
              </span>
              <p className="text-sm font-medium">
                "Where do you think your cognitive thinking process failed?"
              </p>
            </div>

            {/* Active Recall Selection Options */}
            {!isRevealed ? (
              <div className="grid grid-cols-1 gap-2 pt-2">
                <button
                  onClick={() => handleSelectHypothesis('Safety Scan / LPDO Loose Piece')}
                  className="p-3.5 text-left rounded-xl bg-[var(--bg-surface)] hover:bg-indigo-500/5 text-xs text-[var(--text-primary)] transition-all flex items-center justify-between group"
                >
                  <span>I missed a loose piece or left a defender behind (Safety Scan)</span>
                  <CaretRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-indigo-500 transition-colors" weight="bold" />
                </button>
                <button
                  onClick={() => handleSelectHypothesis('Threat Scan Failure')}
                  className="p-3.5 text-left rounded-xl bg-[var(--bg-surface)] hover:bg-indigo-500/5 text-xs text-[var(--text-primary)] transition-all flex items-center justify-between group"
                >
                  <span>I ignored my opponent's direct forcing threat (Threat Scan)</span>
                  <CaretRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-indigo-500 transition-colors" weight="bold" />
                </button>
                <button
                  onClick={() => handleSelectHypothesis('System 2 Impulse Blunder')}
                  className="p-3.5 text-left rounded-xl bg-[var(--bg-surface)] hover:bg-indigo-500/5 text-xs text-[var(--text-primary)] transition-all flex items-center justify-between group"
                >
                  <span>I made a fast impulse move without calculating replies</span>
                  <CaretRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-indigo-500 transition-colors" weight="bold" />
                </button>
              </div>
            ) : (
              /* Post-Reflection Stockfish & Diagnosis Reveal */
              <div className="space-y-4 pt-2 animate-fade-in">
                <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-900 dark:text-emerald-300 text-xs space-y-1">
                  <div className="font-semibold flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="w-4 h-4" weight="fill" />
                    Metacognitive Self-Reflection Submitted
                  </div>
                  <p className="text-[11px]">
                    Your hypothesis: <strong>{selectedHypothesis}</strong>
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[var(--bg-surface)] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-red-500 flex items-center gap-1">
                      <ShieldWarning className="w-4 h-4" weight="fill" />
                      Level 1: Hung Piece (LPDO)
                    </span>
                    <span className="font-mono text-red-500 font-bold">-2.80 CP Drop</span>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    <strong>Level 2 Thinking Error:</strong> Safety Scan Failure.<br />
                    <strong>Level 3 Habit Tag:</strong> <code className="text-indigo-500 font-mono">loose-piece-awareness-failure</code>.
                  </p>

                  <div className="p-3 rounded-lg bg-[var(--bg-subtle)] text-[11px] text-[var(--text-secondary)]">
                    <strong className="text-[var(--text-primary)]">Coach Advice:</strong> You left your Knight on e5 undefended. Run a 2-second Safety Scan before releasing pieces.
                  </div>
                </div>

                <button
                  onClick={handleResetReview}
                  className="px-4 py-2 bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-[var(--text-primary)] rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <ArrowCounterClockwise className="w-3.5 h-3.5" weight="bold" />
                  <span>Review Another Position</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
