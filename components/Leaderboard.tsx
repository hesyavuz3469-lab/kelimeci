"use client";

import { useEffect, useState } from "react";
import { getLeaderboard, LeaderboardEntry } from "@/lib/storage";

type Props = {
  onClose: () => void;
};

export default function Leaderboard({ onClose }: Props) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    setEntries(getLeaderboard());
  }, []);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">🏆 Liderboard</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white text-2xl transition-colors"
          >
            ✕
          </button>
        </div>

        {entries.length === 0 ? (
          <p className="text-zinc-500 text-center py-8">
            Henüz skor yok. İlk sen ol!
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {entries.slice(0, 10).map((entry, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 p-3 rounded-xl ${
                  idx === 0
                    ? "bg-yellow-500/20 border border-yellow-500/40"
                    : idx === 1
                    ? "bg-zinc-400/10 border border-zinc-400/20"
                    : idx === 2
                    ? "bg-orange-700/20 border border-orange-700/30"
                    : "bg-zinc-800/50 border border-zinc-700/30"
                }`}
              >
                <span className="text-xl w-8 text-center">
                  {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}.`}
                </span>
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm">{entry.name}</p>
                  <p className="text-zinc-400 text-xs">
                    {entry.guesses} tahmin · {entry.time}s
                  </p>
                </div>
                <span className="text-yellow-400 font-bold text-lg">
                  {entry.score}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
