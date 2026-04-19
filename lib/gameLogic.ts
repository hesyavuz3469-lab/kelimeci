import { Difficulty } from "./storage";

export type LetterState = "correct" | "present" | "absent" | "empty" | "tbd";

export type GuessRow = {
  letters: string[];
  states: LetterState[];
  submitted: boolean;
};

export type GameStatus = "playing" | "won" | "lost";

export const MAX_GUESSES_BY_DIFFICULTY: Record<Difficulty, number> = {
  kolay: 7,
  normal: 6,
  zor: 5,
};

export const MAX_GUESSES = 6;

export function evaluateGuess(guess: string, target: string): LetterState[] {
  const result: LetterState[] = Array(target.length).fill("absent");
  const targetArr = target.split("");
  const guessArr = guess.split("");

  guessArr.forEach((letter, i) => {
    if (letter === targetArr[i]) {
      result[i] = "correct";
      targetArr[i] = "#";
      guessArr[i] = "*";
    }
  });

  guessArr.forEach((letter, i) => {
    if (letter === "*") return;
    const idx = targetArr.indexOf(letter);
    if (idx !== -1) {
      result[i] = "present";
      targetArr[idx] = "#";
    }
  });

  return result;
}

export function buildKeyboardState(rows: GuessRow[]): Record<string, LetterState> {
  const state: Record<string, LetterState> = {};
  const priority: Record<LetterState, number> = { correct: 3, present: 2, absent: 1, empty: 0, tbd: 0 };

  rows.forEach((row) => {
    if (!row.submitted) return;
    row.letters.forEach((letter, i) => {
      const current = state[letter];
      const next = row.states[i];
      if (!current || priority[next] > priority[current]) state[letter] = next;
    });
  });

  return state;
}

export function createEmptyRow(wordLength: number): GuessRow {
  return { letters: Array(wordLength).fill(""), states: Array(wordLength).fill("empty"), submitted: false };
}

export function getHintLetter(target: string, rows: GuessRow[], currentRow: number): number {
  // Returns index of an unrevealed letter
  const revealed = new Set<number>();
  rows.slice(0, currentRow).forEach((row) => {
    if (!row.submitted) return;
    row.states.forEach((state, i) => { if (state === "correct") revealed.add(i); });
  });

  const unrevealed = target.split("").map((_, i) => i).filter((i) => !revealed.has(i));
  if (unrevealed.length === 0) return -1;
  return unrevealed[Math.floor(Math.random() * unrevealed.length)];
}
