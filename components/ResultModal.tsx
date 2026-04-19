"use client";

import { GuessRow, GameStatus } from "@/lib/gameLogic";
import { buildShareText } from "@/lib/storage";
import { useState } from "react";

type Props = {
  status: GameStatus;
  target: string;
  guesses: number;
  score: number;
  time: number;
  categoryName: string;
  rows: GuessRow[];
  difficulty?: string;
  hintsUsed?: number;
  xpGained?: number;
  streak?: number;
  onShowLeaderboard: () => void;
  onClose: () => void;
};

export default function ResultModal({ status, target, guesses, score, time, categoryName, rows, xpGained, streak, onShowLeaderboard, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const won = status === "won";

  const handleShare = async () => {
    const text = buildShareText(guesses, rows, categoryName);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert(text);
    }
  };

  const handleChallenge = async () => {
    const url = `${window.location.origin}?challenge=${encodeURIComponent(target)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert(url);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-sm animate-bounce-in">
        <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: "linear-gradient(145deg, #1e1b4b, #1a103a)" }}>
          <div className={`h-1 ${won ? "bg-gradient-to-r from-emerald-500 to-cyan-500" : "bg-gradient-to-r from-red-500 to-orange-500"}`} />

          <div className="p-6 text-center">
            <div className="text-5xl mb-3">{won ? "🎉" : "😔"}</div>
            <h2 className="text-2xl font-black text-white mb-1">
              {won ? "Harika!" : "Olmadı!"}
            </h2>
            <p className="text-zinc-400 text-sm mb-5">
              {won ? `${guesses}. tahminde buldun!` : (
                <>Doğru kelime: <span className="text-white font-black text-base">{target}</span></>
              )}
            </p>

            {won && xpGained && (
              <div className="mb-3 py-2 px-4 rounded-xl inline-block" style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(219,39,119,0.3))", border: "1px solid rgba(124,58,237,0.4)" }}>
                <span className="text-yellow-400 font-black">⭐ +{xpGained} XP</span>
                {streak && streak > 1 && <span className="text-orange-400 font-bold ml-2">🔥 {streak} gün serisi!</span>}
              </div>
            )}

            {won && (
              <div className="flex justify-center gap-3 mb-5">
                {[
                  { label: "Puan", value: score, color: "text-yellow-400" },
                  { label: "Süre", value: `${time}s`, color: "text-cyan-400" },
                  { label: "Tahmin", value: `${guesses}/6`, color: "text-purple-400" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-2">
                    <p className="text-zinc-500 text-xs mb-1">{label}</p>
                    <p className={`font-black text-lg ${color}`}>{value}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <button onClick={handleShare} className="w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95" style={{ background: "linear-gradient(135deg, #059669, #0891b2)", color: "white" }}>
                {copied ? "✓ Kopyalandı!" : "📋 Sonucu Paylaş"}
              </button>
              <button onClick={handleChallenge} className="w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95" style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)", color: "white" }}>
                🤜 Arkadaşına Meydan Oku
              </button>
              <button onClick={onShowLeaderboard} className="w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95" style={{ background: "linear-gradient(135deg, #d97706, #f59e0b)", color: "black" }}>
                🏆 Liderboard&apos;u Gör
              </button>
              <button onClick={onClose} className="w-full py-2 text-zinc-500 hover:text-zinc-300 text-sm transition-colors">
                Kapat
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
