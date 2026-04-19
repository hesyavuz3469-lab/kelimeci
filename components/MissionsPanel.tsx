"use client";

import { Mission } from "@/lib/storage";

type Props = {
  missions: Mission[];
  onClose: () => void;
};

export default function MissionsPanel({ missions, onClose }: Props) {
  const completed = missions.filter((m) => m.completed).length;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-sm animate-bounce-in">
        <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: "linear-gradient(145deg, #1e1b4b, #1a103a)" }}>
          <div className="h-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500" />
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-black text-white">🎯 Günlük Görevler</h2>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-zinc-300 transition-colors text-sm">✕</button>
            </div>
            <p className="text-zinc-500 text-xs mb-5">{completed}/{missions.length} görev tamamlandı</p>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-5">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${(completed / missions.length) * 100}%`, background: "linear-gradient(90deg, #f59e0b, #ef4444)" }} />
            </div>

            <div className="flex flex-col gap-3">
              {missions.map((mission) => (
                <div key={mission.id} className={`p-4 rounded-xl border transition-all ${mission.completed ? "border-emerald-500/30 bg-emerald-500/10" : "border-white/10 bg-white/3"}`}>
                  <div className="flex items-start gap-3">
                    <span className="text-xl mt-0.5">{mission.completed ? "✅" : "🎯"}</span>
                    <div className="flex-1">
                      <p className={`font-bold text-sm ${mission.completed ? "text-emerald-400 line-through" : "text-white"}`}>
                        {mission.title}
                      </p>
                      <p className="text-zinc-500 text-xs">{mission.description}</p>
                    </div>
                    <span className="text-xs font-bold text-yellow-400">+{mission.xpReward} XP</span>
                  </div>
                </div>
              ))}
            </div>

            {completed === missions.length && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-center">
                <p className="text-emerald-400 font-bold text-sm">🎉 Tüm görevler tamamlandı!</p>
                <p className="text-emerald-600 text-xs">Yarın yeni görevler geliyor</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
