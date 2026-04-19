"use client";

import { useEffect, useState } from "react";
import { getStats, getLevelProgress, getLevelTitle, getLevel, LEVEL_THRESHOLDS, PlayerStats } from "@/lib/storage";

type Props = { onClose: () => void };

export default function StatsModal({ onClose }: Props) {
  const [stats, setStats] = useState<PlayerStats | null>(null);

  useEffect(() => { setStats(getStats()); }, []);

  if (!stats) return null;

  const winRate = stats.totalGames > 0 ? Math.round((stats.totalWins / stats.totalGames) * 100) : 0;
  const avgGuesses = stats.guessDistribution.reduce((sum, count, i) => sum + count * (i + 1), 0) /
    (stats.totalWins || 1);
  const maxDist = Math.max(...stats.guessDistribution, 1);
  const level = getLevel(stats.totalXP);
  const { percent, next } = getLevelProgress(stats.totalXP);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-sm animate-bounce-in overflow-y-auto max-h-[90vh]">
        <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: "linear-gradient(145deg, #1e1b4b, #1a103a)" }}>
          <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500" />

          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-black text-white">📊 İstatistikler</h2>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-zinc-300 transition-colors text-sm">
                ✕
              </button>
            </div>

            {/* Level */}
            <div className="mb-5 p-4 rounded-xl border border-white/10 bg-white/5">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-zinc-400 text-xs">Seviye {level}</p>
                  <p className="text-white font-black text-lg">{getLevelTitle(level)}</p>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center font-black text-xl"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #db2777)" }}>
                  {level}
                </div>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${percent}%`, background: "linear-gradient(90deg, #7c3aed, #db2777)" }} />
              </div>
              <div className="flex justify-between mt-1">
                <p className="text-zinc-500 text-xs">{stats.totalXP} XP</p>
                <p className="text-zinc-500 text-xs">{next} XP'e kadar</p>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-4 gap-2 mb-5">
              {[
                { label: "Oyun", value: stats.totalGames, icon: "🎮" },
                { label: "Kazanma %", value: `${winRate}%`, icon: "🏆" },
                { label: "Seri", value: stats.currentStreak, icon: "🔥" },
                { label: "En Uzun", value: stats.bestStreak, icon: "⚡" },
              ].map(({ label, value, icon }) => (
                <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-2 text-center">
                  <p className="text-base mb-0.5">{icon}</p>
                  <p className="text-white font-black text-lg leading-none">{value}</p>
                  <p className="text-zinc-500 text-xs mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Guess distribution */}
            <div>
              <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-3">Tahmin Dağılımı</p>
              <div className="flex flex-col gap-1.5">
                {stats.guessDistribution.map((count, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-zinc-400 text-xs font-bold w-3">{i + 1}</span>
                    <div className="flex-1 h-6 bg-white/5 rounded overflow-hidden">
                      <div
                        className="h-full rounded flex items-center justify-end pr-2 transition-all duration-700"
                        style={{
                          width: `${Math.max((count / maxDist) * 100, count > 0 ? 8 : 0)}%`,
                          background: count > 0 ? "linear-gradient(90deg, #7c3aed, #06b6d4)" : undefined,
                        }}
                      >
                        {count > 0 && <span className="text-white text-xs font-bold">{count}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-zinc-600 text-xs mt-2 text-center">Ort. {avgGuesses.toFixed(1)} tahmin</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
