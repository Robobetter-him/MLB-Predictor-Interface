import { TeamStats } from '../store/teamStore';

// Environment variables with default values
const ENV = {
  HOME_ADVANTAGE_WEIGHT: 0.15,
  OPS_WEIGHT: 0.2,
  OBP_WEIGHT: 0.2,
  RUNS_WEIGHT: 0.15,
  EARNED_RUNS_WEIGHT: 0.15,
  HOME_AWAY_WEIGHT: 0.2,
  WIN_PCT_WEIGHT: 0.1
};

// Memoization cache for prediction descriptions
const descriptionCache = new Map<string, string>();
const confidenceDescriptionCache = new Map<number, string>();

export function getConfidenceDescription(confidence: number): string {
  // Check cache first
  if (confidenceDescriptionCache.has(confidence)) {
    return confidenceDescriptionCache.get(confidence)!;
  }
  
  let description: string;
  if (confidence >= 0.8) {
    description = "Very high confidence based on strong home/away performance and statistical advantages";
  } else if (confidence >= 0.7) {
    description = "Good confidence supported by home/away splits and team metrics";
  } else {
    description = "Moderate confidence - consider home/away factors and recent performance";
  }
  
  // Cache the result
  confidenceDescriptionCache.set(confidence, description);
  return description;
}

export function getPredictionDescription(
  probability: number, 
  homeTeam: string, 
  awayTeam: string, 
  homeStats: TeamStats, 
  awayStats: TeamStats
): string {
  // Create a cache key
  const cacheKey = `${probability.toFixed(2)}-${homeTeam}-${awayTeam}`;
  
  // Check cache first
  if (descriptionCache.has(cacheKey)) {
    return descriptionCache.get(cacheKey)!;
  }
  
  const homeAdvantage = homeStats.homeWinPct - homeStats.winPct;
  const awayDisadvantage = awayStats.winPct - awayStats.awayWinPct;
  
  let description: string;
  if (probability >= 0.7) {
    description = `Strong prediction for ${homeTeam} (${(homeStats.homeWinPct * 100).toFixed(1)}% home win rate) against ${awayTeam} (${(awayStats.awayWinPct * 100).toFixed(1)}% away win rate)`;
  } else if (probability >= 0.6) {
    description = `${homeTeam} has a good chance, boosted by their ${(homeAdvantage * 100).toFixed(1)}% home advantage`;
  } else if (probability >= 0.5) {
    description = `Slight edge for ${homeTeam}, despite ${awayTeam}'s solid ${(awayStats.awayWinPct * 100).toFixed(1)}% road record`;
  } else if (probability >= 0.4) {
    description = `${awayTeam} likely to overcome ${homeTeam}'s home advantage`;
  } else {
    description = `${awayTeam} strongly favored despite playing away (${(awayStats.awayWinPct * 100).toFixed(1)}% road win rate)`;
  }
  
  // Cache the result
  descriptionCache.set(cacheKey, description);
  return description;
}

// Optimized calculation of prediction features
export function calculateFeatures(homeStats: TeamStats, awayStats: TeamStats) {
  // Pre-calculate differences to avoid redundant operations
  const runsDiff = homeStats.r - awayStats.r;
  const hitsDiff = homeStats.h - awayStats.h;
  const rbiDiff = homeStats.rbi - awayStats.rbi;
  const strikeoutsDiff = awayStats.so - homeStats.so;
  const obpDiff = homeStats.obp - awayStats.obp;
  const opsDiff = homeStats.ops - awayStats.ops;
  const lobDiff = awayStats.lob - homeStats.lob;
  const walksDiff = homeStats.bb - awayStats.bb;
  const earnedRunsDiff = awayStats.er - homeStats.er;
  const winPctDiff = homeStats.winPct - awayStats.winPct;
  
  // Calculate features with optimized scaling factors
  return {
    runs: runsDiff * 0.001,
    hits: hitsDiff * 0.00067,
    rbi: rbiDiff * 0.00125,
    strikeouts: strikeoutsDiff * 0.00067,
    obp: obpDiff,
    ops: opsDiff,
    lob: lobDiff * 0.00083,
    walks: walksDiff * 0.00154,
    earnedRuns: earnedRunsDiff * 0.00125,
    winPct: winPctDiff
  };
}

// Optimized prediction calculation
export function calculateWinProbability(features: ReturnType<typeof calculateFeatures>) {
  // Apply weights to features
  const weightedSum = 
    features.runs * ENV.RUNS_WEIGHT +
    features.hits * 0.1 +
    features.rbi * 0.1 +
    features.strikeouts * 0.05 +
    features.obp * ENV.OBP_WEIGHT +
    features.ops * ENV.OPS_WEIGHT +
    features.lob * 0.05 +
    features.walks * 0.05 +
    features.earnedRuns * ENV.EARNED_RUNS_WEIGHT +
    features.winPct * ENV.WIN_PCT_WEIGHT;
  
  // Clamp the result between 0.1 and 0.9
  return Math.min(Math.max(0.5 + weightedSum, 0.1), 0.9);
}

// Optimized confidence calculation
export function calculateConfidence(features: ReturnType<typeof calculateFeatures>) {
  // Calculate absolute values once
  const absFeatures = {
    runs: Math.abs(features.runs),
    hits: Math.abs(features.hits),
    rbi: Math.abs(features.rbi),
    strikeouts: Math.abs(features.strikeouts),
    obp: Math.abs(features.obp),
    ops: Math.abs(features.ops),
    lob: Math.abs(features.lob),
    walks: Math.abs(features.walks),
    earnedRuns: Math.abs(features.earnedRuns),
    winPct: Math.abs(features.winPct)
  };
  
  // Apply weights to absolute features
  const weightedSum = 
    absFeatures.runs * 0.1 +
    absFeatures.hits * 0.1 +
    absFeatures.rbi * 0.1 +
    absFeatures.strikeouts * 0.05 +
    absFeatures.obp * 0.15 +
    absFeatures.ops * 0.15 +
    absFeatures.lob * 0.05 +
    absFeatures.walks * 0.05 +
    absFeatures.earnedRuns * 0.1 +
    absFeatures.winPct * 0.15;
  
  // Clamp the result between 0.6 and 0.9
  return Math.min(0.6 + weightedSum, 0.9);
}