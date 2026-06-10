"use client";
import type { Prediction } from "@/lib/types";

const KEY = "wc2026_predictions";

function getPredictions(): Prediction[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function getUserId(): string {
  let id = localStorage.getItem("wc2026_uid");
  if (!id) {
    id = Math.random().toString(36).slice(2);
    localStorage.setItem("wc2026_uid", id);
  }
  return id;
}

function getPredictionForMatch(matchId: number): Prediction | null {
  return getPredictions().find((p) => p.matchId === matchId && p.userId === getUserId()) ?? null;
}

export default function YourPrediction({ matchId }: { matchId: number }) {
  const prediction = getPredictionForMatch(matchId);
  if (!prediction) return null;
  return (
    <div className="card p-5 space-y-2">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Your Prediction</h2>
      <p className="font-mono text-2xl text-[#4ade80] font-bold">
        {prediction.homeScore} <span className="text-gray-600">:</span> {prediction.awayScore}
      </p>
    </div>
  );
}
