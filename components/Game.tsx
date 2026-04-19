"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Board from "./Board";
import Keyboard from "./Keyboard";
import ResultModal from "./ResultModal";
import Leaderboard from "./Leaderboard";
import UsernameModal from "./UsernameModal";
import {
  MAX_GUESSES,
  GameStatus,
  GuessRow,
  evaluateGuess,
  buildKeyboardState,
  createEmptyRow,
  calculateScore,
} from "@/lib/gameLogic";
import {
  saveGameState,
  loadGameState,
  saveToLeaderboard,
  getUsername,
} from "@/lib/storage";
import { getDailyCategory, getDailyWord, getTodayKey } from "@/lib/words";

const TURKISH_LETTERS = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ";

export default function Game() {
  const category = getDailyCategory();
  const target = getDailyWord(category);
  const wordLength = target.length;

  const [rows, setRows] = useState<GuessRow[]>(() =>
    Array.from({ length: MAX_GUESSES }, () => createEmptyRow(wordLength))
  );
  const [currentRow, setCurrentRow] = useState(0);
  const [status, setStatus] = useState<GameStatus>("playing");
  const [shake, setShake] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showUsername, setShowUsername] = useState(false);
  const [username, setUsername] = useState("");
  const [score, setScore] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const saved = loadGameState();
    if (saved) {
      setRows(saved.rows);
      setCurrentRow(saved.currentRow);
      setStatus(saved.status);
      setScore(saved.score);
      startTimeRef.current = saved.startTime;
      if (saved.status !== "playing") setShowResult(true);
    }
    const savedName = getUsername();
    if (savedName) setUsername(savedName);
    else setShowUsername(true);
  }, []);

  useEffect(() => {
    if (status !== "playing") return;
    timerRef.current = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [status]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
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
        saveGameState({ rows: next, currentRow, status, startTime: startTimeRef.current, score, dateKey: getTodayKey() });
        return next;
      });
      return;
    }

    if (key === "ENTER") {
      setRows((prev) => {
        const row = prev[currentRow];
        const guess = row.letters.join("");
        if (guess.length < wordLength) {
          setShake(true);
          setTimeout(() => setShake(false), 500);
          showToast("Kelime çok kısa!");
          return prev;
        }
        const states = evaluateGuess(guess, target);
        const newRows = prev.map((r, i) => i !== currentRow ? r : { ...r, states, submitted: true });
        const won = states.every((s) => s === "correct");
        const newRow = currentRow + 1;
        const lost = !won && newRow >= MAX_GUESSES;
        const newStatus: GameStatus = won ? "won" : lost ? "lost" : "playing";
        const timeSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const finalScore = won ? calculateScore(newRow, timeSeconds) : 0;

        setCurrentRow(newRow);
        setStatus(newStatus);
        setElapsedTime(timeSeconds);

        if (newStatus !== "playing") {
          setScore(finalScore);
          if (timerRef.current) clearInterval(timerRef.current);
          setTimeout(() => setShowResult(true), won ? 1800 : 800);
          if (won && username) {
            saveToLeaderboard({ name: username, score: finalScore, guesses: newRow, time: timeSeconds, date: getTodayKey() });
          }
        }
        saveGameState({ rows: newRows, currentRow: newRow, status: newStatus, startTime: startTimeRef.current, score: finalScore, dateKey: getTodayKey() });
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
      saveGameState({ rows: next, currentRow, status, startTime: startTimeRef.current, score, dateKey: getTodayKey() });
      return next;
    });
  }, [currentRow, status, target, wordLength, username, score]);

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

  const keyStates = buildKeyboardState(rows);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(135deg, #0f0f1a 0%, #1a0f2e 50%, #0f1a1f 100%)" }}>
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-violet-600/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative border-b border-white/10 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setShowLeaderboard(true)}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-xl border border-white/10"
          title="Liderboard"
        >
          🏆
        </button>

        <div className="text-center">
          <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            Kelimeci
          </h1>
          <div className="flex items-center gap-1.5 justify-center mt-0.5">
            <span className="text-base">{category.emoji}</span>
            <span
              className="text-xs font-bold px-2.5 py-0.5 rounded-full border"
              style={{
                backgroundColor: category.color + "22",
                borderColor: category.color + "55",
                color: category.color,
              }}
            >
              {category.name}
            </span>
          </div>
        </div>

        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10">
          <span className="text-xs font-mono text-zinc-300">
            {String(Math.floor(elapsedTime / 60)).padStart(2, "0")}:{String(elapsedTime % 60).padStart(2, "0")}
          </span>
        </div>
      </header>

      {/* Toast */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 animate-fade-slide">
          <div className="bg-white text-black font-bold px-5 py-2.5 rounded-xl shadow-2xl text-sm">
            {toast}
          </div>
        </div>
      )}

      {/* Game */}
      <main className="relative flex-1 flex flex-col items-center justify-center gap-6 px-4 py-6">
        {/* Progress bar */}
        <div className="w-full max-w-xs h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all duration-500"
            style={{ width: `${(currentRow / MAX_GUESSES) * 100}%` }}
          />
        </div>

        <Board rows={rows} currentRow={currentRow} wordLength={wordLength} shake={shake} />

        <div className="w-full max-w-lg">
          <Keyboard onKey={handleKey} keyStates={keyStates} />
        </div>
      </main>

      {/* Modals */}
      {showUsername && (
        <UsernameModal onSave={(name) => { setUsername(name); setShowUsername(false); }} />
      )}
      {showResult && !showUsername && (
        <ResultModal
          status={status}
          target={target}
          guesses={currentRow}
          score={score}
          time={elapsedTime}
          categoryName={category.name}
          rows={rows}
          onShowLeaderboard={() => { setShowResult(false); setShowLeaderboard(true); }}
          onClose={() => setShowResult(false)}
        />
      )}
      {showLeaderboard && <Leaderboard onClose={() => setShowLeaderboard(false)} />}
    </div>
  );
}
