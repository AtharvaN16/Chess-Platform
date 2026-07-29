import { useChessGame } from '../../hooks/useChessGame';
import { Clock } from '@phosphor-icons/react';

export function MoveHistoryList() {
  const { moveHistory } = useChessGame();

  // Group moves into pairs (White move & Black move)
  const pairedMoves: { moveNumber: number; white?: string; whiteTime?: number; black?: string; blackTime?: number }[] = [];

  moveHistory.forEach((record) => {
    if (record.playerColor === 'w') {
      pairedMoves.push({
        moveNumber: record.moveNumber,
        white: record.san,
        whiteTime: record.timeSpentMs,
      });
    } else {
      const lastPair = pairedMoves[pairedMoves.length - 1];
      if (lastPair && lastPair.moveNumber === record.moveNumber) {
        lastPair.black = record.san;
        lastPair.blackTime = record.timeSpentMs;
      } else {
        pairedMoves.push({
          moveNumber: record.moveNumber,
          black: record.san,
          blackTime: record.timeSpentMs,
        });
      }
    }
  });

  const formatMs = (ms?: number) => {
    if (!ms) return '';
    const secs = (ms / 1000).toFixed(1);
    return `${secs}s`;
  };

  return (
    <div className="surface-card rounded-2xl p-5 space-y-3 flex flex-col h-full max-h-[320px]">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider font-mono flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" weight="bold" />
          Move Notation & Timestamps
        </h3>
        <span className="text-[10px] font-mono text-[var(--text-secondary)]">{moveHistory.length} moves</span>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-1 text-xs font-mono">
        {pairedMoves.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[var(--text-secondary)] text-[11px] italic">
            No moves played yet
          </div>
        ) : (
          pairedMoves.map((pair) => (
            <div key={pair.moveNumber} className="grid grid-cols-7 px-2 py-1 rounded bg-[var(--bg-subtle)]/50 items-center">
              <span className="col-span-1 text-[var(--text-secondary)] text-[10px]">{pair.moveNumber}.</span>
              
              <div className="col-span-3 flex items-center justify-between pr-2">
                <span className="font-semibold">{pair.white || ''}</span>
                {pair.whiteTime && <span className="text-[9px] text-[var(--text-secondary)]">{formatMs(pair.whiteTime)}</span>}
              </div>

              <div className="col-span-3 flex items-center justify-between pl-2 border-l border-white/5">
                <span className="font-semibold">{pair.black || ''}</span>
                {pair.blackTime && <span className="text-[9px] text-[var(--text-secondary)]">{formatMs(pair.blackTime)}</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
