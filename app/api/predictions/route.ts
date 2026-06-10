import { NextResponse } from "next/server";
import { requireSupabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const supabase = requireSupabase();
    const { userId, username, matchId, homeScore, awayScore } = await req.json();
    if (!userId || matchId == null || homeScore == null || awayScore == null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from("predictions")
      .select("id")
      .eq("user_id", userId)
      .eq("match_id", matchId)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("predictions")
        .update({ home_score: homeScore, away_score: awayScore, username: username || "Anonymous" })
        .eq("id", existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("predictions")
        .insert({
          user_id: userId,
          username: username || "Anonymous",
          match_id: matchId,
          home_score: homeScore,
          away_score: awayScore,
        });
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const supabase = requireSupabase();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    let query = supabase.from("predictions").select("*").order("created_at", { ascending: false });
    if (userId) query = query.eq("user_id", userId);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ predictions: data || [] });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
