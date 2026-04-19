"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import Board from "./Board";
import Keyboard from "./Keyboard";
import ResultModal from "./ResultModal";
import Leaderboard from "./Leaderboard";
import UsernameModal from "./UsernameModal";
import StatsModal from "./StatsModal";
import DifficultyModal from "./DifficultyModal";
import MissionsPanel from "./MissionsPanel";
import {
  GameStatus, GuessRow,
  evaluateGuess, buildKeyboardState, createEmptyRow,
  getHintLetter, MAX_GUESSES_BY_DIFFICULTY,
} from "@/lib/gameLogic";
import {
  saveGameState, loadGameState, saveToLeaderboard, getUsername,
  updateStatsAfterGame, getDailyMissions, completeMission,
  getDifficulty, Difficulty, getStats, getLevelTitle, getLevel,
  getLevelProgress, getHintsRemaining, useHint, calculateScore, Mission,
} from "@/lib/storage";
import { getDailyCategory, getDailyWord, getTodayKey } from "@/lib/words";

const TURKISH_LETTERS = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ";

export default function Game() {
  const category = getDailyCategory();
  const target = getDailyWord(category);
  const wordLength = target.length;

  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const maxGuesses = MAX_GUESSES_BY_DIFFICULTY[difficulty];

  const [rows, setRows] = useState<GuessRow[]>(() =>
    Array.from({ length: 7 }, () => createEmptyRow(wordLength))
  );
  const [currentRow, setCurrentRow] = useState(0);
  const [status, setStatus] = useState<GameStatus>("playing");
  const [shake, setShake] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showUsername, setShowUsername] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showDifficulty, setShowDifficulty] = useState(false);
  const [showMissions, setShowMissions] = useState(false);
  const [username, setUsername] = useState("");
  const [score, setScore] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const [revealedHints, setRevealedHints] = useState<Record<number, string>>({});
  const [hintsUsedThisGame, setHintsUsedThisGame] = useState(0);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [xpGained, setXpGained] = useState(0);
  const [levelUp, setLevelUp] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type?: "success" | "error" | "info" }>({ msg: "" });
  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Init
  useEffect(() => {
    const savedDiff = getDifficulty();
    setDifficulty(savedDiff);
    setHintsRemaining(getHintsRemaining());
    setMissions(getDailyMissions());

    const saved = loadGameState();
    if (saved) {
      setRows(saved.rows);
      setCurrentRow(saved.currentRow);
      setStatus(saved.status);
      setScore(saved.score);
      setDifficulty(saved.difficulty);
      setHintsUsedThisGame(saved.hintsUsed);
      startTimeRef.current = saved.startTime;
      if (saved.status !== "playing") setShowResult(true);
    }

    const savedName = getUsername();
    if (savedName) setUsername(savedName);
    else setShowUsername(true);
  }, []);

  // Timer
  useEffect(() => {
    if (status !== "playing") return;
    timerRef.current = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [status]);

  const showToastMsg = (msg: string, type: "success" | "error" | "info" = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "" }), 2200);
  };

  // Hint
  const handleHint = () => {
    if (status !== "playing") return;
    if (hintsRemaining <= 0) { showToastMsg("Bugün ipucu hakkın kalmadı!", "error"); return; }
    const idx = getHintLetter(target, rows, currentRow);
    if (idx === -1) { showToastMsg("Daha fazla ipucu yok!"); return; }
    if (useHint()) {
      setRevealedHints((prev) => ({ ...prev, [idx]: target[idx] }));
      setHintsRemaining(getHintsRemaining());
      setHintsUsedThisGame((n) => n + 1);
      showToastMsg(`İpucu: ${idx + 1}. harf "${target[idx]}"`, "info");
    }
  };

  const handleKey = useCallback((key: string) => {
    if (status !== "playing") return;

    if (key === "⌫" || key === "BACKSPACE") {
      setRows((prev) => {
        const next = prev.map((r, i) => {
          if (i !== currentRow) return r;
          const letters = [...r.letters];
          const last = letters.map((l) => l !== "").lastIndexOf(true);
          if (last >= 0) letters[last] = "";
          return { ...r, letters };
        });
        saveGameState({ rows: next, currentRow, status, startTime: startTimeRef.current, score, dateKey: getTodayKey(), difficulty, hintsUsed: hintsUsedThisGame });
        return next;
      });
      return;
    }

    if (key === "ENTER") {
      setRows((prev) => {
        const row = prev[currentRow];
        const guess = row.letters.join("");
        if (guess.length < wordLength) {
          setShake(true); setTimeout(() => setShake(false), 500);
          showToastMsg("Kelime çok kısa!", "error");
          return prev;
        }

        const states = evaluateGuess(guess, target);
        const newRows = prev.map((r, i) => i !== currentRow ? r : { ...r, states, submitted: true });
        const won = states.every((s) => s === "correct");
        const newRow = currentRow + 1;
        const lost = !won && newRow >= maxGuesses;
        const newStatus: GameStatus = won ? "won" : lost ? "lost" : "playing";
        const timeSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const finalScore = won ? calculateScore(newRow, timeSeconds) : 0;

        setCurrentRow(newRow);
        setStatus(newStatus);
        setElapsedTime(timeSeconds);

        if (newStatus !== "playing") {
          setScore(finalScore);
          if (timerRef.current) clearInterval(timerRef.current);

          setTimeout(() => {
            const prevStats = getStats();
            const prevLevel = getLevel(prevStats.totalXP);
            const newStats = updateStatsAfterGame(won, newRow, timeSeconds, difficulty, hintsUsedThisGame);
            const newLevel = getLevel(newStats.totalXP);

            // Missions
            if (won) {
              completeMission("win_today");
              if (timeSeconds <= 120) completeMission("fast_win");
              if (hintsUsedThisGame === 0) completeMission("no_hints");
              if (difficulty === "zor") completeMission("hard_mode");
              setMissions(getDailyMissions());
            }

            if (won && newLevel > prevLevel) setLevelUp(true);
            if (won) {
              const earned = newStats.totalXP - prevStats.totalXP;
              setXpGained(earned);
            }

            if (won && username) {
              saveToLeaderboard({ name: username, score: finalScore, guesses: newRow, time: timeSeconds, date: getTodayKey() });
            }

            if (won) {
              confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 }, colors: ["#7c3aed", "#db2777", "#06b6d4", "#10b981", "#f59e0b"] });
              setTimeout(() => confetti({ particleCount: 60, spread: 120, origin: { y: 0.3 }, angle: 60, colors: ["#a78bfa", "#f472b6"] }), 300);
              setTimeout(() => confetti({ particleCount: 60, spread: 120, origin: { y: 0.3 }, angle: 120, colors: ["#34d399", "#fbbf24"] }), 500);
            }
            setTimeout(() => setShowResult(true), won ? 1800 : 800);
          }, 300);
        }

        saveGameState({ rows: newRows, currentRow: newRow, status: newStatus, startTime: startTimeRef.current, score: finalScore, dateKey: getTodayKey(), difficulty, hintsUsed: hintsUsedThisGame });
        return newRows;
      });
      return;
    }

    const upper = key.toUpperCase();
    if (!TURKISH_LETTERS.includes(upper) || upper.length !== 1) return;

    setRows((prev) => {
      const row = prev[currentRow];
      const firstEmpty = row.letters.indexOf("");
      if (firstEmpty === -1) return prev;
      const next = prev.map((r, i) => {
        if (i !== currentRow) return r;
        const letters = [...r.letters];
        letters[firstEmpty] = upper;
        return { ...r, letters };
      });
      saveGameState({ rows: next, currentRow, status, startTime: startTimeRef.current, score, dateKey: getTodayKey(), difficulty, hintsUsed: hintsUsedThisGame });
      return next;
    });
  }, [currentRow, status, target, wordLength, username, score, difficulty, hintsUsedThisGame, maxGuesses]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "Enter") handleKey("ENTER");
      else if (e.key === "Backspace") handleKey("⌫");
      else handleKey(e.key);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleKey]);

  const stats = typeof window !== "undefined" ? getStats() : null;
  const level = stats ? getLevel(stats.totalXP) : 1;
  const { percent } = stats ? getLevelProgress(stats.totalXP) : { percent: 0 };
  const keyStates = buildKeyboardState(rows);
  const completedMissions = missions.filter((m) => m.completed).length;
  const diffColors: Record<Difficulty, string> = { kolay: "#10b981", normal: "#8b5cf6", zor: "#ef4444" };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(160deg, #050d1a 0%, #0a1628 50%, #060e1f 100%)" }}>
      {/* BG glow effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-72 h-72 bg-pink-600/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative border-b border-white/10 backdrop-blur-sm px-3 py-2">
        <div className="flex items-center justify-between">
          {/* Left buttons */}
          <div className="flex items-center gap-2">
            <button onClick={() => setShowStats(true)} className="w-12 h-12 flex items-center justify-center rounded-xl border transition-all text-2xl hover:scale-110 active:scale-95" style={{ background: "rgba(124,58,237,0.15)", borderColor: "rgba(124,58,237,0.4)", boxShadow: "0 0 12px rgba(124,58,237,0.3)" }} title="İstatistikler">📊</button>
            <button onClick={() => setShowMissions(true)} className="relative w-12 h-12 flex items-center justify-center rounded-xl border transition-all text-2xl hover:scale-110 active:scale-95" style={{ background: "rgba(249,115,22,0.15)", borderColor: "rgba(249,115,22,0.4)", boxShadow: "0 0 12px rgba(249,115,22,0.3)" }} title="Görevler">
              🎯
              {completedMissions < missions.length && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-orange-500 rounded-full border-2 border-black" />
              )}
            </button>
          </div>

          {/* Center */}
          <div className="text-center">
            <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent leading-none">
              Kelimeci
            </h1>
            <div className="flex items-center gap-1 justify-center mt-0.5">
              <span>{category.emoji}</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full border" style={{ backgroundColor: category.color + "22", borderColor: category.color + "55", color: category.color }}>
                {category.name}
              </span>
              <span className="text-xs font-bold px-1.5 py-0.5 rounded-full border" style={{ backgroundColor: diffColors[difficulty] + "22", borderColor: diffColors[difficulty] + "55", color: diffColors[difficulty] }}>
                {difficulty}
              </span>
            </div>
          </div>

          {/* Right buttons */}
          <div className="flex items-center gap-2">
            <button onClick={() => setShowDifficulty(true)} className="w-12 h-12 flex items-center justify-center rounded-xl border transition-all text-2xl hover:scale-110 active:scale-95" style={{ background: "rgba(6,182,212,0.15)", borderColor: "rgba(6,182,212,0.4)", boxShadow: "0 0 12px rgba(6,182,212,0.3)" }} title="Zorluk">⚙️</button>
            <button onClick={() => setShowLeaderboard(true)} className="w-12 h-12 flex items-center justify-center rounded-xl border transition-all text-2xl hover:scale-110 active:scale-95" style={{ background: "rgba(234,179,8,0.15)", borderColor: "rgba(234,179,8,0.4)", boxShadow: "0 0 12px rgba(234,179,8,0.3)" }} title="Liderboard">🏆</button>
          </div>
        </div>

        {/* Level bar + info */}
        {stats && (
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black" style={{ background: "linear-gradient(135deg, #7c3aed, #db2777)" }}>
                {level}
              </div>
              <span className="text-zinc-400 text-xs hidden sm:block">{getLevelTitle(level)}</span>
            </div>
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${percent}%`, background: "linear-gradient(90deg, #7c3aed, #db2777)" }} />
            </div>
            <div className="flex items-center gap-1 text-xs text-zinc-400">
              {stats.currentStreak > 0 && <span className="flex items-center gap-0.5">🔥{stats.currentStreak}</span>}
              <span className="font-mono">{String(Math.floor(elapsedTime / 60)).padStart(2, "0")}:{String(elapsedTime % 60).padStart(2, "0")}</span>
            </div>
          </div>
        )}
      </header>

      {/* Toast */}
      {toast.msg && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-40 animate-fade-slide">
          <div className={`font-bold px-5 py-2.5 rounded-xl shadow-2xl text-sm ${toast.type === "error" ? "bg-red-500 text-white" : toast.type === "success" ? "bg-emerald-500 text-white" : "bg-white text-black"}`}>
            {toast.msg}
          </div>
        </div>
      )}

      {/* Level up toast */}
      {levelUp && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-40 animate-fade-slide">
          <div className="font-bold px-5 py-3 rounded-xl shadow-2xl text-sm text-white text-center" style={{ background: "linear-gradient(135deg, #7c3aed, #db2777)" }}>
            🎉 SEVİYE ATLADINIZ! Level {level}
          </div>
        </div>
      )}

      {/* Game */}
      <main className="relative flex-1 flex flex-col items-center justify-center gap-4 px-4 py-4">
        {/* Progress */}
        <div className="flex items-center gap-2 w-full max-w-xs">
          <span className="text-zinc-500 text-xs">{currentRow}/{maxGuesses}</span>
          <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(currentRow / maxGuesses) * 100}%`, background: "linear-gradient(90deg, #7c3aed, #06b6d4)" }} />
          </div>
        </div>

        <Board rows={rows.slice(0, maxGuesses)} currentRow={currentRow} wordLength={wordLength} shake={shake} revealedHints={revealedHints} />

        {/* Hint button */}
        {status === "playing" && (
          <button
            onClick={handleHint}
            disabled={hintsRemaining <= 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border transition-all active:scale-95 disabled:opacity-40"
            style={{ borderColor: "rgba(251,191,36,0.3)", background: "rgba(251,191,36,0.08)", color: "#fbbf24" }}
          >
            <span>💡</span>
            <span className="text-sm font-bold">İpucu</span>
            <span className="text-xs bg-yellow-500/20 px-1.5 py-0.5 rounded-full">{hintsRemaining} kaldı</span>
          </button>
        )}

        <div className="w-full max-w-lg">
          <Keyboard onKey={handleKey} keyStates={keyStates} />
        </div>

        {/* XP gained */}
        {xpGained > 0 && status !== "playing" && (
          <div className="flex items-center gap-1 text-yellow-400 font-bold text-sm animate-fade-slide">
            <span>⭐</span><span>+{xpGained} XP kazandın!</span>
          </div>
        )}
      </main>

      {/* Modals */}
      {showUsername && <UsernameModal onSave={(name) => { setUsername(name); setShowUsername(false); }} />}
      {showResult && !showUsername && (
        <ResultModal
          status={status} target={target} guesses={currentRow} score={score}
          time={elapsedTime} categoryName={category.name} rows={rows}
          difficulty={difficulty} hintsUsed={hintsUsedThisGame} xpGained={xpGained}
          streak={stats?.currentStreak ?? 0}
          onShowLeaderboard={() => { setShowResult(false); setShowLeaderboard(true); }}
          onClose={() => setShowResult(false)}
        />
      )}
      {showLeaderboard && <Leaderboard onClose={() => setShowLeaderboard(false)} />}
      {showStats && <StatsModal onClose={() => setShowStats(false)} />}
      {showDifficulty && <DifficultyModal current={difficulty} onSelect={setDifficulty} onClose={() => setShowDifficulty(false)} />}
      {showMissions && <MissionsPanel missions={missions} onClose={() => setShowMissions(false)} />}
    </div>
  );
}
