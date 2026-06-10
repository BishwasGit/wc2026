import { NextResponse } from "next/server";
import { getStandings } from "@/lib/football-api";

export async function GET() {
  try {
    const data = await getStandings();
    return NextResponse.json(data);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
