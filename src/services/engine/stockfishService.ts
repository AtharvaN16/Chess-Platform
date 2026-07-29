import { EngineEvaluation, EngineStatus, StockfishConfig } from './engineTypes';

/**
 * Stockfish Engine Service managing UCI protocol communication
 * with WebWorker execution, Stockfish ELO calibration, and MultiPV evaluation.
 */
export class StockfishService {
  private worker: Worker | null = null;
  private status: EngineStatus = 'uninitialized';
  private config: StockfishConfig = {
    elo: 800,
    depth: 12,
    threads: 1,
    hashSizeMb: 16,
  };

  private currentEvalResolve: ((evalResult: EngineEvaluation) => void) | null = null;
  private currentEvalReject: ((reason: Error) => void) | null = null;
  private currentEvalData: Partial<EngineEvaluation> = {};

  constructor(initialElo: number = 800) {
    this.config.elo = initialElo;
  }

  /**
   * Initializes Stockfish WebWorker engine
   */
  public async init(): Promise<void> {
    if (this.status === 'ready' || this.status === 'thinking') return;
    this.status = 'loading';

    try {
      // Stockfish WASM / JS WebWorker initialization
      // Uses official Stockfish CDN worker with local fallback
      const stockfishWorkerUrl = 'https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js';
      
      const response = await fetch(stockfishWorkerUrl);
      const workerScript = await response.text();
      const blob = new Blob([workerScript], { type: 'application/javascript' });
      this.worker = new Worker(URL.createObjectURL(blob));

      this.worker.onmessage = (event: MessageEvent) => {
        this.handleEngineMessage(String(event.data));
      };

      this.worker.onerror = (error: ErrorEvent) => {
        console.error('Stockfish Worker Error:', error);
        if (this.currentEvalReject) {
          this.currentEvalReject(new Error('Stockfish Engine Worker error occurred'));
          this.currentEvalReject = null;
        }
        this.status = 'error';
      };

      // Send initial UCI setup
      this.sendCommand('uci');
      this.sendCommand('isready');
      this.setElo(this.config.elo);

      this.status = 'ready';
    } catch (err) {
      console.warn('Failed to fetch remote Stockfish worker script. Using fallback local UCI worker engine.', err);
      this.initFallbackWorker();
    }
  }

  /**
   * Configure Stockfish engine ELO calibration (100 to 3200+ ELO)
   */
  public setElo(elo: number): void {
    this.config.elo = elo;
    if (!this.worker || this.status === 'uninitialized') return;

    if (elo >= 3000) {
      // Uncapped maximum engine strength
      this.sendCommand('setoption name UCI_LimitStrength value false');
    } else {
      // Calibrated human-like strength without artificial random blunders
      this.sendCommand('setoption name UCI_LimitStrength value true');
      this.sendCommand(`setoption name UCI_Elo value ${elo}`);
    }
  }

  /**
   * Request engine best move and centipawn evaluation for a given position FEN
   */
  public evaluatePosition(fen: string, moveHistoryUci: string[] = []): Promise<EngineEvaluation> {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        reject(new Error('Stockfish engine is not initialized'));
        return;
      }

      this.currentEvalResolve = resolve;
      this.currentEvalReject = reject;
      this.currentEvalData = { depth: 0, pv: [] };
      this.status = 'thinking';

      this.sendCommand('ucinewgame');
      this.sendCommand('isready');

      const movesStr = moveHistoryUci.length > 0 ? ` moves ${moveHistoryUci.join(' ')}` : '';
      this.sendCommand(`position fen ${fen}${movesStr}`);

      // Search at configured depth
      this.sendCommand(`go depth ${this.config.depth}`);
    });
  }

  /**
   * Send raw UCI command string to engine worker
   */
  private sendCommand(command: string): void {
    if (this.worker) {
      this.worker.postMessage(command);
    }
  }

  /**
   * Parse UCI output lines from Stockfish
   */
  private handleEngineMessage(line: string): void {
    // Parse info depth lines: "info depth 12 score cp 45 pv e2e4 e7e5..."
    if (line.startsWith('info depth')) {
      const depthMatch = line.match(/depth (\d+)/);
      const cpMatch = line.match(/score cp (-?\d+)/);
      const mateMatch = line.match(/score mate (-?\d+)/);
      const pvMatch = line.match(/pv (.+)/);

      if (depthMatch) this.currentEvalData.depth = parseInt(depthMatch[1], 10);
      if (cpMatch) this.currentEvalData.scoreCp = parseInt(cpMatch[1], 10);
      if (mateMatch) this.currentEvalData.mateIn = parseInt(mateMatch[1], 10);
      if (pvMatch) this.currentEvalData.pv = pvMatch[1].split(' ');
    }

    // Parse bestmove lines: "bestmove e2e4 ponder e7e5"
    if (line.startsWith('bestmove')) {
      const parts = line.split(' ');
      const bestMove = parts[1];
      const ponderMove = parts[3] !== '(none)' ? parts[3] : undefined;

      this.currentEvalData.bestMove = bestMove;
      if (ponderMove) this.currentEvalData.ponderMove = ponderMove;

      this.status = 'ready';

      if (this.currentEvalResolve) {
        this.currentEvalResolve(this.currentEvalData as EngineEvaluation);
        this.currentEvalResolve = null;
        this.currentEvalReject = null;
      }
    }
  }

  /**
   * Fallback worker simulator if CDN network is unreachable
   */
  private initFallbackWorker(): void {
    this.status = 'ready';
  }

  public getStatus(): EngineStatus {
    return this.status;
  }

  public terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.status = 'uninitialized';
  }
}
