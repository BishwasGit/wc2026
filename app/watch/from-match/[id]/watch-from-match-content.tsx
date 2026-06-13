"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";
import type { Match } from "@/lib/types";

type StreamSource = {
  name: string;
  url: string;
  type: "web" | "hls";
};

type StreamedMatch = {
  id: string;
  title: string;
  category: string;
  date: number;
  popular: boolean;
  teams?: { home: { name: string; badge: string }; away: { name: string; badge: string } };
  sources: { source: string; id: string }[];
};

// FIFA 3-letter team codes for WC 2026 teams
const TEAM_TLA: Record<string, string> = {
  usa: "USA", canada: "CAN", mexico: "MEX",
  argentina: "ARG", brazil: "BRA", uruguay: "URU", colombia: "COL",
  ecuador: "ECU", peru: "PER", chile: "CHI", venezuela: "VEN", paraguay: "PAR",
  england: "ENG", france: "FRA", germany: "GER", italy: "ITA", spain: "ESP",
  portugal: "POR", netherlands: "NED", belgium: "BEL", switzerland: "SUI",
  croatia: "CRO", denmark: "DEN", sweden: "SWE", norway: "NOR", poland: "POL",
  serbia: "SRB", austria: "AUT", ukraine: "UKR", turkey: "TUR", "czech republic": "CZE",
  scotland: "SCO", wales: "WAL", romania: "ROU", greece: "GRE", hungary: "HUN",
  nigeria: "NGA", ghana: "GHA", senegal: "SEN", morocco: "MAR", egypt: "EGY",
  cameroon: "CMR", "côte d'ivoire": "CIV", "ivory coast": "CIV", tunisia: "TUN",
  australia: "AUS", japan: "JPN", "south korea": "KOR", "saudi arabia": "KSA",
  iran: "IRN", qatar: "QAT", "united arab emirates": "UAE", iraq: "IRQ",
  china: "CHN", "new zealand": "NZL",
  "costa rica": "CRC", honduras: "HON", panama: "PAN", jamaica: "JAM",
  guatemala: "GUA", "el salvador": "SLV", haiti: "HAI",
  bolivia: "BOL", "trinidad and tobago": "TRI",
};

function getTla(teamName: string): string | null {
  const key = teamName.toLowerCase().trim();
  // Direct lookup
  if (TEAM_TLA[key]) return TEAM_TLA[key].toLowerCase();
  // Try removing parenthetical suffixes like " (USA)"
  const stripped = key.replace(/\(.*?\)/g, "").trim();
  if (TEAM_TLA[stripped]) return TEAM_TLA[stripped].toLowerCase();
  return null;
}

// PPV.to/embedindia.st use local match date, not UTC.
// WC 2026 matches are in North America; convert via US Eastern timezone.
function toLocalDateStr(dateInput: string | number): string {
  return new Date(dateInput).toLocaleDateString("en-CA", {
    timeZone: "America/New_York",
  });
}

export default function WatchFromMatchContent({
  match,
  matchId,
}: {
  match: Match | null;
  matchId?: string;
}) {
  const searchParams = useSearchParams();
  const queryHome = searchParams.get("home");
  const queryAway = searchParams.get("away");
  const [selectedSourceIdx, setSelectedSourceIdx] = useState(0);
  const [streamedMatch, setStreamedMatch] = useState<StreamedMatch | null>(null);
  const [fetchingFallback, setFetchingFallback] = useState(!match && !!matchId);

  const homeTeam = match?.homeTeam?.name || streamedMatch?.teams?.home?.name || "";
  const awayTeam = match?.awayTeam?.name || streamedMatch?.teams?.away?.name || "";
  const isFinished = match?.status === "FINISHED";

  // Derive embedindia.st and PPV.to URLs from TLA codes
  const tlaUrls = useMemo(() => {
    const homeTlaStr = match?.homeTeam?.tla || (streamedMatch?.teams?.home?.name ? getTla(streamedMatch.teams.home.name) : null);
    const awayTlaStr = match?.awayTeam?.tla || (streamedMatch?.teams?.away?.name ? getTla(streamedMatch.teams.away.name) : null);
    if (!homeTlaStr || !awayTlaStr) return null;

    // Use match utcDate if available, otherwise derive from streamedMatch date
    // Convert via US Eastern timezone — PPV.to/embedindia.st use local match date
    let dateStr: string | null = null;
    if (match?.utcDate) {
      dateStr = toLocalDateStr(match.utcDate);
    } else if (streamedMatch?.date) {
      dateStr = toLocalDateStr(streamedMatch.date);
    }
    if (!dateStr) return null;

    const homeTla = homeTlaStr.toLowerCase();
    const awayTla = awayTlaStr.toLowerCase();
    const slug = `${dateStr}/${homeTla}-${awayTla}`;
    return {
      ppv: `https://ppv.to/live/wc/${slug}`,
      embed: `https://embedindia.st/embed/wc/${slug}`,
    };
  }, [match, streamedMatch]);

  // Build all available stream sources
  const allSources = useMemo<StreamSource[]>(() => {
    const sources: StreamSource[] = [];

    // PPV.to + embedindia.st (only when we have TLA from football-data)
    if (tlaUrls) {
      sources.push({ name: "EmbedIndia", url: tlaUrls.embed, type: "web" });
      sources.push({ name: "PPV.to", url: tlaUrls.ppv, type: "web" });
    }

    // embed.st sources from streamed data
    if (streamedMatch) {
      for (const s of streamedMatch.sources) {
        if (s.source === "echo") {
          sources.push({
            name: "Stream (Echo)",
            url: `https://embed.st/embed/echo/${s.id}/1`,
            type: "web",
          });
        } else if (s.source === "delta") {
          sources.push({
            name: "Stream (Delta)",
            url: `https://embed.st/embed/delta/${s.id}/1`,
            type: "web",
          });
        } else if (s.source === "admin" || s.source === "golf") {
          sources.push({
            name: `Stream (${s.source})`,
            url: `https://embed.st/embed/${s.source}/${s.id}/1`,
            type: "web",
          });
        }
      }
    }

    // Extra known sources for specific matches (bintv, etc.)
    const matchKey = `${homeTeam}-${awayTeam}`.toLowerCase().replace(/\s+/g, "-");
    const knownExtras: Record<string, StreamSource[]> = {
      "usa-paraguay": [
        { name: "Bintv", url: "https://sources.bintv.online/?match=usa-vs-paraguay", type: "web" },
        { name: "Cola TV", url: "https://prabashsapkota.github.io/noooooads/?src=https://live05.msdht.app/live/24561735.m3u8", type: "web" },
        { name: "Telemundo", url: "https://prabashsapkota.github.io/ads/?url=https://prabashsapkota.github.io/willo/", type: "web" },
      ],
    };
    const extras = knownExtras[matchKey];
    if (extras) {
      // Avoid duplicates
      for (const extra of extras) {
        if (!sources.some((s) => s.url === extra.url)) {
          sources.push(extra);
        }
      }
    }

    return sources;
  }, [tlaUrls, streamedMatch, homeTeam, awayTeam]);

  const activeUrl = useMemo(
    () => allSources[selectedSourceIdx]?.url ?? null,
    [allSources, selectedSourceIdx],
  );

  // Fetch from streamed.pk as fallback
  useEffect(() => {
    if (match || !matchId) return;

    fetch("https://streamed.pk/api/matches/all")
      .then((r) => r.json())
      .then((data: StreamedMatch[]) => {
        // Prefer match matching team names from query params
        let found: StreamedMatch | undefined;
        if (queryHome && queryAway) {
          found = data.find(
            (m) =>
              m.teams?.home?.name.toLowerCase() === queryHome.toLowerCase() &&
              m.teams?.away?.name.toLowerCase() === queryAway.toLowerCase()
          );
        }
        // Fall back to ID match
        if (!found) {
          found = data.find(
            (m) => m.id === matchId || m.id.includes(matchId)
          );
        }
        // Last resort: first football match
        const matchData = found || data.find((m) => m.category === "football");
        if (matchData) {
          setStreamedMatch(matchData);
        }
      })
      .catch(() => {})
      .finally(() => setFetchingFallback(false));
  }, [match, matchId, queryHome, queryAway]);

  function switchSource(idx: number) {
    setSelectedSourceIdx(idx);
  }

  const teamDisplay = homeTeam && awayTeam ? `${homeTeam} vs ${awayTeam}` : null;
  const title = teamDisplay || streamedMatch?.title || matchId || "Watch";
  const showStatus = match?.status || (streamedMatch ? "SCHEDULED" : null);

  if (fetchingFallback) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
        <LoadingSpinner text="Loading match..." />
      </div>
    );
  }

  if (!match && !streamedMatch) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col">
        <div className="flex items-center gap-3 px-4 py-2 bg-[#0a0f0a]/90 backdrop-blur shrink-0">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-[#4ade80] transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <div className="flex-1 text-center">
            <span className="text-sm text-gray-500">Match unavailable</span>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <p className="mb-2">Could not load match data.</p>
            <Link href="/watch" className="text-xs text-[#4ade80] hover:underline">
              Browse all channels →
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
          <span className="text-sm font-medium truncate">{title}</span>
        </div>

        {showStatus === "IN_PLAY" || showStatus === "LIVE" || showStatus === "PAUSED" ? (
          <span className="text-[10px] text-[#4ade80] font-medium shrink-0">LIVE</span>
        ) : showStatus === "FINISHED" ? (
          <span className="text-[10px] text-gray-500 font-medium shrink-0">FT</span>
        ) : showStatus ? (
          <span className="text-[10px] text-gray-500 font-medium shrink-0">UPCOMING</span>
        ) : null}
      </div>

      {/* Source selector */}
      {allSources.length > 1 && !isFinished && (
        <div className="flex gap-1.5 px-4 py-1.5 bg-[#0f1a0f]/80 overflow-x-auto shrink-0">
          {allSources.map((s, i) => (
            <button
              key={i}
              onClick={() => switchSource(i)}
              className={`text-xs px-2.5 py-1 rounded-full shrink-0 transition-colors ${
                i === selectedSourceIdx
                  ? "bg-[#4ade80] text-black font-medium"
                  : "bg-[#1a2e1a] text-gray-400 hover:bg-[#243824]"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      {/* Player */}
      <div className="flex-1 min-h-0">
        {isFinished ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>This match has ended.</p>
          </div>
        ) : activeUrl ? (
          <iframe
            key={activeUrl}
            src={activeUrl}
            className="w-full h-full"
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
            referrerPolicy="no-referrer"
            title={title}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No stream sources available.</p>
          </div>
        )}
      </div>

      {/* Direct stream links */}
      {!isFinished && allSources.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-1.5 bg-[#0a0f0a]/80 shrink-0 overflow-x-auto">
          <span className="text-[10px] text-gray-600 shrink-0">Sources:</span>
          {allSources.map((s, i) => (
            <a
              key={i}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-gray-400 hover:text-[#4ade80] underline shrink-0"
            >
              {s.name} ↗
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
