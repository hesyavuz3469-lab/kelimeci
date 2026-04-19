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
  onShowLeaderboard: () => void;
  onClose: () => void;
};

export default function ResultModal({
  status,
  target,
  guesses,
  score,
  time,
  categoryName,
  rows,
  onShowLeaderboard,
  onClose,
}: Props) {
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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-sm p-6 text-center">
        <div className="text-5xl mb-3">{won ? "🎉" : "😔"}</div>
        <h2 className="text-2xl font-bold text-white mb-1">
          {won ? "Tebrikler!" : "Olmadı!"}
        </h2>
        <p className="text-zinc-400 mb-4 text-sm">
          {won
            ? `${guesses}. tahminde buldun!`
            : `Doğru kelime: `}
          {!won && (
            <span className="text-white font-bold text-base">{target}</span>
          )}
        </p>

        {won && (
          <div className="flex justify-center gap-4 mb-4">
            <div className="bg-zinc-800 rounded-xl px-4 py-3">
              <p className="text-zinc-400 text-xs">Puan</p>
              <p className="text-yellow-400 font-bold text-xl">{score}</p>
            </div>
            <div className="bg-zinc-800 rounded-xl px-4 py-3">
              <p className="text-zinc-400 text-xs">Süre</p>
              <p className="text-white font-bold text-xl">{time}s</p>
            </div>
            <div className="bg-zinc-800 rounded-xl px-4 py-3">
              <p className="text-zinc-400 text-xs">Tahmin</p>
              <p className="text-white font-bold text-xl">{guesses}/6</p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <button
            onClick={handleShare}
            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition-colors"
          >
            {copied ? "✓ Kopyalandı!" : "📋 Sonucu Paylaş"}
          </button>
          <button
            onClick={handleChallenge}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors"
          >
            🤜 Arkadaşına Meydan Oku
          </button>
          <button
            onClick={onShowLeaderboard}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-xl transition-colors"
          >
            🏆 Liderboard
          </button>
          <button
            onClick={onClose}
            className="w-full text-zinc-400 hover:text-white py-2 text-sm transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
