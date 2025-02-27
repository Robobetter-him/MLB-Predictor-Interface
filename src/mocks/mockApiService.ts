import { format } from 'date-fns';
import { mlbTeams } from './mlbTeams';

// Helper function to get confidence description
function getConfidenceDescription(confidence: number): string {
  if (confidence >= 0.8) {
    return "Very high confidence based on strong home/away performance and statistical advantages";
  } else if (confidence >= 0.7) {
    return "Good confidence supported by home/away splits and team metrics";
  } else {
    return "Moderate confidence - consider home/away factors and recent performance";
  }
}

// Helper function to get prediction description
function getPredictionDescription(probability: number, homeTeam: string, awayTeam: string, homeStats: any, awayStats: any): string {
  const homeAdvantage = homeStats.homeWinPct - homeStats.winPct;
  const awayDisadvantage = awayStats.winPct - awayStats.awayWinPct;
  
  if (probability >= 0.7) {
    return `Strong prediction for ${homeTeam} (${(homeStats.homeWinPct * 100).toFixed(1)}% home win rate) against ${awayTeam} (${(awayStats.awayWinPct * 100).toFixed(1)}% away win rate)`;
  } else if (probability >= 0.6) {
    return `${homeTeam} has a good chance, boosted by their ${(homeAdvantage * 100).toFixed(1)}% home advantage`;
  } else if (probability >= 0.5) {
    return `Slight edge for ${homeTeam}, despite ${awayTeam}'s solid ${(awayStats.awayWinPct * 100).toFixed(1)}% road record`;
  } else if (probability >= 0.4) {
    return `${awayTeam} likely to overcome ${homeTeam}'s home advantage`;
  } else {
    return `${awayTeam} strongly favored despite playing away (${(awayStats.awayWinPct * 100).toFixed(1)}% road win rate)`;
  }
}

// Calculate prediction based on team stats
export function calculatePrediction(homeTeam: string, awayTeam: string) {
  if (!homeTeam || !awayTeam || homeTeam === awayTeam) {
    return null;
  }
  
  const homeStats = mlbTeams[homeTeam]?.stats;
  const awayStats = mlbTeams[awayTeam]?.stats;
  
  if (!homeStats || !awayStats) {
    return null;
  }
  
  // Calculate weighted features
  const features = {
    "runs": (homeStats.r - awayStats.r) / 1000,
    "hits": (homeStats.h - awayStats.h) / 1500,
    "rbi": (homeStats.rbi - awayStats.rbi) / 800,
    "strikeouts": (awayStats.so - homeStats.so) / 1500,
    "obp": homeStats.obp - awayStats.obp,
    "ops": homeStats.ops - awayStats.ops,
    "lob": (awayStats.lob - homeStats.lob) / 1200,
    "walks": (homeStats.bb - awayStats.bb) / 650,
    "earnedRuns": (awayStats.er - homeStats.er) / 800,
    "winPct": homeStats.winPct - awayStats.winPct
  };
  
  // Get weights from environment variables or use defaults
  const homeAdvantageWeight = 0.15;
  const opsWeight = 0.2;
  const obpWeight = 0.2;
  const runsWeight = 0.15;
  const earnedRunsWeight = 0.15;
  const homeAwayWeight = 0.2;
  const winPctWeight = 0.1;
  
  const winProb = Math.min(Math.max(
    0.5 + 
    features.runs * runsWeight +
    features.hits * 0.1 +
    features.rbi * 0.1 +
    features.strikeouts * 0.05 +
    features.obp * obpWeight +
    features.ops * opsWeight +
    features.lob * 0.05 +
    features.walks * 0.05 +
    features.earnedRuns * earnedRunsWeight +
    features.winPct * winPctWeight,
    0.1
  ), 0.9);
  
  const confidence = Math.min(0.6 + 
    Math.abs(features.runs) * 0.1 +
    Math.abs(features.hits) * 0.1 +
    Math.abs(features.rbi) * 0.1 +
    Math.abs(features.strikeouts) * 0.05 +
    Math.abs(features.obp) * 0.15 +
    Math.abs(features.ops) * 0.15 +
    Math.abs(features.lob) * 0.05 +
    Math.abs(features.walks) * 0.05 +
    Math.abs(features.earnedRuns) * 0.1 +
    Math.abs(features.winPct) * 0.15,
    0.9
  );
  
  return {
    winProbability: winProb,
    confidence: confidence,
    stats: {
      home: homeStats,
      away: awayStats
    },
    description: getPredictionDescription(winProb, homeTeam, awayTeam, homeStats, awayStats),
    confidenceDescription: getConfidenceDescription(confidence)
  };
}

// Generate games for a specific date
export function generateGamesForDate(date: string) {
  const teamNames = Object.keys(mlbTeams);
  const games = [];
  
  // Create 5 random matchups
  for (let i = 0; i < 5; i++) {
    const homeIndex = Math.floor(Math.random() * teamNames.length);
    let awayIndex;
    do {
      awayIndex = Math.floor(Math.random() * teamNames.length);
    } while (awayIndex === homeIndex);
    
    const homeTeam = teamNames[homeIndex];
    const awayTeam = teamNames[awayIndex];
    const prediction = calculatePrediction(homeTeam, awayTeam);
    
    // Generate a random game time on the specified date
    const gameDate = new Date(date);
    const gameHour = 12 + Math.floor(Math.random() * 8); // Between 12pm and 8pm
    gameDate.setHours(gameHour, Math.floor(Math.random() * 60), 0);
    
    games.push({
      homeTeam,
      awayTeam,
      prediction,
      gameTime: gameDate.toISOString(),
      venue: `${homeTeam} Stadium`,
      status: Math.random() > 0.5 ? 'Scheduled' : 'In Progress'
    });
  }
  
  return games;
}

// Generate historical prediction data
export function generateHistoricalData() {
  const teams = Object.keys(mlbTeams);
  const results = [];
  
  // Generate data for each month of the 2023 season (April-October)
  for (let month = 4; month <= 10; month++) {
    // Number of games per month varies
    const gamesInMonth = month === 10 ? 15 : 30; // Fewer games in October (postseason)
    
    for (let i = 0; i < gamesInMonth; i++) {
      // Random day in month
      const day = Math.floor(Math.random() * 28) + 1;
      const date = `2023-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      
      // Random teams
      const homeIndex = Math.floor(Math.random() * teams.length);
      let awayIndex;
      do {
        awayIndex = Math.floor(Math.random() * teams.length);
      } while (awayIndex === homeIndex);
      
      const homeTeam = teams[homeIndex];
      const awayTeam = teams[awayIndex];
      
      // Generate prediction data
      const winProbability = Math.random() * 0.5 + 0.3; // Between 0.3 and 0.8
      const confidence = Math.random() * 0.4 + 0.5; // Between 0.5 and 0.9
      const predictedWinner = winProbability >= 0.5 ? homeTeam : awayTeam;
      
      // Determine actual winner - higher confidence should correlate with more correct predictions
      const correctnessFactor = Math.random() + (confidence - 0.5);
      const correct = correctnessFactor > 0.8;
      const actualWinner = correct ? predictedWinner : (predictedWinner === homeTeam ? awayTeam : homeTeam);
      
      results.push({
        date,
        homeTeam,
        awayTeam,
        predictedWinner,
        actualWinner,
        winProbability,
        confidence,
        correct
      });
    }
  }
  
  // Sort by date, newest first
  const sortedResults = results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Calculate overall prediction accuracy
  const totalGames = sortedResults.length;
  const correctPredictions = sortedResults.filter(g => g.correct).length;
  const accuracy = totalGames > 0 ? (correctPredictions / totalGames) * 100 : 0;
  
  // Calculate high confidence prediction accuracy
  const highConfidenceGames = sortedResults.filter(g => g.confidence >= 0.7);
  const highConfidenceCorrect = highConfidenceGames.filter(g => g.correct).length;
  const highConfidenceAccuracy = highConfidenceGames.length > 0 ? 
    (highConfidenceCorrect / highConfidenceGames.length) * 100 : 0;
  
  // Calculate low confidence prediction accuracy
  const lowConfidenceGames = sortedResults.filter(g => g.confidence < 0.7);
  const lowConfidenceCorrect = lowConfidenceGames.filter(g => g.correct).length;
  const lowConfidenceAccuracy = lowConfidenceGames.length > 0 ? 
    (lowConfidenceCorrect / lowConfidenceGames.length) * 100 : 0;
  
  // Calculate home team win rate
  const homeTeamWins = sortedResults.filter(g => g.actualWinner === g.homeTeam).length;
  const homeTeamWinRate = totalGames > 0 ? (homeTeamWins / totalGames) * 100 : 0;
  
  // Calculate average confidence
  const totalConfidence = sortedResults.reduce((sum, g) => sum + g.confidence, 0);
  const averageConfidence = totalGames > 0 ? (totalConfidence / totalGames) * 100 : 0;
  
  return {
    games: sortedResults,
    stats: {
      totalGames,
      correctPredictions,
      accuracy,
      highConfidenceGames: highConfidenceGames.length,
      highConfidenceCorrect,
      highConfidenceAccuracy,
      lowConfidenceGames: lowConfidenceGames.length,
      lowConfidenceCorrect,
      lowConfidenceAccuracy,
      homeTeamWins,
      homeTeamWinRate,
      averageConfidence
    }
  };
}

// Mock API service
class MockApiService {
  // Get teams
  async getTeams() {
    return Object.keys(mlbTeams).sort();
  }
  
  // Get team details
  async getTeamDetails() {
    return mlbTeams;
  }
  
  // Get games for a date
  async getGames(date: string = format(new Date(), 'yyyy-MM-dd')) {
    return generateGamesForDate(date);
  }
  
  // Get historical data
  async getHistoricalData() {
    return generateHistoricalData();
  }
  
  // Calculate prediction
  async calculatePrediction(homeTeam: string, awayTeam: string) {
    if (!homeTeam || !awayTeam || homeTeam === awayTeam) {
      throw new Error("Invalid team selection");
    }
    
    const prediction = calculatePrediction(homeTeam, awayTeam);
    
    if (prediction) {
      return prediction;
    } else {
      throw new Error("Could not generate prediction");
    }
  }
}

export const mockApiService = new MockApiService();