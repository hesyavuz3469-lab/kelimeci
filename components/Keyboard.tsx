"use client";

import { LetterState } from "@/lib/gameLogic";

type Props = {
  onKey: (key: string) => void;
  keyStates: Record<string, LetterState>;
};

const ROWS = [
  ["E", "R", "T", "Y", "U", "I", "O", "P", "Ğ", "Ü"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ş", "İ"],
  ["ENTER", "Z", "C", "V", "B", "N", "M", "Ö", "Ç", "⌫"],
];

const stateStyle: Record<string, string> = {
  correct: "bg-green-600 text-white border-green-600",
  present: "bg-yellow-500 text-white border-yellow-500",
  absent: "bg-zinc-600 text-white border-zinc-600",
  empty: "bg-zinc-800 text-white border-zinc-700",
  tbd: "bg-zinc-800 text-white border-zinc-700",
};

export default function Keyboard({ onKey, keyStates }: Props) {
  return (
    <div className="flex flex-col items-center gap-1.5 w-full">
      {ROWS.map((row, rIdx) => (
        <div key={rIdx} className="flex gap-1">
          {row.map((key) => {
            const state = keyStates[key] || "empty";
            const isWide = key === "ENTER" || key === "⌫";

            return (
              <button
                key={key}
                onClick={() => onKey(key)}
                className={`
                  ${isWide ? "px-3 text-xs min-w-[56px]" : "w-9"}
                  h-14 rounded font-bold text-sm border
                  active:scale-95 transition-all duration-150 select-none
                  ${stateStyle[state]}
                `}
              >
                {key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
