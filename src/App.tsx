import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { 
  Play, 
  Eye, 
  TrendingUp, 
  Brain, 
  ShieldAlert, 
  Zap, 
  Sparkles, 
  RotateCcw,
  Sliders,
  Award,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'play' | 'review' | 'progress'>('play');
  const [game, setGame] = useState<Chess>(new Chess());
  const [stockfishElo, setStockfishElo] = useState<number>(800);
  const [estimatedRating] = useState<number>(850);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleResetBoard = () => {
    const newGame = new Chess();
    setGame(newGame);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-base)] text-[var(--text-primary)] font-sans antialiased overflow-x-hidden transition-colors duration-300">
      {/* Top Navbar */}
      <header className="h-16 surface-panel sticky top-0 z-50 px-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/20">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-sm tracking-tight flex items-center gap-2">
              Personal AI Chess Coach
              <span className="px-2 py-0.5 text-[10px] uppercase font-mono tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full font-medium">
                Offline Mode
              </span>
            </h1>
            <p className="text-[11px] text-[var(--text-secondary)]">Diagnosing your thinking process, not just engine moves</p>
          </div>
        </div>

        {/* Center Tabs: Play | Review | Progress */}
        <nav className="flex items-center space-x-1 bg-[var(--bg-subtle)] p-1 rounded-full">
          <button
            onClick={() => setActiveTab('play')}
            className={`relative px-5 py-1.5 text-xs font-medium rounded-full transition-colors flex items-center space-x-2 ${
              activeTab === 'play' ? 'text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {activeTab === 'play' && (
              <motion.div
                layoutId="activeTabBadge"
                className="absolute inset-0 bg-indigo-600 rounded-full shadow-md shadow-indigo-600/30"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <Play className="w-3.5 h-3.5 relative z-10" />
            <span className="relative z-10">Play</span>
          </button>

          <button
            onClick={() => setActiveTab('review')}
            className={`relative px-5 py-1.5 text-xs font-medium rounded-full transition-colors flex items-center space-x-2 ${
              activeTab === 'review' ? 'text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {activeTab === 'review' && (
              <motion.div
                layoutId="activeTabBadge"
                className="absolute inset-0 bg-indigo-600 rounded-full shadow-md shadow-indigo-600/30"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <Eye className="w-3.5 h-3.5 relative z-10" />
            <span className="relative z-10">Review</span>
          </button>

          <button
            onClick={() => setActiveTab('progress')}
            className={`relative px-5 py-1.5 text-xs font-medium rounded-full transition-colors flex items-center space-x-2 ${
              activeTab === 'progress' ? 'text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {activeTab === 'progress' && (
              <motion.div
                layoutId="activeTabBadge"
                className="absolute inset-0 bg-indigo-600 rounded-full shadow-md shadow-indigo-600/30"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <TrendingUp className="w-3.5 h-3.5 relative z-10" />
            <span className="relative z-10">Progress</span>
          </button>
        </nav>

        {/* Right Status & Theme Toggle */}
        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-medium font-mono">Performance: {estimatedRating} ELO</div>
            <div className="text-[10px] text-amber-500 dark:text-amber-400 font-medium flex items-center justify-end gap-1">
              <ShieldAlert className="w-3 h-3" />
              <span>Leak: Threat Scan</span>
            </div>
          </div>

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-xl bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            title="Toggle Light/Dark Theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col">
        <AnimatePresence mode="wait">
          {activeTab === 'play' && (
            <motion.div
              key="play"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start my-auto"
            >
              {/* Left Panel: Engine Strength & Game Controls */}
              <div className="lg:col-span-4 space-y-6">
                <div className="surface-card rounded-2xl p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold tracking-tight flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-indigo-500" />
                      Calibrated Stockfish Opponent
                    </h2>
                    <span className="text-xs font-mono px-2.5 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-md font-medium">
                      {stockfishElo >= 3000 ? 'Uncapped / Max' : `${stockfishElo} ELO`}
                    </span>
                  </div>

                  {/* Stockfish ELO Slider */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs text-[var(--text-secondary)]">
                      <span>Beginner (100)</span>
                      <span className="font-semibold text-[var(--text-primary)]">Target ({stockfishElo})</span>
                      <span>Max (3200+)</span>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="3200"
                      step="50"
                      value={stockfishElo}
                      onChange={(e) => setStockfishElo(Number(e.target.value))}
                      className="w-full h-1.5 bg-[var(--bg-subtle)] rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="flex gap-2 pt-1">
                      {[700, 900, 1100, 1500, 3200].map((elo) => (
                        <button
                          key={elo}
                          onClick={() => setStockfishElo(elo)}
                          className={`flex-1 text-[11px] py-1 rounded-lg transition-all ${
                            (elo === 3200 ? stockfishElo >= 3000 : stockfishElo === elo)
                              ? 'bg-indigo-600 text-white font-medium shadow-sm'
                              : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                          }`}
                        >
                          {elo === 3200 ? 'Max' : elo}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[var(--bg-subtle)] text-xs text-[var(--text-secondary)] space-y-1">
                    <div className="font-medium text-[var(--text-primary)] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      Session Mode Active
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Play multiple games in a row. Every move time and PGN is automatically saved for post-game cognitive analysis.
                    </p>
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <button
                      onClick={handleResetBoard}
                      className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-all shadow-md shadow-indigo-600/20 active:scale-95"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>New Game</span>
                    </button>
                  </div>
                </div>

                {/* Cognitive Diagnostics Widget */}
                <div className="surface-card rounded-2xl p-5 space-y-3">
                  <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider font-mono">
                    Active Cognitive Focus
                  </h3>
                  <div className="p-3.5 rounded-xl bg-amber-500/10 text-amber-900 dark:text-amber-300 space-y-1">
                    <div className="text-xs font-semibold flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-500" />
                      <span>Threat Scan Protocol</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-400/90">
                      Before making every move, ask: *"What is my opponent threatening with their last move?"*
                    </p>
                  </div>
                </div>
              </div>

              {/* Center/Right Panel: Interactive Chessboard */}
              <div className="lg:col-span-8 flex flex-col items-center">
                <div className="w-full max-w-[560px] aspect-square rounded-2xl overflow-hidden surface-card p-2">
                  <Chessboard
                    options={{
                      position: game.fen(),
                      darkSquareStyle: { backgroundColor: isDarkMode ? '#1E2337' : '#B58863' },
                      lightSquareStyle: { backgroundColor: isDarkMode ? '#2D334D' : '#F0D9B5' },
                      boardStyle: {
                        borderRadius: '12px',
                      },
                    }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'review' && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="max-w-4xl mx-auto w-full space-y-6 my-auto"
            >
              <div className="surface-card rounded-2xl p-8 space-y-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
                  <Eye className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold tracking-tight">Guided Metacognitive Review</h2>
                  <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
                    Before revealing Stockfish evaluation lines, identify where you think your decision-making process failed.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[var(--bg-subtle)] text-left max-w-xl mx-auto space-y-4">
                  <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-mono">
                    <span>Move 16 • White</span>
                    <span className="text-red-500 font-semibold">Critical Turning Point</span>
                  </div>
                  <p className="text-sm font-medium">
                    "You played <code className="bg-[var(--bg-base)] px-1.5 py-0.5 rounded text-indigo-600 dark:text-indigo-400 font-mono">16. Nd4</code>. Where do you think you went wrong?"
                  </p>

                  <div className="grid grid-cols-1 gap-2 pt-2">
                    <button className="p-3.5 text-left rounded-xl bg-[var(--bg-surface)] hover:bg-indigo-500/5 text-xs text-[var(--text-primary)] transition-all flex items-center justify-between group">
                      <span>I missed my opponent's direct attack on my Queen</span>
                      <ChevronRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-indigo-500 transition-colors" />
                    </button>
                    <button className="p-3.5 text-left rounded-xl bg-[var(--bg-surface)] hover:bg-indigo-500/5 text-xs text-[var(--text-primary)] transition-all flex items-center justify-between group">
                      <span>I moved a piece that was defending another piece (LPDO)</span>
                      <ChevronRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-indigo-500 transition-colors" />
                    </button>
                    <button className="p-3.5 text-left rounded-xl bg-[var(--bg-surface)] hover:bg-indigo-500/5 text-xs text-[var(--text-primary)] transition-all flex items-center justify-between group">
                      <span>I made a quick impulse move without calculating replies</span>
                      <ChevronRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-indigo-500 transition-colors" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'progress' && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="max-w-5xl mx-auto w-full space-y-6 my-auto"
            >
              {/* Personal Chess DNA Card */}
              <div className="surface-card rounded-2xl p-8 relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-mono font-medium">
                      <Award className="w-3.5 h-3.5" />
                      <span>Personal Chess DNA Profile</span>
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">The Counter-Puncher</h2>
                    <p className="text-xs text-[var(--text-secondary)] max-w-md">
                      Strong tactical vision in open positions, but prone to skipping threat scans when initiating early attacks.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 font-mono">
                    <div className="p-4 rounded-xl bg-[var(--bg-subtle)] text-center">
                      <div className="text-[10px] text-[var(--text-secondary)] uppercase">Performance ELO</div>
                      <div className="text-xl font-bold mt-1">{estimatedRating}</div>
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

              {/* Cognitive Thinking Skill Balance Bars */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="surface-card rounded-2xl p-6 space-y-4">
                  <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider font-mono flex items-center gap-2">
                    <Zap className="w-4 h-4 text-indigo-500" />
                    Cognitive Thinking Steps
                  </h3>

                  <div className="space-y-4 text-xs font-mono">
                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <span>Threat Scan</span>
                        <span className="text-amber-500 font-semibold">42% (Needs Work)</span>
                      </div>
                      <div className="h-2 rounded-full bg-[var(--bg-subtle)] overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: '42%' }} />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <span>Safety Scan (LPDO)</span>
                        <span className="text-emerald-500 font-semibold">78%</span>
                      </div>
                      <div className="h-2 rounded-full bg-[var(--bg-subtle)] overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '78%' }} />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <span>Candidate Move Generation</span>
                        <span className="text-indigo-500 font-semibold">65%</span>
                      </div>
                      <div className="h-2 rounded-full bg-[var(--bg-subtle)] overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: '65%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Behavioral Metrics Dashboard */}
                <div className="surface-card rounded-2xl p-6 space-y-4">
                  <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider font-mono flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-500" />
                    Mined Behavioral Habits
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-[var(--bg-subtle)] flex items-center justify-between">
                      <span>Attacks Before Development</span>
                      <span className="font-mono text-amber-500 font-bold">82%</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[var(--bg-subtle)] flex items-center justify-between">
                      <span>Delays Castling Past Move 15</span>
                      <span className="font-mono text-amber-500 font-bold">74%</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[var(--bg-subtle)] flex items-center justify-between">
                      <span>Moves Queen Early</span>
                      <span className="font-mono text-[var(--text-secondary)] font-bold">61%</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
