/**
 * HealthBar Component
 * Cinematic HP bar with trailing damage delay bar, low-health warning glow, and numeric readout.
 */

import React, { useEffect, useState } from 'react';
import { Heart, Shield } from 'lucide-react';

interface HealthBarProps {
  currentHp: number;
  maxHp: number;
  name: string;
  title?: string;
  isPlayer: boolean;
  color?: string;
}

export const HealthBar: React.FC<HealthBarProps> = ({
  currentHp,
  maxHp,
  name,
  title,
  isPlayer,
  color,
}) => {
  const [ghostHp, setGhostHp] = useState(currentHp);

  // Update ghost health with a smooth delay (classic arcade/fighting game feel)
  useEffect(() => {
    const timer = setTimeout(() => {
      setGhostHp(currentHp);
    }, 400);
    return () => clearTimeout(timer);
  }, [currentHp]);

  const percentage = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));
  const ghostPercentage = Math.max(0, Math.min(100, (ghostHp / maxHp) * 100));
  const isCritical = percentage < 25;

  const barColor = color || (isPlayer ? '#38bdf8' : '#ef4444');

  return (
    <div
      className={`flex flex-col w-full max-w-[280px] sm:max-w-xs md:max-w-sm ${
        isPlayer ? 'items-start' : 'items-end'
      }`}
    >
      {/* Name & Title Header */}
      <div
        className={`flex items-center gap-2 mb-1 w-full ${
          isPlayer ? 'justify-start' : 'justify-end'
        }`}
      >
        {isPlayer && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-sky-950/70 border border-sky-500/40 text-sky-400 text-xs font-rajdhani font-bold tracking-wider">
            <Shield className="w-3 h-3" />
            <span>PLAYER</span>
          </div>
        )}
        <div
          className={`flex flex-col ${
            isPlayer ? 'items-start' : 'items-end'
          }`}
        >
          <span className="font-cinzel font-bold text-sm md:text-base text-zinc-100 tracking-wide drop-shadow">
            {name}
          </span>
          {title && (
            <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">
              {title}
            </span>
          )}
        </div>
        {!isPlayer && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-950/70 border border-red-500/40 text-red-400 text-xs font-rajdhani font-bold tracking-wider">
            <span>ENEMY</span>
          </div>
        )}
      </div>

      {/* Outer Health Frame with angled chamfered cuts */}
      <div className="relative w-full h-5 md:h-6 bg-zinc-950/90 rounded border border-zinc-700/80 p-0.5 overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]">
        {/* Low HP Emergency Pulse */}
        {isCritical && (
          <div className="absolute inset-0 bg-red-500/20 animate-pulse pointer-events-none z-10" />
        )}

        {/* Ghost trailing bar (delayed red/orange damage) */}
        <div
          className={`absolute top-0.5 bottom-0.5 ${
            isPlayer ? 'left-0.5' : 'right-0.5'
          } bg-amber-500/60 transition-all duration-500 ease-out rounded-sm`}
          style={{ width: `${ghostPercentage}%` }}
        />

        {/* Active Health Fill */}
        <div
          className={`relative h-full transition-all duration-150 ease-out rounded-sm flex items-center ${
            isPlayer ? 'justify-end pr-2' : 'justify-start pl-2'
          }`}
          style={{
            width: `${percentage}%`,
            background: isPlayer
              ? 'linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)'
              : 'linear-gradient(90deg, #b91c1c 0%, #ef4444 100%)',
            boxShadow: `0 0 12px ${barColor}`,
          }}
        >
          {/* Glass reflection gloss overlay */}
          <div className="absolute inset-x-0 top-0 h-1/2 bg-white/20 rounded-t-sm" />
        </div>

        {/* Health Text Overlay */}
        <div className="absolute inset-0 flex items-center justify-between px-2 text-[11px] font-mono font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,1)] z-20">
          <div className="flex items-center gap-1">
            <Heart className={`w-3 h-3 ${isCritical ? 'text-red-400 fill-red-400 animate-ping' : 'text-zinc-200 fill-current'}`} />
            <span>HP</span>
          </div>
          <span>
            {Math.max(0, Math.ceil(currentHp))} / {maxHp}
          </span>
        </div>
      </div>
    </div>
  );
};
