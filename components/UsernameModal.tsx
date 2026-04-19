"use client";

import { useState } from "react";
import { saveUsername } from "@/lib/storage";

type Props = {
  onSave: (name: string) => void;
};

export default function UsernameModal({ onSave }: Props) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    saveUsername(trimmed);
    onSave(trimmed);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-sm p-6 text-center">
        <div className="text-5xl mb-4">🎮</div>
        <h2 className="text-2xl font-bold text-white mb-2">Hoş Geldin!</h2>
        <p className="text-zinc-400 text-sm mb-6">
          Liderboard&apos;a katılmak için bir isim seç
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Kullanıcı adın..."
            maxLength={20}
            autoFocus
            className="w-full bg-zinc-800 border border-zinc-600 text-white rounded-xl px-4 py-3 text-center text-lg focus:outline-none focus:border-yellow-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-zinc-700 disabled:text-zinc-500 text-black font-bold py-3 rounded-xl transition-colors"
          >
            Oynamaya Başla →
          </button>
        </form>
      </div>
    </div>
  );
}
