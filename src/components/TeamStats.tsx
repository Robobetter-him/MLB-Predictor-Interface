import React from 'react';
import { 
  Baseline as Baseball, TrendingUp, Target, Activity, 
  Star, Zap, Users, TrendingDown, Percent 
} from 'lucide-react';
import { TeamStats as TeamStatsType } from '../store/teamStore';

interface TeamStatsProps {
  stats: TeamStatsType;
  title: string;
}

const TeamStats: React.FC<TeamStatsProps> = React.memo(({ stats, title }) => {
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 shadow-xl">
      <h3 className="text-2xl font-bold text-blue-300 mb-6 flex items-center gap-3">
        <Baseball className="w-6 h-6" />
        {title}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Win Percentages */}
        <div className="bg-white/5 rounded-xl p-4">
          <h4 className="text-lg font-semibold text-blue-200 mb-4">Win Percentages</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-green-400" />
                <span className="text-white/70">Overall</span>
              </div>
              <span className="font-semibold">{(stats.winPct * 100).toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span className="text-white/70">Home</span>
              </div>
              <span className="font-semibold">{(stats.homeWinPct * 100).toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-purple-400" />
                <span className="text-white/70">Away</span>
              </div>
              <span className="font-semibold">{(stats.awayWinPct * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Batting Stats */}
        <div className="bg-white/5 rounded-xl p-4">
          <h4 className="text-lg font-semibold text-blue-200 mb-4">Batting</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-yellow-400" />
                <span className="text-white/70">OBP</span>
              </div>
              <span className="font-semibold">{stats.obp.toFixed(3)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-red-400" />
                <span className="text-white/70">OPS</span>
              </div>
              <span className="font-semibold">{stats.ops.toFixed(3)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" />
                <span className="text-white/70">Hits</span>
              </div>
              <span className="font-semibold">{stats.h}</span>
            </div>
          </div>
        </div>

        {/* Run Production */}
        <div className="bg-white/5 rounded-xl p-4">
          <h4 className="text-lg font-semibold text-blue-200 mb-4">Run Production</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-green-400" />
                <span className="text-white/70">Runs</span>
              </div>
              <span className="font-semibold">{stats.r}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-white/70">RBI</span>
              </div>
              <span className="font-semibold">{stats.rbi}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-400" />
                <span className="text-white/70">LOB</span>
              </div>
              <span className="font-semibold">{stats.lob.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Plate Discipline */}
        <div className="bg-white/5 rounded-xl p-4">
          <h4 className="text-lg font-semibold text-blue-200 mb-4">Plate Discipline</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-orange-400" />
                <span className="text-white/70">Strikeouts</span>
              </div>
              <span className="font-semibold">{stats.so}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-white/70">Walks</span>
              </div>
              <span className="font-semibold">{stats.bb}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" />
                <span className="text-white/70">Earned Runs</span>
              </div>
              <span className="font-semibold">{stats.er}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

TeamStats.displayName = 'TeamStats';

export default TeamStats;