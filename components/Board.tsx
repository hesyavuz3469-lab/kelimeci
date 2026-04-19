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
      return `${base} border-emerald-400 text-white` + ` shadow-[0_0_20px_rgba(52,211,153,0.6)]`;
    case "present":
      return `${base} border-amber-400 text-white` + ` shadow-[0_0_20px_rgba(251,191,36,0.6)]`;
    case "absent":
      return `${base} border-zinc-600 bg-zinc-900 text-zinc-400`;
    default:
      return `${base} border-white/15 bg-white/5 text-white`;
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

            const tileStyle: React.CSSProperties = isRevealed
              ? state === "correct"
                ? { background: "linear-gradient(135deg, #059669, #10b981)", boxShadow: "0 0 24px rgba(16,185,129,0.7), inset 0 1px 0 rgba(255,255,255,0.2)" }
                : state === "present"
                ? { background: "linear-gradient(135deg, #d97706, #f59e0b)", boxShadow: "0 0 24px rgba(245,158,11,0.7), inset 0 1px 0 rgba(255,255,255,0.2)" }
                : { background: "linear-gradient(135deg, #27272a, #3f3f46)" }
              : letter
              ? { boxShadow: "0 0 12px rgba(168,85,247,0.4)" }
              : {};

            return (
              <div
                key={cIdx}
                className={`${getTileStyle(state, isRevealed, letter)} ${isHint ? "ring-2 ring-yellow-400/60" : ""}`}
                style={tileStyle}
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
