import { NextResponse } from "next/server";

const CACHE_TTL = 5 * 60 * 1000;
let cache: { data: VipRowEvent[]; ts: number } | null = null;

export type VipRowEvent = {
  name: string;
  url: string;
};

export async function GET() {
  if (cache && Date.now() - cache.ts < CACHE_TTL) {
    return NextResponse.json({ events: cache.data });
  }

  try {
    const res = await fetch("https://www.viprow.sx/sports-football-online", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `VIPRow returned ${res.status}`, events: [] }, { status: 502 });
    }

    const html = await res.text();

    const pattern = /href="\/(world-cup\/[^"]+)"[^>]*title="([^"]*)"/g;
    const events: VipRowEvent[] = [];
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(html)) !== null) {
      events.push({
        url: `https://www.viprow.sx/${match[1]}`,
        name: match[2],
      });
    }

    const unique = events.filter(
      (e, i, a) => a.findIndex((x) => x.url === e.url) === i
    );

    cache = { data: unique, ts: Date.now() };

    return NextResponse.json({ events: unique });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to fetch VIPRow", events: [] },
      { status: 500 }
    );
  }
}
