import { create } from 'zustand';
import { format } from 'date-fns';
import { Prediction } from './predictionStore';
import { mockApiService } from '../mocks/mockApiService';

export interface Game {
  homeTeam: string;
  awayTeam: string;
  prediction: Prediction;
  gameTime: string;
  venue: string;
  status?: string;
}

interface GamesState {
  games: Game[];
  selectedDate: string;
  loading: boolean;
  error: string | null;
  lastUpdated: Date;
  refreshing: boolean;
  setSelectedDate: (date: string) => void;
  fetchGames: () => Promise<void>;
  refreshGames: () => Promise<void>;
}

// Create a cache for games by date
const gamesCache: Record<string, { games: Game[], timestamp: number }> = {};
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

export const useGamesStore = create<GamesState>((set, get) => ({
  games: [],
  selectedDate: format(new Date(), 'yyyy-MM-dd'),
  loading: false,
  error: null,
  lastUpdated: new Date(),
  refreshing: false,
  
  setSelectedDate: (date) => {
    set({ selectedDate: date });
    get().fetchGames();
  },
  
  fetchGames: async () => {
    const { selectedDate } = get();
    
    // Check if we have a valid cache
    const cache = gamesCache[selectedDate];
    const now = Date.now();
    
    if (cache && (now - cache.timestamp) < CACHE_EXPIRY) {
      set({ 
        games: cache.games,
        loading: false,
        lastUpdated: new Date(cache.timestamp)
      });
      return;
    }
    
    set({ loading: true, error: null });
    
    try {
      // Use mock API service
      const games = await mockApiService.getGames(selectedDate);
      
      // Cache the games
      gamesCache[selectedDate] = {
        games,
        timestamp: now
      };
      
      set({ 
        games,
        loading: false,
        lastUpdated: new Date(),
        error: null
      });
    } catch (error) {
      console.error('Error fetching games:', error instanceof Error ? error.message : String(error));
      set({ 
        error: 'Failed to fetch games. Please try again.',
        loading: false
      });
    }
  },
  
  refreshGames: async () => {
    set({ refreshing: true });
    
    try {
      await get().fetchGames();
    } finally {
      set({ refreshing: false });
    }
  }
}));