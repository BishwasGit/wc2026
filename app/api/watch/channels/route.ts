import { NextResponse } from "next/server";
import { CURATED_CHANNELS } from "@/lib/curated-channels";

const SOURCES = [
  "https://iptv-org.github.io/iptv/index.m3u",
  "https://iptv-org.github.io/iptv/categories/sports.m3u",
  "https://iptv-org.github.io/iptv/channels/us.m3u",
  "https://romaxa55.github.io/world_ip_tv/output/index.m3u",
  "https://raw.githubusercontent.com/Free-TV/IPTV/master/playlist.m3u8",
  "https://raw.githubusercontent.com/Free-TV/IPTV/master/playlists/2025/news.m3u8",
];

const WORLD_CUP_KEYWORDS = [
  "world cup", "fifa", "wc 2026", "2026",
];

const BROADCASTER_KEYWORDS = [
  "fox sport", "fs1", "fs2",
  "espn", "espn2", "espn 2", "abc",
  "telemundo", "universo", "peacock",
  "itvx", "itv", "itv4",
  "bbc", "bbc one", "bbc two", "bbc1", "bbc2",
  "sbs", "rds", "tsn",
  "cazé tv", "caze tv", "caze",
  "bein sports", "beın sports", "beinsport", "beın",
  "tnt sport", "tnt",
  "sky sport", "sky sports",
  "eurosport", "euro sport",
  "rtve", "tele deporte", "teledeporte", "la 1",
  "orf", "orf1", "orf sport",
  "ard", "daserste", "das erste", "zdf",
  "nrk", "nrk1", "nrk2",
  "svt", "svt1", "svt2",
  "srf", "rts", "rsi",
  "tvp", "tvp sport",
  "hrt",
  "rté", "rte", "rte2",
  "rai", "rai sport",
  "yle",
  "npo", "nos",
  "dr", "tv2",
  "tudn", "vix",
  "canal 5", "las estrellas",
  "dgo", "dsports", "directv sport",
  "claro sports",
  "sports18", "viacom18", "jiocinema",
  "s sport", "ssport",
  "trt", "trt1", "trt spor",
  "al kass", "alkass",
  "abu dhabi sport",
  "cctv5",
  "cbs sport",
  "nbc sport",
  "gol tv",
  "band sports",
  "sport tv",
  "eleven sport",
  "optus sport",
  "supersport",
  "canal+ sport",
  "multimedios",
  "sky mexico",
];

const SPORTS_GROUPS = [
  "sport", "football", "soccer", "motorsport",
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
  type?: "hls" | "web" | "external";
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

function isWorldCupRelevant(entry: ParsedChannel): boolean {
  const name = entry.name.toLowerCase();
  const group = entry.group.toLowerCase();

  for (const kw of SPORTS_GROUPS) {
    if (group.includes(kw)) return true;
  }

  for (const kw of WORLD_CUP_KEYWORDS) {
    if (name.includes(kw)) return true;
  }

  for (const kw of BROADCASTER_KEYWORDS) {
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

  const filtered = allParsed.filter(isWorldCupRelevant);

  const map = new Map<string, MergedChannel>();

  for (const ch of filtered) {
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

  for (const ch of CURATED_CHANNELS) {
    const key = normalizeName(ch.name);
    const existing = map.get(key);
    if (existing) {
      for (const url of ch.urls) {
        if (!existing.urls.includes(url)) {
          existing.urls.push(url);
        }
      }
      if (ch.type) existing.type = ch.type;
    } else {
      map.set(key, {
        tvgId: "",
        name: ch.name,
        logo: ch.logo,
        group: ch.group,
        type: ch.type,
        urls: [...ch.urls],
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
