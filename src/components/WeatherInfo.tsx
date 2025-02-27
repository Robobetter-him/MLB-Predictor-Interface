import React from 'react';
import { Cloud, CloudRain, CloudSnow, Sun, Wind } from 'lucide-react';

interface WeatherInfoProps {
  weatherData?: {
    condition: string;
    temperature: number;
    windSpeed: number;
    humidity: number;
    precipitation: number;
  };
  weatherFactorApplied?: boolean;
}

const WeatherInfo: React.FC<WeatherInfoProps> = ({ weatherData, weatherFactorApplied }) => {
  if (!weatherData && !weatherFactorApplied) {
    return null;
  }

  // If we have weather factor applied but no data, show a simplified version
  if (!weatherData && weatherFactorApplied) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 mt-4">
        <div className="flex items-center gap-2 text-blue-300 mb-2">
          <Cloud className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Weather Impact</h3>
        </div>
        <p className="text-white/70 text-sm">
          Weather conditions have been factored into this prediction.
        </p>
      </div>
    );
  }

  if (!weatherData) return null;

  // Determine weather icon based on condition
  const getWeatherIcon = () => {
    const condition = weatherData.condition.toLowerCase();
    if (condition.includes('rain') || condition.includes('drizzle')) {
      return <CloudRain className="w-6 h-6 text-blue-400" />;
    } else if (condition.includes('snow')) {
      return <CloudSnow className="w-6 h-6 text-blue-200" />;
    } else if (condition.includes('cloud')) {
      return <Cloud className="w-6 h-6 text-gray-400" />;
    } else if (weatherData.windSpeed > 15) {
      return <Wind className="w-6 h-6 text-teal-400" />;
    } else {
      return <Sun className="w-6 h-6 text-yellow-400" />;
    }
  };

  // Determine impact on game
  const getWeatherImpact = () => {
    let impact = '';
    
    if (weatherData.windSpeed > 15) {
      impact += 'High winds may reduce hitting distance. ';
    }
    
    if (weatherData.temperature > 85) {
      impact += 'Hot conditions favor hitters (ball travels farther). ';
    } else if (weatherData.temperature < 50) {
      impact += 'Cold conditions favor pitchers. ';
    }
    
    if (weatherData.humidity > 80) {
      impact += 'High humidity may reduce ball travel. ';
    } else if (weatherData.humidity < 40) {
      impact += 'Low humidity may help ball travel farther. ';
    }
    
    if (weatherData.precipitation > 0) {
      impact += 'Precipitation could affect grip and visibility. ';
    }
    
    return impact || 'Current weather conditions have minimal impact on the game.';
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 mt-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-blue-300">
          {getWeatherIcon()}
          <h3 className="text-lg font-semibold">Weather Conditions</h3>
        </div>
        <span className="text-white/80 font-semibold">
          {weatherData.temperature}°F
        </span>
      </div>
      
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-xs text-white/50 mb-1">Wind</div>
          <div className="text-sm font-medium">{weatherData.windSpeed} mph</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-xs text-white/50 mb-1">Humidity</div>
          <div className="text-sm font-medium">{weatherData.humidity}%</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-xs text-white/50 mb-1">Precipitation</div>
          <div className="text-sm font-medium">{weatherData.precipitation}%</div>
        </div>
      </div>
      
      <div className="text-sm text-white/70">
        <strong className="text-blue-300">Game Impact:</strong> {getWeatherImpact()}
      </div>
    </div>
  );
};

export default WeatherInfo;