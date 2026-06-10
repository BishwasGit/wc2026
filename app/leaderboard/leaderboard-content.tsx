"use client";
import { useEffect, useState } from "react";
import type { Match, Prediction } from "@/lib/types";
import LoadingSpinner from "@/components/LoadingSpinner";

const PRED_KEY = "wc2026_predictions";

function getUserId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("wc2026_uid");
  if (!id) {
    id = Math.random().toString(36).slice(2);
    localStorage.setItem("wc2026_uid", id);
  }
  return id;
}

function getPredictions(): Prediction[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(PRED_KEY) || "[]");
  } catch {
    return [];
  }
}

interface StatRow {
  matchId: number;
  homeTeam: string;
  awayTeam: string;
  actualHome: number | null;
  actualAway: number | null;
  predHome: number;
  predAway: number;
  correctScore: boolean;
  correctWinner: boolean;
}

export default function LeaderboardContent() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/matches?status=FINISHED")
      .then((r) => r.json())
      .then((d) => setMatches(d.matches || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading leaderboard..." />;

  const userId = getUserId();
  const predictions = getPredictions().filter((p) => p.userId === userId);
  const finishedPredictions = predictions.filter((p) =>
    matches.some((m) => m.id === p.matchId && m.score.fullTime.home != null)
  );

  const stats: StatRow[] = finishedPredictions.map((p) => {
    const m = matches.find((x) => x.id === p.matchId)!;
    const ah = m.score.fullTime.home;
    const aa = m.score.fullTime.away;
    const cs = ah === p.homeScore && aa === p.awayScore;
    const actualWinner = ah != null && aa != null ? (ah > aa ? "H" : ah < aa ? "A" : "D") : null;
    const predWinner = p.homeScore > p.awayScore ? "H" : p.homeScore < p.awayScore ? "A" : "D";
    return {
      matchId: p.matchId,
      homeTeam: m.homeTeam.shortName || m.homeTeam.name,
      awayTeam: m.awayTeam.shortName || m.awayTeam.name,
      actualHome: ah,
      actualAway: aa,
      predHome: p.homeScore,
      predAway: p.awayScore,
      correctScore: cs,
      correctWinner: actualWinner === predWinner,
    };
  });

  const totalPreds = predictions.length;
  const finishedCount = finishedPredictions.length;
  const correctScores = stats.filter((s) => s.correctScore).length;
  const correctWinners = stats.filter((s) => s.correctWinner).length;
  const points = correctScores * 3 + (correctWinners - correctScores) * 1;
  const accuracy = finishedCount > 0 ? Math.round((correctWinners / finishedCount) * 100) : 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Leaderboard</h1>
        <p className="text-sm text-gray-500">Your prediction stats based on finished matches.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Predictions" value={totalPreds} />
        <StatCard label="Finished" value={finishedCount} />
        <StatCard label="Points" value={points} highlight />
        <StatCard label="Accuracy" value={`${accuracy}%`} />
      </div>

      {stats.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-[#1a2e1a] text-xs text-gray-500 font-semibold uppercase tracking-wider">
            Match History
          </div>
          <div className="divide-y divide-[#1a2e1a]">
            {stats.map((s) => (
              <div key={s.matchId} className="px-4 py-3 flex items-center gap-3 text-sm">
                <div className="flex-1 min-w-0">
                  <span className="text-white">{s.homeTeam}</span>
                  <span className="text-gray-600 mx-1">vs</span>
                  <span className="text-white">{s.awayTeam}</span>
                </div>
                <div className="text-right font-mono text-xs text-gray-500 whitespace-nowrap">
                  {s.actualHome} : {s.actualAway}
                </div>
                <div className="text-gray-600 text-xs px-2">|</div>
                <div className="text-right font-mono text-xs whitespace-nowrap">
                  <span className={s.correctScore ? "text-[#4ade80]" : "text-gray-500"}>
                    {s.predHome} : {s.predAway}
                  </span>
                </div>
                <div className="w-16 text-right">
                  {s.correctScore && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#4ade80]/20 text-[#4ade80] font-semibold">+3</span>}
                  {!s.correctScore && s.correctWinner && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-400/20 text-blue-400 font-semibold">+1</span>}
                  {!s.correctScore && !s.correctWinner && <span className="text-[10px] px-1.5 py-0.5 rounded text-gray-600 font-semibold">0</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.length === 0 && (
        <div className="card p-8 text-center">
          <p className="text-gray-500 text-sm mb-2">No finished matches with predictions yet.</p>
          <p className="text-xs text-gray-600">Predict upcoming matches on the Predict page to start earning points.</p>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="card p-4 text-center">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold font-mono ${highlight ? "text-[#4ade80]" : "text-white"}`}>{value}</p>
    </div>
  );
}
