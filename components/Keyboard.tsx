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

function getKeyStyle(key: string, state: string): string {
  const isWide = key === "ENTER" || key === "⌫";
  const base = `${isWide ? "px-3 min-w-[56px] text-xs" : "w-9"} h-14 rounded-xl font-bold text-sm active:scale-90 transition-all duration-150 select-none border`;

  switch (state) {
    case "correct":
      return `${base} bg-gradient-to-b from-emerald-500 to-emerald-600 border-emerald-400 text-white shadow-md shadow-emerald-500/30`;
    case "present":
      return `${base} bg-gradient-to-b from-amber-500 to-amber-600 border-amber-400 text-white shadow-md shadow-amber-500/30`;
    case "absent":
      return `${base} bg-zinc-800 border-zinc-700 text-zinc-500`;
    default:
      return `${base} bg-gradient-to-b from-zinc-700 to-zinc-800 border-zinc-600 text-white hover:from-zinc-600 hover:to-zinc-700 shadow-sm`;
  }
}

export default function Keyboard({ onKey, keyStates }: Props) {
  return (
    <div className="flex flex-col items-center gap-1.5 w-full">
      {ROWS.map((row, rIdx) => (
        <div key={rIdx} className="flex gap-1">
          {row.map((key) => (
            <button
              key={key}
              onClick={() => onKey(key)}
              className={getKeyStyle(key, keyStates[key] || "empty")}
            >
              {key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
