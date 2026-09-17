/**
 * MainMenu Component
 * Cinematic AAA-inspired landing screen with animated battle silhouettes,
 * particle embers, weapon armory selection, and campaign level select modal.
 */

import React, { useState } from 'react';
import {
  Play,
  Zap,
  Trophy,
  Target,
  Settings,
  BarChart3,
  Shield,
  Volume2,
  VolumeX,
  Music,
  Lock,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { CharacterSprite } from './CharacterSprites';
import { WEAPONS_DATA, LEVELS_DATA } from '../data/battleData';
import { LevelInfo, UserProgress, WeaponType, GameSettings } from '../types';
import { soundEngine } from '../services/soundEngine';

interface MainMenuProps {
  progress: UserProgress;
  settings: GameSettings;
  onStartBattle: (level: LevelInfo) => void;
  onOpenSpeedTest: () => void;
  onOpenPractice: () => void;
  onOpenLeaderboard: () => void;
  onOpenStats: () => void;
  onOpenSettings: () => void;
  onEquipWeapon: (weapon: WeaponType) => void;
  onToggleSound: () => void;
  onToggleMusic: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  progress,
  settings,
  onStartBattle,
  onOpenSpeedTest,
  onOpenPractice,
  onOpenLeaderboard,
  onOpenStats,
  onOpenSettings,
  onEquipWeapon,
  onToggleSound,
  onToggleMusic,
}) => {
  const [showLevelSelect, setShowLevelSelect] = useState<boolean>(false);
  const [showArmory, setShowArmory] = useState<boolean>(false);

  const equippedWeaponInfo =
    WEAPONS_DATA.find((w) => w.id === progress.equippedWeapon) || WEAPONS_DATA[0];

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-gradient-to-b from-[#0a0814] via-[#05040a] to-[#020205] select-none text-zinc-100">
      {/* Background Animated Dynamic Arena Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        {/* Sky Ambient Light */}
        <div className="absolute -top-32 inset-x-0 h-96 bg-gradient-to-b from-sky-900/30 via-red-900/10 to-transparent blur-3xl" />

        {/* Silhouetted Battlefield Ground */}
        <div className="absolute bottom-0 inset-x-0 h-72 bg-gradient-to-t from-zinc-950 via-zinc-900/70 to-transparent border-t border-zinc-800/40" />

        {/* Cyber / Ruins Background Backdrop */}
        <svg viewBox="0 0 1200 400" preserveAspectRatio="none" className="w-full h-full opacity-30">
          <polygon
            points="0,400 0,220 120,160 220,240 340,140 480,260 600,120 720,250 860,160 1000,280 1120,180 1200,240 1200,400"
            fill="#080c14"
          />
        </svg>
      </div>

      {/* Floating Sparkles & Light Beams */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/5 w-72 h-72 rounded-full bg-sky-500/10 blur-[90px] animate-pulse" />
        <div className="absolute top-1/3 right-1/5 w-80 h-80 rounded-full bg-red-500/10 blur-[100px] animate-pulse" />
      </div>

      {/* TOP NAVIGATION BAR */}
      <header className="relative z-20 flex items-center justify-between p-4 sm:p-6 max-w-7xl mx-auto w-full">
        {/* Brand Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/70 border border-zinc-800/80 backdrop-blur-md">
          <Shield className="w-4 h-4 text-sky-400" />
          <span className="font-cinzel text-xs font-bold text-zinc-300 tracking-wider">
            CINEMATIC COMBAT
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-950 border border-sky-600/40 text-sky-300">
            v1.0
          </span>
        </div>

        {/* Controls: Audio toggles, Armory, Stats */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Sound Toggle */}
          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onToggleSound();
            }}
            title="Toggle Sound"
            className="p-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-all cursor-pointer"
          >
            {settings.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-sky-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-zinc-500" />
            )}
          </button>

          {/* Quick Music Toggle */}
          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onToggleMusic();
            }}
            title="Toggle Music"
            className="p-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-all cursor-pointer"
          >
            <Music
              className={`w-4 h-4 ${settings.musicEnabled ? 'text-amber-400' : 'text-zinc-500'}`}
            />
          </button>

          {/* Armory / Weapon Switcher */}
          <button
            onClick={() => {
              soundEngine.playButtonClick();
              setShowArmory(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-cinzel font-bold tracking-wider transition-all cursor-pointer shadow-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">ARMORY:</span>
            <span style={{ color: equippedWeaponInfo.color }}>{equippedWeaponInfo.name}</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onOpenSettings();
            }}
            className="p-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-all cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* CENTER HERO AREA: TITLE, SUBTITLE & CINEMATIC DISPLAY */}
      <main className="relative z-20 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto my-auto py-8">
        {/* Core Tagline Badge */}
        <div className="mb-3 px-4 py-1 rounded-full bg-red-950/70 border border-red-500/50 text-red-300 font-mono text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(239,68,68,0.4)]">
          TYPE FASTER. STRIKE HARDER.
        </div>

        {/* Main Title */}
        <h1 className="font-cinzel text-5xl sm:text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-500 tracking-wider drop-shadow-[0_10px_25px_rgba(0,0,0,0.9)]">
          TYPING BATTLE
        </h1>

        {/* Subtitle */}
        <p className="font-rajdhani text-lg sm:text-2xl font-bold tracking-[0.3em] text-sky-400 uppercase mt-2 mb-1 drop-shadow-[0_0_12px_rgba(56,189,248,0.6)]">
          TYPE. ATTACK. SURVIVE.
        </p>

        <p className="font-mono text-xs sm:text-sm text-zinc-400 tracking-wider mb-8">
          Your keyboard is your weapon. Keystroke velocity directly commands the battle.
        </p>

        {/* Dual Character Idle Duel Silhouette Preview */}
        <div className="relative w-full max-w-lg h-36 sm:h-44 flex items-end justify-between px-8 sm:px-12 mb-8 pointer-events-none opacity-90">
          <div className="transform scale-90">
            <CharacterSprite
              isPlayer={true}
              weapon={progress.equippedWeapon}
              actionState="idle"
            />
          </div>

          {/* Center VS Pulse */}
          <div className="flex flex-col items-center justify-center pb-8">
            <span className="font-cinzel font-black text-2xl text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.8)] animate-pulse">
              VS
            </span>
          </div>

          <div className="transform scale-90">
            <CharacterSprite
              isPlayer={false}
              weapon="sword"
              actionState="idle"
              enemyType="warrior"
            />
          </div>
        </div>

        {/* PRIMARY ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-xl">
          {/* PLAY BATTLE */}
          <button
            onClick={() => {
              soundEngine.playButtonClick();
              setShowLevelSelect(true);
            }}
            onMouseEnter={() => soundEngine.playButtonHover()}
            className="group relative flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 active:scale-98 text-white font-cinzel font-black text-base sm:text-lg tracking-wider shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-all cursor-pointer overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <Play className="w-5 h-5 fill-current" />
            <span>PLAY BATTLE</span>
          </button>

          {/* SPEED TEST */}
          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onOpenSpeedTest();
            }}
            onMouseEnter={() => soundEngine.playButtonHover()}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-4 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 active:scale-98 text-zinc-100 font-cinzel font-bold text-sm tracking-wider shadow-lg transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>SPEED TEST</span>
          </button>

          {/* PRACTICE MODE */}
          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onOpenPractice();
            }}
            onMouseEnter={() => soundEngine.playButtonHover()}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-4 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 active:scale-98 text-zinc-100 font-cinzel font-bold text-sm tracking-wider shadow-lg transition-all cursor-pointer"
          >
            <Target className="w-4 h-4 text-emerald-400" />
            <span>PRACTICE</span>
          </button>
        </div>

        {/* SECONDARY ROW: Leaderboard & Stats */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onOpenLeaderboard();
            }}
            onMouseEnter={() => soundEngine.playButtonHover()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-zinc-400 hover:text-amber-300 font-cinzel text-xs tracking-wider transition-colors cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>LEADERBOARD</span>
          </button>

          <span className="text-zinc-700">•</span>

          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onOpenStats();
            }}
            onMouseEnter={() => soundEngine.playButtonHover()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-zinc-400 hover:text-sky-300 font-cinzel text-xs tracking-wider transition-colors cursor-pointer"
          >
            <BarChart3 className="w-3.5 h-3.5 text-sky-400" />
            <span>STATS & RECORDS</span>
          </button>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-20 flex items-center justify-between p-4 sm:p-6 max-w-7xl mx-auto w-full text-xs font-mono text-zinc-500">
        <div>
          <span>HIGH SCORE: </span>
          <span className="text-sky-400 font-bold">{progress.bestWpm} WPM</span>
          <span className="mx-2">•</span>
          <span>WINS: </span>
          <span className="text-emerald-400 font-bold">{progress.wins}</span>
        </div>
        <div className="hidden sm:inline">CINEMATIC DARK FANTASY ENGINE</div>
      </footer>

      {/* --- LEVEL SELECTION MODAL --- */}
      {showLevelSelect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.95)] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-6">
              <div>
                <h2 className="font-cinzel text-2xl font-black text-zinc-100 tracking-wider">
                  SELECT BATTLE ARENA
                </h2>
                <p className="font-rajdhani text-xs text-zinc-400 uppercase tracking-widest">
                  Progressive Combat Trial • 7 Environments
                </p>
              </div>
              <button
                onClick={() => setShowLevelSelect(false)}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-mono cursor-pointer"
              >
                CLOSE [ESC]
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {LEVELS_DATA.map((lvl) => {
                const isUnlocked = lvl.id <= progress.unlockedLevel;

                return (
                  <div
                    key={lvl.id}
                    onClick={() => {
                      if (!isUnlocked) return;
                      soundEngine.playButtonClick();
                      setShowLevelSelect(false);
                      onStartBattle(lvl);
                    }}
                    className={`relative p-4 rounded-2xl border transition-all select-none ${
                      isUnlocked
                        ? 'bg-zinc-900/70 border-zinc-700 hover:border-sky-500 hover:bg-zinc-850 cursor-pointer shadow-md'
                        : 'bg-zinc-950 border-zinc-900 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                          LEVEL {lvl.id}
                        </span>
                        <h3 className="font-cinzel font-bold text-base text-zinc-100">
                          {lvl.name}
                        </h3>
                        <p className="text-xs text-zinc-400 font-rajdhani">
                          {lvl.subTitle}
                        </p>
                      </div>

                      {isUnlocked ? (
                        <div className="p-2 rounded-xl bg-sky-950 border border-sky-500/40 text-sky-400">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-600">
                          <Lock className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono pt-2 border-t border-zinc-800/80 text-zinc-400">
                      <span>Opponent: {lvl.enemy.name}</span>
                      <span className="text-sky-400">Rec: {lvl.requiredWpmRecommendation}+ WPM</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* --- ARMORY WEAPON SELECTION MODAL --- */}
      {showArmory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.95)]">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-6">
              <div>
                <h2 className="font-cinzel text-2xl font-black text-amber-300 tracking-wider">
                  WARRIOR ARMORY
                </h2>
                <p className="font-rajdhani text-xs text-zinc-400 uppercase tracking-widest">
                  Choose Weapon Visual & Attack Archetype
                </p>
              </div>
              <button
                onClick={() => setShowArmory(false)}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-mono cursor-pointer"
              >
                CLOSE
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {WEAPONS_DATA.map((wep) => {
                const isEquipped = progress.equippedWeapon === wep.id;

                return (
                  <div
                    key={wep.id}
                    onClick={() => {
                      soundEngine.playAttack(wep.id, false);
                      onEquipWeapon(wep.id);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isEquipped
                        ? 'bg-zinc-900 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                        : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-cinzel font-bold text-sm" style={{ color: wep.color }}>
                        {wep.name}
                      </span>
                      {isEquipped && (
                        <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 text-[10px] font-mono border border-amber-700">
                          EQUIPPED
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 font-mono mb-2">
                      {wep.description}
                    </p>
                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
                      <span>Type: {wep.attackSpeedName}</span>
                      <span className="text-zinc-300">Dmg: {wep.damageMultiplier}x</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
