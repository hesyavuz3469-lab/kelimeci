"use client";

import { GuessRow, LetterState } from "@/lib/gameLogic";
import { useEffect, useState } from "react";

type Props = {
  rows: GuessRow[];
  currentRow: number;
  wordLength: number;
  shake: boolean;
  revealedHints?: Record<number, string>;
};

function getTileStyle(state: LetterState, submitted: boolean, letter: string): string {
  const base = "relative w-14 h-14 flex items-center justify-center text-2xl font-black uppercase select-none rounded-xl border-2 transition-all duration-100";

  if (!submitted) {
    if (letter) return `${base} border-purple-500 bg-purple-500/10 text-white scale-105 shadow-lg shadow-purple-500/20`;
    return `${base} border-white/10 bg-white/5 text-white`;
  }

  switch (state) {
    case "correct":
      return `${base} border-emerald-500 bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30`;
    case "present":
      return `${base} border-amber-500 bg-gradient-to-b from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30`;
    case "absent":
      return `${base} border-zinc-600 bg-gradient-to-b from-zinc-700 to-zinc-800 text-zinc-300`;
    default:
      return `${base} border-white/10 bg-white/5 text-white`;
  }
}

export default function Board({ rows, currentRow, wordLength, shake, revealedHints = {} }: Props) {
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (currentRow === 0) return;
    const prev = currentRow - 1;
    if (!rows[prev]?.submitted) return;

    for (let col = 0; col < wordLength; col++) {
      const key = `${prev}-${col}`;
      setTimeout(() => {
        setRevealed((r) => new Set([...r, key]));
      }, col * 90);
    }
  }, [currentRow, wordLength]);

  return (
    <div className="flex flex-col gap-2">
      {rows.map((row, rIdx) => (
        <div
          key={rIdx}
          className={`flex gap-2 ${shake && rIdx === currentRow ? "animate-shake" : ""}`}
        >
          {Array.from({ length: wordLength }).map((_, cIdx) => {
            const hintLetter = !row.submitted && rIdx === currentRow ? (revealedHints[cIdx] ?? "") : "";
            const letter = row.letters[cIdx] || hintLetter;
            const isRevealed = revealed.has(`${rIdx}-${cIdx}`);
            const isHint = !row.submitted && !!hintLetter && !row.letters[cIdx];
            const state: LetterState = isRevealed ? row.states[cIdx] : (letter && !row.submitted ? "tbd" : "empty");

            return (
              <div
                key={cIdx}
                className={`${getTileStyle(state, isRevealed, letter)} ${isHint ? "ring-2 ring-yellow-400/60" : ""}`}
              >
                <span className="drop-shadow-sm">{letter}</span>
                {isHint && <span className="absolute top-0.5 right-1 text-yellow-400 text-xs">💡</span>}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
