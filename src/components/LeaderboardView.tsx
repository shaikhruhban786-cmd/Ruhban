/**
 * LeaderboardView Component
 * High-stakes arcade leaderboard with Daily, Weekly, and All-Time divisions.
 */

import React, { useState } from 'react';
import { ArrowLeft, Trophy, Medal, Crown } from 'lucide-react';
import { LeaderboardEntry } from '../types';
import { soundEngine } from '../services/soundEngine';

interface LeaderboardViewProps {
  entries: LeaderboardEntry[];
  onBack: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ entries, onBack }) => {
  const [filterTab, setFilterTab] = useState<'all' | 'weekly' | 'daily'>('all');

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#08080f] via-[#04040a] to-[#010103] p-4 sm:p-8 select-none">
      <div className="max-w-5xl mx-auto">
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
            <h1 className="font-cinzel text-2xl sm:text-3xl font-black text-amber-300 tracking-wider flex items-center justify-end gap-2">
              <Trophy className="w-6 h-6 text-amber-400" />
              <span>GLOBAL HALL OF CHAMPIONS</span>
            </h1>
            <p className="font-rajdhani text-xs text-zinc-400 tracking-widest uppercase">
              Elite Typists Across the Realm
            </p>
          </div>
        </div>

        {/* Division Tabs */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {(['all', 'weekly', 'daily'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                soundEngine.playButtonClick();
                setFilterTab(tab);
              }}
              className={`px-5 py-2 rounded-xl font-cinzel font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                filterTab === tab
                  ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
              }`}
            >
              {tab === 'all' ? 'ALL-TIME' : tab === 'weekly' ? 'THIS WEEK' : 'TODAY'}
            </button>
          ))}
        </div>

        {/* Leaderboard Table Container */}
        <div className="bg-zinc-950/90 border border-zinc-800 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-md">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 px-6 py-4 border-b border-zinc-800 text-xs font-mono text-zinc-400 uppercase tracking-widest bg-zinc-900/60">
            <div className="col-span-2 sm:col-span-1 text-center">RANK</div>
            <div className="col-span-4 sm:col-span-5">CHAMPION</div>
            <div className="col-span-2 text-center">WPM</div>
            <div className="col-span-2 text-center">ACCURACY</div>
            <div className="col-span-2 text-right">SCORE</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-zinc-800/60 font-mono">
            {entries.map((entry, idx) => {
              const isFirst = entry.rank === 1;
              const isSecond = entry.rank === 2;
              const isThird = entry.rank === 3;
              const isUser = entry.isUser;

              return (
                <div
                  key={idx}
                  className={`grid grid-cols-12 gap-2 px-6 py-4 items-center transition-colors ${
                    isUser
                      ? 'bg-sky-950/40 border-l-4 border-sky-400'
                      : isFirst
                      ? 'bg-amber-950/20'
                      : 'hover:bg-zinc-900/40'
                  }`}
                >
                  {/* Rank */}
                  <div className="col-span-2 sm:col-span-1 flex items-center justify-center font-bold">
                    {isFirst && <Crown className="w-5 h-5 text-amber-400" />}
                    {isSecond && <Medal className="w-5 h-5 text-zinc-300" />}
                    {isThird && <Medal className="w-5 h-5 text-amber-700" />}
                    {!isFirst && !isSecond && !isThird && (
                      <span className="text-zinc-500 text-sm">#{entry.rank}</span>
                    )}
                  </div>

                  {/* Player Name & Tag */}
                  <div className="col-span-4 sm:col-span-5 flex items-center gap-2">
                    <span
                      className={`font-cinzel font-bold text-sm sm:text-base ${
                        isUser
                          ? 'text-sky-300'
                          : isFirst
                          ? 'text-amber-300'
                          : 'text-zinc-200'
                      }`}
                    >
                      {entry.playerName}
                    </span>
                    {isUser && (
                      <span className="px-2 py-0.5 rounded bg-sky-900/60 border border-sky-400 text-sky-300 text-[10px] font-mono">
                        YOU
                      </span>
                    )}
                    <span className="hidden sm:inline text-xs text-zinc-500 font-mono">
                      ({entry.weapon.toUpperCase()})
                    </span>
                  </div>

                  {/* WPM */}
                  <div className="col-span-2 text-center font-rajdhani font-black text-lg sm:text-xl text-sky-400">
                    {entry.wpm}
                  </div>

                  {/* Accuracy */}
                  <div className="col-span-2 text-center text-xs sm:text-sm text-emerald-400">
                    {entry.accuracy}%
                  </div>

                  {/* Score */}
                  <div className="col-span-2 text-right font-rajdhani font-black text-base sm:text-lg text-amber-300">
                    {entry.score.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
