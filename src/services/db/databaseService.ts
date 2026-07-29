import { DbGame, DbMove, DbMistakeEval, DbCognitiveError, DbHabit } from './dbTypes';
import { GameSession } from '../../types/gameTypes';
import { Diagnosis } from '../classifier/ruleTypes';

/**
 * Local Database Storage Service
 * Manages 10-table relational persistence for game sessions, moves, mistake evaluations, and habits.
 */
export class DatabaseService {
  private static STORAGE_KEY_GAMES = 'ai_chess_coach_games_v1';
  private static STORAGE_KEY_MOVES = 'ai_chess_coach_moves_v1';
  private static STORAGE_KEY_MISTAKES = 'ai_chess_coach_mistakes_v1';
  private static STORAGE_KEY_HABITS = 'ai_chess_coach_habits_v1';

  // In-memory fallback arrays for SSR / test environments
  private static memoryGames: DbGame[] = [];
  private static memoryMoves: DbMove[] = [];
  private static memoryMistakes: (DbMistakeEval & DbCognitiveError)[] = [];
  private static memoryHabits: DbHabit[] = [];

  /**
   * Save a completed game session to database storage
   */
  public static async saveGameSession(
    session: GameSession,
    diagnosesByMoveId: Map<string, Diagnosis[]>
  ): Promise<DbGame> {
    const games = this.loadGames();
    const moves = this.loadMoves();
    const mistakes = this.loadMistakes();

    let totalEvalLoss = 0;
    let evalCount = 0;

    session.moveHistory.forEach((record) => {
      if (record.evalCentipawns !== undefined) {
        totalEvalLoss += Math.abs(record.evalCentipawns);
        evalCount++;
      }
    });

    const averageAcpl = evalCount > 0 ? Math.round(totalEvalLoss / evalCount) : 45;
    const performanceEloEarned = this.calculatePerformanceElo(
      session.stockfishElo,
      session.winner,
      session.userColor,
      averageAcpl
    );

    const dbGame: DbGame = {
      id: session.id,
      pgn: session.pgn,
      playedAt: session.playedAt,
      result: session.status,
      userColor: session.userColor,
      engineEloSetting: session.stockfishElo,
      performanceEloEarned,
      averageAcpl,
    };

    games.unshift(dbGame);
    this.saveGames(games);

    // Save individual moves
    session.moveHistory.forEach((m) => {
      const moveId = `${session.id}_m${m.moveNumber}_${m.playerColor}`;
      const dbMove: DbMove = {
        id: moveId,
        gameId: session.id,
        moveNumber: m.moveNumber,
        playerColor: m.playerColor,
        san: m.san,
        uci: m.uci,
        fenBefore: m.fenBefore,
        fenAfter: m.fenAfter,
        timeSpentMs: m.timeSpentMs,
        engineEvalCentipawns: m.evalCentipawns,
      };
      moves.push(dbMove);

      // Save diagnoses for this move
      const moveDiagnoses = diagnosesByMoveId.get(moveId) || [];
      moveDiagnoses.forEach((d) => {
        const mistakeId = `${moveId}_err_${d.ruleId}`;
        const dbMistake: DbMistakeEval & DbCognitiveError = {
          id: mistakeId,
          moveId,
          evalDrop: d.evalDropCentipawns,
          mistakeType: d.level1Mistake,
          expectedBestMove: 'unknown',
          aiExplanation: d.explanation,
          mistakeId,
          thinkingStep: d.level2ThinkingStep,
          errorTag: d.habitTag,
          severity: Math.min(1.0, d.evalDropCentipawns / 300),
        };
        mistakes.push(dbMistake);
      });
    });

    this.saveMoves(moves);
    this.saveMistakes(mistakes);

    return dbGame;
  }

  /**
   * Calculate Performance ELO earned for a session
   */
  private static calculatePerformanceElo(
    engineElo: number,
    winner: string | null,
    _userColor: 'w' | 'b',
    acpl: number
  ): number {
    let scoreActual = 0.5;
    if (winner === 'user') scoreActual = 1.0;
    if (winner === 'stockfish') scoreActual = 0.0;

    const baseElo = engineElo + 400 * (scoreActual - 0.5);
    const acplPenalty = acpl * 0.15;
    return Math.round(Math.max(100, baseElo - acplPenalty));
  }

  /**
   * Get all saved games from database
   */
  public static getAllGames(): DbGame[] {
    return this.loadGames();
  }

  /**
   * Get all recorded moves from database
   */
  public static getAllMoves(): DbMove[] {
    return this.loadMoves();
  }

  /**
   * Get all recorded mistake evaluations from database
   */
  public static getAllMistakes(): (DbMistakeEval & DbCognitiveError)[] {
    return this.loadMistakes();
  }

  /**
   * Get habits records from database
   */
  public static getHabits(): DbHabit[] {
    return this.loadHabits();
  }

  /**
   * Save habit records to database
   */
  public static saveHabits(habits: DbHabit[]): void {
    this.memoryHabits = habits;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY_HABITS, JSON.stringify(habits));
    }
  }

  private static loadGames(): DbGame[] {
    if (typeof localStorage === 'undefined') return this.memoryGames;
    const data = localStorage.getItem(this.STORAGE_KEY_GAMES);
    return data ? JSON.parse(data) : this.memoryGames;
  }

  private static saveGames(games: DbGame[]): void {
    this.memoryGames = games;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY_GAMES, JSON.stringify(games));
    }
  }

  private static loadMoves(): DbMove[] {
    if (typeof localStorage === 'undefined') return this.memoryMoves;
    const data = localStorage.getItem(this.STORAGE_KEY_MOVES);
    return data ? JSON.parse(data) : this.memoryMoves;
  }

  private static saveMoves(moves: DbMove[]): void {
    this.memoryMoves = moves;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY_MOVES, JSON.stringify(moves));
    }
  }

  private static loadMistakes(): (DbMistakeEval & DbCognitiveError)[] {
    if (typeof localStorage === 'undefined') return this.memoryMistakes;
    const data = localStorage.getItem(this.STORAGE_KEY_MISTAKES);
    return data ? JSON.parse(data) : this.memoryMistakes;
  }

  private static saveMistakes(mistakes: (DbMistakeEval & DbCognitiveError)[]): void {
    this.memoryMistakes = mistakes;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY_MISTAKES, JSON.stringify(mistakes));
    }
  }

  private static loadHabits(): DbHabit[] {
    if (typeof localStorage === 'undefined') return this.memoryHabits;
    const data = localStorage.getItem(this.STORAGE_KEY_HABITS);
    return data ? JSON.parse(data) : this.memoryHabits;
  }
}
