import { useChessGame } from '../../hooks/useChessGame';
import { SlidersHorizontal, Sparkle } from '@phosphor-icons/react';

export function StockfishEloSelector() {
  const { stockfishElo, setStockfishElo } = useChessGame();

  const presets = [700, 900, 1100, 1500, 3200];

  return (
    <div className="surface-card rounded-2xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-tight flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-indigo-500" weight="bold" />
          Calibrated Stockfish Opponent
        </h2>
        <span className="text-xs font-mono px-2.5 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-md font-medium">
          {stockfishElo >= 3000 ? 'Uncapped / Max' : `${stockfishElo} ELO`}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-xs text-[var(--text-secondary)]">
          <span>Beginner (100)</span>
          <span className="font-semibold text-[var(--text-primary)] font-mono">Target ({stockfishElo})</span>
          <span>Max (3200+)</span>
        </div>
        <input
          type="range"
          min="100"
          max="3200"
          step="50"
          value={stockfishElo}
          onChange={(e) => setStockfishElo(Number(e.target.value))}
          className="w-full h-1.5 bg-[var(--bg-subtle)] rounded-lg appearance-none cursor-pointer accent-indigo-600"
        />
        <div className="flex gap-2 pt-1">
          {presets.map((elo) => (
            <button
              key={elo}
              onClick={() => setStockfishElo(elo)}
              className={`flex-1 text-[11px] py-1 rounded-lg transition-all font-mono ${
                (elo === 3200 ? stockfishElo >= 3000 : stockfishElo === elo)
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {elo === 3200 ? 'Max' : elo}
            </button>
          ))}
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-[var(--bg-subtle)] text-xs text-[var(--text-secondary)] space-y-1">
        <div className="font-medium text-[var(--text-primary)] flex items-center gap-1.5">
          <Sparkle className="w-3.5 h-3.5 text-indigo-500" weight="fill" />
          Offline Session Active
        </div>
        <p className="text-[11px] leading-relaxed">
          Play against a Stockfish engine calibrated to realistic human play without artificial random blunders.
        </p>
      </div>
    </div>
  );
}
