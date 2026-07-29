import { useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { useChessGame } from '../../hooks/useChessGame';
import { LessonGenerator } from '../../services/lessons/lessonGenerator';
import { GraduationCap, CheckCircle, ShieldCheck, ArrowRight } from '@phosphor-icons/react';

export function AdaptiveLessonPlayer() {
  const { topAcuteLeak } = useChessGame();
  const lesson = LessonGenerator.generateLessonForLeak(topAcuteLeak);

  const [currentPositionIdx, setCurrentPositionIdx] = useState<number>(0);
  const [hasCompletedThreatScan, setHasCompletedThreatScan] = useState<boolean>(false);
  const [lessonStatus, setLessonStatus] = useState<'pending' | 'success' | 'failed'>('pending');

  const position = lesson.positions[currentPositionIdx];
  const game = new Chess(position.fen);

  const handlePieceDrop = ({ sourceSquare, targetSquare }: { sourceSquare: string; targetSquare: string | null }): boolean => {
    if (!hasCompletedThreatScan || !targetSquare) return false;

    const uci = `${sourceSquare}${targetSquare}`;
    if (uci === position.correctMoveUci) {
      setLessonStatus('success');
      return true;
    } else {
      setLessonStatus('failed');
      return false;
    }
  };

  const handleNextPosition = () => {
    if (currentPositionIdx < lesson.positions.length - 1) {
      setCurrentPositionIdx((prev) => prev + 1);
      setHasCompletedThreatScan(false);
      setLessonStatus('pending');
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full space-y-6 my-auto">
      <div className="surface-card rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" weight="bold" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">{lesson.title}</h2>
              <p className="text-xs text-[var(--text-secondary)]">{lesson.description}</p>
            </div>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 font-semibold">
            Position {currentPositionIdx + 1}/{lesson.positions.length}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Interactive Lesson Board */}
          <div className="w-full max-w-[360px] mx-auto aspect-square rounded-2xl overflow-hidden surface-card p-2">
            <Chessboard
              options={{
                position: game.fen(),
                allowDragging: hasCompletedThreatScan,
                onPieceDrop: handlePieceDrop,
                darkSquareStyle: { backgroundColor: '#1E2337' },
                lightSquareStyle: { backgroundColor: '#2D334D' },
                boardStyle: { borderRadius: '12px' },
              }}
            />
          </div>

          {/* Cognitive Forcing Function (CFF) Interactive Panel */}
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[var(--bg-subtle)] space-y-3">
              <span className="text-[10px] font-mono text-indigo-500 uppercase tracking-wider font-semibold">
                Cognitive Forcing Function Protocol
              </span>
              <p className="text-xs font-medium text-[var(--text-primary)] leading-relaxed">
                "{position.reflectionQuestion}"
              </p>

              {!hasCompletedThreatScan ? (
                <button
                  onClick={() => setHasCompletedThreatScan(true)}
                  className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all"
                >
                  <ShieldCheck className="w-4 h-4" weight="bold" />
                  <span>Confirm Safety Scan Complete (Unlock Move)</span>
                </button>
              ) : (
                <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" weight="fill" />
                  Safety Scan Confirmed — Play your solution move on the board!
                </div>
              )}
            </div>

            {lessonStatus === 'success' && (
              <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-900 dark:text-emerald-300 text-xs space-y-2 animate-fade-in">
                <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" weight="fill" />
                  Correct! {position.correctMoveSan}
                </div>
                <p className="text-[11px] leading-relaxed">{position.explanation}</p>
                {currentPositionIdx < lesson.positions.length - 1 && (
                  <button
                    onClick={handleNextPosition}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors mt-2"
                  >
                    <span>Next Position</span>
                    <ArrowRight className="w-3.5 h-3.5" weight="bold" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
