import { useState, CSSProperties } from 'react';
import { Chessboard } from 'react-chessboard';
import { Square } from 'chess.js';
import { useChessGame } from '../../hooks/useChessGame';
import { CircleNotch, Trophy, Handshake, Flag } from '@phosphor-icons/react';

interface ChessBoardViewProps {
  boardOrientation: 'white' | 'black';
  isDarkMode: boolean;
}

export function ChessBoardView({ boardOrientation, isDarkMode }: ChessBoardViewProps) {
  const { game, makeMove, isEngineThinking, gameStatus, winner, getEvaluation, userColor, lastMove } = useChessGame();
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);

  // Click-to-Move Handler
  const onSquareClick = (square: string) => {
    if (gameStatus !== 'playing') return;

    if (!selectedSquare) {
      const piece = game.get(square as Square);
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
      }
    } else {
      // Attempt move from selectedSquare to target square
      const success = makeMove(selectedSquare, square);
      setSelectedSquare(null);
      if (!success) {
        // If clicking another friendly piece, switch selection to that piece
        const piece = game.get(square as Square);
        if (piece && piece.color === game.turn()) {
          setSelectedSquare(square);
        }
      }
    }
  };

  // Piece Drag Handler: Instantly highlight origin square and legal destination moves while dragging
  const handlePieceDrag = ({ square }: { square: string | null }) => {
    if (gameStatus !== 'playing' || !square) return;
    const piece = game.get(square as Square);
    if (piece && piece.color === game.turn()) {
      setSelectedSquare(square);
    }
  };

  // Drag-and-Drop Drop Handler
  const handlePieceDrop = ({ sourceSquare, targetSquare }: { sourceSquare: string; targetSquare: string | null }): boolean => {
    if (gameStatus !== 'playing' || !targetSquare) {
      setSelectedSquare(null);
      return false;
    }
    const success = makeMove(sourceSquare, targetSquare);
    setSelectedSquare(null);
    return success;
  };

  // Build custom square styles for selected/dragged square, legal moves, and last move
  const squareStyles: Record<string, CSSProperties> = {};

  // 1. Highlight last move (from & to squares)
  if (lastMove) {
    squareStyles[lastMove.from] = { backgroundColor: 'rgba(251, 191, 36, 0.25)' };
    squareStyles[lastMove.to] = { backgroundColor: 'rgba(251, 191, 36, 0.35)' };
  }

  // 2. Highlight selected/dragged square & legal destination moves
  if (selectedSquare) {
    squareStyles[selectedSquare] = { backgroundColor: 'rgba(99, 102, 241, 0.5)' };

    try {
      const moves = game.moves({ square: selectedSquare as Square, verbose: true });
      moves.forEach((move) => {
        const isCapture = Boolean(move.captured);
        squareStyles[move.to] = {
          background: isCapture
            ? 'radial-gradient(circle, rgba(239, 68, 68, 0.6) 30%, transparent 30%)'
            : 'radial-gradient(circle, rgba(99, 102, 241, 0.5) 25%, transparent 25%)',
          borderRadius: '50%',
        };

        // Also highlight Rook squares for King castling (Chess.com & Lichess style)
        if (selectedSquare === 'e1') {
          if (move.to === 'g1') {
            squareStyles['h1'] = {
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.5) 25%, transparent 25%)',
              borderRadius: '50%',
            };
          }
          if (move.to === 'c1') {
            squareStyles['a1'] = {
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.5) 25%, transparent 25%)',
              borderRadius: '50%',
            };
          }
        } else if (selectedSquare === 'e8') {
          if (move.to === 'g8') {
            squareStyles['h8'] = {
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.5) 25%, transparent 25%)',
              borderRadius: '50%',
            };
          }
          if (move.to === 'c8') {
            squareStyles['a8'] = {
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.5) 25%, transparent 25%)',
              borderRadius: '50%',
            };
          }
        }
      });
    } catch {
      // Ignore move lookup errors if square is invalid
    }
  }

  // Evaluation centipawn score to percentage mapping (-1000 to +1000 CP)
  const evalCp = getEvaluation();
  const evalPercent = Math.max(5, Math.min(95, 50 + (evalCp / 1000) * 50));

  return (
    <div className="flex flex-col items-center w-full space-y-4">
      {/* Top Game Status & Turn Indicator */}
      <div className="w-full max-w-[560px] flex items-center justify-between px-4 py-2 rounded-xl surface-card text-xs">
        <div className="flex items-center gap-2 font-medium">
          {gameStatus === 'playing' ? (
            game.turn() === userColor ? (
              <span className="flex items-center gap-1.5 text-indigo-500 font-semibold">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                Your Turn
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                <CircleNotch className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                {isEngineThinking ? 'Stockfish Calculating...' : 'Stockfish Thinking...'}
              </span>
            )
          ) : (
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-amber-500">
              {statusMessage(gameStatus, winner)}
            </span>
          )}
        </div>

        {/* Evaluation Bar Score */}
        <div className="font-mono text-[11px] text-[var(--text-secondary)]">
          Eval: <span className="font-semibold text-[var(--text-primary)]">{(evalCp / 100).toFixed(1)}</span>
        </div>
      </div>

      {/* Main Board Container with Evaluation Bar */}
      <div className="flex items-center gap-3 w-full max-w-[560px]">
        {/* Vertical Evaluation Bar */}
        <div className="w-2.5 h-[540px] rounded-full bg-zinc-800 overflow-hidden flex flex-col justify-end relative shadow-inner">
          <div
            className="w-full bg-indigo-500 transition-all duration-500 ease-out"
            style={{ height: `${evalPercent}%` }}
          />
        </div>

        {/* Interactive Chessboard (Drag & Drop + Click Move + Drag Highlights Enabled) */}
        <div className="flex-1 aspect-square rounded-2xl overflow-hidden surface-card p-2 relative">
          <Chessboard
            options={{
              position: game.fen(),
              boardOrientation,
              allowDragging: true,
              onPieceDrag: handlePieceDrag,
              onPieceDrop: handlePieceDrop,
              onSquareClick: ({ square }) => onSquareClick(square),
              squareStyles,
              darkSquareStyle: { backgroundColor: isDarkMode ? '#1E2337' : '#B58863' },
              lightSquareStyle: { backgroundColor: isDarkMode ? '#2D334D' : '#F0D9B5' },
              boardStyle: {
                borderRadius: '12px',
              },
            }}
          />

          {/* Game Over Modal Overlay - Tone-on-tone zero glassmorphism */}
          {gameStatus !== 'playing' && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center space-y-4 rounded-2xl animate-fade-in">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                {gameStatus === 'checkmate' ? (
                  <Trophy className="w-6 h-6" weight="bold" />
                ) : gameStatus === 'resigned' ? (
                  <Flag className="w-6 h-6" weight="bold" />
                ) : (
                  <Handshake className="w-6 h-6" weight="bold" />
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {gameStatus === 'checkmate'
                    ? winner === 'user'
                      ? 'Victory by Checkmate!'
                      : 'Checkmate - Engine Wins'
                    : gameStatus === 'resigned'
                    ? 'Game Resigned'
                    : 'Game Drawn'}
                </h3>
                <p className="text-xs text-zinc-400">
                  Game saved to local session log. Ready for interactive game review.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function statusMessage(status: string, winner: string | null): string {
  if (status === 'checkmate') {
    return winner === 'user' ? 'Checkmate — You Won!' : 'Checkmate — Stockfish Won';
  }
  if (status === 'resigned') return 'Resigned';
  if (status === 'draw') return 'Draw Game';
  return '';
}
