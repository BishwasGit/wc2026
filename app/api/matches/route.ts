import { NextResponse } from "next/server";
import { getTodayMatches, getMatches } from "@/lib/football-api";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") as "SCHEDULED" | "LIVE" | "FINISHED" | null;
  const today = searchParams.get("today");

  try {
    const data = today ? await getTodayMatches() : await getMatches(status || undefined);
    return NextResponse.json(data);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
