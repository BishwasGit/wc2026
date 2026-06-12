import { NextResponse } from "next/server";
import { CURATED_CHANNELS } from "@/lib/curated-channels";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.toLowerCase();

  let channels = CURATED_CHANNELS.map((ch) => ({ ...ch, tvgId: "" }));

  if (q) {
    channels = channels.filter(
      (c) => c.name.toLowerCase().includes(q) || c.group.toLowerCase().includes(q)
    );
  }

  return NextResponse.json({ channels, total: channels.length });
}
