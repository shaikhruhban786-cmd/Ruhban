/**
 * Cinematic Typing Battle - Types & Interfaces
 */

export type ScreenMode =
  | 'menu'
  | 'battle'
  | 'practice'
  | 'speedtest'
  | 'leaderboard'
  | 'stats'
  | 'settings';

export type WeaponType = 'sword' | 'gun' | 'axe' | 'bow' | 'spear' | 'energy';

export interface WeaponInfo {
  id: WeaponType;
  name: string;
  icon: string;
  description: string;
  damageMultiplier: number;
  attackSpeedName: string;
  color: string;
  glowColor: string;
  trailColor: string;
}

export type EnemyType = 'warrior' | 'assassin' | 'tank' | 'gunner' | 'boss';

export interface EnemyInfo {
  id: EnemyType;
  name: string;
  title: string;
  health: number;
  attackInterval: number; // in milliseconds
  attackDamage: number;
  armor: number; // percentage reduction
  color: string;
  weapon: WeaponType;
  avatarSeed: string;
  attackQuotes: string[];
}

export interface LevelInfo {
  id: number;
  name: string;
  subTitle: string;
  enemy: EnemyInfo;
  backgroundTheme: 'training' | 'ancient' | 'castle' | 'fire' | 'forest' | 'cyber' | 'boss';
  ambientFogColor: string;
  glowColor: string;
  sparksColor: string;
  requiredWpmRecommendation: number;
  sentencePrompt: string;
  unlockedByDefault: boolean;
}

export type AttackComboTier = 'NORMAL' | 'QUICK_STRIKE' | 'POWER_ATTACK' | 'SPECIAL_ATTACK' | 'FURY_MODE';

export interface DamageNumber {
  id: string;
  amount: number;
  x: number;
  y: number;
  isCritical: boolean;
  color: string;
}

export interface BattleStats {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  errors: number;
  correctChars: number;
  totalChars: number;
  combo: number;
  maxCombo: number;
  damageDealt: number;
  damageTaken: number;
  elapsedTime: number; // seconds
  reactionTimes: number[];
  wpmHistory: { time: number; wpm: number }[];
}

export interface BattleResult {
  won: boolean;
  levelId: number;
  levelName: string;
  enemyName: string;
  wpm: number;
  accuracy: number;
  errors: number;
  charactersTyped: number;
  timeSec: number;
  maxCombo: number;
  damageDealt: number;
  performanceGrade: 'S+' | 'S' | 'A' | 'B' | 'C' | 'D';
  xpGained: number;
  date: string;
}

export interface UserProgress {
  bestWpm: number;
  averageWpm: number;
  highestCombo: number;
  totalBattles: number;
  wins: number;
  losses: number;
  totalCharacters: number;
  totalDamage: number;
  unlockedLevel: number;
  playerLevel: number;
  playerXp: number;
  equippedWeapon: WeaponType;
  battleHistory: BattleResult[];
}

export interface LeaderboardEntry {
  rank: number;
  playerName: string;
  wpm: number;
  accuracy: number;
  combo: number;
  score: number;
  weapon: WeaponType;
  date: string;
  isUser?: boolean;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  sfxVolume: number; // 0 to 1
  musicVolume: number; // 0 to 1
  screenShake: boolean;
  typingSound: boolean;
  graphicsQuality: 'high' | 'medium' | 'low';
  keyboardFeedback: boolean;
}

export type PracticeDifficulty = 'beginner' | 'normal' | 'advanced' | 'expert' | 'custom';
