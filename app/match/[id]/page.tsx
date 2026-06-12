import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import type { Match } from "@/lib/types";
import { getMatch } from "@/lib/football-api";
import YourPrediction from "./prediction";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  let m: Match;
  try {
    m = await getMatch(id) as Match;
  } catch {
    return { title: "Match - WC 2026" };
  }
  const home = m.homeTeam?.shortName || m.homeTeam?.name || "?";
  const away = m.awayTeam?.shortName || m.awayTeam?.name || "?";
  const score =
    m.score?.fullTime?.home != null
      ? `${m.score.fullTime.home}-${m.score.fullTime.away}`
      : "";
  const venue = m.venue ? ` at ${m.venue}` : "";
  const stage = m.stage ? ` - ${m.stage}` : "";
  return {
    title: `${home} vs ${away} - WC 2026`,
    description: `${home} vs ${away}${score ? ` (${score})` : ""}${venue}${stage}`,
  };
}

function StatusBadge({ status }: { status: Match["status"] }) {
  if (status === "IN_PLAY" || status === "LIVE" || status === "PAUSED")
    return <span className="badge-live">LIVE</span>;
  if (status === "FINISHED")
    return <span className="badge-finished">FT</span>;
  return <span className="badge-scheduled">UPCOMING</span>;
}

function formatDate(utcDate: string) {
  return new Date(utcDate).toLocaleDateString([], {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
}

function formatTime(utcDate: string) {
  return new Date(utcDate).toLocaleTimeString([], {
    hour: "2-digit", minute: "2-digit",
  });
}

function MatchDetailView({ match }: { match: Match }) {
  const isFinished = match.status === "FINISHED";
  const isLive = match.status === "IN_PLAY" || match.status === "LIVE" || match.status === "PAUSED";
  const isScheduled = match.status === "SCHEDULED";

  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#4ade80] transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to scores
      </Link>

      <div className="card p-6">
        <div className="flex justify-center mb-6">
          <StatusBadge status={match.status} />
        </div>

        <div className="flex items-center justify-center gap-4 md:gap-8">
          <div className="flex flex-col items-center gap-2 flex-1 text-right">
            {match.homeTeam.crest && (
              <img src={match.homeTeam.crest} alt={match.homeTeam.name} className="w-12 h-12 md:w-16 md:h-16 object-contain" />
            )}
            <span className="font-semibold text-sm md:text-lg">{match.homeTeam.name}</span>
            <span className="text-xs text-gray-500">{match.homeTeam.shortName}</span>
          </div>

          <div className="min-w-[100px] text-center">
            {isFinished || isLive ? (
              <div className="font-mono font-bold text-3xl md:text-5xl text-white">
                {match.score.fullTime.home ?? "—"}
                <span className="text-gray-600 mx-2">:</span>
                {match.score.fullTime.away ?? "—"}
              </div>
            ) : (
              <div className="font-mono text-2xl md:text-4xl text-gray-500">vs</div>
            )}
          </div>

          <div className="flex flex-col items-center gap-2 flex-1 text-left">
            {match.awayTeam.crest && (
              <img src={match.awayTeam.crest} alt={match.awayTeam.name} className="w-12 h-12 md:w-16 md:h-16 object-contain" />
            )}
            <span className="font-semibold text-sm md:text-lg">{match.awayTeam.name}</span>
            <span className="text-xs text-gray-500">{match.awayTeam.shortName}</span>
          </div>
        </div>
      </div>

      <div className="card p-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Match Info</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {match.venue && <><span className="text-gray-500">Venue</span><span className="text-white text-right">{match.venue}</span></>}
          {match.stage && <><span className="text-gray-500">Stage</span><span className="text-white text-right">{match.stage}</span></>}
          {match.group && <><span className="text-gray-500">Group</span><span className="text-white text-right">{match.group}</span></>}
          {match.matchday != null && <><span className="text-gray-500">Matchday</span><span className="text-white text-right">{match.matchday}</span></>}
        </div>
      </div>

      {(isFinished || isLive) && (
        <div className="card p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Score Details</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <span className="text-gray-500">Full Time</span>
            <span className="text-white font-mono text-right">{match.score.fullTime.home ?? "—"} : {match.score.fullTime.away ?? "—"}</span>
            <span className="text-gray-500">Half Time</span>
            <span className="text-white font-mono text-right">
              {match.score.halfTime.home != null ? `${match.score.halfTime.home} : ${match.score.halfTime.away}` : "—"}
            </span>
          </div>
        </div>
      )}

      {isScheduled && (
        <div className="card p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Date and Time</h2>
          <p className="text-white text-sm">{formatDate(match.utcDate)} at {formatTime(match.utcDate)}</p>
          <p className="text-xs text-gray-500">All times in your local timezone</p>
        </div>
      )}

      {isLive && (
        <a
          href={`/watch/from-match/${match.id}`}
          className="card p-5 flex items-center justify-between hover:border-[#4ade80] transition-colors"
        >
          <div>
            <h2 className="text-sm font-semibold text-white">Watch Live</h2>
            <p className="text-xs text-gray-500 mt-0.5">This match may be available on a sports channel</p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded font-medium bg-red-900 text-red-200">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            WATCH LIVE
          </span>
        </a>
      )}

      <YourPrediction matchId={match.id} />

      <div className="card p-5 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Make a Prediction</h2>
          <p className="text-xs text-gray-500 mt-0.5">Predict the final score for this match</p>
        </div>
        <Link href="/predict" className="text-xs px-4 py-2 rounded font-medium bg-[#1a2e1a] text-[#4ade80] hover:bg-[#243824] transition-colors">
          Predict
        </Link>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-4 w-24 bg-[#1a2e1a] rounded animate-pulse" />
      <div className="card p-6">
        <div className="flex justify-center mb-6"><div className="h-5 w-16 bg-[#1a2e1a] rounded animate-pulse" /></div>
        <div className="flex items-center justify-center gap-8">
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-[#1a2e1a] rounded-full animate-pulse" />
            <div className="h-4 w-20 bg-[#1a2e1a] rounded animate-pulse" />
          </div>
          <div className="h-12 w-24 bg-[#1a2e1a] rounded animate-pulse" />
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-[#1a2e1a] rounded-full animate-pulse" />
            <div className="h-4 w-20 bg-[#1a2e1a] rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

async function MatchFetcher({ id }: { id: string }) {
  let data: Match;
  try {
    data = await getMatch(id) as Match;
  } catch {
    return (
      <div className="card p-8 text-center">
        <p className="text-gray-500 text-lg mb-2">Match not found</p>
        <Link href="/" className="text-sm text-[#4ade80] hover:underline">Back to scores</Link>
      </div>
    );
  }

  if (!data || !data.homeTeam) {
    return (
      <div className="card p-8 text-center">
        <p className="text-gray-500 text-lg mb-2">Match not found</p>
        <Link href="/" className="text-sm text-[#4ade80] hover:underline">Back to scores</Link>
      </div>
    );
  }

  return <MatchDetailView match={data as Match} />;
}

export default function MatchDetailPage({ params }: Props) {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <MatchDetailPageInner params={params} />
    </Suspense>
  );
}

async function MatchDetailPageInner({ params }: Props) {
  const { id } = await params;
  return <MatchFetcher id={id} />;
}
