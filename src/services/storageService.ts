/**
 * LocalStorage Service for Player Progress, History, and Settings
 */

import { GameSettings, UserProgress, BattleResult, LeaderboardEntry, WeaponType } from '../types';
import { INITIAL_LEADERBOARD } from '../data/battleData';

const PROGRESS_STORAGE_KEY = 'cinematic_typing_battle_progress_v1';
const SETTINGS_STORAGE_KEY = 'cinematic_typing_battle_settings_v1';
const LEADERBOARD_STORAGE_KEY = 'cinematic_typing_battle_leaderboard_v1';

export const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  musicEnabled: true,
  sfxVolume: 0.8,
  musicVolume: 0.35,
  screenShake: true,
  typingSound: true,
  graphicsQuality: 'high',
  keyboardFeedback: true,
};

export const DEFAULT_PROGRESS: UserProgress = {
  bestWpm: 0,
  averageWpm: 0,
  highestCombo: 0,
  totalBattles: 0,
  wins: 0,
  losses: 0,
  totalCharacters: 0,
  totalDamage: 0,
  unlockedLevel: 1,
  playerLevel: 1,
  playerXp: 0,
  equippedWeapon: 'sword',
  battleHistory: [],
};

export const storageService = {
  loadProgress(): UserProgress {
    try {
      const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
      if (!raw) return DEFAULT_PROGRESS;
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_PROGRESS, ...parsed };
    } catch {
      return DEFAULT_PROGRESS;
    }
  },

  saveProgress(progress: UserProgress) {
    try {
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.warn('Failed to save progress to localStorage', e);
    }
  },

  loadSettings(): GameSettings {
    try {
      const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!raw) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: GameSettings) {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings to localStorage', e);
    }
  },

  loadLeaderboard(): LeaderboardEntry[] {
    try {
      const raw = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
      if (!raw) return INITIAL_LEADERBOARD;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_LEADERBOARD;
    } catch {
      return INITIAL_LEADERBOARD;
    }
  },

  saveLeaderboard(entries: LeaderboardEntry[]) {
    try {
      localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(entries));
    } catch (e) {
      console.warn('Failed to save leaderboard', e);
    }
  },

  recordBattleResult(result: BattleResult): UserProgress {
    const progress = this.loadProgress();

    const newBattles = progress.totalBattles + 1;
    const newWins = result.won ? progress.wins + 1 : progress.wins;
    const newLosses = !result.won ? progress.losses + 1 : progress.losses;
    const newBestWpm = Math.max(progress.bestWpm, Math.round(result.wpm));
    const newHighestCombo = Math.max(progress.highestCombo, result.maxCombo);
    const newTotalChars = progress.totalCharacters + result.charactersTyped;
    const newTotalDamage = progress.totalDamage + result.damageDealt;

    // Recalculate average WPM
    const prevSum = progress.averageWpm * progress.totalBattles;
    const newAverageWpm = Math.round((prevSum + result.wpm) / newBattles);

    // XP and level calculation
    const xpNeededForNext = progress.playerLevel * 500;
    let newXp = progress.playerXp + result.xpGained;
    let newLevel = progress.playerLevel;
    if (newXp >= xpNeededForNext) {
      newLevel += 1;
      newXp = newXp - xpNeededForNext;
    }

    // Level unlock progression
    let newUnlockedLevel = progress.unlockedLevel;
    if (result.won && result.levelId >= progress.unlockedLevel && progress.unlockedLevel < 7) {
      newUnlockedLevel = result.levelId + 1;
    }

    const updatedHistory = [result, ...progress.battleHistory].slice(0, 30);

    const updatedProgress: UserProgress = {
      ...progress,
      bestWpm: newBestWpm,
      averageWpm: newAverageWpm,
      highestCombo: newHighestCombo,
      totalBattles: newBattles,
      wins: newWins,
      losses: newLosses,
      totalCharacters: newTotalChars,
      totalDamage: newTotalDamage,
      unlockedLevel: newUnlockedLevel,
      playerLevel: newLevel,
      playerXp: newXp,
      battleHistory: updatedHistory,
    };

    this.saveProgress(updatedProgress);

    // Also update leaderboard if WPM is worthy
    if (result.won) {
      this.updateLeaderboardWithScore(result, updatedProgress.equippedWeapon);
    }

    return updatedProgress;
  },

  updateLeaderboardWithScore(result: BattleResult, weapon: WeaponType) {
    const leaderboard = this.loadLeaderboard();
    const score = Math.round(result.wpm * 100 * (result.accuracy / 100) + result.maxCombo * 50);

    const newEntry: LeaderboardEntry = {
      rank: 0,
      playerName: 'You (Champion)',
      wpm: Math.round(result.wpm),
      accuracy: Math.round(result.accuracy * 10) / 10,
      combo: result.maxCombo,
      score,
      weapon,
      date: 'Just now',
      isUser: true,
    };

    // Replace previous user entry if higher, or add
    const filtered = leaderboard.filter((item) => !item.isUser);
    const combined = [...filtered, newEntry];
    combined.sort((a, b) => b.score - a.score);

    // Re-rank
    const ranked = combined.slice(0, 10).map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));

    this.saveLeaderboard(ranked);
  },

  resetAllProgress() {
    localStorage.removeItem(PROGRESS_STORAGE_KEY);
    localStorage.removeItem(LEADERBOARD_STORAGE_KEY);
  },
};
