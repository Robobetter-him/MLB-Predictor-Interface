# MLB Game Predictor

An advanced MLB game prediction application that uses statistical analysis and machine learning to predict game outcomes.

## Features

- Game prediction based on team statistics
- Weather impact analysis
- Historical performance tracking
- Advanced statistical modeling

## Setup

### Prerequisites

- Node.js (v16+)
- Python (v3.8+)

### Installation

1. Clone the repository
2. Install frontend dependencies:
   ```
   npm install
   ```
3. Install Python dependencies:
   ```
   pip install -r requirements.txt
   ```
4. Copy the environment variables file:
   ```
   cp .env.example .env
   ```
5. Add your API keys to the `.env` file:
   ```
   MLB_API_KEY=your_api_key_here
   WEATHER_API_KEY=your_weather_api_key_here
   ```

### Running the Application

1. Start the Python backend:
   ```
   npm run start-api
   ```
2. In a separate terminal, start the frontend:
   ```
   npm run dev
   ```
3. Open your browser and navigate to the URL shown in the terminal (usually http://localhost:5173)

## API Keys

This application requires the following API keys:

1. **MLB API Key** - Required for fetching team data and statistics
2. **Weather API Key** (optional) - For including weather conditions in predictions

## Configuration

You can adjust the prediction model weights in the `.env` file:

```
HOME_ADVANTAGE_WEIGHT=0.15
OPS_WEIGHT=0.2
OBP_WEIGHT=0.2
RUNS_WEIGHT=0.15
EARNED_RUNS_WEIGHT=0.15
HOME_AWAY_WEIGHT=0.2
WIN_PCT_WEIGHT=0.1
```

## Prediction Model

The prediction model uses a weighted combination of factors:

1. **Home Field Advantage (15%)**: Historical performance at home vs. league average
2. **Head-to-Head Stats (55%)**:
   - OPS Differential (20%)
   - OBP Comparison (20%)
   - Run Differential (15%)
3. **Recent Form (30%)**:
   - Home/Away Win Rate (20%)
   - Overall Win Percentage (10%)
4. **Weather Impact**: Dynamic adjustment based on current weather conditions

##