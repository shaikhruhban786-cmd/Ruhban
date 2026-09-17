/**
 * SpeedTestView Component
 * Dedicated timed speed trial (15s, 30s, 60s, 120s) with live pace gauge
 * and personal best benchmark comparison.
 */

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Clock, Zap, Target, RotateCcw, Trophy } from 'lucide-react';
import { SPEED_TEST_PASSAGES } from '../data/battleData';
import { soundEngine } from '../services/soundEngine';

interface SpeedTestViewProps {
  bestWpm: number;
  onBack: () => void;
  onSaveNewBest?: (newBest: number) => void;
}

export const SpeedTestView: React.FC<SpeedTestViewProps> = ({ bestWpm, onBack, onSaveNewBest }) => {
  const [duration, setDuration] = useState<number>(30); // 15, 30, 60, 120
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [passageIndex, setPassageIndex] = useState<number>(0);
  const [typed, setTyped] = useState<string>('');
  const [wpm, setWpm] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(100);
  const [errors, setErrors] = useState<number>(0);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const correctCountRef = useRef<number>(0);
  const errorCountRef = useRef<number>(0);

  const currentPassage = SPEED_TEST_PASSAGES[passageIndex % SPEED_TEST_PASSAGES.length];

  const resetTest = (newDuration?: number) => {
    const dur = newDuration !== undefined ? newDuration : duration;
    setDuration(dur);
    setTimeLeft(dur);
    setHasStarted(false);
    setIsFinished(false);
    setTyped('');
    setWpm(0);
    setAccuracy(100);
    setErrors(0);
    correctCountRef.current = 0;
    errorCountRef.current = 0;
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // Countdown timer loop
  useEffect(() => {
    let interval: number;
    if (hasStarted && !isFinished && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsFinished(true);
            soundEngine.playVictoryFanfare();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [hasStarted, isFinished, timeLeft]);

  // When finished, check if personal record is beaten
  useEffect(() => {
    if (isFinished && wpm > bestWpm && onSaveNewBest) {
      onSaveNewBest(wpm);
    }
  }, [isFinished, wpm, bestWpm, onSaveNewBest]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isFinished) return;

    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(e.key)) return;

    if (e.key === 'Backspace') {
      e.preventDefault();
      if (typed.length > 0) {
        setTyped((prev) => prev.slice(0, -1));
      }
      return;
    }

    if (e.key.length !== 1) return;
    e.preventDefault();

    if (!hasStarted) {
      setHasStarted(true);
    }

    const targetChar = currentPassage[typed.length];
    const isCorrect = e.key === targetChar;

    if (isCorrect) {
      soundEngine.playKeyClick(e.key);
      correctCountRef.current++;
      const nextTyped = typed + e.key;
      setTyped(nextTyped);

      const elapsed = duration - timeLeft;
      const elapsedMinutes = Math.max(0.015, elapsed / 60);
      const currentWpm = Math.round(correctCountRef.current / 5 / elapsedMinutes);
      setWpm(currentWpm);

      const acc = Math.round(
        (correctCountRef.current / (correctCountRef.current + errorCountRef.current)) * 100
      );
      setAccuracy(acc);

      // Loop to next passage if reached the end before timer
      if (nextTyped.length >= currentPassage.length) {
        setPassageIndex((prev) => prev + 1);
        setTyped('');
      }
    } else {
      soundEngine.playKeyError();
      errorCountRef.current++;
      setErrors((prev) => prev + 1);
      const acc = Math.round(
        (correctCountRef.current / (correctCountRef.current + errorCountRef.current)) * 100
      );
      setAccuracy(acc);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#0a0812] via-[#05040a] to-[#010103] p-4 sm:p-8 select-none flex flex-col justify-between">
      <div className="max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onBack();
            }}
            onMouseEnter={() => soundEngine.playButtonHover()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer font-cinzel text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO MENU</span>
          </button>

          <div className="text-right">
            <h1 className="font-cinzel text-2xl sm:text-3xl font-black text-zinc-100 tracking-wider flex items-center justify-end gap-2">
              <Zap className="w-6 h-6 text-amber-400" />
              <span>SPEED TRIAL</span>
            </h1>
            <p className="font-rajdhani text-xs text-zinc-400 tracking-widest uppercase">
              Personal Best: {bestWpm} WPM
            </p>
          </div>
        </div>

        {/* Time duration tabs */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {[15, 30, 60, 120].map((t) => (
            <button
              key={t}
              onClick={() => {
                soundEngine.playButtonClick();
                resetTest(t);
              }}
              className={`px-4 py-2 rounded-xl font-cinzel font-bold text-xs uppercase transition-all cursor-pointer ${
                duration === t
                  ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
              }`}
            >
              {t} SECONDS
            </button>
          ))}
        </div>

        {/* Top HUD: Big Timer & Live WPM */}
        <div className="flex items-center justify-between gap-4 mb-6 bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4 sm:p-6 backdrop-blur-md">
          {/* Remaining Time */}
          <div className="flex items-center gap-3">
            <Clock className={`w-8 h-8 ${timeLeft <= 5 ? 'text-red-400 animate-ping' : 'text-amber-400'}`} />
            <div className="flex flex-col">
              <span className={`font-rajdhani font-black text-4xl sm:text-5xl ${
                timeLeft <= 5 ? 'text-red-400' : 'text-zinc-100'
              }`}>
                {timeLeft}s
              </span>
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                TIME REMAINING
              </span>
            </div>
          </div>

          {/* Current WPM */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="font-rajdhani font-black text-4xl sm:text-5xl text-sky-300">
                {wpm}
              </span>
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                CURRENT WPM
              </span>
            </div>
            <Zap className="w-8 h-8 text-sky-400" />
          </div>
        </div>

        {/* Typing Passage Canvas */}
        {!isFinished ? (
          <div
            onClick={() => inputRef.current?.focus()}
            className="relative rounded-2xl bg-zinc-950/90 border border-zinc-800 p-6 sm:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.8)] backdrop-blur-md cursor-text min-h-[160px]"
          >
            <input
              ref={inputRef}
              type="text"
              value=""
              onChange={() => {}}
              onKeyDown={handleKeyDown}
              className="absolute inset-0 opacity-0 pointer-events-auto cursor-text w-full h-full"
              autoFocus
            />

            <div className="font-typing text-xl sm:text-2xl md:text-3xl leading-relaxed tracking-wider">
              {currentPassage.split('').map((char, index) => {
                const isTyped = index < typed.length;
                const isCurrent = index === typed.length;

                if (isTyped) {
                  return (
                    <span key={index} className="text-amber-400 font-bold">
                      {char}
                    </span>
                  );
                }
                if (isCurrent) {
                  return (
                    <span
                      key={index}
                      className="relative bg-amber-500/30 text-white border-b-4 border-amber-400 font-bold px-0.5"
                    >
                      {char === ' ' ? '␣' : char}
                    </span>
                  );
                }
                return (
                  <span key={index} className="text-zinc-600">
                    {char}
                  </span>
                );
              })}
            </div>
          </div>
        ) : (
          /* Finished Result Card */
          <div className="rounded-3xl bg-zinc-950 border border-amber-500/60 p-8 sm:p-12 shadow-[0_20px_50px_rgba(245,158,11,0.2)] flex flex-col items-center text-center animate-in zoom-in-95">
            <Trophy className="w-16 h-16 text-amber-400 mb-4 animate-bounce" />
            <h2 className="font-cinzel text-3xl sm:text-4xl font-black text-amber-300 mb-2">
              TIME EXPIRED!
            </h2>
            <p className="font-rajdhani text-sm uppercase tracking-widest text-zinc-400 mb-8">
              Official Speed Trial Results
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full max-w-lg mb-8">
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center">
                <span className="font-rajdhani font-black text-4xl text-amber-300">
                  {wpm}
                </span>
                <span className="text-xs font-mono text-zinc-400 uppercase mt-1">
                  FINAL WPM
                </span>
              </div>

              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center">
                <span className="font-rajdhani font-black text-4xl text-emerald-300">
                  {accuracy}%
                </span>
                <span className="text-xs font-mono text-zinc-400 uppercase mt-1">
                  ACCURACY
                </span>
              </div>

              <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center col-span-2 sm:col-span-1">
                <span className="font-rajdhani font-black text-4xl text-sky-300">
                  {bestWpm}
                </span>
                <span className="text-xs font-mono text-zinc-400 uppercase mt-1">
                  PREVIOUS BEST
                </span>
              </div>
            </div>

            {wpm > bestWpm && (
              <div className="mb-6 px-4 py-2 rounded-xl bg-amber-950/80 border border-amber-500/80 text-amber-300 text-sm font-cinzel font-bold">
                🎉 NEW PERSONAL SPEED RECORD ESTABLISHED!
              </div>
            )}

            <button
              onClick={() => {
                soundEngine.playButtonClick();
                resetTest();
              }}
              onMouseEnter={() => soundEngine.playButtonHover()}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-cinzel font-bold text-sm tracking-wider cursor-pointer shadow-lg transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>TEST AGAIN</span>
            </button>
          </div>
        )}
      </div>

      <div className="text-center py-4 text-xs font-mono text-zinc-500">
        YOUR KEYBOARD IS YOUR WEAPON • SPEED THROUGH RELAXATION
      </div>
    </div>
  );
};
