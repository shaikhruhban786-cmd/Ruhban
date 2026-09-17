/**
 * PracticeModeView Component
 * Stress-free typing training with 5 difficulty tiers (including custom text input),
 * real-time feedback, and end-of-drill analytics.
 */

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, CheckCircle2, RotateCcw, Target, Zap, Clock, AlertTriangle, BookOpen } from 'lucide-react';
import { PracticeDifficulty } from '../types';
import { PRACTICE_SENTENCES } from '../data/battleData';
import { soundEngine } from '../services/soundEngine';

interface PracticeModeViewProps {
  onBack: () => void;
}

export const PracticeModeView: React.FC<PracticeModeViewProps> = ({ onBack }) => {
  const [difficulty, setDifficulty] = useState<PracticeDifficulty>('normal');
  const [customInputText, setCustomInputText] = useState<string>('');
  const [activeSentence, setActiveSentence] = useState<string>('');
  const [typed, setTyped] = useState<string>('');
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(100);
  const [errors, setErrors] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const correctCharsRef = useRef<number>(0);
  const errorCharsRef = useRef<number>(0);

  // Initialize sentence based on difficulty
  const pickSentence = (diff: PracticeDifficulty) => {
    if (diff === 'custom') {
      const text = customInputText.trim() || 'Type your custom passage here to practice typing mastery.';
      setActiveSentence(text);
    } else {
      const list = PRACTICE_SENTENCES[diff] || PRACTICE_SENTENCES.normal;
      const random = list[Math.floor(Math.random() * list.length)];
      setActiveSentence(random);
    }
    resetDrill();
  };

  const resetDrill = () => {
    setTyped('');
    setIsFinished(false);
    setStartTime(null);
    setWpm(0);
    setAccuracy(100);
    setErrors(0);
    setElapsedTime(0);
    correctCharsRef.current = 0;
    errorCharsRef.current = 0;
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  useEffect(() => {
    pickSentence(difficulty);
  }, [difficulty]);

  // Timer loop
  useEffect(() => {
    let interval: number;
    if (startTime && !isFinished) {
      interval = window.setInterval(() => {
        const seconds = (Date.now() - startTime) / 1000;
        setElapsedTime(seconds);
      }, 200);
    }
    return () => clearInterval(interval);
  }, [startTime, isFinished]);

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

    const now = Date.now();
    if (!startTime) {
      setStartTime(now);
    }

    const targetChar = activeSentence[typed.length];
    const isCorrect = e.key === targetChar;

    if (isCorrect) {
      soundEngine.playKeyClick(e.key);
      correctCharsRef.current++;
      const nextTyped = typed + e.key;
      setTyped(nextTyped);

      const elapsedMinutes = Math.max(0.015, (now - (startTime || now)) / 60000);
      const calculatedWpm = Math.round(correctCharsRef.current / 5 / elapsedMinutes);
      setWpm(calculatedWpm);

      const acc = Math.round(
        (correctCharsRef.current / (correctCharsRef.current + errorCharsRef.current)) * 100
      );
      setAccuracy(acc);

      if (nextTyped.length >= activeSentence.length) {
        setIsFinished(true);
        soundEngine.playVictoryFanfare();
      }
    } else {
      soundEngine.playKeyError();
      errorCharsRef.current++;
      setErrors((prev) => prev + 1);
      const acc = Math.round(
        (correctCharsRef.current / (correctCharsRef.current + errorCharsRef.current)) * 100
      );
      setAccuracy(acc);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#080a12] via-[#04060c] to-[#010204] p-4 sm:p-8 select-none flex flex-col justify-between">
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
              <BookOpen className="w-6 h-6 text-sky-400" />
              <span>PRACTICE DOJO</span>
            </h1>
            <p className="font-rajdhani text-xs text-zinc-400 tracking-widest uppercase">
              Combat-Free Cadence & Accuracy Training
            </p>
          </div>
        </div>

        {/* Difficulty Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          {(['beginner', 'normal', 'advanced', 'expert', 'custom'] as PracticeDifficulty[]).map(
            (tier) => (
              <button
                key={tier}
                onClick={() => {
                  soundEngine.playButtonClick();
                  setDifficulty(tier);
                }}
                className={`px-4 py-2 rounded-xl font-cinzel font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                  difficulty === tier
                    ? 'bg-sky-500 text-black shadow-[0_0_15px_rgba(56,189,248,0.5)]'
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                }`}
              >
                {tier}
              </button>
            )
          )}
        </div>

        {/* Custom Textarea if Custom Mode */}
        {difficulty === 'custom' && (
          <div className="mb-6 p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
            <label className="block text-xs font-mono text-zinc-400 uppercase mb-2">
              Enter or Paste Your Custom Practice Text:
            </label>
            <textarea
              value={customInputText}
              onChange={(e) => setCustomInputText(e.target.value)}
              placeholder="Paste custom sentences or paragraphs here..."
              rows={3}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-zinc-200 font-mono text-sm focus:outline-none focus:border-sky-500"
            />
            <button
              onClick={() => pickSentence('custom')}
              className="mt-2 px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-cinzel text-xs font-bold cursor-pointer"
            >
              LOAD CUSTOM TEXT
            </button>
          </div>
        )}

        {/* Real-time Stats Pill Row */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-3 flex flex-col items-center">
            <div className="flex items-center gap-1 text-sky-400 text-[10px] font-mono uppercase">
              <Zap className="w-3.5 h-3.5" />
              <span>WPM</span>
            </div>
            <span className="font-rajdhani font-black text-2xl text-sky-300">{wpm}</span>
          </div>

          <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-3 flex flex-col items-center">
            <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-mono uppercase">
              <Target className="w-3.5 h-3.5" />
              <span>ACCURACY</span>
            </div>
            <span className="font-rajdhani font-black text-2xl text-emerald-300">{accuracy}%</span>
          </div>

          <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-3 flex flex-col items-center">
            <div className="flex items-center gap-1 text-red-400 text-[10px] font-mono uppercase">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>ERRORS</span>
            </div>
            <span className="font-rajdhani font-black text-2xl text-red-300">{errors}</span>
          </div>

          <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-3 flex flex-col items-center">
            <div className="flex items-center gap-1 text-amber-400 text-[10px] font-mono uppercase">
              <Clock className="w-3.5 h-3.5" />
              <span>TIME</span>
            </div>
            <span className="font-rajdhani font-black text-2xl text-amber-300">
              {elapsedTime.toFixed(1)}s
            </span>
          </div>
        </div>

        {/* Practice Text Box */}
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
            {activeSentence.split('').map((char, index) => {
              const isTyped = index < typed.length;
              const isCurrent = index === typed.length;

              if (isTyped) {
                return (
                  <span key={index} className="text-sky-400 font-bold">
                    {char}
                  </span>
                );
              }
              if (isCurrent) {
                return (
                  <span
                    key={index}
                    className="relative bg-sky-500/30 text-white border-b-4 border-sky-400 font-bold px-0.5"
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

        {/* Drill Completion Card */}
        {isFinished && (
          <div className="mt-8 p-6 rounded-2xl bg-sky-950/60 border border-sky-500/60 flex flex-col items-center text-center animate-in zoom-in-95">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-2" />
            <h3 className="font-cinzel text-2xl font-black text-sky-200 mb-1">
              DRILL COMPLETED!
            </h3>
            <p className="font-rajdhani text-sm text-zinc-300 mb-4">
              Speed: <strong className="text-sky-300">{wpm} WPM</strong> • Accuracy:{' '}
              <strong className="text-emerald-300">{accuracy}%</strong> • Errors:{' '}
              <strong className="text-red-400">{errors}</strong>
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => pickSentence(difficulty)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-cinzel font-bold text-xs uppercase cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>NEXT PASSAGE</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="text-center py-4 text-xs font-mono text-zinc-500">
        FOCUS ON RHYTHM • SPEED IS AN OUTCOME OF ACCURACY
      </div>
    </div>
  );
};
