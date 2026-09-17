/**
 * HUD Component
 * Displays real-time WPM, Accuracy, Errors, Combo, and Attack Velocity rating.
 */

import React from 'react';
import { Zap, Target, AlertTriangle, Flame, Clock } from 'lucide-react';
import { AttackComboTier } from '../types';

interface HUDProps {
  wpm: number;
  accuracy: number;
  errors: number;
  combo: number;
  comboTier: AttackComboTier;
  elapsedTime: number; // in seconds
  isFuryMode: boolean;
}

export const HUD: React.FC<HUDProps> = ({
  wpm,
  accuracy,
  errors,
  combo,
  comboTier,
  elapsedTime,
  isFuryMode,
}) => {
  // Determine speed pace label based on prompt specifications
  let paceLabel = 'INITIATING';
  let paceColor = 'text-zinc-400';
  if (wpm >= 90) {
    paceLabel = '⚡ SPECIAL RAPID / FURY';
    paceColor = 'text-red-400 animate-pulse';
  } else if (wpm >= 70) {
    paceLabel = '⚔️ VERY FAST ATTACKS';
    paceColor = 'text-amber-400';
  } else if (wpm >= 50) {
    paceLabel = '⚔️ FAST ATTACKS';
    paceColor = 'text-sky-400';
  } else if (wpm >= 30) {
    paceLabel = 'NORMAL ATTACK SPEED';
    paceColor = 'text-emerald-400';
  } else if (wpm > 0) {
    paceLabel = 'SLOW ATTACK CADENCE';
    paceColor = 'text-zinc-400';
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex items-center justify-between gap-3 px-2 sm:px-4 py-2 select-none">
      {/* WPM Counter & Velocity */}
      <div className="flex items-center gap-3 bg-zinc-950/70 border border-sky-900/40 rounded-xl px-3 sm:px-4 py-2 backdrop-blur-sm shadow-md">
        <div className="p-2 rounded-lg bg-sky-950/80 border border-sky-500/40 text-sky-400">
          <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1.5">
            <span className="font-rajdhani font-black text-2xl sm:text-4xl text-sky-300 drop-shadow-[0_0_10px_rgba(56,189,248,0.5)]">
              {wpm}
            </span>
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-bold">
              WPM
            </span>
          </div>
          <span className={`text-[10px] font-bold font-mono tracking-wider ${paceColor}`}>
            {paceLabel}
          </span>
        </div>
      </div>

      {/* Center Combo & Timer */}
      <div className="flex items-center gap-3">
        {/* Combo Badge */}
        <div
          className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl border backdrop-blur-sm transition-all duration-200 ${
            combo >= 10
              ? 'bg-amber-950/80 border-amber-500/80 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
              : 'bg-zinc-950/70 border-zinc-800 text-zinc-400'
          }`}
        >
          <Flame className={`w-5 h-5 ${combo >= 10 ? 'text-amber-400 fill-amber-400 animate-bounce' : 'text-zinc-500'}`} />
          <div className="flex flex-col">
            <span className="font-rajdhani font-black text-lg sm:text-2xl leading-none">
              {combo}x
            </span>
            <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-400">
              COMBO
            </span>
          </div>
        </div>

        {/* Timer */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-950/70 border border-zinc-800 text-zinc-300 font-mono">
          <Clock className="w-4 h-4 text-zinc-400" />
          <span className="text-sm font-bold">{formatTime(elapsedTime)}</span>
        </div>
      </div>

      {/* Accuracy & Errors */}
      <div className="flex items-center gap-3 bg-zinc-950/70 border border-zinc-800/80 rounded-xl px-3 sm:px-4 py-2 backdrop-blur-sm shadow-md">
        {/* Accuracy */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
            <Target className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-rajdhani font-black text-xl sm:text-2xl text-emerald-300">
              {accuracy}%
            </span>
            <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">
              ACCURACY
            </span>
          </div>
        </div>

        <div className="h-7 w-[1px] bg-zinc-800" />

        {/* Errors */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-red-950/80 border border-red-500/40 text-red-400">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-rajdhani font-black text-xl sm:text-2xl text-red-300">
              {errors}
            </span>
            <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">
              ERRORS
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
