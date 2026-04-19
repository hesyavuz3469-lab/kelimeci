"use client";

import { useState } from "react";
import { saveUsername } from "@/lib/storage";

type Props = {
  onSave: (name: string) => void;
};

export default function UsernameModal({ onSave }: Props) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    saveUsername(trimmed);
    onSave(trimmed);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-sm animate-bounce-in">
        <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: "linear-gradient(145deg, #1e1b4b, #1a103a)" }}>
          {/* Top accent */}
          <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500" />

          <div className="p-8 text-center">
            <div className="text-6xl mb-4">🎮</div>
            <h2 className="text-2xl font-black text-white mb-1">Kelimeci&apos;ye Hoş Geldin!</h2>
            <p className="text-zinc-400 text-sm mb-2">Her gün yeni kategori, yeni kelime</p>

            {/* How to play */}
            <div className="my-5 p-4 rounded-xl bg-white/5 border border-white/10 text-left space-y-2">
              <p className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-3">Nasıl Oynanır?</p>
              <div className="flex items-center gap-2 text-sm text-zinc-300">
                <span className="w-6 h-6 rounded bg-emerald-500 flex items-center justify-center text-xs font-bold">K</span>
                <span>Doğru harf, doğru yer</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-300">
                <span className="w-6 h-6 rounded bg-amber-500 flex items-center justify-center text-xs font-bold">E</span>
                <span>Doğru harf, yanlış yer</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-300">
                <span className="w-6 h-6 rounded bg-zinc-700 flex items-center justify-center text-xs font-bold">L</span>
                <span>Kelimede yok</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Kullanıcı adın..."
                maxLength={20}
                autoFocus
                className="w-full bg-white/5 border border-white/20 text-white rounded-xl px-4 py-3 text-center text-base focus:outline-none focus:border-purple-500 transition-colors placeholder:text-zinc-600"
              />
              <button
                type="submit"
                disabled={!name.trim()}
                className="w-full py-3 rounded-xl font-black text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: name.trim() ? "linear-gradient(135deg, #7c3aed, #db2777)" : undefined, color: "white" }}
              >
                Oynamaya Başla →
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
