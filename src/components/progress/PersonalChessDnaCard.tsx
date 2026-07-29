import { useChessGame } from '../../hooks/useChessGame';
import { Trophy } from '@phosphor-icons/react';

export function PersonalChessDnaCard() {
  const { minedHabits } = useChessGame();

  // Determine Archetype dynamically based on top habit leak
  let archetype = 'The Counter-Puncher';
  let description = 'Strong tactical vision in open positions, but prone to skipping threat scans when initiating early attacks.';

  if (minedHabits.some((h) => h.habitTag === 'impulse-blunder-fast-move')) {
    archetype = 'The Speed-Tactician';
    description = 'High tactical strength, but susceptible to System 2 impulse blunders under 4 seconds.';
  } else if (minedHabits.some((h) => h.habitTag === 'castling-neglect')) {
    archetype = 'The Uncastled Attacker';
    description = 'Initiates central pawn pushes quickly, but frequently delays King castling.';
  }

  return (
    <div className="surface-card rounded-2xl p-8 relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-mono font-medium">
            <Trophy className="w-3.5 h-3.5" weight="bold" />
            <span>Personal Chess DNA Profile</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">{archetype}</h2>
          <p className="text-xs text-[var(--text-secondary)] max-w-md leading-relaxed">
            {description}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 font-mono">
          <div className="p-4 rounded-xl bg-[var(--bg-subtle)] text-center">
            <div className="text-[10px] text-[var(--text-secondary)] uppercase">Performance ELO</div>
            <div className="text-xl font-bold mt-1">850</div>
          </div>
          <div className="p-4 rounded-xl bg-[var(--bg-subtle)] text-center">
            <div className="text-[10px] text-[var(--text-secondary)] uppercase">Tactical Strength</div>
            <div className="text-xl font-bold text-emerald-500 mt-1">1120</div>
          </div>
          <div className="p-4 rounded-xl bg-[var(--bg-subtle)] text-center">
            <div className="text-[10px] text-[var(--text-secondary)] uppercase">Positional Strength</div>
            <div className="text-xl font-bold text-amber-500 mt-1">760</div>
          </div>
        </div>
      </div>
    </div>
  );
}
