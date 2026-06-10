export interface FantasyPlayer {
  id: string;
  teamId: number;
  teamName: string;
  name: string;
  position: "GK" | "DEF" | "MID" | "FWD";
  rating: number;
  cost: number;
}

const FIRST_INITIALS = "ABCDEFGHJKLMNPRSTVWXYZ";
const SURNAMES = [
  "Silva","Santos","Garcia","Rodriguez","Martinez","Lopez","Gonzalez",
  "Hernandez","Perez","Sanchez","Ramirez","Torres","Flores","Rivera",
  "Gomez","Diaz","Cruz","Morales","Ortiz","Vargas","Castillo","Reyes",
  "Gutierrez","Mendoza","Ramos","Delgado","Pena","Aguilar","Jimenez",
  "Moreno","Romero","Navarro","Alvarez","Fernandez","Ruiz","Medina",
  "Castro","Rubio","Marin","Campos","Nunez","Iglesias","Blanco",
  "Suarez","Vazquez","Cano","Bravo","Leon","Calvo","Marquez",
  "Vicente","Moya","Crespo","Roman","Pastor","Sanz","Lara",
  "Cabrera","Ferrer","Soto","Roca","Mesa","Roig",
  "Fabregas","Casillas","Iniesta","Mata","Cazorla",
  "Isco","Asensio","Olmo","Pedri","Gavi","Laporte",
  "Carvajal","Alba","Gaya","Azpilicueta","Busquets",
  "Thiago","Koke","Saul","Oyarzabal","Merino",
  "Zubimendi","Pino","Yamal","Nico",
];

const BASE_RATINGS: Record<string, number[]> = {
  GK: [80, 65],
  DEF: [82, 76, 72, 66, 60],
  MID: [89, 79, 74, 68, 62],
  FWD: [85, 77, 69],
};

const POSITION_ORDER = ["GK", "DEF", "MID", "FWD"] as const;
const COUNTS: Record<string, number[]> = {
  GK: [2],
  DEF: [5],
  MID: [5],
  FWD: [3],
};

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function generateName(tla: string, position: string, index: number): string {
  const seed = hash(tla + position + index);
  const firstIdx = seed % FIRST_INITIALS.length;
  const lastIdx = Math.floor(seed / FIRST_INITIALS.length) % SURNAMES.length;
  return `${FIRST_INITIALS[firstIdx]}. ${SURNAMES[lastIdx]}`;
}

function generateRating(tla: string, position: string, index: number): number {
  const bases = BASE_RATINGS[position];
  const base = bases[index % bases.length];
  const variation = (hash(tla + position + index + "r") % 9) - 4;
  return Math.max(40, Math.min(99, base + variation));
}

function getCost(rating: number): number {
  if (rating >= 90) return 12;
  if (rating >= 80) return 9;
  if (rating >= 70) return 6;
  if (rating >= 60) return 4;
  return 2;
}

import type { Team } from "./types";

export function generatePlayerPool(teams: Team[]): FantasyPlayer[] {
  const pool: FantasyPlayer[] = [];

  for (const team of teams) {
    for (const pos of POSITION_ORDER) {
      const count = COUNTS[pos][0];
      for (let i = 0; i < count; i++) {
        const rating = generateRating(team.tla, pos, i);
        const name = generateName(team.tla, pos, i);
        pool.push({
          id: `${team.tla}-${pos}-${i}`,
          teamId: team.id,
          teamName: team.shortName || team.name,
          name,
          position: pos,
          rating,
          cost: getCost(rating),
        });
      }
    }
  }

  return pool;
}
