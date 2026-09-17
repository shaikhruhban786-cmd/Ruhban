/**
 * BattleArena Component
 * Master battle controller: manages countdown, 1v1 warrior combat loop,
 * real-time typing attack triggers, enemy retaliations, floating numbers,
 * pause overlay, and cinematic freeze finishing.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Pause, Volume2, VolumeX } from 'lucide-react';
import { BattleStage } from './BattleStage';
import { TypingEngine } from './TypingEngine';
import { HUD } from './HUD';
import { PauseMenu } from './PauseMenu';
import {
  AttackComboTier,
  BattleResult,
  DamageNumber,
  GameSettings,
  LevelInfo,
  WeaponType,
} from '../types';
import { WEAPONS_DATA } from '../data/battleData';
import { soundEngine } from '../services/soundEngine';

interface BattleArenaProps {
  level: LevelInfo;
  playerWeapon: WeaponType;
  settings: GameSettings;
  onFinishBattle: (result: BattleResult) => void;
  onExitToMenu: () => void;
  onOpenSettings: () => void;
}

export const BattleArena: React.FC<BattleArenaProps> = ({
  level,
  playerWeapon,
  settings,
  onFinishBattle,
  onExitToMenu,
  onOpenSettings,
}) => {
  // Battle state
  const [countdown, setCountdown] = useState<number | null>(3); // 3, 2, 1, 0 (FIGHT), null (active)
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isVictoryFreeze, setIsVictoryFreeze] = useState<boolean>(false);

  // Health
  const playerMaxHp = 100;
  const enemyMaxHp = level.enemy.health;
  const [playerHp, setPlayerHp] = useState<number>(playerMaxHp);
  const [enemyHp, setEnemyHp] = useState<number>(enemyMaxHp);

  // Action states for characters
  const [playerAction, setPlayerAction] = useState<
    'idle' | 'attack' | 'heavy_attack' | 'hit' | 'dead'
  >('idle');
  const [enemyAction, setEnemyAction] = useState<
    'idle' | 'attack' | 'heavy_attack' | 'hit' | 'dead'
  >('idle');

  // Typing & Performance
  const [wpm, setWpm] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(100);
  const [errors, setErrors] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [comboTier, setComboTier] = useState<AttackComboTier>('NORMAL');
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [totalDamageDealt, setTotalDamageDealt] = useState<number>(0);

  // FX
  const [damageNumbers, setDamageNumbers] = useState<DamageNumber[]>([]);
  const [screenShake, setScreenShake] = useState<'none' | 'light' | 'heavy'>('none');

  // Timers & Refs
  const battleStartTimeRef = useRef<number | null>(null);
  const lastTypingTimeRef = useRef<number>(Date.now());
  const enemyAttackTimerRef = useRef<number | null>(null);
  const isBattleConcludedRef = useRef<boolean>(false);

  const weaponInfo =
    WEAPONS_DATA.find((w) => w.id === playerWeapon) || WEAPONS_DATA[0];

  // --- 1. COUNTDOWN SEQUENCE (3, 2, 1, FIGHT!) ---
  useEffect(() => {
    let timer: number;
    if (countdown !== null && countdown > 0) {
      soundEngine.playKeyClick();
      timer = window.setTimeout(() => {
        setCountdown((prev) => (prev !== null ? prev - 1 : null));
      }, 800);
    } else if (countdown === 0) {
      soundEngine.playAttack(playerWeapon, true);
      timer = window.setTimeout(() => {
        setCountdown(null);
        battleStartTimeRef.current = Date.now();
        lastTypingTimeRef.current = Date.now();
        if (settings.musicEnabled) {
          soundEngine.startBattleMusic();
        }
      }, 600);
    }
    return () => clearTimeout(timer);
  }, [countdown, playerWeapon, settings.musicEnabled]);

  // --- 2. BATTLE CLOCK LOOP ---
  useEffect(() => {
    let interval: number;
    if (countdown === null && !isPaused && !isVictoryFreeze) {
      interval = window.setInterval(() => {
        if (battleStartTimeRef.current) {
          const secs = Math.floor((Date.now() - battleStartTimeRef.current) / 1000);
          setElapsedTime(secs);
        }
      }, 500);
    }
    return () => clearInterval(interval);
  }, [countdown, isPaused, isVictoryFreeze]);

  // --- 3. ENEMY RETALIATION TIMERS (WHEN PLAYER PAUSES OR HESITATES) ---
  useEffect(() => {
    if (countdown !== null || isPaused || isVictoryFreeze || isBattleConcludedRef.current) {
      if (enemyAttackTimerRef.current) clearInterval(enemyAttackTimerRef.current);
      return;
    }

    enemyAttackTimerRef.current = window.setInterval(() => {
      const now = Date.now();
      const idleTime = now - lastTypingTimeRef.current;

      // If player paused for more than 2.2 seconds or enemy interval reached
      if (idleTime > 2200) {
        triggerEnemyAttack();
      }
    }, level.enemy.attackInterval);

    return () => {
      if (enemyAttackTimerRef.current) clearInterval(enemyAttackTimerRef.current);
    };
  }, [countdown, isPaused, isVictoryFreeze, level.enemy]);

  // --- 4. ESC KEY TO PAUSE ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && countdown === null && !isVictoryFreeze) {
        setIsPaused((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [countdown, isVictoryFreeze]);

  // Cleanup music on unmount
  useEffect(() => {
    return () => {
      soundEngine.stopBattleMusic();
    };
  }, []);

  // --- ATTACK TRIGGER FROM TYPING ENGINE ---
  const handleAttackTrigger = (
    tier: AttackComboTier,
    isCritical: boolean,
    speedMultiplier: number
  ) => {
    if (isBattleConcludedRef.current || isVictoryFreeze) return;

    lastTypingTimeRef.current = Date.now();
    setComboTier(tier);

    // Calculate base damage influenced by speed & weapon
    const baseDamage = 10 * weaponInfo.damageMultiplier * speedMultiplier;
    const finalDamage = Math.round(isCritical ? baseDamage * 1.8 : baseDamage);

    // Character attack animation
    setPlayerAction(isCritical || tier === 'FURY_MODE' ? 'heavy_attack' : 'attack');
    soundEngine.playAttack(playerWeapon, isCritical);

    setTimeout(() => {
      if (!isBattleConcludedRef.current) {
        setPlayerAction('idle');
      }
    }, 180);

    // Enemy hit reaction
    setTimeout(() => {
      if (isBattleConcludedRef.current) return;
      setEnemyAction('hit');
      soundEngine.playHitImpact();

      // Screen shake
      if (settings.screenShake && isCritical) {
        setScreenShake('heavy');
        setTimeout(() => setScreenShake('none'), 350);
      } else if (settings.screenShake) {
        setScreenShake('light');
        setTimeout(() => setScreenShake('none'), 200);
      }

      // Enemy takes damage
      setEnemyHp((prev) => {
        const next = Math.max(0, prev - finalDamage);
        return next;
      });

      setTotalDamageDealt((prev) => prev + finalDamage);

      // Spawn floating damage text on enemy (right side)
      spawnDamageNumber(finalDamage, isCritical, 68 + Math.random() * 8, 45 + Math.random() * 10);

      setTimeout(() => {
        if (!isBattleConcludedRef.current) setEnemyAction('idle');
      }, 180);
    }, 90);
  };

  // --- ENEMY ATTACK RETALIATION ---
  const triggerEnemyAttack = () => {
    if (isBattleConcludedRef.current || isVictoryFreeze) return;

    setEnemyAction('attack');
    soundEngine.playEnemyStrike();

    setTimeout(() => {
      if (isBattleConcludedRef.current) return;
      setEnemyAction('idle');

      // Player hit reaction
      setPlayerAction('hit');
      soundEngine.playHitImpact();

      if (settings.screenShake) {
        setScreenShake('light');
        setTimeout(() => setScreenShake('none'), 200);
      }

      const enemyDmg = level.enemy.attackDamage;
      setPlayerHp((prev) => {
        const next = Math.max(0, prev - enemyDmg);
        if (next <= 0) {
          // Player Defeat!
          handleBattleDefeat();
        }
        return next;
      });

      // Spawn floating damage text on player
      spawnDamageNumber(enemyDmg, false, 28 + Math.random() * 6, 45 + Math.random() * 10);

      setTimeout(() => {
        if (!isBattleConcludedRef.current) setPlayerAction('idle');
      }, 200);
    }, 160);
  };

  // --- TYPING MISTAKE HANDLER ---
  const handleMistake = () => {
    if (isBattleConcludedRef.current) return;
    setErrors((prev) => prev + 1);
    setCombo(0);
    // Mistake gives enemy chance to strike immediately
    triggerEnemyAttack();
  };

  const handleCharacterTyped = (
    _char: string,
    isCorrect: boolean,
    currentWpm: number,
    newCombo: number
  ) => {
    if (isBattleConcludedRef.current) return;
    setWpm(currentWpm);
    if (isCorrect) {
      setCombo(newCombo);
      setMaxCombo((prev) => Math.max(prev, newCombo));

      // Trigger milestone sound at 10, 20, 30, 50
      if ([10, 20, 30, 50].includes(newCombo)) {
        soundEngine.playComboMilestone(Math.floor(newCombo / 10));
      }
    }
  };

  const spawnDamageNumber = (amount: number, isCritical: boolean, x: number, y: number) => {
    const id = Math.random().toString(36).substring(2, 9);
    setDamageNumbers((prev) => [...prev, { id, amount, isCritical, x, y, color: '#f87171' }]);
    setTimeout(() => {
      setDamageNumbers((prev) => prev.filter((d) => d.id !== id));
    }, 700);
  };

  // --- COMPLETION: TYPING COMPLETION = BATTLE STOP ---
  const handleComplete = (stats: {
    wpm: number;
    rawWpm: number;
    accuracy: number;
    errors: number;
    charactersTyped: number;
    elapsedSeconds: number;
    maxCombo: number;
  }) => {
    if (isBattleConcludedRef.current) return;
    isBattleConcludedRef.current = true;

    // Immediately stop combat and battle movement
    soundEngine.stopBattleMusic();
    if (enemyAttackTimerRef.current) clearInterval(enemyAttackTimerRef.current);

    // Trigger final lethal attack
    setPlayerAction('heavy_attack');
    setEnemyAction('dead');
    soundEngine.playAttack(playerWeapon, true);
    setEnemyHp(0);

    // Freeze screen in slow motion
    setIsVictoryFreeze(true);

    // Grade calculation
    let grade: 'S+' | 'S' | 'A' | 'B' | 'C' | 'D' = 'B';
    if (stats.wpm >= 90 && stats.accuracy >= 97) grade = 'S+';
    else if (stats.wpm >= 75 && stats.accuracy >= 95) grade = 'S';
    else if (stats.wpm >= 55 && stats.accuracy >= 90) grade = 'A';
    else if (stats.wpm >= 40) grade = 'B';
    else if (stats.wpm >= 25) grade = 'C';
    else grade = 'D';

    const xpGained = Math.round(stats.wpm * 10 + stats.accuracy * 5 + stats.maxCombo * 8);

    // Transition to result screen after brief cinematic freeze
    setTimeout(() => {
      onFinishBattle({
        won: true,
        levelId: level.id,
        levelName: level.name,
        enemyName: level.enemy.name,
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        errors: stats.errors,
        charactersTyped: stats.charactersTyped,
        timeSec: stats.elapsedSeconds,
        maxCombo: stats.maxCombo,
        damageDealt: totalDamageDealt + 50,
        performanceGrade: grade,
        xpGained,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    }, 1200);
  };

  // Handle Player Defeat
  const handleBattleDefeat = () => {
    if (isBattleConcludedRef.current) return;
    isBattleConcludedRef.current = true;
    soundEngine.stopBattleMusic();
    if (enemyAttackTimerRef.current) clearInterval(enemyAttackTimerRef.current);

    setPlayerAction('dead');

    setTimeout(() => {
      onFinishBattle({
        won: false,
        levelId: level.id,
        levelName: level.name,
        enemyName: level.enemy.name,
        wpm: wpm || 25,
        accuracy: accuracy || 80,
        errors: errors + 1,
        charactersTyped: Math.round(level.sentencePrompt.length * 0.4),
        timeSec: elapsedTime || 10,
        maxCombo: maxCombo,
        damageDealt: totalDamageDealt,
        performanceGrade: 'D',
        xpGained: 50,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    }, 1000);
  };

  const handleRestart = () => {
    setIsPaused(false);
    isBattleConcludedRef.current = false;
    setPlayerHp(playerMaxHp);
    setEnemyHp(enemyMaxHp);
    setCountdown(3);
    setWpm(0);
    setAccuracy(100);
    setErrors(0);
    setCombo(0);
    setMaxCombo(0);
    setElapsedTime(0);
    setTotalDamageDealt(0);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#05060a] p-2 sm:p-4 md:p-6 flex flex-col justify-between select-none">
      {/* Top Header Bar with Level title, pause button & volume */}
      <div className="flex items-center justify-between max-w-5xl mx-auto w-full mb-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-amber-400 font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/40">
            LEVEL {level.id}
          </span>
          <span className="font-cinzel text-sm sm:text-base font-bold text-zinc-200">
            {level.name}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundEngine.playButtonClick();
              setIsPaused(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-cinzel font-bold cursor-pointer transition-colors"
          >
            <Pause className="w-3.5 h-3.5" />
            <span>PAUSE [ESC]</span>
          </button>
        </div>
      </div>

      {/* TOP AREA: 1V1 CHARACTERS BATTLE STAGE & HEALTH BARS */}
      <div className="w-full max-w-5xl mx-auto mb-2">
        <BattleStage
          level={level}
          playerHp={playerHp}
          playerMaxHp={playerMaxHp}
          enemyHp={enemyHp}
          enemyMaxHp={enemyMaxHp}
          playerWeapon={playerWeapon}
          playerAction={playerAction}
          enemyAction={enemyAction}
          damageNumbers={damageNumbers}
          isFuryMode={comboTier === 'FURY_MODE' || wpm >= 90}
          screenShake={screenShake}
          comboCount={combo}
          comboTier={comboTier}
          isVictoryFreeze={isVictoryFreeze}
        />
      </div>

      {/* HUD: REAL-TIME WPM, ACCURACY, ERRORS, AND COMBO */}
      <HUD
        wpm={wpm}
        accuracy={accuracy}
        errors={errors}
        combo={combo}
        comboTier={comboTier}
        elapsedTime={elapsedTime}
        isFuryMode={comboTier === 'FURY_MODE' || wpm >= 90}
      />

      {/* TYPING INTERFACE (LOWER-MIDDLE SECTION) */}
      <div className="w-full max-w-5xl mx-auto mt-2">
        <TypingEngine
          sentence={level.sentencePrompt}
          isActive={countdown === null && !isPaused && !isVictoryFreeze}
          onCharacterTyped={handleCharacterTyped}
          onAttackTrigger={handleAttackTrigger}
          onMistake={handleMistake}
          onComplete={handleComplete}
          comboCount={combo}
          currentWpm={wpm}
          accuracy={accuracy}
          errorCount={errors}
        />
      </div>

      {/* --- COUNTDOWN OVERLAY (3, 2, 1, FIGHT!) --- */}
      {countdown !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm pointer-events-none">
          <div className="font-cinzel text-7xl sm:text-9xl font-black text-amber-400 drop-shadow-[0_0_40px_rgba(245,158,11,1)] animate-ping">
            {countdown === 0 ? 'FIGHT!' : countdown}
          </div>
        </div>
      )}

      {/* --- PAUSE MENU MODAL --- */}
      {isPaused && (
        <PauseMenu
          onResume={() => setIsPaused(false)}
          onRestart={handleRestart}
          onOpenSettings={onOpenSettings}
          onExit={onExitToMenu}
        />
      )}
    </div>
  );
};
