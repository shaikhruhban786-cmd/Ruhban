/**
 * StatsDashboard Component
 * Performance analysis with historical WPM chart, win rates, and combat records.
 */

import React from 'react';
import { ArrowLeft, Zap, Target, Flame, Trophy, Activity, Award } from 'lucide-react';
import { UserProgress } from '../types';
import { soundEngine } from '../services/soundEngine';

interface StatsDashboardProps {
  progress: UserProgress;
  onBack: () => void;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ progress, onBack }) => {
  const winRate =
    progress.totalBattles > 0
      ? Math.round((progress.wins / progress.totalBattles) * 100)
      : 0;

  // Generate SVG points for the historical WPM graph
  const history = [...progress.battleHistory].reverse();
  const graphPoints = history.map((item, index) => ({
    x: index,
    wpm: item.wpm,
  }));

  const maxWpm = Math.max(100, ...graphPoints.map((p) => p.wpm));
  const minWpm = Math.min(20, ...graphPoints.map((p) => p.wpm));

  const svgWidth = 600;
  const svgHeight = 180;
  const padding = 25;

  const pointsString =
    graphPoints.length > 1
      ? graphPoints
          .map((p, idx) => {
            const x =
              padding +
              (idx / (graphPoints.length - 1)) * (svgWidth - padding * 2);
            const y =
              svgHeight -
              padding -
              ((p.wpm - minWpm) / (maxWpm - minWpm || 1)) *
                (svgHeight - padding * 2);
            return `${x},${y}`;
          })
          .join(' ')
      : '';

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#080a10] via-[#05060a] to-[#020204] p-4 sm:p-8 select-none">
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
            <h1 className="font-cinzel text-2xl sm:text-3xl font-black text-zinc-100 tracking-wider">
              COMBAT PERFORMANCE
            </h1>
            <p className="font-rajdhani text-xs text-sky-400 tracking-widest uppercase">
              Player Level {progress.playerLevel} • {progress.playerXp} XP
            </p>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
          <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-4 flex flex-col">
            <div className="flex items-center gap-1.5 text-sky-400 text-xs font-mono uppercase mb-2">
              <Zap className="w-4 h-4" />
              <span>BEST WPM</span>
            </div>
            <span className="font-rajdhani font-black text-3xl sm:text-4xl text-sky-300">
              {progress.bestWpm}
            </span>
          </div>

          <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-4 flex flex-col">
            <div className="flex items-center gap-1.5 text-blue-400 text-xs font-mono uppercase mb-2">
              <Activity className="w-4 h-4" />
              <span>AVG WPM</span>
            </div>
            <span className="font-rajdhani font-black text-3xl sm:text-4xl text-blue-300">
              {progress.averageWpm}
            </span>
          </div>

          <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-4 flex flex-col">
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-mono uppercase mb-2">
              <Trophy className="w-4 h-4" />
              <span>WIN RATE</span>
            </div>
            <span className="font-rajdhani font-black text-3xl sm:text-4xl text-emerald-300">
              {winRate}%
            </span>
          </div>

          <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-4 flex flex-col">
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-mono uppercase mb-2">
              <Flame className="w-4 h-4" />
              <span>MAX COMBO</span>
            </div>
            <span className="font-rajdhani font-black text-3xl sm:text-4xl text-amber-300">
              {progress.highestCombo}x
            </span>
          </div>

          <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-4 flex flex-col">
            <div className="flex items-center gap-1.5 text-purple-400 text-xs font-mono uppercase mb-2">
              <Award className="w-4 h-4" />
              <span>BATTLES</span>
            </div>
            <span className="font-rajdhani font-black text-3xl sm:text-4xl text-purple-300">
              {progress.totalBattles}
            </span>
          </div>

          <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-4 flex flex-col">
            <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-mono uppercase mb-2">
              <Target className="w-4 h-4" />
              <span>TOTAL CHARS</span>
            </div>
            <span className="font-rajdhani font-black text-3xl sm:text-4xl text-zinc-300">
              {progress.totalCharacters.toLocaleString()}
            </span>
          </div>
        </div>

        {/* WPM Trend Chart */}
        <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-3xl p-6 sm:p-8 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-cinzel text-lg sm:text-xl font-bold text-zinc-100">
                WPM PROGRESSION TRAJECTORY
              </h2>
              <p className="text-xs font-mono text-zinc-400">
                Real-time speed evolution across recent battle encounters
              </p>
            </div>
            <span className="px-3 py-1 rounded bg-sky-950/70 border border-sky-500/40 text-sky-400 text-xs font-mono">
              Peak: {progress.bestWpm} WPM
            </span>
          </div>

          {graphPoints.length > 1 ? (
            <div className="w-full overflow-x-auto">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-48 sm:h-56 stroke-linecap-round"
              >
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Guide Lines */}
                {[0.25, 0.5, 0.75].map((ratio) => {
                  const y = padding + ratio * (svgHeight - padding * 2);
                  return (
                    <line
                      key={ratio}
                      x1={padding}
                      y1={y}
                      x2={svgWidth - padding}
                      y2={y}
                      stroke="#27272a"
                      strokeDasharray="4,4"
                    />
                  );
                })}

                {/* Polyline */}
                <polyline
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="3"
                  points={pointsString}
                  style={{ filter: 'drop-shadow(0 0 8px rgba(56,189,248,0.7))' }}
                />

                {/* Dots on points */}
                {graphPoints.map((p, idx) => {
                  const x =
                    padding +
                    (idx / (graphPoints.length - 1)) * (svgWidth - padding * 2);
                  const y =
                    svgHeight -
                    padding -
                    ((p.wpm - minWpm) / (maxWpm - minWpm || 1)) *
                      (svgHeight - padding * 2);
                  return (
                    <circle
                      key={idx}
                      cx={x}
                      cy={y}
                      r="4"
                      fill="#0369a1"
                      stroke="#7dd3fc"
                      strokeWidth="2"
                    />
                  );
                })}
              </svg>
            </div>
          ) : (
            <div className="py-12 text-center text-zinc-500 font-mono text-sm">
              Complete at least 2 battles to reveal your historical speed curve.
            </div>
          )}
        </div>

        {/* Recent Battle History */}
        <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-3xl p-6 sm:p-8">
          <h2 className="font-cinzel text-lg sm:text-xl font-bold text-zinc-100 mb-4">
            RECENT BATTLE LOG
          </h2>
          {progress.battleHistory.length > 0 ? (
            <div className="divide-y divide-zinc-800/60">
              {progress.battleHistory.slice(0, 10).map((b, idx) => (
                <div
                  key={idx}
                  className="py-3 flex items-center justify-between flex-wrap gap-2 text-sm font-mono"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold ${
                        b.won
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-red-950 text-red-400 border border-red-800'
                      }`}
                    >
                      {b.won ? 'VICTORY' : 'DEFEAT'}
                    </span>
                    <span className="font-cinzel font-bold text-zinc-200">
                      {b.levelName}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-zinc-400">
                    <span>
                      <strong className="text-sky-400">{Math.round(b.wpm)}</strong> WPM
                    </span>
                    <span>
                      <strong className="text-emerald-400">{b.accuracy}%</strong> ACC
                    </span>
                    <span>
                      <strong className="text-amber-400">{b.maxCombo}x</strong> COMBO
                    </span>
                    <span className="font-bold text-zinc-300">
                      Grade: {b.performanceGrade}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-500 font-mono text-sm">No battle records yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
