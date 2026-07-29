import { useChessGame } from '../../hooks/useChessGame';
import { 
  ArrowCounterClockwise, 
  Flag, 
  Handshake, 
  ArrowClockwise,
  Swap
} from '@phosphor-icons/react';

interface GameControlsProps {
  onFlipBoard: () => void;
}

export function GameControls({ onFlipBoard }: GameControlsProps) {
  const { 
    gameStatus, 
    resetGame, 
    resignGame, 
    offerDraw, 
    undoMove,
    moveHistory,
    isEngineThinking
  } = useChessGame();

  const isPlaying = gameStatus === 'playing';

  return (
    <div className="flex items-center justify-between gap-2 surface-card p-3 rounded-2xl">
      <button
        onClick={resetGame}
        className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
        title="Start New Game"
      >
        <ArrowCounterClockwise className="w-4 h-4" weight="bold" />
        <span>New Game</span>
      </button>

      <div className="flex items-center gap-1.5">
        <button
          onClick={onFlipBoard}
          className="p-2 rounded-xl bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          title="Flip Board View"
        >
          <Swap className="w-4 h-4" weight="bold" />
        </button>

        <button
          onClick={undoMove}
          disabled={moveHistory.length < 2 || isEngineThinking || !isPlaying}
          className="p-2 rounded-xl bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Undo Last Move"
        >
          <ArrowClockwise className="w-4 h-4" weight="bold" />
        </button>

        <button
          onClick={offerDraw}
          disabled={!isPlaying || isEngineThinking}
          className="p-2 rounded-xl bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Offer Draw"
        >
          <Handshake className="w-4 h-4" weight="bold" />
        </button>

        <button
          onClick={resignGame}
          disabled={!isPlaying || isEngineThinking}
          className="p-2 rounded-xl bg-[var(--bg-subtle)] text-red-500/80 hover:text-red-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Resign Game"
        >
          <Flag className="w-4 h-4" weight="bold" />
        </button>
      </div>
    </div>
  );
}
