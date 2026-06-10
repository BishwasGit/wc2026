import { NextResponse } from "next/server";
import { requireSupabase } from "@/lib/supabase";
import { getMatches } from "@/lib/football-api";
import type { Match } from "@/lib/types";

export async function GET() {
  try {
    const supabase = requireSupabase();
    const { data, error } = await supabase
      .from("predictions")
      .select("*");

    if (error) throw error;
    if (!data || data.length === 0) {
      return NextResponse.json({ leaderboard: [] });
    }

    const finishedMatches = await getMatches("FINISHED") as { matches: Match[] };
    const results = new Map<number, Match>();
    for (const m of finishedMatches.matches || []) {
      if (m.score.fullTime.home != null) {
        results.set(m.id, m);
      }
    }

    const grouped = new Map<string, { username: string; totalPoints: number; correctScores: number; correctWinners: number; total: number }>();

    for (const p of data || []) {
      if (!grouped.has(p.user_id)) {
        grouped.set(p.user_id, { username: p.username, totalPoints: 0, correctScores: 0, correctWinners: 0, total: 0 });
      }
      const entry = grouped.get(p.user_id)!;

      const match = results.get(p.match_id);
      if (match) {
        const ah = match.score.fullTime.home!;
        const aa = match.score.fullTime.away!;
        const exact = ah === p.home_score && aa === p.away_score;
        const actualWinner = ah > aa ? "H" : ah < aa ? "A" : "D";
        const predWinner = p.home_score > p.away_score ? "H" : p.home_score < p.away_score ? "A" : "D";
        const correctWinner = actualWinner === predWinner;

        const points = exact ? 3 : correctWinner ? 1 : 0;
        entry.totalPoints += points;
        if (exact) entry.correctScores++;
        else if (correctWinner) entry.correctWinners++;
      }

      entry.total++;
    }

    const leaderboard = Array.from(grouped.entries())
      .map(([userId, stats]) => ({
        userId,
        username: stats.username,
        totalPoints: stats.totalPoints,
        correctScores: stats.correctScores,
        correctWinners: stats.correctWinners,
        totalPredictions: stats.total,
        accuracy: stats.total > 0 ? Math.round((stats.correctScores + stats.correctWinners) / stats.total * 100) : 0,
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints);

    return NextResponse.json({ leaderboard });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
