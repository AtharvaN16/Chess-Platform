import { useState } from 'react';
import { GameSetupOptions, TimeControl } from '../../types/gameTypes';
import { Play, Timer, User, Robot, Shuffle } from '@phosphor-icons/react';

interface MatchSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartMatch: (options: GameSetupOptions) => void;
}

const PRESET_TIME_CONTROLS: TimeControl[] = [
  { type: 'bullet', initialMinutes: 1, incrementSeconds: 0, name: '1+0 Bullet ⚡' },
  { type: 'blitz', initialMinutes: 3, incrementSeconds: 2, name: '3+2 Blitz 🚀' },
  { type: 'blitz', initialMinutes: 5, incrementSeconds: 0, name: '5+0 Blitz 🚀' },
  { type: 'rapid', initialMinutes: 10, incrementSeconds: 5, name: '10+5 Rapid ⏱' },
  { type: 'rapid', initialMinutes: 15, incrementSeconds: 10, name: '15+10 Rapid ⏱' },
];

export function MatchSetupModal({ isOpen, onClose, onStartMatch }: MatchSetupModalProps) {
  const [selectedColor, setSelectedColor] = useState<'w' | 'b' | 'random'>('w');
  const [selectedElo, setSelectedElo] = useState<number>(1100);
  const [selectedTimeControl, setSelectedTimeControl] = useState<TimeControl>(PRESET_TIME_CONTROLS[1]); // 3+2 Blitz
  const [customMinutes, setCustomMinutes] = useState<number>(10);
  const [customIncrement, setCustomIncrement] = useState<number>(5);
  const [isCustomTime, setIsCustomTime] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleStart = () => {
    let finalTimeControl = selectedTimeControl;
    if (isCustomTime) {
      finalTimeControl = {
        type: 'custom',
        initialMinutes: customMinutes,
        incrementSeconds: customIncrement,
        name: `${customMinutes}+${customIncrement} Custom`,
      };
    }

    onStartMatch({
      userColor: selectedColor,
      stockfishElo: selectedElo,
      timeControl: finalTimeControl,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="surface-card rounded-2xl p-6 max-w-lg w-full space-y-6 shadow-2xl border border-[var(--border-subtle)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Robot className="w-6 h-6 text-indigo-500" weight="bold" />
            <span>Match Setup vs Stockfish</span>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 1. Side Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider font-mono text-[var(--text-secondary)]">
            Choose Side
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setSelectedColor('w')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                selectedColor === 'w'
                  ? 'border-indigo-500 bg-indigo-500/10 font-bold text-indigo-500'
                  : 'border-[var(--border-subtle)] bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <User className="w-5 h-5" weight="bold" />
              <span className="text-xs">White ♔</span>
            </button>

            <button
              onClick={() => setSelectedColor('b')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                selectedColor === 'b'
                  ? 'border-indigo-500 bg-indigo-500/10 font-bold text-indigo-500'
                  : 'border-[var(--border-subtle)] bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <User className="w-5 h-5 text-zinc-400" weight="bold" />
              <span className="text-xs">Black ♚</span>
            </button>

            <button
              onClick={() => setSelectedColor('random')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                selectedColor === 'random'
                  ? 'border-indigo-500 bg-indigo-500/10 font-bold text-indigo-500'
                  : 'border-[var(--border-subtle)] bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Shuffle className="w-5 h-5" weight="bold" />
              <span className="text-xs">Random 🎲</span>
            </button>
          </div>
        </div>

        {/* 2. Stockfish Difficulty Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              Engine Difficulty
            </span>
            <span className="font-bold text-indigo-500">{selectedElo} ELO</span>
          </div>

          <input
            type="range"
            min="700"
            max="3200"
            step="100"
            value={selectedElo}
            onChange={(e) => setSelectedElo(Number(e.target.value))}
            className="w-full h-2 bg-[var(--bg-subtle)] rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />

          <div className="flex justify-between text-[10px] font-mono text-[var(--text-secondary)]">
            <span>700 (Beginner)</span>
            <span>1100 (Intermediate)</span>
            <span>1500 (Advanced)</span>
            <span>3200 (Max)</span>
          </div>
        </div>

        {/* 3. Time Control Selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider font-mono text-[var(--text-secondary)] flex items-center gap-1">
              <Timer className="w-4 h-4 text-indigo-500" weight="bold" />
              Time Control
            </label>
            <button
              onClick={() => setIsCustomTime((prev) => !prev)}
              className="text-[11px] font-mono text-indigo-500 hover:underline"
            >
              {isCustomTime ? '← Presets' : 'Custom Time +'}
            </button>
          </div>

          {!isCustomTime ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESET_TIME_CONTROLS.map((tc) => (
                <button
                  key={tc.name}
                  onClick={() => setSelectedTimeControl(tc)}
                  className={`p-2.5 rounded-xl border text-xs font-mono transition-all text-center ${
                    selectedTimeControl.name === tc.name
                      ? 'border-indigo-500 bg-indigo-500/10 font-bold text-indigo-500'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {tc.name}
                </button>
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-[var(--bg-subtle)] grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[10px] text-[var(--text-secondary)] mb-1">Minutes</label>
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(Number(e.target.value))}
                  className="w-full p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[var(--text-secondary)] mb-1">Increment (sec)</label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={customIncrement}
                  onChange={(e) => setCustomIncrement(Number(e.target.value))}
                  className="w-full p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] font-mono text-xs"
                />
              </div>
            </div>
          )}
        </div>

        {/* Start Game CTA */}
        <button
          onClick={handleStart}
          className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all"
        >
          <Play className="w-5 h-5" weight="fill" />
          <span>Start Game</span>
        </button>
      </div>
    </div>
  );
}
