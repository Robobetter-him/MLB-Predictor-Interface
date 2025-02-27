import React from 'react';
import { Brain, Calculator, BarChart as ChartBar, Database, LineChart, Sigma, Sparkles, Target } from 'lucide-react';

function About() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="glass-card p-8 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg">
            <Brain className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-200">
            Our Prediction Methodology
          </h2>
        </div>
        <p className="text-white/80 leading-relaxed mb-6">
          Our MLB game prediction system uses advanced statistical analysis and machine learning techniques
          to provide accurate predictions for baseball games. We combine historical data, team performance metrics,
          and situational variables to generate win probabilities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="stat-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calculator className="w-6 h-6 text-blue-400" />
            <h3 className="text-xl font-semibold text-blue-300">Statistical Factors</h3>
          </div>
          <ul className="space-y-3 text-white/70">
            <li className="flex items-center gap-2">
              <ChartBar className="w-4 h-4 text-green-400" />
              Team Win Percentages (Home/Away)
            </li>
            <li className="flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-400" />
              On-base Percentage (OBP)
            </li>
            <li className="flex items-center gap-2">
              <LineChart className="w-4 h-4 text-yellow-400" />
              OPS (On-base Plus Slugging)
            </li>
          </ul>
        </div>

        <div className="stat-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Sigma className="w-6 h-6 text-purple-400" />
            <h3 className="text-xl font-semibold text-purple-300">Regression Model</h3>
          </div>
          <ul className="space-y-3 text-white/70">
            <li className="flex items-center gap-2">
              <Database className="w-4 h-4 text-red-400" />
              Historical Game Data Analysis
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              Performance Metrics Weighting
            </li>
            <li className="flex items-center gap-2">
              <Target className="w-4 h-4 text-green-400" />
              Situational Variables
            </li>
          </ul>
        </div>
      </div>

      <div className="glass-card p-8">
        <h3 className="text-2xl font-semibold text-blue-300 mb-4">Prediction Formula</h3>
        <div className="space-y-4 text-white/80">
          <p>Our prediction model uses a weighted combination of factors:</p>
          <div className="bg-white/5 p-4 rounded-lg space-y-2">
            <p><strong>1. Home Field Advantage (15%):</strong> Historical performance at home vs. league average</p>
            <p><strong>2. Head-to-Head Stats (55%):</strong></p>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>OPS Differential (20%)</li>
              <li>OBP Comparison (20%)</li>
              <li>Run Differential (15%)</li>
            </ul>
            <p><strong>3. Recent Form (30%):</strong></p>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>Home/Away Win Rate (20%)</li>
              <li>Overall Win Percentage (10%)</li>
            </ul>
          </div>
          <p className="text-sm text-white/60 mt-4">
            The model adjusts these weights dynamically based on the significance of each factor in recent games,
            ensuring the predictions remain accurate throughout the season.
          </p>
        </div>
      </div>
    </div>
  );
}

export default About;