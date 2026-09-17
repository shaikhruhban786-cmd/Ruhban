/**
 * TypingEngine Component
 * High-performance real-time typing engine with zero input lag.
 * Character-by-character color-coded feedback, auto-focus, WPM & accuracy tracking,
 * and real-time attack trigger dispatching.
 */

import React, { useEffect, useRef, useState } from 'react';
import { soundEngine } from '../services/soundEngine';
import { AttackComboTier } from '../types';

interface TypingEngineProps {
  sentence: string;
  isActive: boolean;
  onCharacterTyped: (char: string, isCorrect: boolean, currentWpm: number, combo: number) => void;
  onAttackTrigger: (tier: AttackComboTier, isCritical: boolean, damageMultiplier: number) => void;
  onMistake: () => void;
  onComplete: (stats: {
    wpm: number;
    rawWpm: number;
    accuracy: number;
    errors: number;
    charactersTyped: number;
    elapsedSeconds: number;
    maxCombo: number;
  }) => void;
  comboCount: number;
  currentWpm: number;
  accuracy: number;
  errorCount: number;
}

export const TypingEngine: React.FC<TypingEngineProps> = ({
  sentence,
  isActive,
  onCharacterTyped,
  onAttackTrigger,
  onMistake,
  onComplete,
  comboCount,
  currentWpm,
  accuracy,
  errorCount,
}) => {
  const [typedText, setTypedText] = useState<string>('');
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [isErrorOnCurrent, setIsErrorOnCurrent] = useState<boolean>(false);

  const startTimeRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const correctCountRef = useRef<number>(0);
  const errorCountRef = useRef<number>(0);
  const maxComboRef = useRef<number>(0);
  const lastKeyTimeRef = useRef<number>(Date.now());
  const wordsProgressRef = useRef<number>(0);

  // Auto-focus input on mount or whenever active
  useEffect(() => {
    if (isActive) {
      inputRef.current?.focus();
    }
  }, [isActive]);

  // Keep focus on window click unless user is clicking a button
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (!isActive) return;
      const target = e.target as HTMLElement;
      if (target.tagName !== 'BUTTON' && !target.closest('button')) {
        inputRef.current?.focus();
      }
    };
    window.addEventListener('click', handleDocumentClick);
    return () => window.removeEventListener('click', handleDocumentClick);
  }, [isActive]);

  const currentIndex = typedText.length;
  const targetChar = sentence[currentIndex] || '';

  // Handle keystroke directly
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isActive) return;

    // Ignore modifier keys
    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(e.key)) {
      return;
    }

    // Allow backspace
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (typedText.length > 0) {
        setTypedText((prev) => prev.slice(0, -1));
        setIsErrorOnCurrent(false);
      }
      return;
    }

    if (e.key.length !== 1) return; // ignore other function keys
    e.preventDefault();

    const now = Date.now();
    if (!hasStarted) {
      setHasStarted(true);
      startTimeRef.current = now;
    }

    const key = e.key;
    const isCorrect = key === targetChar;

    if (isCorrect) {
      soundEngine.playKeyClick(key);
      correctCountRef.current++;
      setIsErrorOnCurrent(false);

      const newTyped = typedText + key;
      setTypedText(newTyped);

      const newCombo = comboCount + 1;
      maxComboRef.current = Math.max(maxComboRef.current, newCombo);

      // Real-time WPM calculation: (correct / 5) / (minutes)
      const elapsedMinutes = Math.max(0.02, (now - (startTimeRef.current || now)) / 60000);
      const calculatedWpm = Math.round(correctCountRef.current / 5 / elapsedMinutes);

      // Call character typed
      onCharacterTyped(key, true, calculatedWpm, newCombo);

      // Check combo milestones
      let comboTier: AttackComboTier = 'NORMAL';
      if (newCombo >= 50) {
        comboTier = 'FURY_MODE';
      } else if (newCombo >= 30) {
        comboTier = 'SPECIAL_ATTACK';
      } else if (newCombo >= 20) {
        comboTier = 'POWER_ATTACK';
      } else if (newCombo >= 10) {
        comboTier = 'QUICK_STRIKE';
      }

      // Trigger weapon attack animations every word boundary or every 3 characters in high speed
      const isWordBoundary = key === ' ';
      const isRapidStrike = calculatedWpm > 70 && newTyped.length % 3 === 0;

      if (isWordBoundary || isRapidStrike || newCombo % 10 === 0) {
        wordsProgressRef.current++;
        const isCritical = calculatedWpm >= 80 && (accuracy >= 96 || newCombo >= 20);
        const damageMultiplier = calculatedWpm > 90 ? 1.6 : calculatedWpm > 60 ? 1.25 : 1.0;
        onAttackTrigger(comboTier, isCritical, damageMultiplier);
      }

      // Check if sentence is completed!
      if (newTyped.length >= sentence.length) {
        const totalElapsedSeconds = Math.max(1, (now - (startTimeRef.current || now)) / 1000);
        const finalAccuracy = Math.round(
          (correctCountRef.current / (correctCountRef.current + errorCountRef.current || 1)) * 100
        );
        const finalWpm = Math.round(correctCountRef.current / 5 / (totalElapsedSeconds / 60));
        const rawWpm = Math.round(
          (correctCountRef.current + errorCountRef.current) / 5 / (totalElapsedSeconds / 60)
        );

        onComplete({
          wpm: finalWpm,
          rawWpm,
          accuracy: finalAccuracy,
          errors: errorCountRef.current,
          charactersTyped: newTyped.length,
          elapsedSeconds: totalElapsedSeconds,
          maxCombo: maxComboRef.current,
        });
      }
    } else {
      // Mistake!
      soundEngine.playKeyError();
      errorCountRef.current++;
      setIsErrorOnCurrent(true);
      onMistake();
      onCharacterTyped(key, false, currentWpm, 0);
    }

    lastKeyTimeRef.current = now;
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="relative w-full max-w-4xl mx-auto rounded-xl p-4 sm:p-6 bg-zinc-950/80 border border-zinc-800/90 shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-md cursor-text transition-all duration-200 hover:border-zinc-700 select-none"
    >
      {/* Invisible auto-focused typing input */}
      <input
        ref={inputRef}
        type="text"
        value=""
        onChange={() => {}}
        onKeyDown={handleKeyDown}
        className="absolute inset-0 opacity-0 pointer-events-auto cursor-text w-full h-full"
        autoFocus
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        aria-label="Typing battle input"
      />

      {/* Prominent Text Display Box */}
      <div className="relative font-typing text-lg sm:text-2xl md:text-3xl leading-relaxed tracking-wider break-words">
        {sentence.split('').map((char, index) => {
          let charState = 'remaining';
          if (index < typedText.length) {
            charState = 'correct';
          } else if (index === typedText.length) {
            charState = isErrorOnCurrent ? 'error' : 'current';
          }

          if (charState === 'correct') {
            return (
              <span
                key={index}
                className="text-sky-400 font-bold transition-colors duration-75 drop-shadow-[0_0_8px_rgba(56,189,248,0.7)]"
              >
                {char}
              </span>
            );
          }

          if (charState === 'error') {
            return (
              <span
                key={index}
                className="bg-red-600/90 text-white rounded px-0.5 animate-shake-light shadow-[0_0_12px_rgba(239,68,68,0.9)]"
              >
                {char === ' ' ? '␣' : char}
              </span>
            );
          }

          if (charState === 'current') {
            return (
              <span
                key={index}
                className="relative inline-block bg-sky-500/30 text-white border-b-4 border-sky-400 font-bold rounded-t px-0.5 animate-pulse shadow-[0_0_15px_rgba(56,189,248,0.8)]"
              >
                {char === ' ' ? '␣' : char}
                <span className="absolute -bottom-1 left-0 right-0 h-1 bg-sky-300 animate-ping" />
              </span>
            );
          }

          // Remaining characters
          return (
            <span key={index} className="text-zinc-500/80 font-normal">
              {char}
            </span>
          );
        })}
      </div>

      {/* Helper instruction footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-800/80 text-xs text-zinc-400 font-mono">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>TYPE RAPIDLY TO ATTACK • MISTAKES TRIGGER COUNTER-STRIKES</span>
        </div>
        <div className="flex items-center gap-3">
          <span>PROGRESS: {Math.round((typedText.length / sentence.length) * 100)}%</span>
          <span>{typedText.length}/{sentence.length} CHARS</span>
        </div>
      </div>
    </div>
  );
};
