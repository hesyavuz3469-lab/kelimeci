import { GuessRow, GameStatus } from "./gameLogic";
import { getTodayKey } from "./words";

export type LeaderboardEntry = {
  name: string;
  score: number;
  guesses: number;
  time: number;
  date: string;
};

export type SavedGameState = {
  rows: GuessRow[];
  currentRow: number;
  status: GameStatus;
  startTime: number;
  score: number;
  dateKey: string;
};

const GAME_KEY = "kelimeci_game";
const LEADERBOARD_KEY = "kelimeci_leaderboard";
const USERNAME_KEY = "kelimeci_username";

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
  } catch {
    return null;
  }
}

export function saveToLeaderboard(entry: LeaderboardEntry): void {
  if (typeof window === "undefined") return;
  const board = getLeaderboard();
  board.push(entry);
  board.sort((a, b) => b.score - a.score);
  const top50 = board.slice(0, 50);
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(top50));
}

export function getLeaderboard(): LeaderboardEntry[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(LEADERBOARD_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as LeaderboardEntry[];
  } catch {
    return [];
  }
}

export function getUsername(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(USERNAME_KEY) || "";
}

export function saveUsername(name: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USERNAME_KEY, name);
}

export function buildShareText(
  guesses: number,
  rows: GuessRow[],
  categoryName: string
): string {
  const stateEmoji: Record<string, string> = {
    correct: "🟩",
    present: "🟨",
    absent: "⬛",
    empty: "⬜",
    tbd: "⬜",
  };

  const grid = rows
    .filter((r) => r.submitted)
    .map((r) => r.states.map((s) => stateEmoji[s]).join(""))
    .join("\n");

  return `Kelimeci - ${categoryName}\n${guesses}/6\n\n${grid}\n\nkelimeci.com`;
}
