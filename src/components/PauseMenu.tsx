/**
 * PauseMenu Component
 * Modal shown on ESC or Pause button click, halting combat, timer, and input.
 */

import React from 'react';
import { Play, RotateCcw, Settings, LogOut } from 'lucide-react';
import { soundEngine } from '../services/soundEngine';

interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
  onOpenSettings: () => void;
  onExit: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  onResume,
  onRestart,
  onOpenSettings,
  onExit,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm mx-4 bg-zinc-950 border border-zinc-700/80 rounded-2xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex flex-col items-center select-none text-center">
        {/* Title */}
        <h2 className="font-cinzel text-3xl font-black text-zinc-100 tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] mb-2">
          PAUSED
        </h2>
        <p className="font-rajdhani text-sm text-zinc-400 tracking-wider mb-6">
          COMBAT SUSPENDED • CHOOSE ACTION
        </p>

        {/* Buttons List */}
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onResume();
            }}
            onMouseEnter={() => soundEngine.playButtonHover()}
            className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 active:scale-98 text-white font-cinzel font-bold text-sm tracking-wider shadow-[0_0_15px_rgba(2,132,199,0.5)] transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>RESUME BATTLE</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onRestart();
            }}
            onMouseEnter={() => soundEngine.playButtonHover()}
            className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 active:scale-98 text-zinc-200 font-cinzel font-bold text-sm tracking-wider transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESTART</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onOpenSettings();
            }}
            onMouseEnter={() => soundEngine.playButtonHover()}
            className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 active:scale-98 text-zinc-200 font-cinzel font-bold text-sm tracking-wider transition-all cursor-pointer"
          >
            <Settings className="w-4 h-4" />
            <span>SETTINGS</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onExit();
            }}
            onMouseEnter={() => soundEngine.playButtonHover()}
            className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-800/80 active:scale-98 text-red-300 font-cinzel font-bold text-sm tracking-wider transition-all cursor-pointer mt-2"
          >
            <LogOut className="w-4 h-4" />
            <span>EXIT BATTLE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
