import { MouseEvent } from 'react';
import { MoveRecord } from '../../types/gameTypes';

interface EvalSparklineScrubberProps {
  moveHistory: MoveRecord[];
  activeMoveIndex: number;
  onSelectMove: (index: number) => void;
}

export function EvalSparklineScrubber({ moveHistory, activeMoveIndex, onSelectMove }: EvalSparklineScrubberProps) {
  if (moveHistory.length === 0) {
    return <div className="w-full h-12 bg-[var(--bg-subtle)] rounded-xl animate-pulse" />;
  }

  const width = 600;
  const height = 64;

  // Convert move centipawn scores into SVG path points
  const points = moveHistory.map((m, idx) => {
    const x = (idx / Math.max(1, moveHistory.length - 1)) * width;
    const cp = m.evalCentipawns || 0;
    // Map -1000 to +1000 CP onto height 64 -> 0
    const clampedCp = Math.max(-1000, Math.min(1000, cp));
    const y = height / 2 - (clampedCp / 1000) * (height / 2 - 4);
    return { x, y, move: m, index: idx };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  const activePoint = points[Math.min(activeMoveIndex, points.length - 1)] || points[0];

  const handleSparklineClick = (e: MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const targetIdx = Math.round(ratio * (moveHistory.length - 1));
    onSelectMove(targetIdx);
  };

  return (
    <div className="w-full space-y-1">
      <div className="relative w-full h-16 bg-[var(--bg-subtle)] rounded-xl overflow-hidden cursor-pointer select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full"
          preserveAspectRatio="none"
          onClick={handleSparklineClick}
        >
          {/* Zero evaluation center line */}
          <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="var(--border-subtle)" strokeWidth="1" strokeDasharray="3 3" />

          {/* Evaluation trend line */}
          <path d={pathD} fill="none" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Move quality markers */}
          {points.map((p) => {
            if (p.move.moveQuality === 'blunder') {
              return (
                <circle key={p.index} cx={p.x} cy={p.y} r="5" fill="#EF4444" className="animate-pulse" />
              );
            }
            if (p.move.moveQuality === 'brilliant') {
              return (
                <circle key={p.index} cx={p.x} cy={p.y} r="5" fill="#10B981" />
              );
            }
            return null;
          })}

          {/* Active Move Vertical Scrubber Line */}
          {activePoint && (
            <g>
              <line x1={activePoint.x} y1="0" x2={activePoint.x} y2={height} stroke="#A855F7" strokeWidth="3" />
              <circle cx={activePoint.x} cy={activePoint.y} r="4" fill="#A855F7" />
            </g>
          )}
        </svg>
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-secondary)] px-1">
        <span>Move 1</span>
        <span>Move {moveHistory.length}</span>
      </div>
    </div>
  );
}
