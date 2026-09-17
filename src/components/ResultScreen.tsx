/**
 * ResultScreen Component
 * Post-battle cinematic victory/defeat summary with performance ranking and XP rewards.
 */

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, ArrowRight, BarChart3, Home, Trophy, Award, Zap, Target, Flame, Heart } from 'lucide-react';
import { BattleResult } from '../types';
import { soundEngine } from '../services/soundEngine';

interface ResultScreenProps {
  result: BattleResult;
  hasNextLevel: boolean;
  onPlayAgain: () => void;
  onNextBattle: () => void;
  onViewStats: () => void;
  onMainMenu: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  result,
  hasNextLevel,
  onPlayAgain,
  onNextBattle,
  onViewStats,
  onMainMenu,
}) => {
  useEffect(() => {
    if (result.won) {
      soundEngine.playVictoryFanfare();
      // Confetti burst
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#fbbf24', '#f43f5e', '#34d399'],
      });
    } else {
      soundEngine.playDefeat();
    }
  }, [result.won]);

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'S+':
      case 'S':
        return 'text-amber-400 border-amber-500 shadow-[0_0_25px_rgba(251,191,36,0.6)]';
      case 'A':
        return 'text-sky-400 border-sky-500 shadow-[0_0_20px_rgba(56,189,248,0.5)]';
      case 'B':
        return 'text-emerald-400 border-emerald-500 shadow-[0_0_15px_rgba(52,211,153,0.4)]';
      default:
        return 'text-zinc-300 border-zinc-500';
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-[#080b12] via-[#04060a] to-[#010204] select-none">
      <div className="relative w-full max-w-2xl bg-zinc-950/90 border border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.95)] backdrop-blur-xl flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
        {/* Glow ambient background aura */}
        <div
          className="absolute -top-24 inset-x-0 h-48 rounded-full blur-3xl pointer-events-none opacity-40"
          style={{
            background: result.won
              ? 'radial-gradient(circle, rgba(56,189,248,0.6) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(239,68,68,0.6) 0%, transparent 70%)',
          }}
        />

        {/* Victory / Defeat Header */}
        <div className="flex items-center gap-3 mb-2">
          {result.won ? (
            <Trophy className="w-8 h-8 text-amber-400 animate-bounce" />
          ) : (
            <Award className="w-8 h-8 text-red-400" />
          )}
          <h1
            className={`font-cinzel text-4xl sm:text-5xl font-black tracking-widest ${
              result.won
                ? 'text-amber-300 drop-shadow-[0_0_20px_rgba(251,191,36,0.8)]'
                : 'text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]'
            }`}
          >
            {result.won ? 'VICTORY ⚔️' : 'DEFEAT 💀'}
          </h1>
        </div>

        <p className="font-rajdhani text-sm sm:text-base text-zinc-400 tracking-wider mb-6 uppercase">
          {result.levelName} • {result.won ? 'Opponent Vanquished' : 'Retreat & Refocus'}
        </p>

        {/* Grade Badge */}
        <div
          className={`flex flex-col items-center justify-center w-24 h-24 rounded-2xl border-2 bg-zinc-900/90 mb-6 ${getGradeColor(
            result.performanceGrade
          )}`}
        >
          <span className="font-cinzel text-4xl font-black">{result.performanceGrade}</span>
          <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
            GRADE
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full mb-8">
          {/* WPM */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 flex flex-col items-center">
            <Zap className="w-5 h-5 text-sky-400 mb-1" />
            <span className="font-rajdhani font-black text-2xl sm:text-3xl text-sky-300">
              {Math.round(result.wpm)}
            </span>
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
              SPEED WPM
            </span>
          </div>

          {/* Accuracy */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 flex flex-col items-center">
            <Target className="w-5 h-5 text-emerald-400 mb-1" />
            <span className="font-rajdhani font-black text-2xl sm:text-3xl text-emerald-300">
              {result.accuracy}%
            </span>
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
              ACCURACY
            </span>
          </div>

          {/* Max Combo */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 flex flex-col items-center">
            <Flame className="w-5 h-5 text-amber-400 mb-1" />
            <span className="font-rajdhani font-black text-2xl sm:text-3xl text-amber-300">
              {result.maxCombo}x
            </span>
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
              MAX COMBO
            </span>
          </div>

          {/* Total Damage */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 flex flex-col items-center">
            <Heart className="w-5 h-5 text-red-400 mb-1" />
            <span className="font-rajdhani font-black text-2xl sm:text-3xl text-red-300">
              {result.damageDealt}
            </span>
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
              TOTAL DAMAGE
            </span>
          </div>
        </div>

        {/* Secondary Detail Row */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 py-3 px-6 rounded-xl bg-zinc-900/40 border border-zinc-800/80 w-full mb-8 text-xs sm:text-sm font-mono text-zinc-300">
          <div>
            <span className="text-zinc-500">Characters Typed: </span>
            <span className="font-bold text-zinc-200">{result.charactersTyped}</span>
          </div>
          <div>
            <span className="text-zinc-500">Errors: </span>
            <span className="font-bold text-red-400">{result.errors}</span>
          </div>
          <div>
            <span className="text-zinc-500">Duration: </span>
            <span className="font-bold text-zinc-200">{result.timeSec.toFixed(1)}s</span>
          </div>
          <div>
            <span className="text-zinc-500">XP Earned: </span>
            <span className="font-bold text-amber-400">+{result.xpGained} XP</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full">
          {result.won && hasNextLevel && (
            <button
              onClick={() => {
                soundEngine.playButtonClick();
                onNextBattle();
              }}
              onMouseEnter={() => soundEngine.playButtonHover()}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-98 text-black font-cinzel font-black text-sm tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.6)] cursor-pointer transition-all"
            >
              <span>NEXT BATTLE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onPlayAgain();
            }}
            onMouseEnter={() => soundEngine.playButtonHover()}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 active:scale-98 text-white font-cinzel font-bold text-sm tracking-wider shadow-[0_0_15px_rgba(2,132,199,0.4)] cursor-pointer transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>PLAY AGAIN</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onViewStats();
            }}
            onMouseEnter={() => soundEngine.playButtonHover()}
            className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 active:scale-98 text-zinc-200 font-cinzel font-bold text-sm tracking-wider cursor-pointer transition-all"
          >
            <BarChart3 className="w-4 h-4" />
            <span>VIEW STATS</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onMainMenu();
            }}
            onMouseEnter={() => soundEngine.playButtonHover()}
            className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 active:scale-98 text-zinc-400 hover:text-zinc-200 font-cinzel font-bold text-sm tracking-wider cursor-pointer transition-all"
          >
            <Home className="w-4 h-4" />
            <span>MAIN MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
