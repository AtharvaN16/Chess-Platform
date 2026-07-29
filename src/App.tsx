import { useState } from 'react';
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
  ChevronRight
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'play' | 'review' | 'progress'>('play');
  const [game, setGame] = useState<Chess>(new Chess());
  const [stockfishElo, setStockfishElo] = useState<number>(800);
  const [estimatedRating] = useState<number>(850);

  const handleResetBoard = () => {
    const newGame = new Chess();
    setGame(newGame);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0D0D0D] text-[#EDEDED] font-sans antialiased overflow-x-hidden">
      {/* Top Navbar */}
      <header className="h-16 border-b border-white/5 glass-panel sticky top-0 z-50 px-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-sm tracking-tight text-white flex items-center gap-2">
              Personal AI Chess Coach
              <span className="px-2 py-0.5 text-[10px] uppercase font-mono tracking-widest bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
                Offline Mode
              </span>
            </h1>
            <p className="text-[11px] text-zinc-500">Diagnosing your thinking process, not just engine moves</p>
          </div>
        </div>

        {/* Center Tabs: Play | Review | Progress */}
        <nav className="flex items-center space-x-1 bg-zinc-900/60 p-1 rounded-full border border-white/5">
          <button
            onClick={() => setActiveTab('play')}
            className={`relative px-5 py-1.5 text-xs font-medium rounded-full transition-colors flex items-center space-x-2 ${
              activeTab === 'play' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {activeTab === 'play' && (
              <motion.div
                layoutId="activeTabBadge"
                className="absolute inset-0 bg-indigo-600 rounded-full shadow-md shadow-indigo-500/30"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <Play className="w-3.5 h-3.5 relative z-10" />
            <span className="relative z-10">Play</span>
          </button>

          <button
            onClick={() => setActiveTab('review')}
            className={`relative px-5 py-1.5 text-xs font-medium rounded-full transition-colors flex items-center space-x-2 ${
              activeTab === 'review' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {activeTab === 'review' && (
              <motion.div
                layoutId="activeTabBadge"
                className="absolute inset-0 bg-indigo-600 rounded-full shadow-md shadow-indigo-500/30"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <Eye className="w-3.5 h-3.5 relative z-10" />
            <span className="relative z-10">Review</span>
          </button>

          <button
            onClick={() => setActiveTab('progress')}
            className={`relative px-5 py-1.5 text-xs font-medium rounded-full transition-colors flex items-center space-x-2 ${
              activeTab === 'progress' ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {activeTab === 'progress' && (
              <motion.div
                layoutId="activeTabBadge"
                className="absolute inset-0 bg-indigo-600 rounded-full shadow-md shadow-indigo-500/30"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <TrendingUp className="w-3.5 h-3.5 relative z-10" />
            <span className="relative z-10">Progress</span>
          </button>
        </nav>

        {/* Right Status Summary */}
        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-medium text-zinc-300 font-mono">Performance: {estimatedRating} ELO</div>
            <div className="text-[10px] text-amber-400/90 flex items-center justify-end gap-1">
              <ShieldAlert className="w-3 h-3" />
              <span>Leak: Threat Scan</span>
            </div>
          </div>
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
                <div className="glass-card rounded-2xl p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold tracking-tight text-white flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-indigo-400" />
                      Calibrated Stockfish Opponent
                    </h2>
                    <span className="text-xs font-mono px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-md border border-indigo-500/20">
                      {stockfishElo >= 3000 ? 'Uncapped / Max' : `${stockfishElo} ELO`}
                    </span>
                  </div>

                  {/* Stockfish ELO Slider */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs text-zinc-400">
                      <span>Beginner (100)</span>
                      <span>Target ({stockfishElo})</span>
                      <span>Max (3200+)</span>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="3200"
                      step="50"
                      value={stockfishElo}
                      onChange={(e) => setStockfishElo(Number(e.target.value))}
                      className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => setStockfishElo(700)}
                        className={`flex-1 text-[11px] py-1 rounded-md border transition-all ${
                          stockfishElo === 700
                            ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-300'
                            : 'border-white/5 text-zinc-400 hover:bg-zinc-800/50'
                        }`}
                      >
                        700
                      </button>
                      <button
                        onClick={() => setStockfishElo(900)}
                        className={`flex-1 text-[11px] py-1 rounded-md border transition-all ${
                          stockfishElo === 900
                            ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-300'
                            : 'border-white/5 text-zinc-400 hover:bg-zinc-800/50'
                        }`}
                      >
                        900
                      </button>
                      <button
                        onClick={() => setStockfishElo(1100)}
                        className={`flex-1 text-[11px] py-1 rounded-md border transition-all ${
                          stockfishElo === 1100
                            ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-300'
                            : 'border-white/5 text-zinc-400 hover:bg-zinc-800/50'
                        }`}
                      >
                        1100
                      </button>
                      <button
                        onClick={() => setStockfishElo(1500)}
                        className={`flex-1 text-[11px] py-1 rounded-md border transition-all ${
                          stockfishElo === 1500
                            ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-300'
                            : 'border-white/5 text-zinc-400 hover:bg-zinc-800/50'
                        }`}
                      >
                        1500
                      </button>
                      <button
                        onClick={() => setStockfishElo(3200)}
                        className={`flex-1 text-[11px] py-1 rounded-md border transition-all ${
                          stockfishElo >= 3000
                            ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-300'
                            : 'border-white/5 text-zinc-400 hover:bg-zinc-800/50'
                        }`}
                      >
                        Max
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/5 text-xs text-zinc-400 space-y-1">
                    <div className="font-medium text-zinc-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      Session Mode Active
                    </div>
                    <p className="text-[11px] leading-relaxed text-zinc-500">
                      Play multiple games in a row. Every move time and PGN is automatically saved to your local database for post-game cognitive analysis.
                    </p>
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <button
                      onClick={handleResetBoard}
                      className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-all shadow-lg shadow-indigo-600/25 active:scale-95"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>New Game</span>
                    </button>
                  </div>
                </div>

                {/* Cognitive Diagnostics Widget */}
                <div className="glass-card rounded-2xl p-5 space-y-3">
                  <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                    Active Cognitive Focus
                  </h3>
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                    <div className="text-xs font-medium text-amber-300 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4" />
                      <span>Threat Scan Protocol</span>
                    </div>
                    <p className="text-[11px] text-amber-400/80 leading-relaxed">
                      Before making every move, ask: *"What is my opponent threatening with their last move?"*
                    </p>
                  </div>
                </div>
              </div>

              {/* Center/Right Panel: Interactive Chessboard */}
              <div className="lg:col-span-8 flex flex-col items-center">
                <div className="w-full max-w-[560px] aspect-square rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative glass-panel p-2">
                  <Chessboard
                    options={{
                      position: game.fen(),
                      darkSquareStyle: { backgroundColor: '#1A1D2E' },
                      lightSquareStyle: { backgroundColor: '#2E334D' },
                      boardStyle: {
                        borderRadius: '12px',
                        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
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
              <div className="glass-card rounded-2xl p-8 space-y-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                  <Eye className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-white tracking-tight">Guided Metacognitive Review</h2>
                  <p className="text-sm text-zinc-400 max-w-md mx-auto">
                    Before revealing Stockfish evaluation lines, identify where you think your decision-making process failed.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-zinc-900/90 border border-white/10 text-left max-w-xl mx-auto space-y-4">
                  <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                    <span>Move 16 • White</span>
                    <span className="text-red-400 font-semibold">Critical Turning Point</span>
                  </div>
                  <p className="text-sm text-zinc-200 font-medium">
                    "You played <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-indigo-300 font-mono">16. Nd4</code>. Where do you think you went wrong?"
                  </p>

                  <div className="grid grid-cols-1 gap-2 pt-2">
                    <button className="p-3 text-left rounded-xl bg-zinc-800/50 hover:bg-zinc-800 border border-white/5 text-xs text-zinc-300 transition-all flex items-center justify-between group">
                      <span>I missed my opponent's direct attack on my Queen</span>
                      <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
                    </button>
                    <button className="p-3 text-left rounded-xl bg-zinc-800/50 hover:bg-zinc-800 border border-white/5 text-xs text-zinc-300 transition-all flex items-center justify-between group">
                      <span>I moved a piece that was defending another piece (LPDO)</span>
                      <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
                    </button>
                    <button className="p-3 text-left rounded-xl bg-zinc-800/50 hover:bg-zinc-800 border border-white/5 text-xs text-zinc-300 transition-all flex items-center justify-between group">
                      <span>I made a quick impulse move without calculating replies</span>
                      <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
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
              <div className="glass-card rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono">
                      <Award className="w-3.5 h-3.5" />
                      <span>Personal Chess DNA Profile</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">The Counter-Puncher</h2>
                    <p className="text-xs text-zinc-400 max-w-md">
                      Strong tactical vision in open positions, but prone to skipping threat scans when initiating early attacks.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 font-mono">
                    <div className="p-4 rounded-xl bg-zinc-900/80 border border-white/5 text-center">
                      <div className="text-[10px] text-zinc-500 uppercase">Performance ELO</div>
                      <div className="text-xl font-bold text-white mt-1">{estimatedRating}</div>
                    </div>
                    <div className="p-4 rounded-xl bg-zinc-900/80 border border-white/5 text-center">
                      <div className="text-[10px] text-zinc-500 uppercase">Tactical Strength</div>
                      <div className="text-xl font-bold text-emerald-400 mt-1">1120</div>
                    </div>
                    <div className="p-4 rounded-xl bg-zinc-900/80 border border-white/5 text-center">
                      <div className="text-[10px] text-zinc-500 uppercase">Positional Strength</div>
                      <div className="text-xl font-bold text-amber-400 mt-1">760</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cognitive Thinking Skill Balance Bars */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card rounded-2xl p-6 space-y-4">
                  <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono flex items-center gap-2">
                    <Zap className="w-4 h-4 text-indigo-400" />
                    Cognitive Thinking Steps
                  </h3>

                  <div className="space-y-4 text-xs font-mono">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-zinc-300">
                        <span>Threat Scan</span>
                        <span className="text-amber-400">42% (Needs Work)</span>
                      </div>
                      <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: '42%' }} />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-zinc-300">
                        <span>Safety Scan (LPDO)</span>
                        <span className="text-emerald-400">78%</span>
                      </div>
                      <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '78%' }} />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-zinc-300">
                        <span>Candidate Move Generation</span>
                        <span className="text-indigo-400">65%</span>
                      </div>
                      <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: '65%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Behavioral Metrics Dashboard */}
                <div className="glass-card rounded-2xl p-6 space-y-4">
                  <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    Mined Behavioral Habits
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/5 flex items-center justify-between">
                      <span className="text-zinc-300">Attacks Before Development</span>
                      <span className="font-mono text-amber-400 font-bold">82%</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/5 flex items-center justify-between">
                      <span className="text-zinc-300">Delays Castling Past Move 15</span>
                      <span className="font-mono text-amber-400 font-bold">74%</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/5 flex items-center justify-between">
                      <span className="text-zinc-300">Moves Queen Early</span>
                      <span className="font-mono text-zinc-400 font-bold">61%</span>
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
