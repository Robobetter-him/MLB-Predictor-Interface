import { useState, useEffect, useCallback } from 'react';
import { mockApiService } from '../mocks/mockApiService';

export interface PredictionResult {
  date: string;
  homeTeam: string;
  awayTeam: string;
  predictedWinner: string;
  actualWinner: string;
  winProbability: number;
  confidence: number;
  correct: boolean;
}

export interface PerformanceStats {
  totalPredictions: number;
  correctPredictions: number;
  accuracy: number;
  highConfidenceAccuracy: number;
  lowConfidenceAccuracy: number;
  homeTeamWinRate: number;
  averageConfidence: number;
}

const defaultStats: PerformanceStats = {
  totalPredictions: 0,
  correctPredictions: 0,
  accuracy: 0,
  highConfidenceAccuracy: 0,
  lowConfidenceAccuracy: 0,
  homeTeamWinRate: 0,
  averageConfidence: 0
};

export function usePerformanceData() {
  const [results, setResults] = useState<PredictionResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [stats, setStats] = useState<PerformanceStats>(defaultStats);

  // Memoize the calculation function to prevent unnecessary recalculations
  const calculateStats = useCallback((data: PredictionResult[]): PerformanceStats => {
    if (data.length === 0) {
      return defaultStats;
    }

    const correctPredictions = data.filter(r => r.correct).length;
    const homeTeamWins = data.filter(r => r.actualWinner === r.homeTeam).length;
    
    const highConfidencePredictions = data.filter(r => r.confidence >= 0.7);
    const highConfidenceCorrect = highConfidencePredictions.filter(r => r.correct).length;
    
    const lowConfidencePredictions = data.filter(r => r.confidence < 0.7);
    const lowConfidenceCorrect = lowConfidencePredictions.filter(r => r.correct).length;
    
    const totalConfidence = data.reduce((sum, r) => sum + r.confidence, 0);
    const total = data.length;
    
    return {
      totalPredictions: total,
      correctPredictions,
      accuracy: total > 0 ? (correctPredictions / total) * 100 : 0,
      highConfidenceAccuracy: highConfidencePredictions.length > 0 
        ? (highConfidenceCorrect / highConfidencePredictions.length) * 100 
        : 0,
      lowConfidenceAccuracy: lowConfidencePredictions.length > 0 
        ? (lowConfidenceCorrect / lowConfidencePredictions.length) * 100 
        : 0,
      homeTeamWinRate: total > 0 ? (homeTeamWins / total) * 100 : 0,
      averageConfidence: total > 0 ? (totalConfidence / total) * 100 : 0
    };
  }, []);

  const fetchPredictionResults = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    
    try {
      // Use mock API service
      const historicalData = await mockApiService.getHistoricalData();
      const processedData = historicalData.games || [];
      
      setResults(processedData);
      setStats(calculateStats(processedData));
    } catch (err) {
      console.error('Error fetching prediction results:', err instanceof Error ? err.message : String(err));
      setError('Failed to load prediction performance data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [calculateStats]);

  // Filter results when month changes
  useEffect(() => {
    if (results.length > 0) {
      const filteredResults = selectedMonth === 'all' 
        ? results 
        : results.filter(r => {
            const month = new Date(r.date).getMonth() + 1;
            return month.toString() === selectedMonth;
          });
      
      setStats(calculateStats(filteredResults));
    }
  }, [selectedMonth, results, calculateStats]);

  // Initial data fetch
  useEffect(() => {
    fetchPredictionResults();
  }, [fetchPredictionResults]);

  // Get filtered results based on selected month
  const getFilteredResults = useCallback(() => {
    return selectedMonth === 'all' 
      ? results 
      : results.filter(r => {
          const month = new Date(r.date).getMonth() + 1;
          return month.toString() === selectedMonth;
        });
  }, [results, selectedMonth]);

  return {
    results,
    stats,
    loading,
    error,
    selectedMonth,
    refreshing,
    setSelectedMonth,
    refreshData: fetchPredictionResults,
    getFilteredResults
  };
}