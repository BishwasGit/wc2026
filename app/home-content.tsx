"use client";
import { useEffect, useState } from "react";
import MatchCard from "@/components/MatchCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorCard from "@/components/ErrorCard";
import type { Match } from "@/lib/types";

type Tab = "today" | "live" | "all";

export default function HomeContent() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("today");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const url =
          tab === "today" ? "/api/matches?today=1" :
          tab === "live"  ? "/api/matches?status=LIVE" :
                            "/api/matches";
        const res = await fetch(url);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        if (!cancelled) setMatches(data.matches || []);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [tab]);

  useEffect(() => {
    if (tab !== "live") return;
    const id = setInterval(() => {
      const url = "/api/matches?status=LIVE";
      fetch(url).then(r => r.json()).then(d => {
        if (!d.error) setMatches(d.matches || []);
      });
    }, 60_000);
    return () => clearInterval(id);
  }, [tab]);

  const tabs: { key: Tab; label: string }[] = [
    { key: "today", label: "Today" },
    { key: "live",  label: "Live" },
    { key: "all",   label: "All Matches" },
  ];

  const grouped = matches.reduce<Record<string, Match[]>>((acc, m) => {
    const day = m.utcDate.split("T")[0];
    (acc[day] ||= []).push(m);
    return acc;
  }, {});

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">
          FIFA World Cup <span className="text-[#4ade80]">2026</span>
        </h1>
        <p className="text-sm text-gray-500">June 11 - July 19 | USA, Canada, Mexico</p>
      </div>

      <div className="flex gap-1 mb-6 border-b border-[#1a2e1a] pb-0 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
              tab === t.key
                ? "border-[#4ade80] text-[#4ade80]"
                : "border-transparent text-gray-500 hover:text-white"
            }`}
          >
            {t.key === "live" ? <><span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5 align-middle"></span>{t.label}</> : t.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20 text-gray-500">
          <div className="text-center">
            <LoadingSpinner text="Loading matches..." />
          </div>
        </div>
      )}

      {error && (
        <ErrorCard message={error} />
      )}

      {!loading && !error && matches.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <p className="text-4xl mb-3 opacity-30">[ ]</p>
          <p>No matches {tab === "today" ? "today" : tab === "live" ? "currently live" : "found"}</p>
        </div>
      )}

      {!loading && tab !== "all" && (
        <div className="flex flex-col gap-3">
          {matches.map((m) => <MatchCard key={m.id} match={m} />)}
        </div>
      )}

      {!loading && tab === "all" && (
        <div className="flex flex-col gap-8">
          {Object.entries(grouped).sort().map(([date, dayMatches]) => (
            <div key={date}>
              <h2 className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-3">
                {new Date(date).toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
              </h2>
              <div className="flex flex-col gap-3">
                {dayMatches.map((m) => <MatchCard key={m.id} match={m} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
