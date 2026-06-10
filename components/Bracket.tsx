"use client";

export interface BracketMatch {
  id: string;
  homeTeam: { name: string; crest?: string; score?: number };
  awayTeam: { name: string; crest?: string; score?: number };
}

export interface BracketRound {
  name: string;
  matches: BracketMatch[];
}

interface BracketProps {
  rounds: BracketRound[];
}

export default function Bracket({ rounds }: BracketProps) {
  if (!rounds || rounds.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 text-sm">
        Bracket data not available yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div
        className="grid gap-6 min-w-[700px]"
        style={{
          gridTemplateColumns: `repeat(${rounds.length}, 1fr)`,
        }}
      >
        {rounds.map((round, roundIdx) => (
          <div key={round.name} className="flex flex-col gap-1">
              <div className="text-xs font-semibold text-[#4ade80] uppercase tracking-wider mb-2 text-center">
                {round.name}
              </div>
              <div
                className="flex flex-col justify-around flex-1"
                style={{ gap: `${Math.max(4, 24 - roundIdx * 2)}px` }}
              >
                {round.matches.map((match) => (
                  <div
                    key={match.id}
                    className="card p-2.5 border-[#1f2f1f] hover:border-[#2a4a2a] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex items-center gap-1.5 justify-end min-w-0">
                        {match.homeTeam.crest && (
                          <img
                            src={match.homeTeam.crest}
                            alt=""
                            className="w-4 h-4 object-contain shrink-0"
                          />
                        )}
                        <span className="text-xs truncate text-right">
                          {match.homeTeam.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {match.homeTeam.score !== undefined ? (
                          <span className="font-mono text-sm font-bold text-white min-w-[16px] text-center">
                            {match.homeTeam.score}
                          </span>
                        ) : null}
                        {match.homeTeam.score !== undefined && match.awayTeam.score !== undefined && (
                          <span className="text-gray-600 text-xs">:</span>
                        )}
                        {match.awayTeam.score !== undefined && (
                          <span className="font-mono text-sm font-bold text-white min-w-[16px] text-center">
                            {match.awayTeam.score}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 flex items-center gap-1.5 min-w-0">
                        {match.awayTeam.crest && (
                          <img
                            src={match.awayTeam.crest}
                            alt=""
                            className="w-4 h-4 object-contain shrink-0"
                          />
                        )}
                        <span className="text-xs truncate">
                          {match.awayTeam.name}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
        ))}
      </div>

      {rounds.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <p className="text-sm">Bracket will be available after the group stage.</p>
        </div>
      )}
    </div>
  );
}
