import { useChessGame } from '../../hooks/useChessGame';
import { ShieldWarning } from '@phosphor-icons/react';

export function MinedHabitCards() {
  const { minedHabits } = useChessGame();

  const displayHabits = minedHabits.length > 0 ? minedHabits : [
    {
      habitTag: 'loose-piece-awareness-failure',
      habitName: 'Loose Piece Awareness Failure (LPDO)',
      thinkingStep: 'Safety Scan',
      confidenceScore: 0.88,
      status: 'chronic',
      occurrenceCount: 4,
    },
    {
      habitTag: 'castling-neglect',
      habitName: 'Delayed Castling & Vulnerable King',
      thinkingStep: 'Safety Scan',
      confidenceScore: 0.72,
      status: 'acute',
      occurrenceCount: 2,
    },
  ];

  return (
    <div className="surface-card rounded-2xl p-6 space-y-4">
      <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider font-mono flex items-center gap-2">
        <ShieldWarning className="w-4 h-4 text-amber-500" weight="fill" />
        Mined Behavioral Habits ({displayHabits.length})
      </h3>

      <div className="space-y-3 text-xs">
        {displayHabits.map((habit) => (
          <div key={habit.habitTag} className="p-3.5 rounded-xl bg-[var(--bg-subtle)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[var(--text-primary)]">{habit.habitName}</span>
              <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full font-bold ${statusColor(habit.status)}`}>
                {habit.status}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[var(--text-secondary)] font-mono">
              <span>Step: {habit.thinkingStep}</span>
              <span>Observed {habit.occurrenceCount}x • Confidence: {Math.round(habit.confidenceScore * 100)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function statusColor(status: string): string {
  if (status === 'chronic') return 'bg-red-500/10 text-red-500';
  if (status === 'acute') return 'bg-amber-500/10 text-amber-500';
  if (status === 'fixed') return 'bg-emerald-500/10 text-emerald-500';
  return 'bg-zinc-500/10 text-zinc-500';
}
