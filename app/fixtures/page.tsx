"use client";
import { useEffect, useState } from "react";
import MatchCard from "@/components/MatchCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorCard from "@/components/ErrorCard";
import type { Match } from "@/lib/types";

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

  const hasMatchday = matches.some((m) => m.matchday > 0);
  const byMatchday = matches.reduce<Record<string, Match[]>>((acc, m) => {
    const key = hasMatchday ? `md:${m.matchday}` : m.utcDate.split("T")[0];
    (acc[key] ||= []).push(m);
    return acc;
  }, {});

  const sortedGroups = Object.entries(byMatchday).sort(([a], [b]) => {
    if (a.startsWith("md:") && b.startsWith("md:"))
      return Number(a.slice(3)) - Number(b.slice(3));
    if (a.startsWith("md:")) return -1;
    if (b.startsWith("md:")) return 1;
    return a.localeCompare(b);
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Fixtures</h1>
        <p className="text-sm text-gray-500">Upcoming matches</p>
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

      {!loading && sortedGroups.map(([key, groupMatches]) => {
        const isMatchday = key.startsWith("md:");
        const label = isMatchday
          ? `Matchday ${key.replace("md:", "")}`
          : new Date(key).toLocaleDateString([], {
              weekday: "long",
              month: "long",
              day: "numeric",
            });

        return (
          <div key={key} className="mb-8">
            <h2 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-3">
              {label}
            </h2>
            <div className="flex flex-col gap-3">
              {groupMatches.map((m) => <MatchCard key={m.id} match={m} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
