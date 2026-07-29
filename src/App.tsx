import { useState } from 'react';
import { ChessGameProvider } from './context/ChessGameContext';
import { ChessBoardView } from './components/board/ChessBoardView';
import { StockfishEloSelector } from './components/play/StockfishEloSelector';
import { GameControls } from './components/play/GameControls';
import { MoveHistoryList } from './components/play/MoveHistoryList';
import { GuidedReviewView } from './components/review/GuidedReviewView';
import { PersonalChessDnaCard } from './components/progress/PersonalChessDnaCard';
import { CognitiveSkillBars } from './components/progress/CognitiveSkillBars';
import { MinedHabitCards } from './components/progress/MinedHabitCards';
import { AdaptiveLessonPlayer } from './components/lessons/AdaptiveLessonPlayer';
import { GameController, Eye, ChartLineUp, GraduationCap, Sun, Moon } from '@phosphor-icons/react';

type TabType = 'play' | 'review' | 'progress' | 'lessons';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('play');
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const flipBoard = () => {
    setBoardOrientation((prev) => (prev === 'white' ? 'black' : 'white'));
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <ChessGameProvider>
        <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] transition-colors duration-200 flex flex-col">
          {/* Header Bar */}
          <header className="border-b border-[var(--border-subtle)] px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-500/20">
                ♔
              </div>
              <span className="font-bold text-sm tracking-tight">Personal AI Chess Coach</span>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex items-center gap-1 p-1 rounded-xl bg-[var(--bg-surface)] text-xs">
              <button
                onClick={() => setActiveTab('play')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeTab === 'play'
                    ? 'bg-[var(--bg-subtle)] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <GameController className="w-4 h-4" weight="bold" />
                <span>Play</span>
              </button>

              <button
                onClick={() => setActiveTab('review')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeTab === 'review'
                    ? 'bg-[var(--bg-subtle)] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Eye className="w-4 h-4" weight="bold" />
                <span>Review</span>
              </button>

              <button
                onClick={() => setActiveTab('progress')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeTab === 'progress'
                    ? 'bg-[var(--bg-subtle)] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <ChartLineUp className="w-4 h-4" weight="bold" />
                <span>Progress</span>
              </button>

              <button
                onClick={() => setActiveTab('lessons')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeTab === 'lessons'
                    ? 'bg-[var(--bg-subtle)] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <GraduationCap className="w-4 h-4" weight="bold" />
                <span>Lessons</span>
              </button>
            </nav>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              title="Toggle Light/Dark Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4" weight="bold" /> : <Moon className="w-4 h-4" weight="bold" />}
            </button>
          </header>

          {/* Main Content Workspace */}
          <main className="flex-1 p-6 max-w-7xl mx-auto w-full flex flex-col">
            {activeTab === 'play' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-auto">
                <div className="lg:col-span-2 flex flex-col items-center">
                  <ChessBoardView boardOrientation={boardOrientation} isDarkMode={isDarkMode} />
                </div>
                <div className="space-y-4">
                  <StockfishEloSelector />
                  <GameControls onFlipBoard={flipBoard} />
                  <MoveHistoryList />
                </div>
              </div>
            )}

            {activeTab === 'review' && <GuidedReviewView />}

            {activeTab === 'progress' && (
              <div className="space-y-6 my-auto">
                <PersonalChessDnaCard />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <CognitiveSkillBars />
                  <MinedHabitCards />
                </div>
              </div>
            )}

            {activeTab === 'lessons' && <AdaptiveLessonPlayer />}
          </main>
        </div>
      </ChessGameProvider>
    </div>
  );
}
