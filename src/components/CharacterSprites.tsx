/**
 * Cinematic Character Sprites & Rigs
 * Scalable SVG silhouettes with dynamic lighting, glowing visors/eyes, and custom weapon renderers.
 */

import React from 'react';
import { WeaponType, EnemyType } from '../types';

interface CharacterProps {
  isPlayer: boolean;
  weapon: WeaponType;
  actionState: 'idle' | 'attack' | 'heavy_attack' | 'hit' | 'dead';
  enemyType?: EnemyType;
  color?: string;
  glowColor?: string;
  isFuryMode?: boolean;
}

export const CharacterSprite: React.FC<CharacterProps> = ({
  isPlayer,
  weapon,
  actionState,
  enemyType = 'warrior',
  color,
  glowColor,
  isFuryMode = false,
}) => {
  const primaryColor = color || (isPlayer ? '#38bdf8' : '#ef4444');
  const glow = glowColor || (isPlayer ? 'rgba(56, 189, 248, 0.6)' : 'rgba(239, 68, 68, 0.6)');

  // Dynamic CSS transforms based on actionState
  let transformClass = 'transition-transform duration-150';
  if (actionState === 'attack') {
    transformClass = isPlayer
      ? 'translate-x-12 scale-105 rotate-3 duration-75'
      : '-translate-x-12 scale-105 -rotate-3 duration-75';
  } else if (actionState === 'heavy_attack') {
    transformClass = isPlayer
      ? 'translate-x-20 scale-110 rotate-6 duration-100'
      : '-translate-x-20 scale-110 -rotate-6 duration-100';
  } else if (actionState === 'hit') {
    transformClass = isPlayer
      ? '-translate-x-6 rotate-[-4deg] brightness-150 duration-75'
      : 'translate-x-6 rotate-4 brightness-150 duration-75';
  } else if (actionState === 'dead') {
    transformClass = isPlayer
      ? 'translate-y-16 rotate-45 opacity-30 duration-700'
      : 'translate-y-16 -rotate-45 opacity-30 duration-700';
  } else {
    // idle breathing
    transformClass = 'hover:scale-102';
  }

  return (
    <div
      className={`relative w-44 h-64 md:w-56 md:h-80 flex items-center justify-center select-none ${transformClass}`}
    >
      {/* Fury Aura / Glow */}
      {(isFuryMode || actionState === 'heavy_attack') && (
        <div
          className="absolute inset-0 -m-6 rounded-full blur-xl pointer-events-none opacity-80 animate-pulse"
          style={{ background: isPlayer ? 'radial-gradient(circle, rgba(56,189,248,0.4) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(239,68,68,0.4) 0%, transparent 70%)' }}
        />
      )}

      {/* Dynamic Hit Flash */}
      {actionState === 'hit' && (
        <div className="absolute inset-0 bg-white/30 rounded-full blur-md pointer-events-none" />
      )}

      {/* SVG Character Rig */}
      <svg
        viewBox="0 0 200 300"
        className={`w-full h-full drop-shadow-2xl ${isPlayer ? '' : 'scale-x-[-1]'}`}
        style={{
          filter: `drop-shadow(0 10px 20px ${glow})`,
        }}
      >
        <defs>
          <linearGradient id={`grad-body-${isPlayer ? 'p' : 'e'}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="50%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          <linearGradient id={`grad-armor-${isPlayer ? 'p' : 'e'}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          <filter id={`glow-${isPlayer ? 'p' : 'e'}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Shadow on the ground */}
        <ellipse cx="100" cy="285" rx="55" ry="12" fill="rgba(0,0,0,0.6)" filter="blur(4px)" />

        {/* Cape / Cloak (Flowing) */}
        <path
          d={
            actionState === 'attack' || actionState === 'heavy_attack'
              ? 'M 85 90 Q 30 160 15 260 Q 60 250 85 240 Z'
              : 'M 85 90 Q 55 170 45 260 Q 75 255 90 230 Z'
          }
          fill={isPlayer ? '#0f172a' : '#450a0a'}
          stroke={primaryColor}
          strokeWidth="1.5"
          opacity="0.85"
        />

        {/* Legs / Greaves */}
        <g stroke="#090d16" strokeWidth="2">
          {/* Back leg */}
          <path d="M 75 190 L 65 245 L 55 275 L 75 278 L 85 245 Z" fill="#0f172a" />
          {/* Front leg */}
          <path d="M 105 190 L 115 245 L 125 278 L 145 275 L 130 240 Z" fill="#1e293b" />
          {/* Knee plate */}
          <polygon points="112,230 125,230 128,245 115,250" fill={primaryColor} opacity="0.9" />
        </g>

        {/* Torso / Heavy Armor */}
        <path
          d="M 70 95 L 130 95 L 122 195 L 78 195 Z"
          fill={`url(#grad-body-${isPlayer ? 'p' : 'e'})`}
          stroke="#334155"
          strokeWidth="2"
        />

        {/* Chest Plate / Sigil */}
        <path
          d="M 80 105 L 120 105 L 115 160 L 100 175 L 85 160 Z"
          fill={`url(#grad-armor-${isPlayer ? 'p' : 'e'})`}
          stroke={primaryColor}
          strokeWidth="1.5"
          opacity="0.95"
        />
        {/* Core Glowing Reactor/Emblem */}
        <circle
          cx="100"
          cy="130"
          r="7"
          fill={primaryColor}
          filter={`url(#glow-${isPlayer ? 'p' : 'e'})`}
        />

        {/* Shoulders / Pauldrons */}
        <polygon points="50,90 85,85 80,125 45,115" fill="#1e293b" stroke={primaryColor} strokeWidth="2" />
        <polygon points="115,85 150,90 155,115 120,125" fill="#1e293b" stroke={primaryColor} strokeWidth="2" />

        {/* Helmet / Head */}
        <g>
          {/* Helmet Dome */}
          <path
            d="M 82 50 C 82 30, 118 30, 118 50 L 122 85 L 78 85 Z"
            fill="#0f172a"
            stroke="#475569"
            strokeWidth="2"
          />
          {/* Visor Slit */}
          <polygon
            points={
              enemyType === 'boss' && !isPlayer
                ? '82,60 118,60 114,72 86,72'
                : '86,62 114,62 112,68 88,68'
            }
            fill={primaryColor}
            filter={`url(#glow-${isPlayer ? 'p' : 'e'})`}
          />
          {/* Crest / Horns for Boss or Warrior */}
          {(!isPlayer && enemyType === 'boss') && (
            <g fill={primaryColor}>
              <polygon points="76,45 60,15 82,35" />
              <polygon points="124,45 140,15 118,35" />
            </g>
          )}
        </g>

        {/* Arms & Weapon */}
        {renderWeapon(isPlayer, weapon, actionState, primaryColor)}
      </svg>
    </div>
  );
};

// Sub-renderer for dynamic weapons and arm position
function renderWeapon(
  isPlayer: boolean,
  weapon: WeaponType,
  actionState: string,
  primaryColor: string
) {
  const isAttacking = actionState === 'attack' || actionState === 'heavy_attack';

  if (weapon === 'gun') {
    return (
      <g>
        {/* Arm extended holding gun */}
        <path
          d={isAttacking ? 'M 130 110 L 165 115 L 180 120' : 'M 130 110 L 155 130 L 160 145'}
          stroke="#1e293b"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Gun model */}
        <g transform={isAttacking ? 'translate(170, 105) rotate(0)' : 'translate(150, 135) rotate(45)'}>
          <rect x="0" y="0" width="36" height="12" fill="#0f172a" stroke="#64748b" strokeWidth="1.5" rx="2" />
          <rect x="8" y="10" width="10" height="18" fill="#1e293b" rx="2" />
          <rect x="25" y="-3" width="12" height="6" fill={primaryColor} opacity="0.9" />
          {/* Laser sight */}
          <line x1="36" y1="6" x2="160" y2="6" stroke={primaryColor} strokeWidth="1.5" strokeDasharray="3,3" opacity="0.7" />
          {/* Muzzle flash during attack */}
          {isAttacking && (
            <g transform="translate(38, 6)">
              <polygon points="0,0 20,-8 15,0 25,2 15,4 20,10 0,0" fill="#fef08a" />
              <circle cx="5" cy="0" r="10" fill="rgba(249,115,22,0.6)" />
            </g>
          )}
        </g>
      </g>
    );
  }

  if (weapon === 'axe') {
    return (
      <g>
        {/* Arm */}
        <path
          d={isAttacking ? 'M 130 110 L 165 80 L 155 45' : 'M 130 110 L 155 135 L 140 160'}
          stroke="#1e293b"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Axe Model */}
        <g
          transform={
            isAttacking
              ? 'translate(155, 45) rotate(85)'
              : 'translate(145, 140) rotate(-25)'
          }
        >
          {/* Shaft */}
          <line x1="-30" y1="0" x2="80" y2="0" stroke="#78350f" strokeWidth="6" strokeLinecap="round" />
          {/* Axe Blades (Double Head) */}
          <path
            d="M 50 -35 Q 75 -20 70 0 Q 75 20 50 35 L 45 10 L 45 -10 Z"
            fill="#334155"
            stroke={primaryColor}
            strokeWidth="2"
          />
          <path
            d="M 52 -28 Q 68 -15 65 0 Q 68 15 52 28"
            stroke="#f8fafc"
            strokeWidth="2"
            fill="none"
          />
        </g>
      </g>
    );
  }

  if (weapon === 'bow') {
    return (
      <g>
        {/* Arm drawing bow */}
        <path
          d={isAttacking ? 'M 130 110 L 175 110' : 'M 130 110 L 150 140'}
          stroke="#1e293b"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Bow Arc */}
        <g transform={isAttacking ? 'translate(170, 70)' : 'translate(150, 110) rotate(20)'}>
          <path d="M 0 0 Q 25 45 0 90" stroke="#a855f7" strokeWidth="5" fill="none" strokeLinecap="round" />
          <line x1="0" y1="0" x2="0" y2="90" stroke="#cbd5e1" strokeWidth="1" />
          {/* Arrow */}
          <line x1="-20" y1="45" x2="40" y2="45" stroke="#f1f5f9" strokeWidth="2.5" />
          <polygon points="40,40 50,45 40,50" fill={primaryColor} />
        </g>
      </g>
    );
  }

  if (weapon === 'spear') {
    return (
      <g>
        {/* Arm */}
        <path
          d={isAttacking ? 'M 130 110 L 180 110' : 'M 130 110 L 145 145'}
          stroke="#1e293b"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Spear */}
        <g transform={isAttacking ? 'translate(120, 110)' : 'translate(110, 130) rotate(-35)'}>
          <line x1="-50" y1="0" x2="110" y2="0" stroke="#713f12" strokeWidth="5" strokeLinecap="round" />
          {/* Spearhead */}
          <polygon points="110,-10 145,0 110,10 115,0" fill="#cbd5e1" stroke={primaryColor} strokeWidth="2" />
        </g>
      </g>
    );
  }

  if (weapon === 'energy') {
    return (
      <g>
        {/* Arm */}
        <path
          d={isAttacking ? 'M 130 110 L 165 95' : 'M 130 110 L 145 145'}
          stroke="#1e293b"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Plasma Hilt & Blade */}
        <g transform={isAttacking ? 'translate(165, 95) rotate(45)' : 'translate(145, 145) rotate(-30)'}>
          <rect x="-10" y="-4" width="22" height="8" rx="2" fill="#0f172a" stroke="#64748b" strokeWidth="1.5" />
          {/* Glowing Energy Blade */}
          <rect
            x="12"
            y="-4"
            width="85"
            height="8"
            rx="4"
            fill="#ffffff"
            stroke={primaryColor}
            strokeWidth="3"
            style={{ filter: `drop-shadow(0 0 10px ${primaryColor})` }}
          />
        </g>
      </g>
    );
  }

  // Default: Broadsword
  return (
    <g>
      {/* Arm */}
      <path
        d={isAttacking ? 'M 130 110 L 165 95 L 185 80' : 'M 130 110 L 145 145 L 160 165'}
        stroke="#1e293b"
        strokeWidth="12"
        strokeLinecap="round"
      />
      {/* Broadsword */}
      <g
        transform={
          isAttacking
            ? 'translate(180, 80) rotate(55)'
            : 'translate(155, 155) rotate(-25)'
        }
      >
        {/* Crossguard */}
        <rect x="-8" y="-12" width="6" height="24" rx="1.5" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
        {/* Grip & Pommel */}
        <line x1="-8" y1="0" x2="-22" y2="0" stroke="#78350f" strokeWidth="5" />
        <circle cx="-23" cy="0" r="4" fill="#64748b" />
        {/* Steel Blade */}
        <polygon
          points="-2,-6 85,-4 100,0 85,4 -2,6"
          fill="#e2e8f0"
          stroke={primaryColor}
          strokeWidth="1.5"
          style={{ filter: `drop-shadow(0 0 6px ${primaryColor})` }}
        />
        {/* Center Fuller Groove */}
        <line x1="5" y1="0" x2="80" y2="0" stroke="#94a3b8" strokeWidth="1.5" />
      </g>
    </g>
  );
}
