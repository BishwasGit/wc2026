"use client";
import { useState } from "react";
import Link from "next/link";
import type { Match } from "@/lib/types";
import { getPredictionForMatch, savePrediction } from "@/lib/predictions";

function StatusBadge({ status }: { status: Match["status"] }) {
  if (status === "IN_PLAY" || status === "LIVE" || status === "PAUSED")
    return <span className="badge-live">LIVE</span>;
  if (status === "FINISHED")
    return <span className="badge-finished">FT</span>;
  return <span className="badge-scheduled">UPCOMING</span>;
}

function formatTime(utcDate: string) {
  return new Date(utcDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(utcDate: string) {
  return new Date(utcDate).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}

export default function MatchCard({ match, showPredict = false }: { match: Match; showPredict?: boolean }) {
  const existing = typeof window !== "undefined" ? getPredictionForMatch(match.id) : null;
  const [homeGoals, setHomeGoals] = useState(existing?.homeScore ?? 0);
  const [awayGoals, setAwayGoals] = useState(existing?.awayScore ?? 0);
  const [saved, setSaved] = useState(!!existing);

  const isLive = match.status === "IN_PLAY" || match.status === "LIVE" || match.status === "PAUSED";
  const isFinished = match.status === "FINISHED";
  const canPredict = !isFinished && showPredict;

  function handleSave() {
    savePrediction({ matchId: match.id, homeScore: homeGoals, awayScore: awayGoals });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <Link
      href={`/matches/${match.id}`}
      className={`card p-4 block ${isLive ? "border-red-900" : ""}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500 font-mono">
          {match.group ? `${match.group} · ` : ""}{formatDate(match.utcDate)} {formatTime(match.utcDate)}
        </span>
        <StatusBadge status={match.status} />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 justify-end max-[400px]:gap-1">
          <span className="text-sm font-semibold text-right max-[400px]:text-xs">{match.homeTeam.shortName || match.homeTeam.name}</span>
          {match.homeTeam.crest && (
            <img src={match.homeTeam.crest} alt={match.homeTeam.name} className="w-7 h-7 object-contain max-[400px]:w-5 max-[400px]:h-5" />
          )}
        </div>

        <div className="flex items-center gap-1 min-w-[64px] justify-center max-[400px]:min-w-[48px]">
          {isFinished || isLive ? (
            <span className="font-mono font-bold text-xl text-white max-[400px]:text-base">
              {match.score.fullTime.home ?? "\u2014"} <span className="text-gray-600">:</span> {match.score.fullTime.away ?? "\u2014"}
            </span>
          ) : (
            <span className="font-mono text-sm text-gray-500 max-[400px]:text-xs">vs</span>
          )}
        </div>

        <div className="flex-1 flex items-center gap-2 max-[400px]:gap-1">
          {match.awayTeam.crest && (
            <img src={match.awayTeam.crest} alt={match.awayTeam.name} className="w-7 h-7 object-contain max-[400px]:w-5 max-[400px]:h-5" />
          )}
          <span className="text-sm font-semibold max-[400px]:text-xs">{match.awayTeam.shortName || match.awayTeam.name}</span>
        </div>
      </div>

      <div className="flex items-center gap-1 text-xs text-gray-500 mt-3">
        View details <span className="text-[10px]">&rarr;</span>
      </div>

      {canPredict && (
        <div className="mt-4 pt-3 border-t border-[#1a2e1a] flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          <span className="text-xs text-gray-500 flex-1">Your prediction:</span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <button onClick={() => setHomeGoals(Math.max(0, homeGoals - 1))} className="w-6 h-6 rounded bg-[#1a2e1a] text-[#4ade80] text-xs flex items-center justify-center hover:bg-[#243824]">&minus;</button>
              <span className="font-mono w-5 text-center text-sm">{homeGoals}</span>
              <button onClick={() => setHomeGoals(homeGoals + 1)} className="w-6 h-6 rounded bg-[#1a2e1a] text-[#4ade80] text-xs flex items-center justify-center hover:bg-[#243824]">+</button>
            </div>
            <span className="text-gray-600 text-xs">:</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setAwayGoals(Math.max(0, awayGoals - 1))} className="w-6 h-6 rounded bg-[#1a2e1a] text-[#4ade80] text-xs flex items-center justify-center hover:bg-[#243824]">&minus;</button>
              <span className="font-mono w-5 text-center text-sm">{awayGoals}</span>
              <button onClick={() => setAwayGoals(awayGoals + 1)} className="w-6 h-6 rounded bg-[#1a2e1a] text-[#4ade80] text-xs flex items-center justify-center hover:bg-[#243824]">+</button>
            </div>
          </div>
          <button
            onClick={handleSave}
            className={`text-xs px-3 py-1.5 rounded font-medium transition-colors ${saved ? "bg-[#4ade80] text-black" : "bg-[#1a2e1a] text-[#4ade80] hover:bg-[#243824]"}`}
          >
            {saved ? "Saved" : "Save"}
          </button>
        </div>
      )}

      {!canPredict && existing && !isFinished && (
        <div className="mt-3 pt-3 border-t border-[#1a2e1a] text-xs text-gray-500">
          Your prediction: <span className="font-mono text-[#4ade80]">{existing.homeScore} : {existing.awayScore}</span>
        </div>
      )}
    </Link>
  );
}
