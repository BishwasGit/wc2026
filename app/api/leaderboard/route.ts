import { NextResponse } from "next/server";
import { requireSupabase } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = requireSupabase();
    const { data, error } = await supabase
      .from("predictions")
      .select("*");

    if (error) throw error;

    const grouped = new Map<string, { username: string; totalPoints: number; correctScores: number; correctWinners: number; total: number }>();

    for (const p of data || []) {
      if (!grouped.has(p.user_id)) {
        grouped.set(p.user_id, { username: p.username, totalPoints: 0, correctScores: 0, correctWinners: 0, total: 0 });
      }
      const entry = grouped.get(p.user_id)!;
      entry.total++;
      entry.totalPoints += p.points || 0;
      if (p.points === 3) entry.correctScores++;
      else if (p.points === 1) entry.correctWinners++;
    }

    const leaderboard = Array.from(grouped.entries())
      .map(([userId, stats]) => ({
        userId,
        username: stats.username,
        totalPoints: stats.totalPoints,
        correctScores: stats.correctScores,
        correctWinners: stats.correctWinners,
        totalPredictions: stats.total,
        accuracy: stats.total > 0 ? Math.round(((stats.correctScores + stats.correctWinners) / stats.total) * 100) : 0,
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints);

    return NextResponse.json({ leaderboard });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
