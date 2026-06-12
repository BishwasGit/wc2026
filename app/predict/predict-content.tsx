"use client";
import { useEffect, useState } from "react";
import MatchCard from "@/components/MatchCard";
import type { Match } from "@/lib/types";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function PredictContent() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/matches")
      .then((r) => r.json())
      .then((d) => setMatches((d.matches || []).filter((m: Match) => m.status !== "FINISHED" && m.status !== "IN_PLAY" && m.status !== "LIVE" && m.status !== "PAUSED").slice(0, 20)))
      .finally(() => setLoading(false));
  }, []);

  const grouped = matches.reduce<Record<string, Match[]>>((acc, m) => {
    const day = m.utcDate.split("T")[0];
    (acc[day] ||= []).push(m);
    return acc;
  }, {});

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Predictions</h1>
        <p className="text-sm text-gray-500">Pick your scorelines for upcoming matches. Saved locally on your device.</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20 text-gray-500">
          <LoadingSpinner />
        </div>
      )}

      {!loading && matches.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <p className="text-4xl mb-3 opacity-30">[ ]</p>
          <p>No upcoming matches to predict</p>
        </div>
      )}

      <div className="flex flex-col gap-8">
        {Object.entries(grouped).sort().map(([date, dayMatches]) => (
          <div key={date}>
            <h2 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-3">
              {new Date(date).toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
            </h2>
            <div className="flex flex-col gap-3">
              {dayMatches.map((m) => <MatchCard key={m.id} match={m} showPredict />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
