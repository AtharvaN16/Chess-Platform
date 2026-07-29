import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { Chess, Square } from 'chess.js';
import { GameStatus, GameOutcomeWinner, MoveRecord, GameSession } from '../types/gameTypes';
import { StockfishService } from '../services/engine/stockfishService';
import { soundService } from '../services/audio/soundService';
import { RuleEngine } from '../services/classifier/ruleEngine';
import { DatabaseService } from '../services/db/databaseService';
import { HabitMiner } from '../services/mining/habitMiner';
import { Diagnosis } from '../services/classifier/ruleTypes';
import { HabitCandidate } from '../services/mining/habitTypes';

interface ChessGameContextType {
  game: Chess;
  stockfishElo: number;
  setStockfishElo: (elo: number) => void;
  userColor: 'w' | 'b';
  setUserColor: (color: 'w' | 'b') => void;
  gameStatus: GameStatus;
  winner: GameOutcomeWinner;
  moveHistory: MoveRecord[];
  lastMove: { from: string; to: string } | null;
  isEngineThinking: boolean;
  makeMove: (sourceSquare: string, targetSquare: string) => boolean;
  resetGame: () => void;
  resignGame: () => void;
  offerDraw: () => void;
  undoMove: () => void;
  getEvaluation: () => number; // Centipawns relative to White
  gameSessions: GameSession[];
  topAcuteLeak: HabitCandidate | null;
  minedHabits: HabitCandidate[];
}

const ChessGameContext = createContext<ChessGameContextType | undefined>(undefined);

export function ChessGameProvider({ children }: { children: ReactNode }) {
  const [game, setGame] = useState<Chess>(new Chess());
  const [stockfishElo, setStockfishEloState] = useState<number>(800);
  const [userColor, setUserColor] = useState<'w' | 'b'>('w');
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [winner, setWinner] = useState<GameOutcomeWinner>(null);
  const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([]);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [isEngineThinking, setIsEngineThinking] = useState<boolean>(false);
  const [currentEval, setCurrentEval] = useState<number>(0);
  const [gameSessions, setGameSessions] = useState<GameSession[]>([]);
  const [topAcuteLeak, setTopAcuteLeak] = useState<HabitCandidate | null>(null);
  const [minedHabits, setMinedHabits] = useState<HabitCandidate[]>([]);

  const stockfishRef = useRef<StockfishService | null>(null);
  const lastMoveTimeRef = useRef<number>(Date.now());

  // Initialize Stockfish engine instance and mine initial habits
  useEffect(() => {
    const engine = new StockfishService(stockfishElo);
    stockfishRef.current = engine;
    engine.init().catch(console.error);

    // Initial habit mining scan
    const summary = HabitMiner.mineHabits();
    setTopAcuteLeak(summary.topAcuteLeak);
    setMinedHabits(summary.minedHabits);

    return () => {
      engine.terminate();
    };
  }, []);

  // Sync ELO setting changes
  const setStockfishElo = (elo: number) => {
    setStockfishEloState(elo);
    if (stockfishRef.current) {
      stockfishRef.current.setElo(elo);
    }
  };

  // Trigger Stockfish turn if it's engine's turn to move
  useEffect(() => {
    if (gameStatus !== 'playing') return;

    const isEngineTurn = game.turn() !== userColor;
    if (isEngineTurn && !isEngineThinking) {
      makeEngineMove();
    }
  }, [game, userColor, gameStatus]);

  const makeEngineMove = async () => {
    if (!stockfishRef.current || game.isGameOver()) return;
    setIsEngineThinking(true);

    try {
      const uciHistory = moveHistory.map((m) => m.uci);
      const evalResult = await stockfishRef.current.evaluatePosition(game.fen(), uciHistory);

      if (evalResult.scoreCp !== undefined) {
        // Normalize evaluation relative to White
        const cp = game.turn() === 'w' ? evalResult.scoreCp : -evalResult.scoreCp;
        setCurrentEval(cp);
      }

      if (evalResult.bestMove && evalResult.bestMove.length >= 4) {
        const from = evalResult.bestMove.substring(0, 2) as Square;
        const to = evalResult.bestMove.substring(2, 4) as Square;
        const promotion = evalResult.bestMove.length === 5 ? evalResult.bestMove[4] : undefined;

        executeMove(from, to, promotion, evalResult.scoreCp);
      }
    } catch (err) {
      console.error('Engine move error:', err);
    } finally {
      setIsEngineThinking(false);
    }
  };

  const makeMove = (sourceSquare: string, targetSquare: string): boolean => {
    if (gameStatus !== 'playing') return false;
    if (game.turn() !== userColor) return false;

    return executeMove(sourceSquare as Square, targetSquare as Square);
  };

  const executeMove = (
    from: Square,
    toSquare: Square,
    promotion?: string,
    evalCp?: number
  ): boolean => {
    let to: Square = toSquare;
    const gameCopy = new Chess(game.fen());
    const movingPiece = gameCopy.get(from);

    // Support Chess.com / Lichess King-onto-Rook castling input (e.g. e1 -> h1 or e1 -> a1)
    if (movingPiece && movingPiece.type === 'k') {
      if (from === 'e1') {
        if (toSquare === 'h1') to = 'g1' as Square;
        if (toSquare === 'a1') to = 'c1' as Square;
      } else if (from === 'e8') {
        if (toSquare === 'h8') to = 'g8' as Square;
        if (toSquare === 'a8') to = 'c8' as Square;
      }
    }

    const fenBefore = game.fen();
    const now = Date.now();
    const timeSpentMs = now - lastMoveTimeRef.current;
    lastMoveTimeRef.current = now;

    try {
      // Only pass promotion property if moving a pawn to promotion rank (rank 8 or 1)
      const isPawnPromotion =
        movingPiece &&
        movingPiece.type === 'p' &&
        ((movingPiece.color === 'w' && to[1] === '8') || (movingPiece.color === 'b' && to[1] === '1'));

      const moveConfig = {
        from,
        to,
        ...(isPawnPromotion ? { promotion: promotion || 'q' } : {}),
      };

      const moveResult = gameCopy.move(moveConfig);
      if (!moveResult) return false;

      // Play appropriate sound effect
      if (gameCopy.inCheck()) {
        soundService.playCheck();
      } else if (moveResult.captured) {
        soundService.playCapture();
      } else {
        soundService.playMove();
      }

      const playerColor = moveResult.color;
      const moveNum = Math.ceil(gameCopy.history().length / 2);

      const record: MoveRecord = {
        moveNumber: moveNum,
        san: moveResult.san,
        uci: `${from}${to}${moveResult.promotion || ''}`,
        fenBefore,
        fenAfter: gameCopy.fen(),
        timeSpentMs,
        playerColor,
        evalCentipawns: evalCp,
      };

      setGame(gameCopy);
      setLastMove({ from, to });
      setMoveHistory((prev) => [...prev, record]);

      // Check game completion status
      if (gameCopy.isGameOver()) {
        soundService.playGameOver();
        let status: GameStatus = 'playing';
        let winResult: GameOutcomeWinner = null;

        if (gameCopy.isCheckmate()) {
          status = 'checkmate';
          winResult = gameCopy.turn() === userColor ? 'stockfish' : 'user';
        } else if (gameCopy.isDraw() || gameCopy.isStalemate() || gameCopy.isThreefoldRepetition()) {
          status = 'draw';
          winResult = 'draw';
        }

        setGameStatus(status);
        setWinner(winResult);
        saveCompletedSession(gameCopy, status, winResult, [...moveHistory, record]);
      }

      return true;
    } catch {
      return false;
    }
  };

  const saveCompletedSession = async (
    finalGame: Chess,
    status: GameStatus,
    winResult: GameOutcomeWinner,
    finalHistory: MoveRecord[]
  ) => {
    const session: GameSession = {
      id: `game_${Date.now()}`,
      playedAt: new Date().toISOString(),
      userColor,
      stockfishElo,
      status,
      winner: winResult,
      pgn: finalGame.pgn(),
      moveHistory: finalHistory,
    };

    // Run RuleEngine diagnoses on user moves
    const diagnosesByMoveId = new Map<string, Diagnosis[]>();
    finalHistory.forEach((m) => {
      if (m.playerColor === userColor) {
        const moveId = `${session.id}_m${m.moveNumber}_${m.playerColor}`;
        const diagnoses = RuleEngine.diagnoseMove({
          fenBefore: m.fenBefore,
          fenAfter: m.fenAfter,
          playedMoveSan: m.san,
          playedMoveUci: m.uci,
          playerColor: m.playerColor,
          evalDropCp: Math.max(50, Math.abs(m.evalCentipawns || 0)),
          timeSpentMs: m.timeSpentMs,
          moveNumber: m.moveNumber,
        });
        if (diagnoses.length > 0) {
          diagnosesByMoveId.set(moveId, diagnoses);
        }
      }
    });

    // Save to Database Service
    await DatabaseService.saveGameSession(session, diagnosesByMoveId);

    // Mine habits and update DNA telemetry
    const summary = HabitMiner.mineHabits();
    setTopAcuteLeak(summary.topAcuteLeak);
    setMinedHabits(summary.minedHabits);

    setGameSessions((prev) => [session, ...prev]);
  };

  const resetGame = () => {
    const newGame = new Chess();
    setGame(newGame);
    setGameStatus('playing');
    setWinner(null);
    setMoveHistory([]);
    setLastMove(null);
    setCurrentEval(0);
    lastMoveTimeRef.current = Date.now();
  };

  const resignGame = () => {
    if (gameStatus !== 'playing') return;
    soundService.playGameOver();
    setGameStatus('resigned');
    setWinner('stockfish');
    saveCompletedSession(game, 'resigned', 'stockfish', moveHistory);
  };

  const offerDraw = () => {
    if (gameStatus !== 'playing') return;
    soundService.playGameOver();
    setGameStatus('draw');
    setWinner('draw');
    saveCompletedSession(game, 'draw', 'draw', moveHistory);
  };

  const undoMove = () => {
    if (moveHistory.length < 2 || isEngineThinking) return;
    const gameCopy = new Chess(game.fen());
    gameCopy.undo(); // undo engine move
    gameCopy.undo(); // undo user move

    setGame(gameCopy);
    setMoveHistory((prev) => prev.slice(0, -2));
    setLastMove(null);
    setGameStatus('playing');
    setWinner(null);
    lastMoveTimeRef.current = Date.now();
  };

  return (
    <ChessGameContext.Provider
      value={{
        game,
        stockfishElo,
        setStockfishElo,
        userColor,
        setUserColor,
        gameStatus,
        winner,
        moveHistory,
        lastMove,
        isEngineThinking,
        makeMove,
        resetGame,
        resignGame,
        offerDraw,
        undoMove,
        getEvaluation: () => currentEval,
        gameSessions,
        topAcuteLeak,
        minedHabits,
      }}
    >
      {children}
    </ChessGameContext.Provider>
  );
}

export function useChessGameContext() {
  const context = useContext(ChessGameContext);
  if (!context) {
    throw new Error('useChessGameContext must be used within a ChessGameProvider');
  }
  return context;
}
