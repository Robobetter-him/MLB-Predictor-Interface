import axios from 'axios';
import { format } from 'date-fns';

const MLB_API_BASE = 'https://statsapi.mlb.com/api/v1';

export interface MLBTeam {
  id: number;
  name: string;
}

export interface TeamStats {
  gamesPlayed: number;
  runs: number;
  hits: number;
  strikeOuts: number;
  baseOnBalls: number;
  obp: number;
  ops: number;
  rbi: number;
  leftOnBase: number;
  earnedRuns: number;
}

// Helper function to safely convert values to numbers
function safeNumber(value: any): number {
  if (value === null || value === undefined) return 0;
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

// Helper function to create safe team stats with default values
function createSafeTeamStats(): TeamStats {
  return {
    gamesPlayed: 0,
    runs: 0,
    hits: 0,
    strikeOuts: 0,
    baseOnBalls: 0,
    obp: 0,
    ops: 0,
    rbi: 0,
    leftOnBase: 0,
    earnedRuns: 0
  };
}

export async function getGamesForDate(date: string): Promise<MLBTeam[]> {
  try {
    const formattedDate = format(new Date(date), 'yyyy-MM-dd');
    const { data } = await axios.get(`${MLB_API_BASE}/schedule`, {
      params: {
        sportId: 1,
        date: formattedDate
      }
    });

    const games = data?.dates?.[0]?.games || [];
    const teams: MLBTeam[] = [];

    for (const game of games) {
      if (game?.teams?.away?.team) {
        teams.push({
          id: safeNumber(game.teams.away.team.id),
          name: String(game.teams.away.team.name || '')
        });
      }
      if (game?.teams?.home?.team) {
        teams.push({
          id: safeNumber(game.teams.home.team.id),
          name: String(game.teams.home.team.name || '')
        });
      }
    }

    return teams;
  } catch (error) {
    console.error('Error fetching MLB games:', error);
    return [];
  }
}

export async function getTeamStats(teamId: number): Promise<TeamStats> {
  try {
    const year = new Date().getFullYear();
    const { data } = await axios.get(`${MLB_API_BASE}/teams/${teamId}/stats`, {
      params: {
        season: year,
        group: 'hitting'
      }
    });

    const stats = data?.stats?.[0]?.splits?.[0]?.stat || {};
    
    return {
      gamesPlayed: safeNumber(stats.gamesPlayed),
      runs: safeNumber(stats.runs),
      hits: safeNumber(stats.hits),
      strikeOuts: safeNumber(stats.strikeOuts),
      baseOnBalls: safeNumber(stats.baseOnBalls),
      obp: safeNumber(stats.obp),
      ops: safeNumber(stats.ops),
      rbi: safeNumber(stats.rbi),
      leftOnBase: safeNumber(stats.leftOnBase),
      earnedRuns: safeNumber(stats.earnedRuns)
    };
  } catch (error) {
    console.error('Error fetching team stats:', error);
    return createSafeTeamStats();
  }
}

export async function getTeams(): Promise<MLBTeam[]> {
  try {
    const { data } = await axios.get(`${MLB_API_BASE}/teams`, {
      params: {
        sportId: 1,
        season: new Date().getFullYear()
      }
    });

    const teams: MLBTeam[] = [];
    
    for (const team of data?.teams || []) {
      teams.push({
        id: safeNumber(team.id),
        name: String(team.name || '')
      });
    }

    return teams;
  } catch (error) {
    console.error('Error fetching teams:', error);
    return [];
  }
}