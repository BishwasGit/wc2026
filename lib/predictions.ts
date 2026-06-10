import type { Prediction } from "./types";

const KEY = "wc2026_predictions";

export function getPredictions(): Prediction[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function savePrediction(p: Omit<Prediction, "userId" | "createdAt">): void {
  const all = getPredictions();
  const userId = getUserId();
  const existing = all.findIndex((x) => x.matchId === p.matchId && x.userId === userId);
  const pred: Prediction = { ...p, userId, createdAt: Date.now() };
  if (existing >= 0) all[existing] = pred;
  else all.push(pred);
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function getPredictionForMatch(matchId: number): Prediction | null {
  return getPredictions().find((p) => p.matchId === matchId && p.userId === getUserId()) ?? null;
}

function getUserId(): string {
  let id = localStorage.getItem("wc2026_uid");
  if (!id) {
    id = Math.random().toString(36).slice(2);
    localStorage.setItem("wc2026_uid", id);
  }
  return id;
}
