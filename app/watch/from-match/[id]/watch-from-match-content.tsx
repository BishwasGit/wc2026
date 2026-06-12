"use client";
import { useMemo } from "react";
import Link from "next/link";
import type { Match } from "@/lib/types";

export default function WatchFromMatchContent({ match }: { match: Match }) {
  const streamUrl = useMemo(() => {
    const dateStr = match.utcDate.split("T")[0];
    const homeTla = match.homeTeam?.tla?.toLowerCase() || "";
    const awayTla = match.awayTeam?.tla?.toLowerCase() || "";
    return `https://ppv.to/live/wc/${dateStr}/${homeTla}-${awayTla}`;
  }, [match]);

  const isFinished = match.status === "FINISHED";

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-2 bg-[#0a0f0a]/90 backdrop-blur shrink-0">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-[#4ade80] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        <div className="flex-1 text-center min-w-0">
          <span className="text-sm font-medium truncate">
            {match.homeTeam?.shortName || match.homeTeam?.name} vs{" "}
            {match.awayTeam?.shortName || match.awayTeam?.name}
          </span>
        </div>

        {match.status === "IN_PLAY" || match.status === "LIVE" || match.status === "PAUSED" ? (
          <span className="text-[10px] text-[#4ade80] font-medium shrink-0">LIVE</span>
        ) : match.status === "FINISHED" ? (
          <span className="text-[10px] text-gray-500 font-medium shrink-0">FT</span>
        ) : (
          <span className="text-[10px] text-gray-500 font-medium shrink-0">UPCOMING</span>
        )}
      </div>

      {/* Iframe */}
      <div className="flex-1 min-h-0">
        {isFinished ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>This match has ended.</p>
          </div>
        ) : (
          <iframe
            src={streamUrl}
            className="w-full h-full"
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
            referrerPolicy="no-referrer"
            title={`${match.homeTeam?.name} vs ${match.awayTeam?.name}`}
          />
        )}
      </div>
    </div>
  );
}
