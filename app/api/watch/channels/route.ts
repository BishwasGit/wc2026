import { NextResponse } from "next/server";

const SOURCES = [
  "https://iptv-org.github.io/iptv/index.m3u",
  "https://iptv-org.github.io/iptv/categories/sports.m3u",
];

const SPORTS_KEYWORDS = [
  "sport", "espn", "fox sport", "nfl", "nba", "mlb", "nhl", "ufc", "wwe",
  "f1", "motogp", "bein sports", "elevensports", "elevensport",
  "sky sport", "tnt sport", "eurosport", "world cup", "fifa",
];

const SPORTS_GROUPS = [
  "sport", "football", "soccer", "motorsport", "football (soccer)",
];

interface ParsedChannel {
  tvgId: string;
  name: string;
  logo: string;
  group: string;
  url: string;
}

interface MergedChannel {
  tvgId: string;
  name: string;
  logo: string;
  group: string;
  urls: string[];
}

let cache: { data: MergedChannel[]; ts: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000;

function parseM3U(body: string): ParsedChannel[] {
  const lines = body.split("\n");
  const entries: ParsedChannel[] = [];
  let current: Partial<ParsedChannel> = {};

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("#EXTM3U")) continue;

    if (line.startsWith("#EXTINF:")) {
      if (current.url && current.name) {
        entries.push(current as ParsedChannel);
      }
      current = {};

      const tvgMatch = line.match(/tvg-id="([^"]*)"/);
      current.tvgId = tvgMatch?.[1] || "";

      const logoMatch = line.match(/tvg-logo="([^"]*)"/);
      current.logo = logoMatch?.[1] || "";

      const groupMatch = line.match(/group-title="([^"]*)"/);
      current.group = groupMatch?.[1] || "Undefined";

      const namePart = line.split(",").slice(1).join(",").trim();
      current.name = namePart || "Unknown";
      continue;
    }

    if (line.startsWith("#EXTVLCOPT:") || line.startsWith("#")) continue;

    if (!current.url) {
      current.url = line;
    }
  }

  if (current.url && current.name) {
    entries.push(current as ParsedChannel);
  }

  return entries;
}

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s*\(\d+p\)\s*/g, "")
    .replace(/\s*\[.*?\]\s*/g, "")
    .replace(/\s*\(\d+i\)\s*/g, "")
    .replace(/\s+/, " ")
    .trim();
}

function isSport(entry: ParsedChannel): boolean {
  const name = entry.name.toLowerCase();
  const group = entry.group.toLowerCase();

  for (const kw of SPORTS_GROUPS) {
    if (group.includes(kw)) return true;
  }

  for (const kw of SPORTS_KEYWORDS) {
    if (name.includes(kw)) return true;
  }

  return false;
}

async function fetchFromSource(url: string): Promise<ParsedChannel[]> {
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`Failed ${url}: ${res.status}`);
  const body = await res.text();
  return parseM3U(body);
}

async function fetchChannels(): Promise<MergedChannel[]> {
  if (cache && Date.now() - cache.ts < CACHE_TTL) return cache.data;

  const results = await Promise.allSettled(SOURCES.map(fetchFromSource));

  const allParsed: ParsedChannel[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") {
      allParsed.push(...r.value);
    }
  }

  const sports = allParsed.filter(isSport);

  const map = new Map<string, MergedChannel>();

  for (const ch of sports) {
    const key = normalizeName(ch.name);
    const existing = map.get(key);

    if (existing) {
      if (!existing.urls.includes(ch.url)) {
        existing.urls.push(ch.url);
      }
      if (ch.logo && !existing.logo) existing.logo = ch.logo;
      if (ch.tvgId && !existing.tvgId) existing.tvgId = ch.tvgId;
    } else {
      map.set(key, {
        tvgId: ch.tvgId,
        name: ch.name,
        logo: ch.logo,
        group: ch.group,
        urls: [ch.url],
      });
    }
  }

  const merged = Array.from(map.values());
  merged.sort((a, b) => b.urls.length - a.urls.length);

  cache = { data: merged, ts: Date.now() };
  return merged;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.toLowerCase();

  try {
    let channels = await fetchChannels();

    if (q) {
      channels = channels.filter((c) => c.name.toLowerCase().includes(q));
    }

    return NextResponse.json({ channels, total: channels.length });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
