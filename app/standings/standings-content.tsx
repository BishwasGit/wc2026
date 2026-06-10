"use client";
import { useEffect, useState } from "react";
import type { StandingGroup } from "@/lib/types";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function StandingsContent() {
  const [groups, setGroups] = useState<StandingGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullStats, setShowFullStats] = useState(false);

  useEffect(() => {
    fetch("/api/standings")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setGroups(d.standings || []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-gray-500">
      <div className="text-center">
        <LoadingSpinner />
        <p className="text-sm mt-3">Loading standings...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="card p-4 border-red-900">
      <p className="text-red-400 text-sm">{error}</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-3 text-xs px-3 py-1.5 rounded bg-[#1a2e1a] text-[#4ade80] hover:bg-[#243824] transition-colors"
      >
        Try Again
      </button>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Group Standings</h1>
        <button
          onClick={() => setShowFullStats(!showFullStats)}
          className="text-xs px-3 py-1.5 rounded bg-[#1a2e1a] text-[#4ade80] hover:bg-[#243824] transition-colors md:hidden"
        >
          {showFullStats ? "Compact" : "Full stats"}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groups.map((g) => (
          <div key={g.group} className="card overflow-hidden">
            <div className="px-4 py-3 border-b border-[#1a2e1a] flex items-center justify-between">
              <span className="font-semibold text-sm">{g.group}</span>
              <span className="text-xs text-gray-500 font-mono">
                {showFullStats ? "P W D L GD Pts" : "P Pts"}
              </span>
            </div>
            <table className="w-full">
              <tbody>
                {g.table.map((row, i) => (
                  <tr key={row.team.id} className={`border-b border-[#111] last:border-0 ${i < 2 ? "bg-[#0f1a0f]" : ""}`}>
                    <td className="px-4 py-2.5 w-6 text-xs text-gray-500 font-mono">{row.position}</td>
                    <td className="py-2.5 w-7">
                      {row.team.crest && <img src={row.team.crest} alt={row.team.name} className="w-5 h-5 object-contain" />}
                    </td>
                    <td className="py-2.5 text-sm flex-1 pr-4">
                      <span className="text-white truncate block max-w-[100px] md:max-w-none">{row.team.shortName || row.team.name}</span>
                      {i < 2 && <span className="ml-2 text-[10px] text-[#4ade80] font-semibold">ADV</span>}
                    </td>
                    {showFullStats && (
                      <td className="pr-4 text-xs font-mono text-gray-400 text-right whitespace-nowrap hidden md:table-cell">
                        {row.playedGames} {row.won} {row.draw} {row.lost} {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                      </td>
                    )}
                    {showFullStats && (
                      <td className="pr-4 text-xs font-mono text-gray-400 text-right whitespace-nowrap md:hidden">
                        {row.playedGames}
                      </td>
                    )}
                    <td className="pr-4 text-sm font-bold text-[#4ade80] font-mono text-right">{row.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
