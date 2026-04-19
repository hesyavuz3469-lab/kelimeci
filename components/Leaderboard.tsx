"use client";

import { useEffect, useState } from "react";
import { getLeaderboard, LeaderboardEntry } from "@/lib/storage";

type Props = { onClose: () => void };

const medals = ["🥇", "🥈", "🥉"];

export default function Leaderboard({ onClose }: Props) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => { setEntries(getLeaderboard()); }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-md animate-bounce-in">
        <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: "linear-gradient(145deg, #1e1b4b, #1a103a)" }}>
          <div className="h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400" />

          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-black text-white">🏆 Liderboard</h2>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-colors text-sm">
                ✕
              </button>
            </div>

            {entries.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-4xl mb-3">🎯</p>
                <p className="text-zinc-400">Henüz skor yok. İlk sen ol!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
                {entries.slice(0, 10).map((entry, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-xl border transition-colors"
                    style={{
                      background: idx === 0 ? "rgba(234,179,8,0.1)" : idx === 1 ? "rgba(156,163,175,0.08)" : idx === 2 ? "rgba(180,83,9,0.1)" : "rgba(255,255,255,0.03)",
                      borderColor: idx === 0 ? "rgba(234,179,8,0.3)" : idx === 1 ? "rgba(156,163,175,0.2)" : idx === 2 ? "rgba(180,83,9,0.25)" : "rgba(255,255,255,0.06)",
                    }}
                  >
                    <span className="text-xl w-8 text-center">{medals[idx] || `${idx + 1}.`}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm truncate">{entry.name}</p>
                      <p className="text-zinc-500 text-xs">{entry.guesses} tahmin · {entry.time}s</p>
                    </div>
                    <span className="font-black text-lg" style={{ color: idx === 0 ? "#fbbf24" : idx === 1 ? "#9ca3af" : idx === 2 ? "#fb923c" : "#a78bfa" }}>
                      {entry.score}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
