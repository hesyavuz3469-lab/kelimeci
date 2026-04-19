"use client";

import { GuessRow, LetterState } from "@/lib/gameLogic";
import { useEffect, useState } from "react";

type Props = {
  rows: GuessRow[];
  currentRow: number;
  wordLength: number;
  shake: boolean;
};

const stateBg: Record<LetterState, string> = {
  correct: "bg-green-600 border-green-600 text-white",
  present: "bg-yellow-500 border-yellow-500 text-white",
  absent: "bg-zinc-600 border-zinc-600 text-white",
  empty: "bg-transparent border-zinc-700 text-white",
  tbd: "bg-transparent border-zinc-400 text-white",
};

export default function Board({ rows, currentRow, wordLength, shake }: Props) {
  const [flipping, setFlipping] = useState<number | null>(null);
  const [flipCol, setFlipCol] = useState<number>(-1);

  useEffect(() => {
    if (currentRow === 0) return;
    const prev = currentRow - 1;
    if (!rows[prev]?.submitted) return;

    setFlipping(prev);
    setFlipCol(-1);

    let col = 0;
    const interval = setInterval(() => {
      setFlipCol(col);
      col++;
      if (col >= wordLength) {
        clearInterval(interval);
        setTimeout(() => {
          setFlipping(null);
          setFlipCol(-1);
        }, 300);
      }
    }, 80);

    return () => clearInterval(interval);
  }, [currentRow]);

  return (
    <div className="flex flex-col gap-1.5">
      {rows.map((row, rIdx) => (
        <div
          key={rIdx}
          className={`flex gap-1.5 ${
            shake && rIdx === currentRow ? "animate-shake" : ""
          }`}
        >
          {Array.from({ length: wordLength }).map((_, cIdx) => {
            const letter = row.letters[cIdx] || "";
            const state = row.submitted ? row.states[cIdx] : letter ? "tbd" : "empty";
            const isFlipping = flipping === rIdx && cIdx <= flipCol;

            return (
              <div
                key={cIdx}
                className={`
                  relative w-14 h-14 flex items-center justify-center
                  border-2 text-2xl font-bold uppercase select-none
                  transition-transform duration-100
                  ${stateBg[state]}
                  ${letter && !row.submitted ? "scale-105" : "scale-100"}
                  ${isFlipping ? "animate-flip" : ""}
                `}
                style={{
                  transitionDelay: row.submitted ? `${cIdx * 80}ms` : "0ms",
                }}
              >
                {letter}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
