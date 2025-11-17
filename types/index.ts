export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'coach' | 'player' | 'parent';
}

export interface Team {
  id: string;
  name: string;
  record: string;
  playerCount: number;
  avgPPG: number;
}

export interface Player {
  id: string;
  name: string;
  jerseyNumber: string;
  position?: string;
  teamId: string;
  stats: PlayerStats;
}

export interface PlayerStats {
  points: number;
  assists: number;
  rebounds: number;
  offensiveRebounds: number;
  defensiveRebounds: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fouls: number;
}

export interface Event {
  id: string;
  type: 'game' | 'practice' | 'tournament';
  title: string;
  opponent?: string;
  teamId: string;
  teamName: string;
  date: string;
  time: string;
  location: string;
  isHome?: boolean;
}

export interface Message {
  id: string;
  threadId: string;
  threadName: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  avatar: string;
}

export interface Game {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  quarter: number;
  date: string;
  location: string;
  playerGameStats: Record<string, PlayerGameStats>;
  onCourt: string[];
  events: GameEvent[];
}

export interface PlayerGameStats {
  points: number;
  assists: number;
  offensiveRebounds: number;
  defensiveRebounds: number;
  steals: number;
  turnovers: number;
  fouls: number;
  missedShots: number;
  missedFreeThrows: number;
}

export interface GameEvent {
  id: string;
  playerId: string;
  type: 'point' | 'assist' | 'rebound' | 'steal' | 'block' | 'turnover' | 'foul';
  value?: number;
  quarter: number;
  timestamp: number;
}

export interface Play {
  id: string;
  name: string;
  drawing: string;
  createdAt: string;
}

export interface Fan {
  id: string;
  name: string;
  email: string;
  teamId: string;
  playerId?: string;
  playerName?: string;
  status: 'invited' | 'active';
  invitedAt: string;
  joinedAt?: string;
}
