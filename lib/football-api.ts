import type { Team } from "./types";

const BASE_URL = "https://api.football-data.org/v4";
const WC_ID = "WC";

const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 60_000;

const REQS: number[] = [];
const MAX_RPM = 9;
const WINDOW = 60_000;
const queue: Array<() => void> = [];
let draining = false;

function drainQueue() {
  if (draining || queue.length === 0) return;
  const now = Date.now();
  const within = REQS.filter((t) => now - t < WINDOW);
  REQS.length = 0;
  REQS.push(...within);
  if (REQS.length >= MAX_RPM) {
    const wait = WINDOW - (now - REQS[0]) + 100;
    draining = true;
    setTimeout(() => { draining = false; drainQueue(); }, wait);
    return;
  }
  const next = queue.shift();
  if (next) {
    REQS.push(Date.now());
    next();
  }
}

function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    queue.push(async () => { try { resolve(await fn()); } catch (e) { reject(e); } });
    drainQueue();
  });
}

async function fetchFD(path: string, ttl = CACHE_TTL) {
  const key = path;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.ts < ttl) return hit.data;

  return enqueue(async () => {
    const hit2 = cache.get(key);
    if (hit2 && Date.now() - hit2.ts < ttl) return hit2.data;

    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { "X-Auth-Token": process.env.FOOTBALL_API_KEY || "" },
      next: { revalidate: 60 },
    });

    if (res.status === 429) {
      await new Promise((r) => setTimeout(r, 5000));
      return fetchFD(path, ttl);
    }

    if (!res.ok) throw new Error(`football-data API ${res.status}: ${path}`);
    const data = await res.json();
    cache.set(key, { data, ts: Date.now() });
    return data;
  });
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
