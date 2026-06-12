import type { Team } from "./types";

const BASE_URL = "https://api.football-data.org/v4";
const WC_ID = "WC"; // World Cup competition code

// Simple in-memory cache — avoids hammering the 10 req/min free limit
const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 60_000; // 1 min for live, enough for free tier

async function fetchFD(path: string, ttl = CACHE_TTL) {
  const key = path;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.ts < ttl) return hit.data;

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "X-Auth-Token": process.env.FOOTBALL_API_KEY || "" },
    next: { revalidate: 60 },
  });

  if (!res.ok) throw new Error(`football-data API ${res.status}: ${path}`);
  const data = await res.json();
  cache.set(key, { data, ts: Date.now() });
  return data;
}

export async function getMatches(status?: "SCHEDULED" | "LIVE" | "FINISHED") {
  const q = status ? `?status=${status}` : "";
  return fetchFD(`/competitions/${WC_ID}/matches${q}`);
}

export async function getTodayMatches() {
  const today = new Date().toISOString().split("T")[0];
  return fetchFD(`/competitions/${WC_ID}/matches?dateFrom=${today}&dateTo=${today}`, 30_000);
}

export async function getMatch(id: string) {
  return fetchFD(`/matches/${id}`, 30_000);
}

export async function getStandings() {
  return fetchFD(`/competitions/${WC_ID}/standings`, 5 * 60_000); // 5 min cache
}

export async function getTeams() {
  return fetchFD(`/competitions/${WC_ID}/teams`, 60 * 60_000); // 1 hour cache
}

export async function getTeam(id: string): Promise<Team> {
  const data = await getTeams();
  const teams = (data as { teams: Team[] }).teams;
  const team = teams.find((t: Team) => t.id === Number(id));
  if (!team) throw new Error(`Team ${id} not found`);
  return team;
}
