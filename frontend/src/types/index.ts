export interface Team {
  id: number;
  name: string;
  city: string;
  stadium: string;
  total_players: number;
  created_at: string;
}

export interface Player {
  id: number;
  name: string;
  position: string;
  team_id: number;
  team_name: string;
  team_city: string;
  games_played: number;
  at_bats: number;
  hits: number;
  runs: number;
  batting_average: number;
  created_at: string;
}

export interface Game {
  id: number;
  home_team_id: number;
  away_team_id: number;
  home_team_name: string;
  away_team_name: string;
  home_score: number;
  away_score: number;
  game_date: string;
  status: 'pendiente' | 'en_curso' | 'finalizado';
  created_at: string;
}

export interface Standing {
  id: number;
  name: string;
  city: string;
  games_played: number;
  wins: number;
  losses: number;
  runs_scored: number;
  runs_allowed: number;
  run_diff: number;
  pct: number;
}

export interface DashboardStats {
  totalTeams: number;
  totalPlayers: number;
  gamesPlayed: number;
  gamesPending: number;
}

// Para formularios
export type TeamForm = Omit<Team, 'id' | 'total_players' | 'created_at'>;
export type PlayerForm = Omit<Player, 'id' | 'team_name' | 'team_city' | 'batting_average' | 'created_at'>;
export type GameForm = Pick<Game, 'home_team_id' | 'away_team_id' | 'game_date'>;