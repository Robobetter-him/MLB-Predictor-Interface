import { create } from 'zustand';
import { TeamStats } from './teamStore';
import { mockApiService } from '../mocks/mockApiService';

export interface Prediction {
  winProbability: number;
  confidence: number;
  stats: {
    home: TeamStats;
    away: TeamStats;
  };
  description?: string;
  confidenceDescription?: string;
}

interface PredictionState {
  homeTeam: string;
  awayTeam: string;
  prediction: Prediction | null;
  loading: boolean;
  error: string | null;
  setHomeTeam: (team: string) => void;
  setAwayTeam: (team: string) => void;
  calculatePrediction: () => Promise<void>;
  resetPrediction: () => void;
}

// Create a cache for predictions
const predictionCache: Record<string, Prediction> = {};

export const usePredictionStore = create<PredictionState>((set, get) => ({
  homeTeam: '',
  awayTeam: '',
  prediction: null,
  loading: false,
  error: null,
  
  setHomeTeam: (team) => {
    set({ homeTeam: team });
  },
  
  setAwayTeam: (team) => {
    set({ awayTeam: team });
  },
  
  calculatePrediction: async () => {
    const { homeTeam, awayTeam } = get();
    
    if (!homeTeam || !awayTeam || homeTeam === awayTeam) {
      set({ error: 'Please select different teams' });
      return;
    }
    
    // Create a cache key
    const cacheKey = `${homeTeam}-${awayTeam}`;
    
    // Check if we have a cached prediction
    if (predictionCache[cacheKey]) {
      set({ 
        prediction: predictionCache[cacheKey],
        loading: false,
        error: null
      });
      return;
    }
    
    set({ loading: true, error: null });
    
    try {
      // Use mock API service
      const prediction = await mockApiService.calculatePrediction(homeTeam, awayTeam);
      
      // Cache the prediction
      predictionCache[cacheKey] = prediction;
      
      set({ 
        prediction,
        loading: false,
        error: null
      });
    } catch (err) {
      console.error('Error calculating prediction:', err instanceof Error ? err.message : String(err));
      set({ 
        error: 'Failed to calculate prediction. Please try again.',
        loading: false
      });
    }
  },
  
  resetPrediction: () => {
    set({ prediction: null, error: null });
  }
}));