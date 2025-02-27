import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockApiService } from '../mocks/mockApiService';

// Define the team stats interface
export interface TeamStats {
  r: number;
  h: number;
  rbi: number;
  so: number;
  obp: number;
  ops: number;
  lob: number;
  bb: number;
  er: number;
  winPct: number;
  homeWinPct: number;
  awayWinPct: number;
}

// Define the team interface
export interface Team {
  id: number;
  stats: TeamStats;
}

// Define the store state interface
interface TeamState {
  teams: Record<string, Team>;
  isLoading: boolean;
  error: string | null;
  fetchTeams: () => Promise<void>;
  getTeamNames: () => string[];
}

// Create the store with persistence
export const useTeamStore = create<TeamState>()(
  persist(
    (set, get) => ({
      teams: {},
      isLoading: false,
      error: null,
      
      fetchTeams: async () => {
        // If we already have teams, don't fetch again
        if (Object.keys(get().teams).length > 0) {
          return;
        }
        
        set({ isLoading: true, error: null });
        
        try {
          // Use mock API service
          const teamsData = await mockApiService.getTeamDetails();
          set({ teams: teamsData, isLoading: false, error: null });
        } catch (error) {
          console.error('Error fetching teams:', error);
          set({ 
            error: 'Failed to fetch teams. Please try again.', 
            isLoading: false 
          });
        }
      },
      
      getTeamNames: () => {
        return Object.keys(get().teams).sort();
      }
    }),
    {
      name: 'mlb-teams-storage',
      partialize: (state) => ({ teams: state.teams }),
    }
  )
);