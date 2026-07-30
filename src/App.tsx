import { useState } from 'react';
import { ChessGameProvider, useChessGameContext } from './context/ChessGameContext';
import { ChessBoardView } from './components/board/ChessBoardView';
import { MatchSetupModal } from './components/play/MatchSetupModal';
import { GameControls } from './components/play/GameControls';
import { MoveHistoryList } from './components/play/MoveHistoryList';
import { GamesHistoryLogView } from './components/games/GamesHistoryLogView';
import { GuidedReviewView } from './components/review/GuidedReviewView';
import { PersonalChessDnaCard } from './components/progress/PersonalChessDnaCard';
import { CognitiveSkillBars } from './components/progress/CognitiveSkillBars';
import { MinedHabitCards } from './components/progress/MinedHabitCards';
import { GameSession, GameSetupOptions } from './types/gameTypes';
import { GameController, Clock, ChartLineUp, Eye, Gear, Sun, Moon } from '@phosphor-icons/react';

type TabType = 'play' | 'games' | 'review' | 'progress';

function AppContent() {
  const { setStockfishElo, setUserColor, resetGame } = useChessGameContext();

  const [activeTab, setActiveTab] = useState<TabType>('play');
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState<boolean>(false);
  const [selectedReviewSession, setSelectedReviewSession] = useState<GameSession | null>(null);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);
  const flipBoard = () => setBoardOrientation((prev) => (prev === 'white' ? 'black' : 'white'));

  const handleStartMatch = (options: GameSetupOptions) => {
    let finalColor: 'w' | 'b' = options.userColor === 'random' ? (Math.random() > 0.5 ? 'w' : 'b') : options.userColor;
    setUserColor(finalColor);
    setBoardOrientation(finalColor === 'w' ? 'white' : 'black');
    setStockfishElo(options.stockfishElo);
    resetGame();
    setActiveTab('play');
  };

  const handleSelectGameForReview = (session: GameSession) => {
    setSelectedReviewSession(session);
    setActiveTab('review');
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] transition-colors duration-200 flex flex-col">
        {/* Header Bar - Tone-on-tone zero strokes */}
        <header className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-500/20">
              ♔
            </div>
            <span className="font-bold text-sm tracking-tight">Personal AI Chess Coach</span>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 p-1 rounded-xl bg-[var(--bg-surface)] text-xs shadow-sm">
            <button
              onClick={() => setActiveTab('play')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'play'
                  ? 'bg-[var(--bg-subtle)] text-[var(--text-primary)] font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <GameController className="w-4 h-4" weight="bold" />
              <span>Play</span>
            </button>

            <button
              onClick={() => setActiveTab('games')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'games'
                  ? 'bg-[var(--bg-subtle)] text-[var(--text-primary)] font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Clock className="w-4 h-4" weight="bold" />
              <span>Games Log</span>
            </button>

            <button
              onClick={() => setActiveTab('review')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'review'
                  ? 'bg-[var(--bg-subtle)] text-[var(--text-primary)] font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Eye className="w-4 h-4" weight="bold" />
              <span>Game Review</span>
            </button>

            <button
              onClick={() => setActiveTab('progress')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'progress'
                  ? 'bg-[var(--bg-subtle)] text-[var(--text-primary)] font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <ChartLineUp className="w-4 h-4" weight="bold" />
              <span>Progress</span>
            </button>
          </nav>

          {/* Match Setup & Theme Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSetupModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition-all"
            >
              <Gear className="w-4 h-4" weight="bold" />
              <span>New Match Setup</span>
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors shadow-sm"
              title="Toggle Light/Dark Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4" weight="bold" /> : <Moon className="w-4 h-4" weight="bold" />}
            </button>
          </div>
        </header>

        {/* Main Content Workspace */}
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full flex flex-col">
          {activeTab === 'play' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-auto">
              <div className="lg:col-span-2 flex flex-col items-center">
                <ChessBoardView boardOrientation={boardOrientation} isDarkMode={isDarkMode} />
              </div>
              <div className="space-y-4">
                <GameControls onFlipBoard={flipBoard} />
                <MoveHistoryList />
              </div>
            </div>
          )}

          {activeTab === 'games' && (
            <GamesHistoryLogView onSelectGameForReview={handleSelectGameForReview} />
          )}

          {activeTab === 'review' && (
            <GuidedReviewView
              selectedReviewSession={selectedReviewSession}
              onBackToGamesLog={() => setActiveTab('games')}
            />
          )}

          {activeTab === 'progress' && (
            <div className="space-y-6 my-auto">
              <PersonalChessDnaCard />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CognitiveSkillBars />
                <MinedHabitCards />
              </div>
            </div>
          )}
        </main>

        {/* Pre-Game Match Setup Modal */}
        <MatchSetupModal
          isOpen={isSetupModalOpen}
          onClose={() => setIsSetupModalOpen(false)}
          onStartMatch={handleStartMatch}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ChessGameProvider>
      <AppContent />
    </ChessGameProvider>
  );
}
