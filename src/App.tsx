/**
 * Cinematic Typing Battle - Main Application Controller
 */

import React, { useState, useEffect } from 'react';
import { MainMenu } from './components/MainMenu';
import { BattleArena } from './components/BattleArena';
import { ResultScreen } from './components/ResultScreen';
import { PracticeModeView } from './components/PracticeModeView';
import { SpeedTestView } from './components/SpeedTestView';
import { LeaderboardView } from './components/LeaderboardView';
import { StatsDashboard } from './components/StatsDashboard';
import { SettingsModal } from './components/SettingsModal';

import {
  BattleResult,
  GameSettings,
  LeaderboardEntry,
  LevelInfo,
  ScreenMode,
  UserProgress,
  WeaponType,
} from './types';
import { LEVELS_DATA } from './data/battleData';
import { storageService } from './services/storageService';
import { soundEngine } from './services/soundEngine';

export default function App() {
  const [screenMode, setScreenMode] = useState<ScreenMode | 'result'>('menu');
  const [progress, setProgress] = useState<UserProgress>(storageService.loadProgress());
  const [settings, setSettings] = useState<GameSettings>(storageService.loadSettings());
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(
    storageService.loadLeaderboard()
  );

  const [currentLevel, setCurrentLevel] = useState<LevelInfo>(LEVELS_DATA[0]);
  const [lastBattleResult, setLastBattleResult] = useState<BattleResult | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  // Sync soundEngine settings initially
  useEffect(() => {
    soundEngine.updateSettings(settings);
  }, []);

  const handleStartBattle = (level: LevelInfo) => {
    setCurrentLevel(level);
    setScreenMode('battle');
  };

  const handleFinishBattle = (result: BattleResult) => {
    const updatedProgress = storageService.recordBattleResult(result);
    setProgress(updatedProgress);
    setLeaderboard(storageService.loadLeaderboard());
    setLastBattleResult(result);
    setScreenMode('result');
  };

  const handleNextBattle = () => {
    const nextLevel = LEVELS_DATA.find((l) => l.id === currentLevel.id + 1);
    if (nextLevel) {
      setCurrentLevel(nextLevel);
      setScreenMode('battle');
    } else {
      setScreenMode('menu');
    }
  };

  const handleEquipWeapon = (weapon: WeaponType) => {
    const updated = { ...progress, equippedWeapon: weapon };
    setProgress(updated);
    storageService.saveProgress(updated);
  };

  const handleUpdateSettings = (newSettings: GameSettings) => {
    setSettings(newSettings);
    storageService.saveSettings(newSettings);
    soundEngine.updateSettings(newSettings);
  };

  const handleResetProgress = () => {
    storageService.resetAllProgress();
    const fresh = storageService.loadProgress();
    setProgress(fresh);
    setLeaderboard(storageService.loadLeaderboard());
  };

  const handleToggleSound = () => {
    const updated = { ...settings, soundEnabled: !settings.soundEnabled };
    handleUpdateSettings(updated);
  };

  const handleToggleMusic = () => {
    const updated = { ...settings, musicEnabled: !settings.musicEnabled };
    handleUpdateSettings(updated);
  };

  const handleSaveSpeedTestBest = (newBest: number) => {
    const updated = { ...progress, bestWpm: Math.max(progress.bestWpm, newBest) };
    setProgress(updated);
    storageService.saveProgress(updated);
  };

  return (
    <div className="min-h-screen w-full bg-[#05060a] text-zinc-100 flex flex-col font-sans">
      {/* 1. MAIN MENU SCREEN */}
      {screenMode === 'menu' && (
        <MainMenu
          progress={progress}
          settings={settings}
          onStartBattle={handleStartBattle}
          onOpenSpeedTest={() => setScreenMode('speedtest')}
          onOpenPractice={() => setScreenMode('practice')}
          onOpenLeaderboard={() => setScreenMode('leaderboard')}
          onOpenStats={() => setScreenMode('stats')}
          onOpenSettings={() => setShowSettingsModal(true)}
          onEquipWeapon={handleEquipWeapon}
          onToggleSound={handleToggleSound}
          onToggleMusic={handleToggleMusic}
        />
      )}

      {/* 2. MAIN BATTLE SCREEN */}
      {screenMode === 'battle' && (
        <BattleArena
          level={currentLevel}
          playerWeapon={progress.equippedWeapon}
          settings={settings}
          onFinishBattle={handleFinishBattle}
          onExitToMenu={() => setScreenMode('menu')}
          onOpenSettings={() => setShowSettingsModal(true)}
        />
      )}

      {/* 3. BATTLE RESULT SCREEN */}
      {screenMode === 'result' && lastBattleResult && (
        <ResultScreen
          result={lastBattleResult}
          hasNextLevel={currentLevel.id < LEVELS_DATA.length}
          onPlayAgain={() => setScreenMode('battle')}
          onNextBattle={handleNextBattle}
          onViewStats={() => setScreenMode('stats')}
          onMainMenu={() => setScreenMode('menu')}
        />
      )}

      {/* 4. PRACTICE MODE */}
      {screenMode === 'practice' && (
        <PracticeModeView onBack={() => setScreenMode('menu')} />
      )}

      {/* 5. SPEED TEST CHALLENGE */}
      {screenMode === 'speedtest' && (
        <SpeedTestView
          bestWpm={progress.bestWpm}
          onBack={() => setScreenMode('menu')}
          onSaveNewBest={handleSaveSpeedTestBest}
        />
      )}

      {/* 6. LEADERBOARD */}
      {screenMode === 'leaderboard' && (
        <LeaderboardView
          entries={leaderboard}
          onBack={() => setScreenMode('menu')}
        />
      )}

      {/* 7. PERFORMANCE STATS & WPM GRAPH */}
      {screenMode === 'stats' && (
        <StatsDashboard
          progress={progress}
          onBack={() => setScreenMode('menu')}
        />
      )}

      {/* GLOBAL SETTINGS MODAL */}
      {showSettingsModal && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onResetProgress={handleResetProgress}
          onClose={() => setShowSettingsModal(false)}
        />
      )}
    </div>
  );
}
