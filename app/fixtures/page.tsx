"use client";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorCard from "@/components/ErrorCard";
import type { Match } from "@/lib/types";

const STAGE_ORDER: Record<string, number> = {
  GROUP_STAGE: 0,
  ROUND_16: 1,
  QUARTER_FINALS: 2,
  SEMI_FINALS: 3,
  THIRD_PLACE: 4,
  FINAL: 5,
};

const STAGE_LABEL: Record<string, string> = {
  GROUP_STAGE: "Group Stage",
  ROUND_16: "Round of 16",
  QUARTER_FINALS: "Quarter-finals",
  SEMI_FINALS: "Semi-finals",
  THIRD_PLACE: "Third Place",
  FINAL: "Final",
};

function formatDate(utcDate: string) {
  return new Date(utcDate).toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatTime(utcDate: string) {
  return new Date(utcDate).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

export default function FixturesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/matches");
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        if (!cancelled) {
          const now = new Date().toISOString();
          const upcoming = (data.matches || [])
            .filter((m: Match) => m.utcDate >= now)
            .sort((a: Match, b: Match) => a.utcDate.localeCompare(b.utcDate));
          setMatches(upcoming);
        }
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const byStage = matches.reduce<Record<string, Match[]>>((acc, m) => {
    const stage = m.stage || "GROUP_STAGE";
    (acc[stage] ||= []).push(m);
    return acc;
  }, {});

  const sortedStages = Object.entries(byStage).sort(
    ([a], [b]) => (STAGE_ORDER[a] ?? 99) - (STAGE_ORDER[b] ?? 99)
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Fixtures</h1>
        <p className="text-sm text-gray-500">TBD &ndash; World Cup 2026</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20 text-gray-500">
          <div className="text-center">
            <LoadingSpinner text="Loading fixtures..." />
          </div>
        </div>
      )}

      {error && <ErrorCard message={error} />}

      {!loading && !error && matches.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <p className="text-4xl mb-3 opacity-30">[ ]</p>
          <p>No upcoming fixtures</p>
        </div>
      )}

      {!loading && sortedStages.map(([stage, stageMatches]) => {
        const groupsInStage = stage === "GROUP_STAGE"
          ? stageMatches.reduce<Record<string, Match[]>>((acc, m) => {
              const g = m.group || "A";
              (acc[g] ||= []).push(m);
              return acc;
            }, {})
          : null;

        return (
          <section key={stage} className="mb-10">
            <h2 className="text-sm font-bold text-[#4ade80] uppercase tracking-widest mb-4">
              {STAGE_LABEL[stage] || stage.replace(/_/g, " ")}
              <span className="text-gray-600 ml-2 font-normal">
                ({stageMatches.length} matches)
              </span>
            </h2>

            {groupsInStage ? (
              Object.entries(groupsInStage)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([group, groupMatches]) => (
                  <div key={group} className="mb-6">
                    <h3 className="text-xs font-mono text-gray-500 uppercase mb-2 ml-1">
                      Group {group}
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-xs text-gray-600 uppercase tracking-wider border-b border-[#1a2e1a]">
                            <th className="text-left py-2 pr-4 font-medium">Date</th>
                            <th className="text-left py-2 pr-4 font-medium">Time</th>
                            <th className="text-right py-2 pr-3 font-medium">Home</th>
                            <th className="text-center py-2 px-3 font-medium text-gray-500">vs</th>
                            <th className="text-left py-2 pl-3 font-medium">Away</th>
                            <th className="text-left py-2 pl-4 font-medium hidden sm:table-cell">Venue</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupMatches.map((m) => (
                            <tr
                              key={m.id}
                              className="border-b border-[#1a2e1a]/50 hover:bg-[#1a2e1a]/30 transition-colors"
                            >
                              <td className="py-3 pr-4 text-gray-400 whitespace-nowrap">
                                {formatDate(m.utcDate)}
                              </td>
                              <td className="py-3 pr-4 text-gray-400 whitespace-nowrap">
                                {formatTime(m.utcDate)}
                              </td>
                              <td className="py-3 pr-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <span className="font-medium">{m.homeTeam.shortName || m.homeTeam.name}</span>
                                  <img
                                    src={m.homeTeam.crest}
                                    alt={m.homeTeam.name}
                                    className="w-5 h-5 object-contain"
                                  />
                                </div>
                              </td>
                              <td className="py-3 px-3 text-center text-gray-600 text-xs font-mono">vs</td>
                              <td className="py-3 pl-3">
                                <div className="flex items-center gap-2">
                                  <img
                                    src={m.awayTeam.crest}
                                    alt={m.awayTeam.name}
                                    className="w-5 h-5 object-contain"
                                  />
                                  <span className="font-medium">{m.awayTeam.shortName || m.awayTeam.name}</span>
                                </div>
                              </td>
                              <td className="py-3 pl-4 text-gray-500 text-xs hidden sm:table-cell">
                                {m.venue || "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-600 uppercase tracking-wider border-b border-[#1a2e1a]">
                      <th className="text-left py-2 pr-4 font-medium">Date</th>
                      <th className="text-left py-2 pr-4 font-medium">Time</th>
                      <th className="text-right py-2 pr-3 font-medium">Home</th>
                      <th className="text-center py-2 px-3 font-medium text-gray-500">vs</th>
                      <th className="text-left py-2 pl-3 font-medium">Away</th>
                      <th className="text-left py-2 pl-4 font-medium hidden sm:table-cell">Venue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stageMatches.map((m) => (
                      <tr
                        key={m.id}
                        className="border-b border-[#1a2e1a]/50 hover:bg-[#1a2e1a]/30 transition-colors"
                      >
                        <td className="py-3 pr-4 text-gray-400 whitespace-nowrap">
                          {formatDate(m.utcDate)}
                        </td>
                        <td className="py-3 pr-4 text-gray-400 whitespace-nowrap">
                          {formatTime(m.utcDate)}
                        </td>
                        <td className="py-3 pr-3">
                          <div className="flex items-center justify-end gap-2">
                            <span className="font-medium">{m.homeTeam.shortName || m.homeTeam.name}</span>
                            <img
                              src={m.homeTeam.crest}
                              alt={m.homeTeam.name}
                              className="w-5 h-5 object-contain"
                            />
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center text-gray-600 text-xs font-mono">vs</td>
                        <td className="py-3 pl-3">
                          <div className="flex items-center gap-2">
                            <img
                              src={m.awayTeam.crest}
                              alt={m.awayTeam.name}
                              className="w-5 h-5 object-contain"
                            />
                            <span className="font-medium">{m.awayTeam.shortName || m.awayTeam.name}</span>
                          </div>
                        </td>
                        <td className="py-3 pl-4 text-gray-500 text-xs hidden sm:table-cell">
                          {m.venue || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
