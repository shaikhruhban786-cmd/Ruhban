/**
 * SettingsModal Component
 * Comprehensive game audio, visual feedback, and data management settings.
 */

import React, { useState } from 'react';
import { X, Volume2, Music, Sparkles, Monitor, RotateCcw, AlertTriangle } from 'lucide-react';
import { GameSettings } from '../types';
import { soundEngine } from '../services/soundEngine';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onResetProgress: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onResetProgress,
  onClose,
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState<boolean>(false);

  const toggleSound = () => {
    const updated = { ...settings, soundEnabled: !settings.soundEnabled };
    onUpdateSettings(updated);
    soundEngine.updateSettings(updated);
  };

  const toggleMusic = () => {
    const updated = { ...settings, musicEnabled: !settings.musicEnabled };
    onUpdateSettings(updated);
    soundEngine.updateSettings(updated);
  };

  const toggleTypingSound = () => {
    const updated = { ...settings, typingSound: !settings.typingSound };
    onUpdateSettings(updated);
    soundEngine.updateSettings(updated);
  };

  const toggleScreenShake = () => {
    onUpdateSettings({ ...settings, screenShake: !settings.screenShake });
  };

  const handleSfxVolume = (val: number) => {
    const updated = { ...settings, sfxVolume: val };
    onUpdateSettings(updated);
    soundEngine.updateSettings(updated);
  };

  const handleMusicVolume = (val: number) => {
    const updated = { ...settings, musicVolume: val };
    onUpdateSettings(updated);
    soundEngine.updateSettings(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.95)] flex flex-col select-none">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="font-cinzel text-xl sm:text-2xl font-black text-zinc-100 tracking-wider">
              SETTINGS & PREFERENCES
            </h2>
          </div>
          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audio Settings */}
        <div className="flex flex-col gap-4 mb-6">
          <h3 className="font-cinzel text-xs font-bold text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
            <Volume2 className="w-4 h-4" />
            <span>AUDIO CONFIGURATION</span>
          </h3>

          {/* Master Sound Toggle */}
          <div className="flex items-center justify-between py-2 border-b border-zinc-900">
            <div>
              <div className="text-sm font-bold text-zinc-200">Master Sound</div>
              <div className="text-xs text-zinc-500">Enable or mute all game audio</div>
            </div>
            <button
              onClick={toggleSound}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.soundEnabled ? 'bg-sky-500' : 'bg-zinc-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  settings.soundEnabled ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Music Toggle */}
          <div className="flex items-center justify-between py-2 border-b border-zinc-900">
            <div>
              <div className="text-sm font-bold text-zinc-200">Cinematic Music & Drones</div>
              <div className="text-xs text-zinc-500">Procedural ambient battle score</div>
            </div>
            <button
              onClick={toggleMusic}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.musicEnabled ? 'bg-sky-500' : 'bg-zinc-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  settings.musicEnabled ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Mechanical Typing Click Sound Toggle */}
          <div className="flex items-center justify-between py-2 border-b border-zinc-900">
            <div>
              <div className="text-sm font-bold text-zinc-200">Mechanical Key Feedback</div>
              <div className="text-xs text-zinc-500">Tactile keystroke audio response</div>
            </div>
            <button
              onClick={toggleTypingSound}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.typingSound ? 'bg-sky-500' : 'bg-zinc-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  settings.typingSound ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* SFX Volume Slider */}
          <div className="flex flex-col gap-1.5 pt-1">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
              <span>SFX Volume</span>
              <span>{Math.round(settings.sfxVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.sfxVolume}
              onChange={(e) => handleSfxVolume(parseFloat(e.target.value))}
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>

          {/* Music Volume Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
              <span>Music Volume</span>
              <span>{Math.round(settings.musicVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.musicVolume}
              onChange={(e) => handleMusicVolume(parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Visuals / Game Feel */}
        <div className="flex flex-col gap-4 mb-6">
          <h3 className="font-cinzel text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
            <Monitor className="w-4 h-4" />
            <span>VISUALS & GAME FEEL</span>
          </h3>

          {/* Screen Shake */}
          <div className="flex items-center justify-between py-2 border-b border-zinc-900">
            <div>
              <div className="text-sm font-bold text-zinc-200">Screen Shake On Heavy Hits</div>
              <div className="text-xs text-zinc-500">Camera recoil on critical strikes</div>
            </div>
            <button
              onClick={toggleScreenShake}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.screenShake ? 'bg-amber-500' : 'bg-zinc-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  settings.screenShake ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Data Reset Section */}
        <div className="pt-2 border-t border-zinc-800/80">
          {!showConfirmReset ? (
            <button
              onClick={() => setShowConfirmReset(true)}
              className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 font-mono transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RESET SAVED COMBAT PROGRESS</span>
            </button>
          ) : (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs text-red-300 font-bold">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>Reset all battles, unlocked levels, and stats?</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onResetProgress();
                    setShowConfirmReset(false);
                  }}
                  className="px-3 py-1 rounded bg-red-600 hover:bg-red-500 text-white text-xs font-bold font-mono cursor-pointer"
                >
                  YES, RESET DATA
                </button>
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="px-3 py-1 rounded bg-zinc-800 text-zinc-300 text-xs font-mono cursor-pointer"
                >
                  CANCEL
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
