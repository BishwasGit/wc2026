export interface Team {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
  address?: string;
  website?: string;
  founded?: number;
  clubColors?: string;
  venue?: string;
  coach?: Coach;
  squad?: SquadMember[];
}

export interface Coach {
  id: number;
  name: string;
  nationality: string;
}

export interface SquadMember {
  id: number;
  name: string;
  position: string;
  nationality: string;
  dateOfBirth?: string;
  shirtNumber?: number;
}

export interface Score {
  home: number | null;
  away: number | null;
}

export interface Match {
  id: number;
  utcDate: string;
  status: "SCHEDULED" | "LIVE" | "IN_PLAY" | "PAUSED" | "FINISHED" | "SUSPENDED" | "POSTPONED";
  matchday: number;
  stage: string;
  group: string | null;
  homeTeam: Team;
  awayTeam: Team;
  score: {
    winner: "HOME_TEAM" | "AWAY_TEAM" | "DRAW" | null;
    fullTime: Score;
    halfTime: Score;
  };
  venue?: string;
}

export interface Standing {
  position: number;
  team: Team;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export interface StandingGroup {
  stage: string;
  type: string;
  group: string;
  table: Standing[];
}

export interface Prediction {
  matchId: number;
  userId: string;
  homeScore: number;
  awayScore: number;
  createdAt: number;
}
