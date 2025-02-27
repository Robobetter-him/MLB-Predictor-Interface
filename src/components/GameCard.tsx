import React from 'react';
import { Trophy, Clock, PieChart } from 'lucide-react';
import { Game } from '../store/gamesStore';

interface GameCardProps {
  game: Game;
}

const GameCard: React.FC<GameCardProps> = React.memo(({ game }) => {
  const gameTime = new Date(game.gameTime);
  const formattedTime = gameTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  
  return (
    <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500/20 p-2 rounded-lg">
            <Trophy className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">
              {game.homeTeam} vs {game.awayTeam}
            </h3>
            <div className="flex items-center gap-2 text-sm text-white/50 mt-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{formattedTime}</span>
              {game.status && (
                <span className="px-2 py-0.5 bg-blue-500/20 rounded-full text-xs">
                  {game.status}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="text-2xl font-bold text-green-400">
          {(game.prediction.winProbability * 100).toFixed(1)}%
        </div>
      </div>
      <p className="text-white/70 mb-2">
        {game.prediction.description}
      </p>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-white/50">
          <PieChart className="w-4 h-4" />
          <span>Confidence: {(game.prediction.confidence * 100).toFixed(1)}%</span>
        </div>
        <div className="text-white/50">
          {game.venue}
        </div>
      </div>
    </div>
  );
});

GameCard.displayName = 'GameCard';

export default GameCard;