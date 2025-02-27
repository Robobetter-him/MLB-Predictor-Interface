import React, { useState, useEffect } from 'react';
import { 
  Baseline as Baseball, Trophy, PieChart, Gauge, ArrowRight, 
  Calendar, Clock, RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import TeamStats from './components/TeamStats';
import GameCard from './components/GameCard';
import PerformanceTracker from './components/PerformanceTracker';
import { useTeamStore } from './store/teamStore';
import { usePredictionStore } from './store/predictionStore';
import { useGamesStore } from './store/gamesStore';

function App() {
  const [activeTab, setActiveTab] = useState<'predictor' | 'picks' | 'performance'>('predictor');
  const [error, setError] = useState<string | null>(null);

  // Team store
  const { teams, isLoading: teamsLoading, fetchTeams, getTeamNames } = useTeamStore();
  
  // Prediction store
  const { 
    homeTeam, 
    awayTeam, 
    prediction, 
    loading: predictionLoading, 
    error: predictionError,
    setHomeTeam,
    setAwayTeam,
    calculatePrediction,
    resetPrediction
  } = usePredictionStore();
  
  // Games store
  const {
    games,
    selectedDate,
    loading: gamesLoading,
    error: gamesError,
    lastUpdated,
    refreshing,
    setSelectedDate,
    fetchGames,
    refreshGames
  } = useGamesStore();

  // Initial data fetch
  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  // Set up polling for real-time updates in picks tab
  useEffect(() => {
    if (activeTab !== 'picks') return;
    
    fetchGames();
    
    const interval = setInterval(() => {
      fetchGames();
    }, 30000); // Poll every 30 seconds
    
    return () => clearInterval(interval);
  }, [activeTab, fetchGames]);

  // Handle errors from stores
  useEffect(() => {
    if (predictionError) {
      setError(predictionError);
    } else if (gamesError) {
      setError(gamesError);
    } else {
      setError(null);
    }
  }, [predictionError, gamesError]);

  // Manual refresh handler
  const handleRefresh = () => {
    if (activeTab === 'picks') {
      refreshGames();
    } else if (homeTeam && awayTeam && homeTeam !== awayTeam) {
      calculatePrediction();
    }
  };

  // Team selection handlers
  const handleHomeTeamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setHomeTeam(e.target.value);
    resetPrediction();
  };

  const handleAwayTeamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAwayTeam(e.target.value);
    resetPrediction();
  };

  // Date selection handler
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
            <Baseball className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-200">
              MLB Game Predictor
            </h1>
            <p className="text-blue-300 text-lg">Advanced Statistical Analysis</p>
          </div>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('predictor')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'predictor'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              Game Predictor
            </button>
            <button
              onClick={() => setActiveTab('picks')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'picks'
                  ? 'bg-yellow-500 text-white shadow-lg'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              Best Picks
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'performance'
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              Performance
            </button>
          </div>
          
          <button 
            onClick={handleRefresh}
            disabled={refreshing || predictionLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition-colors disabled:bg-blue-800 disabled:opacity-70"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing || predictionLoading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-white">
            {error}
          </div>
        )}

        {activeTab === 'predictor' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-3 bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <label className="block text-lg font-medium text-blue-300 mb-3">Home Team</label>
                  <select
                    value={homeTeam}
                    onChange={handleHomeTeamChange}
                    className="w-full bg-white/5 border-2 border-blue-500/30 rounded-xl p-4 text-white text-lg focus:outline-none focus:border-blue-500 transition-colors"
                    disabled={teamsLoading}
                  >
                    <option value="">Select Home Team</option>
                    {getTeamNames().map((team) => (
                      <option key={team} value={team}>{team}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-lg font-medium text-blue-300 mb-3">Away Team</label>
                  <select
                    value={awayTeam}
                    onChange={handleAwayTeamChange}
                    className="w-full bg-white/5 border-2 border-blue-500/30 rounded-xl p-4 text-white text-lg focus:outline-none focus:border-blue-500 transition-colors"
                    disabled={teamsLoading}
                  >
                    <option value="">Select Away Team</option>
                    {getTeamNames().map((team) => (
                      <option key={team} value={team}>{team}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={calculatePrediction}
                disabled={!homeTeam || !awayTeam || homeTeam === awayTeam || predictionLoading}
                className="w-full mt-8 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-slate-800 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 text-lg shadow-lg"
              >
                {predictionLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    <span>Calculating...</span>
                  </>
                ) : (
                  <>
                    <Gauge className="w-6 h-6" />
                    Generate Prediction
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {homeTeam === awayTeam && homeTeam && (
                <p className="mt-3 text-red-400 text-center">Please select different teams</p>
              )}
            </div>

            {prediction && (
              <>
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                      <Trophy className="w-6 h-6 text-yellow-400" />
                      <h3 className="text-xl font-semibold text-blue-300">Win Probability</h3>
                    </div>
                    <div className="text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-300">
                      {(prediction.winProbability * 100).toFixed(1)}%
                    </div>
                    <p className="text-lg text-white/70 mb-4">
                      {homeTeam} vs {awayTeam}
                    </p>
                    <p className="text-sm text-white/80 leading-relaxed">
                      {prediction.description}
                    </p>
                  </div>

                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                      <PieChart className="w-6 h-6 text-blue-400" />
                      <h3 className="text-xl font-semibold text-blue-300">Model Confidence</h3>
                    </div>
                    <div className="text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
                      {(prediction.confidence * 100).toFixed(1)}%
                    </div>
                    <p className="text-lg text-white/70 mb-4">Statistical Confidence Level</p>
                    <p className="text-sm text-white/80 leading-relaxed">
                      {prediction.confidenceDescription}
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <TeamStats stats={prediction.stats.home} title={`${homeTeam} Stats`} />
                  <TeamStats stats={prediction.stats.away} title={`${awayTeam} Stats`} />
                </div>
              </>
            )}
          </div>
        ) : activeTab === 'picks' ? (
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-blue-300">Today's Top Picks</h2>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-300" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-white/60 mb-6">
                <Clock className="w-4 h-4" />
                <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
              </div>
              
              {gamesLoading && (!games || games.length === 0) ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                  <p className="text-white/70">Loading games...</p>
                </div>
              ) : (!games || games.length === 0) ? (
                <div className="text-center py-12 bg-white/5 rounded-xl">
                  <p className="text-white/70">No games found for this date.</p>
                  <p className="text-white/50 text-sm mt-2">Try selecting a different date or check back later.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Array.isArray(games) && games.map((game, index) => (
                    <GameCard key={index} game={game} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <PerformanceTracker />
        )}
      </div>
    </div>
  );
}

export default App;