import React from 'react';
import { BarChart, CheckCircle, XCircle, AlertCircle, TrendingUp, Calendar, RefreshCw } from 'lucide-react';
import { usePerformanceData } from '../hooks/usePerformanceData';

const PerformanceTracker: React.FC = () => {
  const {
    results,
    stats,
    loading,
    error,
    selectedMonth,
    refreshing,
    setSelectedMonth,
    refreshData,
    getFilteredResults
  } = usePerformanceData();

  const getMonthName = (monthNum: string) => {
    if (monthNum === 'all') return 'All Months';
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[parseInt(monthNum) - 1];
  };

  const filteredResults = getFilteredResults().slice(0, 10);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 shadow-xl mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
              <BarChart className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-purple-300">Prediction Performance (2023 Season)</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-300" />
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="all">All Months</option>
                <option value="4">April</option>
                <option value="5">May</option>
                <option value="6">June</option>
                <option value="7">July</option>
                <option value="8">August</option>
                <option value="9">September</option>
                <option value="10">October</option>
              </select>
            </div>
            
            <button 
              onClick={refreshData}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white transition-colors disabled:bg-purple-800 disabled:opacity-70"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-white">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mb-4"></div>
            <p className="text-white/70">Loading performance data...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <div className="flex items-center gap-2 text-purple-300 mb-2">
                  <TrendingUp className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">Overall Accuracy</h3>
                </div>
                <div className="text-4xl font-bold text-white mb-1">{stats.accuracy.toFixed(1)}%</div>
                <p className="text-white/60 text-sm">
                  {stats.correctPredictions} correct out of {stats.totalPredictions} predictions
                </p>
              </div>
              
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <div className="flex items-center gap-2 text-green-300 mb-2">
                  <CheckCircle className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">High Confidence</h3>
                </div>
                <div className="text-4xl font-bold text-white mb-1">{stats.highConfidenceAccuracy.toFixed(1)}%</div>
                <p className="text-white/60 text-sm">
                  Accuracy when confidence ≥ 70%
                </p>
              </div>
              
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <div className="flex items-center gap-2 text-yellow-300 mb-2">
                  <AlertCircle className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">Low Confidence</h3>
                </div>
                <div className="text-4xl font-bold text-white mb-1">{stats.lowConfidenceAccuracy.toFixed(1)}%</div>
                <p className="text-white/60 text-sm">
                  Accuracy when confidence &lt; 70%
                </p>
              </div>
              
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <div className="flex items-center gap-2 text-blue-300 mb-2">
                  <BarChart className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">Home Win Rate</h3>
                </div>
                <div className="text-4xl font-bold text-white mb-1">{stats.homeTeamWinRate.toFixed(1)}%</div>
                <p className="text-white/60 text-sm">
                  Home teams won {stats.homeTeamWinRate.toFixed(1)}% of games
                </p>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold text-purple-300 mb-4">Recent Predictions ({getMonthName(selectedMonth)})</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-white/5 text-left">
                    <th className="px-4 py-3 text-white/80 font-semibold rounded-tl-lg">Date</th>
                    <th className="px-4 py-3 text-white/80 font-semibold">Matchup</th>
                    <th className="px-4 py-3 text-white/80 font-semibold">Prediction</th>
                    <th className="px-4 py-3 text-white/80 font-semibold">Actual Winner</th>
                    <th className="px-4 py-3 text-white/80 font-semibold">Confidence</th>
                    <th className="px-4 py-3 text-white/80 font-semibold rounded-tr-lg">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.map((result, index) => (
                    <tr key={index} className={`border-t border-white/5 ${index % 2 === 0 ? 'bg-white/[0.03]' : ''}`}>
                      <td className="px-4 py-3 text-white/70">
                        {new Date(result.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-white">
                        {result.awayTeam} @ {result.homeTeam}
                      </td>
                      <td className="px-4 py-3 text-white/90">
                        {result.predictedWinner}
                      </td>
                      <td className="px-4 py-3 text-white/90">
                        {result.actualWinner}
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-full bg-white/10 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full ${result.confidence >= 0.7 ? 'bg-green-500' : 'bg-yellow-500'}`}
                            style={{ width: `${result.confidence * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-white/60 mt-1 block">
                          {(result.confidence * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {result.correct ? (
                          <span className="inline-flex items-center gap-1 text-green-400">
                            <CheckCircle className="w-4 h-4" />
                            Correct
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-400">
                            <XCircle className="w-4 h-4" />
                            Incorrect
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredResults.length === 0 && (
              <div className="text-center py-8 bg-white/5 rounded-xl mt-4">
                <p className="text-white/70">No prediction data available for this period.</p>
              </div>
            )}
          </>
        )}
      </div>
      
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 shadow-xl">
        <h3 className="text-xl font-semibold text-purple-300 mb-4">Performance Insights</h3>
        
        <div className="space-y-4 text-white/80">
          <p>
            Our MLB prediction model has been tested against the entire 2023 MLB season, with performance metrics tracked across
            different confidence levels and game scenarios.
          </p>
          
          <div className="bg-white/5 p-5 rounded-xl">
            <h4 className="text-lg font-medium text-purple-200 mb-3">Key Findings</h4>
            <ul className="space-y-2 list-disc pl-5">
              <li>High confidence predictions (70%+ confidence) achieved {stats.highConfidenceAccuracy.toFixed(1)}% accuracy</li>
              <li>Home field advantage remains significant, with home teams winning {stats.homeTeamWinRate.toFixed(1)}% of games</li>
              <li>Our model performs best when predicting games involving teams with significant statistical disparities</li>
              <li>Predictions for divisional matchups (teams that play each other frequently) show higher accuracy</li>
            </ul>
          </div>
          
          <p>
            The model continues to be refined based on these historical results, with particular emphasis on improving
            predictions for closely matched teams and accounting for momentum factors during winning/losing streaks.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PerformanceTracker;