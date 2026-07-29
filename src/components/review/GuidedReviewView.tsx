import { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { useChessGame } from '../../hooks/useChessGame';
import { GameSession, MoveRecord } from '../../types/gameTypes';
import { LlmCommentaryService, MoveCommentary } from '../../services/voice/llmCommentaryService';
import { EvalSparklineScrubber } from './EvalSparklineScrubber';
import { Trophy, CaretLeft, CaretRight, FastForward, Rewind, ChatCircleText, ListNumbers } from '@phosphor-icons/react';

interface GuidedReviewViewProps {
  selectedReviewSession?: GameSession | null;
  onBackToGamesLog?: () => void;
}

export function GuidedReviewView({ selectedReviewSession, onBackToGamesLog }: GuidedReviewViewProps) {
  const { gameSessions } = useChessGame();
  const session = selectedReviewSession || (gameSessions.length > 0 ? gameSessions[0] : null);

  const [activeMoveIdx, setActiveMoveIdx] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'commentary' | 'moves'>('commentary');

  useEffect(() => {
    if (session && session.moveHistory.length > 0) {
      setActiveMoveIdx(session.moveHistory.length - 1);
    }
  }, [session]);

  // Keyboard navigation (Left / Right arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevMove();
      if (e.key === 'ArrowRight') handleNextMove();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeMoveIdx, session]);

  if (!session || session.moveHistory.length === 0) {
    return (
      <div className="max-w-4xl mx-auto w-full surface-card rounded-2xl p-12 text-center space-y-4 my-auto">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
          <Trophy className="w-6 h-6" weight="bold" />
        </div>
        <h3 className="text-base font-bold">No Completed Match Session to Review</h3>
        <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
          Play a game vs Stockfish to generate a rich interactive game review with LLM commentary and evaluation sparklines.
        </p>
      </div>
    );
  }

  const moves = session.moveHistory;
  const currentMoveRecord: MoveRecord = moves[Math.min(activeMoveIdx, moves.length - 1)] || moves[0];
  const currentFen = currentMoveRecord.fenAfter;

  const commentary: MoveCommentary = LlmCommentaryService.generateCommentary(currentMoveRecord);

  const handleFirstMove = () => setActiveMoveIdx(0);
  const handlePrevMove = () => setActiveMoveIdx((prev) => Math.max(0, prev - 1));
  const handleNextMove = () => setActiveMoveIdx((prev) => Math.min(moves.length - 1, prev + 1));
  const handleLastMove = () => setActiveMoveIdx(moves.length - 1);

  // Compute move arrow for current move
  const moveArrow: [string, string][] = currentMoveRecord.uci.length >= 4
    ? [[currentMoveRecord.uci.substring(0, 2), currentMoveRecord.uci.substring(2, 4)]]
    : [];

  const evalCp = currentMoveRecord.evalCentipawns || 0;
  const evalPercent = Math.max(5, Math.min(95, 50 + (evalCp / 1000) * 50));

  return (
    <div className="max-w-6xl mx-auto w-full space-y-4 my-auto">
      {/* Top Back Navigation Bar */}
      {onBackToGamesLog && (
        <button
          onClick={onBackToGamesLog}
          className="text-xs font-mono text-indigo-500 hover:underline flex items-center gap-1"
        >
          <CaretLeft className="w-4 h-4" weight="bold" />
          <span>← Back to Games Log History</span>
        </button>
      )}

      {/* Main Side-by-Side Review Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Board with Move Arrows & Eval Bar (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center space-y-3">
          <div className="flex items-center gap-3 w-full max-w-[540px]">
            {/* Vertical Evaluation Bar */}
            <div className="w-2.5 h-[520px] rounded-full bg-zinc-800 overflow-hidden flex flex-col justify-end relative shadow-inner">
              <div
                className="w-full bg-indigo-500 transition-all duration-300 ease-out"
                style={{ height: `${evalPercent}%` }}
              />
            </div>

            {/* Interactive Chessboard */}
            <div className="flex-1 aspect-square rounded-2xl overflow-hidden surface-card p-2 relative">
              <Chessboard
                options={{
                  position: currentFen,
                  boardOrientation: session.userColor === 'w' ? 'white' : 'black',
                  allowDragging: false,
                  arrows: moveArrow as unknown as undefined,
                  darkSquareStyle: { backgroundColor: '#1E2337' },
                  lightSquareStyle: { backgroundColor: '#2D334D' },
                  boardStyle: { borderRadius: '12px' },
                }}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Review Panel with Commentary / Moves Tabs & Scrubber (5 cols) */}
        <div className="lg:col-span-5 surface-card rounded-2xl p-6 space-y-5 flex flex-col justify-between h-[540px]">
          {/* Header Metadata Card (Matching Screenshot 2) */}
          <div className="space-y-3 border-b border-[var(--border-subtle)] pb-4">
            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-mono">
              <span>Atharva • Wins as {session.userColor === 'w' ? 'White' : 'Black'}</span>
              <span className="text-emerald-500 font-bold">+59 (752)</span>
            </div>

            {/* Commentary vs Moves Tab Toggle */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--bg-subtle)] text-xs">
              <button
                onClick={() => setActiveTab('commentary')}
                className={`flex-1 py-1.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'commentary'
                    ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <ChatCircleText className="w-4 h-4" weight="bold" />
                <span>Commentary</span>
              </button>

              <button
                onClick={() => setActiveTab('moves')}
                className={`flex-1 py-1.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'moves'
                    ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <ListNumbers className="w-4 h-4" weight="bold" />
                <span>Moves</span>
              </button>
            </div>
          </div>

          {/* Body Content: Commentary Tab OR Moves Tab */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'commentary' ? (
              /* Commentary Tab Content (Matching Screenshot 2) */
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-500 font-mono font-semibold flex items-center gap-1.5">
                    ♟ {commentary.openingName || 'Middlegame Strategy'}
                  </span>
                  <span className="font-mono text-zinc-400">⚡ Engine: {commentary.engineBestMoveSan}</span>
                </div>

                <div className="p-4 rounded-xl bg-[var(--bg-subtle)] space-y-2 text-xs leading-relaxed text-[var(--text-primary)]">
                  <div className="flex items-center gap-1.5 font-bold text-indigo-500">
                    <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-[10px] font-mono">
                      {commentary.badgeSymbol}
                    </span>
                    Move {currentMoveRecord.moveNumber}. {currentMoveRecord.san}
                  </div>
                  <p>{commentary.commentaryText}</p>
                </div>
              </div>
            ) : (
              /* Moves Tab Content (Matching Screenshot 1) */
              <div className="space-y-1 font-mono text-xs max-h-[220px] overflow-y-auto pr-1">
                {moves.map((m, idx) => {
                  const evalVal = (m.evalCentipawns || 0) / 100;
                  const formattedEval = evalVal >= 0 ? `+${evalVal.toFixed(1)}` : evalVal.toFixed(1);
                  const isCurrent = idx === activeMoveIdx;

                  return (
                    <div
                      key={idx}
                      onClick={() => setActiveMoveIdx(idx)}
                      className={`p-2 rounded-lg cursor-pointer flex items-center justify-between transition-colors ${
                        isCurrent
                          ? 'bg-indigo-500/10 text-indigo-500 font-bold border border-indigo-500/30'
                          : 'hover:bg-[var(--bg-subtle)] text-[var(--text-secondary)]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 text-[10px] text-[var(--text-secondary)]">{m.moveNumber}.</span>
                        <span>{m.san}</span>
                      </div>
                      <span className="text-[11px] font-semibold">{formattedEval}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom Section: Sparkline Scrubber & Player Controls (Matching Screenshots 1 & 2) */}
          <div className="space-y-4 border-t border-[var(--border-subtle)] pt-4">
            <EvalSparklineScrubber
              moveHistory={moves}
              activeMoveIndex={activeMoveIdx}
              onSelectMove={(idx) => setActiveMoveIdx(idx)}
            />

            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                onClick={handleFirstMove}
                disabled={activeMoveIdx === 0}
                className="p-2 rounded-xl bg-[var(--bg-subtle)] hover:bg-indigo-500 hover:text-white disabled:opacity-30 disabled:hover:bg-[var(--bg-subtle)] disabled:hover:text-[var(--text-primary)] transition-colors"
                title="First Move"
              >
                <Rewind className="w-4 h-4" weight="bold" />
              </button>
              <button
                onClick={handlePrevMove}
                disabled={activeMoveIdx === 0}
                className="p-2.5 rounded-xl bg-[var(--bg-subtle)] hover:bg-indigo-500 hover:text-white disabled:opacity-30 disabled:hover:bg-[var(--bg-subtle)] disabled:hover:text-[var(--text-primary)] transition-colors"
                title="Previous Move (Left Arrow)"
              >
                <CaretLeft className="w-4 h-4" weight="bold" />
              </button>
              <button
                onClick={handleNextMove}
                disabled={activeMoveIdx === moves.length - 1}
                className="p-2.5 rounded-xl bg-[var(--bg-subtle)] hover:bg-indigo-500 hover:text-white disabled:opacity-30 disabled:hover:bg-[var(--bg-subtle)] disabled:hover:text-[var(--text-primary)] transition-colors"
                title="Next Move (Right Arrow)"
              >
                <CaretRight className="w-4 h-4" weight="bold" />
              </button>
              <button
                onClick={handleLastMove}
                disabled={activeMoveIdx === moves.length - 1}
                className="p-2 rounded-xl bg-[var(--bg-subtle)] hover:bg-indigo-500 hover:text-white disabled:opacity-30 disabled:hover:bg-[var(--bg-subtle)] disabled:hover:text-[var(--text-primary)] transition-colors"
                title="Last Move"
              >
                <FastForward className="w-4 h-4" weight="bold" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
