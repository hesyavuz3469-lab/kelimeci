import { GuessRow, GameStatus } from "./gameLogic";
import { getTodayKey } from "./words";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Difficulty = "kolay" | "normal" | "zor";

export type LeaderboardEntry = {
  name: string;
  score: number;
  guesses: number;
  time: number;
  date: string;
};

export type PlayerStats = {
  totalGames: number;
  totalWins: number;
  currentStreak: number;
  bestStreak: number;
  lastPlayedDate: string;
  guessDistribution: number[]; // index 0 = 1 guess, index 5 = 6 guesses
  totalXP: number;
  level: number;
  hintsUsedToday: number;
  hintsResetDate: string;
};

export type Mission = {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  completed: boolean;
  progress: number;
  target: number;
};

export type SavedGameState = {
  rows: GuessRow[];
  currentRow: number;
  status: GameStatus;
  startTime: number;
  score: number;
  dateKey: string;
  difficulty: Difficulty;
  hintsUsed: number;
};

// ─── Keys ─────────────────────────────────────────────────────────────────────

const GAME_KEY = "kelimeci_game";
const LEADERBOARD_KEY = "kelimeci_leaderboard";
const USERNAME_KEY = "kelimeci_username";
const STATS_KEY = "kelimeci_stats";
const MISSIONS_KEY = "kelimeci_missions";
const DIFFICULTY_KEY = "kelimeci_difficulty";

// ─── XP / Level ───────────────────────────────────────────────────────────────

export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 900, 1400, 2100, 3000, 4200, 5800, 8000];

export function getLevel(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export function getLevelProgress(xp: number): { current: number; next: number; percent: number } {
  const level = getLevel(xp);
  const current = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const next = LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  const percent = next === current ? 100 : Math.round(((xp - current) / (next - current)) * 100);
  return { current, next, percent };
}

export function calculateXP(guesses: number, time: number, streak: number, difficulty: Difficulty, hintsUsed: number): number {
  const baseXP: Record<number, number> = { 1: 500, 2: 400, 3: 300, 4: 200, 5: 150, 6: 100 };
  let xp = baseXP[guesses] ?? 50;
  const streakBonus = Math.min(streak * 15, 150);
  const timeBonus = Math.max(0, Math.floor((300 - time) / 10));
  const diffBonus = difficulty === "zor" ? 100 : difficulty === "normal" ? 40 : 0;
  const hintPenalty = hintsUsed * 20;
  return Math.max(10, xp + streakBonus + timeBonus + diffBonus - hintPenalty);
}

export function getLevelTitle(level: number): string {
  const titles = ["", "Acemi", "Öğrenci", "Meraklı", "Bilgili", "Usta", "Uzman", "Deha", "Efsane", "Kelime Tanrısı", "Ölümsüz"];
  return titles[Math.min(level, titles.length - 1)] ?? "Efsane";
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export function getStats(): PlayerStats {
  if (typeof window === "undefined") return defaultStats();
  const raw = localStorage.getItem(STATS_KEY);
  if (!raw) return defaultStats();
  try {
    return { ...defaultStats(), ...JSON.parse(raw) };
  } catch { return defaultStats(); }
}

function defaultStats(): PlayerStats {
  return {
    totalGames: 0, totalWins: 0, currentStreak: 0, bestStreak: 0,
    lastPlayedDate: "", guessDistribution: [0, 0, 0, 0, 0, 0],
    totalXP: 0, level: 1, hintsUsedToday: 0, hintsResetDate: "",
  };
}

export function updateStatsAfterGame(won: boolean, guesses: number, time: number, difficulty: Difficulty, hintsUsed: number): PlayerStats {
  const stats = getStats();
  const today = getTodayKey();

  // Streak
  const yesterday = getYesterdayKey();
  if (won) {
    if (stats.lastPlayedDate === yesterday || stats.lastPlayedDate === today) {
      stats.currentStreak = stats.lastPlayedDate === today ? stats.currentStreak : stats.currentStreak + 1;
    } else {
      stats.currentStreak = 1;
    }
    stats.bestStreak = Math.max(stats.bestStreak, stats.currentStreak);
  } else {
    stats.currentStreak = 0;
  }

  stats.lastPlayedDate = today;
  stats.totalGames += 1;
  if (won) {
    stats.totalWins += 1;
    stats.guessDistribution[guesses - 1] = (stats.guessDistribution[guesses - 1] ?? 0) + 1;
    const earnedXP = calculateXP(guesses, time, stats.currentStreak, difficulty, hintsUsed);
    stats.totalXP += earnedXP;
    stats.level = getLevel(stats.totalXP);
  }

  if (typeof window !== "undefined") localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  return stats;
}

function getYesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

// ─── Hints ────────────────────────────────────────────────────────────────────

export const MAX_HINTS_PER_DAY = 3;

export function getHintsRemaining(): number {
  const stats = getStats();
  const today = getTodayKey();
  if (stats.hintsResetDate !== today) return MAX_HINTS_PER_DAY;
  return Math.max(0, MAX_HINTS_PER_DAY - stats.hintsUsedToday);
}

export function useHint(): boolean {
  const remaining = getHintsRemaining();
  if (remaining <= 0) return false;
  const stats = getStats();
  const today = getTodayKey();
  if (stats.hintsResetDate !== today) {
    stats.hintsUsedToday = 1;
    stats.hintsResetDate = today;
  } else {
    stats.hintsUsedToday += 1;
  }
  if (typeof window !== "undefined") localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  return true;
}

// ─── Missions ─────────────────────────────────────────────────────────────────

export function getDailyMissions(): Mission[] {
  if (typeof window === "undefined") return buildMissions();
  const today = getTodayKey();
  const raw = localStorage.getItem(MISSIONS_KEY);
  if (raw) {
    try {
      const saved = JSON.parse(raw);
      if (saved.date === today) return saved.missions;
    } catch { /* */ }
  }
  const missions = buildMissions();
  localStorage.setItem(MISSIONS_KEY, JSON.stringify({ date: today, missions }));
  return missions;
}

function buildMissions(): Mission[] {
  return [
    { id: "win_today", title: "Günlük Zafer", description: "Bugün bir kelime bul", xpReward: 50, completed: false, progress: 0, target: 1 },
    { id: "fast_win", title: "Hızlı Düşün", description: "2 dakika içinde kazan", xpReward: 80, completed: false, progress: 0, target: 1 },
    { id: "no_hints", title: "İpuçsuz Kahraman", description: "İpucu kullanmadan kazan", xpReward: 100, completed: false, progress: 0, target: 1 },
    { id: "hard_mode", title: "Zor Mod Ustası", description: "Zor modda oyna", xpReward: 120, completed: false, progress: 0, target: 1 },
  ];
}

export function completeMission(id: string): void {
  if (typeof window === "undefined") return;
  const today = getTodayKey();
  const raw = localStorage.getItem(MISSIONS_KEY);
  if (!raw) return;
  try {
    const saved = JSON.parse(raw);
    if (saved.date !== today) return;
    const mission = saved.missions.find((m: Mission) => m.id === id);
    if (mission && !mission.completed) {
      mission.completed = true;
      mission.progress = mission.target;
      localStorage.setItem(MISSIONS_KEY, JSON.stringify(saved));
      // Award XP
      const stats = getStats();
      stats.totalXP += mission.xpReward;
      stats.level = getLevel(stats.totalXP);
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    }
  } catch { /* */ }
}

// ─── Game State ───────────────────────────────────────────────────────────────

export function saveGameState(state: SavedGameState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GAME_KEY, JSON.stringify(state));
}

export function loadGameState(): SavedGameState | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(GAME_KEY);
  if (!raw) return null;
  try {
    const state = JSON.parse(raw) as SavedGameState;
    if (state.dateKey !== getTodayKey()) return null;
    return state;
  } catch { return null; }
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────

export function saveToLeaderboard(entry: LeaderboardEntry): void {
  if (typeof window === "undefined") return;
  const board = getLeaderboard();
  board.push(entry);
  board.sort((a, b) => b.score - a.score);
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(board.slice(0, 50)));
}

export function getLeaderboard(): LeaderboardEntry[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(LEADERBOARD_KEY) ?? "[]"); } catch { return []; }
}

// ─── User ─────────────────────────────────────────────────────────────────────

export function getUsername(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(USERNAME_KEY) ?? "";
}

export function saveUsername(name: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USERNAME_KEY, name);
}

export function getDifficulty(): Difficulty {
  if (typeof window === "undefined") return "normal";
  return (localStorage.getItem(DIFFICULTY_KEY) as Difficulty) ?? "normal";
}

export function saveDifficulty(d: Difficulty): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DIFFICULTY_KEY, d);
}

// ─── Share ────────────────────────────────────────────────────────────────────

export function buildShareText(guesses: number, rows: GuessRow[], categoryName: string): string {
  const em: Record<string, string> = { correct: "🟩", present: "🟨", absent: "⬛", empty: "⬜", tbd: "⬜" };
  const grid = rows.filter((r) => r.submitted).map((r) => r.states.map((s) => em[s]).join("")).join("\n");
  return `Kelimeci - ${categoryName}\n${guesses}/6\n\n${grid}\n\nkelimeci.vercel.app`;
}

// ─── Score ────────────────────────────────────────────────────────────────────

export function calculateScore(guessCount: number, timeSeconds: number): number {
  const base = (6 - guessCount + 1) * 100;
  const timeBonus = Math.max(0, 300 - timeSeconds);
  return base + timeBonus;
}
