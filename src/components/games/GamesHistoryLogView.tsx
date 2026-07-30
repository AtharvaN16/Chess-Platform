import { useChessGame } from '../../hooks/useChessGame';
import { GameSession } from '../../types/gameTypes';
import { Chessboard } from 'react-chessboard';
import { Trophy, Clock, Skull, CaretRight, ShieldWarning } from '@phosphor-icons/react';

interface GamesHistoryLogViewProps {
  onSelectGameForReview: (session: GameSession) => void;
}

export function GamesHistoryLogView({ onSelectGameForReview }: GamesHistoryLogViewProps) {
  const { gameSessions } = useChessGame();

  return (
    <div className="max-w-4xl mx-auto w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Games Log History</h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Review past games, analyze move quality with Stockfish, and inspect performance telemetry.
          </p>
        </div>
        <span className="text-xs font-mono px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 font-semibold">
          {gameSessions.length} Games Logged
        </span>
      </div>

      {gameSessions.length === 0 ? (
        <div className="surface-card rounded-2xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6" weight="bold" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold">No Games Logged Yet</h3>
            <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
              Start a new match vs Stockfish with your preferred time control to build your game history log.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {gameSessions.map((session) => {
            const isWin = session.winner === 'user';
            const isDraw = session.winner === 'draw';
            const finalFen = session.moveHistory.length > 0
              ? session.moveHistory[session.moveHistory.length - 1].fenAfter
              : 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

            const formattedDate = new Date(session.playedAt).toLocaleString('en-US', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={session.id}
                onClick={() => onSelectGameForReview(session)}
                className="surface-card rounded-2xl p-5 hover:bg-[var(--bg-subtle)] transition-all cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Left Mini Board Thumbnail & Title */}
                <div className="flex items-center gap-5">
                  <div
                    className={`w-28 h-28 rounded-xl overflow-hidden p-1 shadow-md bg-[var(--bg-subtle)] ${
                      isWin
                        ? 'shadow-indigo-500/20'
                        : isDraw
                        ? ''
                        : 'shadow-red-500/20'
                    }`}
                  >
                    <Chessboard
                      options={{
                        position: finalFen,
                        boardOrientation: session.userColor === 'w' ? 'white' : 'black',
                        allowDragging: false,
                        boardStyle: { borderRadius: '8px' },
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold tracking-tight">
                        {isWin
                          ? `Won as ${session.userColor === 'w' ? 'white' : 'black'}`
                          : isDraw
                          ? 'Drawn Game'
                          : `Lost as ${session.userColor === 'w' ? 'white' : 'black'}`}
                      </h3>
                      <CaretRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-indigo-500 transition-colors" weight="bold" />
                    </div>

                    <div className="space-y-1 text-xs text-[var(--text-secondary)] font-mono">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{formattedDate}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isWin ? (
                          <Trophy className="w-3.5 h-3.5 text-emerald-500" weight="bold" />
                        ) : (
                          <Skull className="w-3.5 h-3.5 text-red-500" weight="bold" />
                        )}
                        <span className={isWin ? 'text-emerald-500 font-bold' : isDraw ? 'text-zinc-400' : 'text-red-500 font-bold'}>
                          {isWin ? 'Win (+59 rating)' : isDraw ? 'Draw (0 rating)' : 'Loss (-52 rating)'}
                        </span>
                      </div>

                      <div className="text-[11px] text-[var(--text-secondary)]">
                        {session.timeControlName || '3+2 Blitz'} vs Stockfish ({session.stockfishElo} ELO)
                      </div>
                    </div>

                    {/* Key Motif Tags */}
                    <div className="flex items-center gap-2 pt-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 text-[10px] font-mono font-semibold flex items-center gap-1">
                        <ShieldWarning className="w-3 h-3" />
                        Dominance
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right CTA Button */}
                <button className="px-4 py-2 bg-[var(--bg-subtle)] group-hover:bg-indigo-500 group-hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors self-end md:self-center">
                  <span>Full Game Review</span>
                  <CaretRight className="w-3.5 h-3.5" weight="bold" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
