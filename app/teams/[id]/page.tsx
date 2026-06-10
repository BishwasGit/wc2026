import type { Metadata } from "next";
import { getTeam, getMatches } from "@/lib/football-api";
import type { Team, Match } from "@/lib/types";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const team = await getTeam(id);
    return { title: `${team.name} - WC 2026` };
  } catch {
    return { title: "Team - WC 2026" };
  }
}

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
  });
}

export default async function TeamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let team: Team | null = null;
  let matches: Match[] = [];
  let error: string | null = null;

  try {
    team = await getTeam(id);
    const allMatches = await getMatches() as { matches?: Match[] };
    if (allMatches.matches) {
      const tid = Number(id);
      matches = allMatches.matches.filter(
        (m) => m.homeTeam.id === tid || m.awayTeam.id === tid
      );
    }
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : "Failed to load team";
  }

  if (error || !team) {
    return (
      <div className="card p-6 border-red-900">
        <p className="text-red-400 text-sm">{error || "Team not found"}</p>
        <Link
          href="/"
          className="mt-4 inline-block text-xs px-3 py-1.5 rounded bg-[#1a2e1a] text-[#4ade80] hover:bg-[#243824] transition-colors"
        >
          Back to scores
        </Link>
      </div>
    );
  }

  const upcoming = matches.filter((m) => m.status === "SCHEDULED");
  const finished = matches.filter((m) => m.status === "FINISHED");
  const live = matches.filter(
    (m) => m.status === "LIVE" || m.status === "IN_PLAY" || m.status === "PAUSED"
  );

  return (
    <div>
      <Link
        href="/"
        className="text-xs text-gray-500 hover:text-[#4ade80] transition-colors mb-4 inline-block"
      >
        &larr; Back to scores
      </Link>

      <div className="card p-6 mb-8">
        <div className="flex items-center gap-5">
          {team.crest && (
            <img
              src={team.crest}
              alt={team.name}
              className="w-20 h-20 object-contain"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold">{team.name}</h1>
            <p className="text-sm text-gray-400 mt-1">
              {team.shortName}
              {team.tla ? <span className="ml-2 font-mono text-xs text-gray-500">({team.tla})</span> : null}
            </p>
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
              {team.venue && <span>Venue: {team.venue}</span>}
              {team.founded && <span>Founded: {team.founded}</span>}
              {team.clubColors && <span>Colors: {team.clubColors}</span>}
            </div>
            {team.coach && (
              <p className="text-xs text-gray-500 mt-1">
                Coach: {team.coach.name} ({team.coach.nationality})
              </p>
            )}
          </div>
        </div>
      </div>

      {live.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold mb-3 text-red-400">Live</h2>
          <div className="flex flex-col gap-3">
            {live.map((m) => (
              <div key={m.id} className="card p-4 border-red-900">
                <div className="flex items-center justify-between">
                  <div className="flex-1 text-right">
                    <span className="text-sm font-semibold">{m.homeTeam.shortName || m.homeTeam.name}</span>
                  </div>
                  <div className="mx-4 font-mono font-bold text-xl text-white">
                    {m.score.fullTime.home} : {m.score.fullTime.away}
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-semibold">{m.awayTeam.shortName || m.awayTeam.name}</span>
                  </div>
                </div>
                <div className="text-center text-xs text-gray-500 mt-2">
                  {m.group && `${m.group} `}· Matchday {m.matchday}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold mb-3 text-gray-300">Upcoming Fixtures</h2>
          <div className="flex flex-col gap-3">
            {upcoming.map((m) => (
              <div key={m.id} className="card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 text-right">
                    <span className="text-sm font-semibold">{m.homeTeam.shortName || m.homeTeam.name}</span>
                  </div>
                  <div className="mx-4 font-mono text-sm text-gray-500">
                    {formatDate(m.utcDate)} {formatTime(m.utcDate)}
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-semibold">{m.awayTeam.shortName || m.awayTeam.name}</span>
                  </div>
                </div>
                <div className="text-center text-xs text-gray-600 mt-2">
                  {m.group && `${m.group} `}· Matchday {m.matchday}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {finished.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold mb-3 text-gray-300">Past Results</h2>
          <div className="flex flex-col gap-3">
            {finished.map((m) => (
              <div key={m.id} className="card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 text-right">
                    <span className="text-sm font-semibold">{m.homeTeam.shortName || m.homeTeam.name}</span>
                  </div>
                  <div className="mx-4 font-mono font-bold text-lg text-white">
                    {m.score.fullTime.home} : {m.score.fullTime.away}
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-semibold">{m.awayTeam.shortName || m.awayTeam.name}</span>
                  </div>
                </div>
                <div className="text-center text-xs text-gray-500 mt-2">
                  {formatDate(m.utcDate)}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {matches.length === 0 && (
        <div className="text-center py-12 text-gray-500 text-sm">
          No matches found for this team.
        </div>
      )}

      {team.squad && team.squad.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold mb-3 text-gray-300">Squad</h2>
          <div className="card overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#1a2e1a]">
              {team.squad.map((player) => (
                <div key={player.id} className="bg-[#111811] p-3">
                  <div className="flex items-center gap-2">
                    {player.shirtNumber && (
                      <span className="text-xs font-mono text-[#4ade80] min-w-[20px]">
                        {player.shirtNumber}
                      </span>
                    )}
                    <div>
                      <p className="text-sm font-medium">{player.name}</p>
                      <p className="text-xs text-gray-500">
                        {player.position}
                        {player.nationality ? ` · ${player.nationality}` : ""}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
