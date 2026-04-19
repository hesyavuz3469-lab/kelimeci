"use client";

import { Difficulty, saveDifficulty } from "@/lib/storage";
import { MAX_GUESSES_BY_DIFFICULTY } from "@/lib/gameLogic";

type Props = {
  current: Difficulty;
  onSelect: (d: Difficulty) => void;
  onClose: () => void;
};

const modes: { id: Difficulty; label: string; emoji: string; desc: string; xpBonus: string; color: string }[] = [
  { id: "kolay", label: "Kolay", emoji: "😊", desc: `${MAX_GUESSES_BY_DIFFICULTY.kolay} tahmin hakkı`, xpBonus: "Normal XP", color: "#10b981" },
  { id: "normal", label: "Normal", emoji: "😤", desc: `${MAX_GUESSES_BY_DIFFICULTY.normal} tahmin hakkı`, xpBonus: "+40 XP bonus", color: "#8b5cf6" },
  { id: "zor", label: "Zor", emoji: "💀", desc: `${MAX_GUESSES_BY_DIFFICULTY.zor} tahmin hakkı`, xpBonus: "+100 XP bonus", color: "#ef4444" },
];

export default function DifficultyModal({ current, onSelect, onClose }: Props) {
  const handleSelect = (d: Difficulty) => {
    saveDifficulty(d);
    onSelect(d);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-sm animate-bounce-in">
        <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: "linear-gradient(145deg, #1e1b4b, #1a103a)" }}>
          <div className="h-1 bg-gradient-to-r from-green-500 via-purple-500 to-red-500" />
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-black text-white">⚙️ Zorluk Seç</h2>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-zinc-300 transition-colors text-sm">✕</button>
            </div>

            <div className="flex flex-col gap-3">
              {modes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => handleSelect(mode.id)}
                  className="w-full p-4 rounded-xl border transition-all active:scale-95 text-left"
                  style={{
                    borderColor: current === mode.id ? mode.color : "rgba(255,255,255,0.1)",
                    background: current === mode.id ? `${mode.color}22` : "rgba(255,255,255,0.03)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{mode.emoji}</span>
                    <div className="flex-1">
                      <p className="text-white font-black">{mode.label}</p>
                      <p className="text-zinc-400 text-xs">{mode.desc}</p>
                    </div>
                    <span className="text-xs font-bold px-2 py-1 rounded-full"
                      style={{ background: `${mode.color}33`, color: mode.color }}>
                      {mode.xpBonus}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <p className="text-zinc-600 text-xs text-center mt-4">Zorluk bir sonraki oyunda uygulanır</p>
          </div>
        </div>
      </div>
    </div>
  );
}
