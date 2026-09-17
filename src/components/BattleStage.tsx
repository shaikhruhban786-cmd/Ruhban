/**
 * BattleStage Component
 * High-immersion interactive battlefield with dynamic environmental effects,
 * real-time particle rendering, weapon strike arcs, and floating damage numbers.
 */

import React, { useEffect, useRef } from 'react';
import { CharacterSprite } from './CharacterSprites';
import { HealthBar } from './HealthBar';
import { DamageNumber, LevelInfo, WeaponType } from '../types';

interface BattleStageProps {
  level: LevelInfo;
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
  playerWeapon: WeaponType;
  playerAction: 'idle' | 'attack' | 'heavy_attack' | 'hit' | 'dead';
  enemyAction: 'idle' | 'attack' | 'heavy_attack' | 'hit' | 'dead';
  damageNumbers: DamageNumber[];
  isFuryMode: boolean;
  screenShake: 'none' | 'light' | 'heavy';
  comboCount: number;
  comboTier: string;
  isVictoryFreeze: boolean;
}

export const BattleStage: React.FC<BattleStageProps> = ({
  level,
  playerHp,
  playerMaxHp,
  enemyHp,
  enemyMaxHp,
  playerWeapon,
  playerAction,
  enemyAction,
  damageNumbers,
  isFuryMode,
  screenShake,
  comboCount,
  comboTier,
  isVictoryFreeze,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Canvas particle engine for environmental atmospheric dust, fog, and sparks
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 400);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle setup
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      color: string;
      life: number;
      maxLife: number;
    }

    const particles: Particle[] = [];
    const maxParticles = isFuryMode ? 55 : 35;

    for (let i = 0; i < maxParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8 + (level.backgroundTheme === 'fire' ? 0.4 : 0),
        vy: -0.3 - Math.random() * 0.8,
        size: Math.random() * 2.5 + 1,
        alpha: Math.random() * 0.7 + 0.2,
        color: level.sparksColor || '#60a5fa',
        life: Math.random() * 100,
        maxLife: 100 + Math.random() * 100,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render floating sparks & atmospheric embers
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        if (p.life > p.maxLife || p.y < -10 || p.x < -10 || p.x > width + 10) {
          p.x = Math.random() * width;
          p.y = height + 10;
          p.life = 0;
          p.alpha = Math.random() * 0.7 + 0.3;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // If attack action is happening, draw dynamic weapon strike slice
      if (playerAction === 'attack' || playerAction === 'heavy_attack') {
        ctx.save();
        ctx.strokeStyle = isFuryMode ? '#f87171' : '#38bdf8';
        ctx.lineWidth = playerAction === 'heavy_attack' ? 5 : 3;
        ctx.shadowColor = isFuryMode ? '#ef4444' : '#0284c7';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        // Dynamic slash arc between characters
        const startX = width * 0.42;
        const startY = height * 0.4;
        const endX = width * 0.62;
        const endY = height * 0.65;
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(width * 0.58, height * 0.45, endX, endY);
        ctx.stroke();
        ctx.restore();
      }

      // If enemy attack is happening
      if (enemyAction === 'attack' || enemyAction === 'heavy_attack') {
        ctx.save();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#dc2626';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        const startX = width * 0.58;
        const startY = height * 0.45;
        const endX = width * 0.38;
        const endY = height * 0.62;
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(width * 0.42, height * 0.5, endX, endY);
        ctx.stroke();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [level, isFuryMode, playerAction, enemyAction]);

  // Environment styling classes depending on theme
  const getThemeBackground = () => {
    switch (level.backgroundTheme) {
      case 'ancient':
        return 'from-[#1a0a0a] via-[#0d0707] to-[#050303]';
      case 'castle':
        return 'from-[#140b24] via-[#0a0512] to-[#040207]';
      case 'fire':
        return 'from-[#290d05] via-[#140702] to-[#060201]';
      case 'forest':
        return 'from-[#051a0d] via-[#020d06] to-[#010603]';
      case 'cyber':
        return 'from-[#031c26] via-[#020e14] to-[#010609]';
      case 'boss':
        return 'from-[#2e0404] via-[#170202] to-[#070101]';
      case 'training':
      default:
        return 'from-[#0a1424] via-[#060c17] to-[#02050a]';
    }
  };

  const shakeClass =
    screenShake === 'heavy'
      ? 'animate-shake-heavy'
      : screenShake === 'light'
      ? 'animate-shake-light'
      : '';

  return (
    <div
      className={`relative w-full h-[260px] sm:h-[300px] md:h-[350px] lg:h-[390px] rounded-2xl overflow-hidden border border-zinc-800/80 bg-gradient-to-b ${getThemeBackground()} select-none shadow-[0_15px_40px_rgba(0,0,0,0.8)] ${shakeClass} ${
        isVictoryFreeze ? 'filter brightness-110' : ''
      }`}
    >
      {/* Background Environmental Art / Silhouettes */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        {/* Distant Mountains / Citadel silhouette */}
        <svg viewBox="0 0 1000 300" preserveAspectRatio="none" className="w-full h-full">
          <polygon
            points="0,300 0,180 80,120 180,190 260,110 380,210 500,90 620,180 720,130 840,210 920,140 1000,190 1000,300"
            fill="#05070d"
          />
          {/* Cyber Arena Grid Lines if cyber theme */}
          {level.backgroundTheme === 'cyber' && (
            <g stroke="#0891b2" strokeWidth="0.8" opacity="0.4">
              <line x1="0" y1="280" x2="1000" y2="280" />
              <line x1="0" y1="240" x2="1000" y2="240" />
              <line x1="100" y1="200" x2="0" y2="300" />
              <line x1="300" y1="200" x2="200" y2="300" />
              <line x1="500" y1="200" x2="500" y2="300" />
              <line x1="700" y1="200" x2="800" y2="300" />
              <line x1="900" y1="200" x2="1000" y2="300" />
            </g>
          )}
        </svg>
      </div>

      {/* Atmospheric Fog / Lighting Gradients */}
      <div
        className="absolute inset-0 pointer-events-none mix-blend-screen opacity-70"
        style={{
          background: `radial-gradient(circle at 50% 70%, ${level.ambientFogColor} 0%, transparent 75%)`,
        }}
      />

      {/* Canvas for Sparks, Embers, and Strike Arcs */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />

      {/* Ground Battle Platform */}
      <div className="absolute inset-x-0 bottom-0 h-16 md:h-20 bg-gradient-to-t from-zinc-950 via-zinc-900/90 to-transparent border-t border-zinc-800/40 z-0">
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent" />
      </div>

      {/* TOP HEADER: Player & Enemy Health Bars */}
      <div className="absolute top-3 inset-x-4 sm:inset-x-8 flex items-start justify-between z-20 pointer-events-none">
        <HealthBar
          currentHp={playerHp}
          maxHp={playerMaxHp}
          name="WARRIOR (YOU)"
          title={`Equipped: ${playerWeapon.toUpperCase()}`}
          isPlayer={true}
        />

        {/* Center Versus Emblem */}
        <div className="hidden sm:flex flex-col items-center px-3 pt-1">
          <span className="font-cinzel text-xs font-black tracking-widest text-zinc-400 drop-shadow">
            VS
          </span>
          <div className="w-8 h-[1px] bg-zinc-600/70 mt-0.5" />
        </div>

        <HealthBar
          currentHp={enemyHp}
          maxHp={enemyMaxHp}
          name={level.enemy.name}
          title={level.enemy.title}
          isPlayer={false}
          color={level.enemy.color}
        />
      </div>

      {/* MIDDLE: 1V1 CHARACTERS FACING EACH OTHER */}
      <div className="absolute inset-x-4 sm:inset-x-12 bottom-6 md:bottom-8 flex items-end justify-between z-15 pointer-events-none">
        {/* Left: Player Character */}
        <div className="flex flex-col items-center">
          <CharacterSprite
            isPlayer={true}
            weapon={playerWeapon}
            actionState={playerAction}
            isFuryMode={isFuryMode}
          />
        </div>

        {/* Center: Real-Time Combo / Attack Milestone Callout */}
        <div className="flex flex-col items-center justify-center mb-16 pointer-events-none z-20">
          {comboCount >= 5 && (
            <div className="flex flex-col items-center animate-bounce">
              <span className="font-rajdhani font-black text-2xl md:text-4xl text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)] tracking-wider">
                {comboCount}x COMBO!
              </span>
              {comboTier !== 'NORMAL' && (
                <span className="px-2.5 py-0.5 mt-1 rounded bg-red-950/80 border border-red-500/80 text-red-300 font-cinzel text-xs font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                  ⚡ {comboTier.replace('_', ' ')}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right: Enemy Character */}
        <div className="flex flex-col items-center">
          <CharacterSprite
            isPlayer={false}
            weapon={level.enemy.weapon}
            actionState={enemyAction}
            enemyType={level.enemy.id}
            color={level.enemy.color}
          />
        </div>
      </div>

      {/* Floating Damage Numbers */}
      <div className="absolute inset-0 pointer-events-none z-30">
        {damageNumbers.map((dmg) => (
          <div
            key={dmg.id}
            className={`absolute font-black font-rajdhani animate-out fade-out slide-out-to-top duration-700 select-none ${
              dmg.isCritical
                ? 'text-3xl md:text-4xl text-yellow-300 drop-shadow-[0_0_12px_rgba(234,179,8,1)]'
                : 'text-2xl md:text-3xl text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]'
            }`}
            style={{
              left: `${dmg.x}%`,
              top: `${dmg.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {dmg.isCritical ? `💥 CRITICAL -${dmg.amount}!` : `-${dmg.amount}`}
          </div>
        ))}
      </div>

      {/* Victory Cinematic Overlay Freeze */}
      {isVictoryFreeze && (
        <div className="absolute inset-0 bg-sky-950/40 backdrop-blur-[1px] flex flex-col items-center justify-center z-40 animate-in fade-in duration-300">
          <span className="font-cinzel text-4xl sm:text-6xl font-black text-amber-300 tracking-widest drop-shadow-[0_0_25px_rgba(251,191,36,0.9)] animate-pulse">
            VICTORY!
          </span>
          <span className="font-rajdhani text-sm sm:text-lg text-sky-200 uppercase tracking-widest mt-2">
            Target Neutralized • Calculating Battle Rewards
          </span>
        </div>
      )}
    </div>
  );
};
