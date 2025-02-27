from flask import Flask, render_template, request, jsonify
import pandas as pd
import numpy as np
from datetime import datetime
import json
import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='static', template_folder='templates')

# MLB API Base URL
MLB_API_BASE = 'https://statsapi.mlb.com/api/v1'

# MLB Teams data
mlb_teams = {
    "Arizona Diamondbacks": {
        "id": 109,
        "stats": {"r": 746, "h": 1368, "rbi": 709, "so": 1236, "obp": 0.322, "ops": 0.408, "lob": 2.8, "bb": 478, "er": 674, "winPct": 0.519, "homeWinPct": 0.531, "awayWinPct": 0.507}
    },
    "Atlanta Braves": {
        "id": 144,
        "stats": {"r": 823, "h": 1401, "rbi": 789, "so": 1289, "obp": 0.331, "ops": 0.443, "lob": 3.1, "bb": 511, "er": 612, "winPct": 0.593, "homeWinPct": 0.617, "awayWinPct": 0.568}
    },
    "Baltimore Orioles": {
        "id": 110,
        "stats": {"r": 807, "h": 1435, "rbi": 768, "so": 1187, "obp": 0.327, "ops": 0.424, "lob": 3.0, "bb": 489, "er": 645, "winPct": 0.586, "homeWinPct": 0.605, "awayWinPct": 0.568}
    },
    "Boston Red Sox": {
        "id": 111,
        "stats": {"r": 778, "h": 1456, "rbi": 742, "so": 1301, "obp": 0.325, "ops": 0.426, "lob": 3.2, "bb": 467, "er": 698, "winPct": 0.512, "homeWinPct": 0.531, "awayWinPct": 0.494}
    },
    "Chicago Cubs": {
        "id": 112,
        "stats": {"r": 762, "h": 1389, "rbi": 728, "so": 1356, "obp": 0.319, "ops": 0.409, "lob": 3.0, "bb": 501, "er": 687, "winPct": 0.506, "homeWinPct": 0.543, "awayWinPct": 0.469}
    },
    "Chicago White Sox": {
        "id": 145,
        "stats": {"r": 578, "h": 1289, "rbi": 549, "so": 1301, "obp": 0.289, "ops": 0.345, "lob": 2.7, "bb": 378, "er": 812, "winPct": 0.346, "homeWinPct": 0.370, "awayWinPct": 0.321}
    },
    "Cincinnati Reds": {
        "id": 113,
        "stats": {"r": 716, "h": 1345, "rbi": 678, "so": 1398, "obp": 0.311, "ops": 0.386, "lob": 2.9, "bb": 512, "er": 701, "winPct": 0.488, "homeWinPct": 0.519, "awayWinPct": 0.457}
    },
    "Cleveland Guardians": {
        "id": 114,
        "stats": {"r": 671, "h": 1378, "rbi": 634, "so": 1089, "obp": 0.312, "ops": 0.376, "lob": 2.8, "bb": 456, "er": 598, "winPct": 0.562, "homeWinPct": 0.593, "awayWinPct": 0.531}
    },
    "Colorado Rockies": {
        "id": 115,
        "stats": {"r": 706, "h": 1389, "rbi": 673, "so": 1367, "obp": 0.308, "ops": 0.401, "lob": 2.9, "bb": 421, "er": 876, "winPct": 0.377, "homeWinPct": 0.432, "awayWinPct": 0.321}
    },
    "Detroit Tigers": {
        "id": 116,
        "stats": {"r": 661, "h": 1312, "rbi": 628, "so": 1367, "obp": 0.301, "ops": 0.376, "lob": 2.7, "bb": 432, "er": 678, "winPct": 0.488, "homeWinPct": 0.519, "awayWinPct": 0.457}
    },
    "Houston Astros": {
        "id": 117,
        "stats": {"r": 746, "h": 1378, "rbi": 712, "so": 1187, "obp": 0.321, "ops": 0.412, "lob": 2.9, "bb": 489, "er": 645, "winPct": 0.543, "homeWinPct": 0.568, "awayWinPct": 0.519}
    },
    "Kansas City Royals": {
        "id": 118,
        "stats": {"r": 773, "h": 1423, "rbi": 734, "so": 1245, "obp": 0.323, "ops": 0.412, "lob": 3.0, "bb": 467, "er": 687, "winPct": 0.531, "homeWinPct": 0.556, "awayWinPct": 0.506}
    },
    "Los Angeles Angels": {
        "id": 108,
        "stats": {"r": 645, "h": 1312, "rbi": 612, "so": 1398, "obp": 0.301, "ops": 0.376, "lob": 2.8, "bb": 432, "er": 789, "winPct": 0.395, "homeWinPct": 0.420, "awayWinPct": 0.370}
    },
    "Los Angeles Dodgers": {
        "id": 119,
        "stats": {"r": 906, "h": 1467, "rbi": 867, "so": 1245, "obp": 0.341, "ops": 0.455, "lob": 3.2, "bb": 567, "er": 623, "winPct": 0.642, "homeWinPct": 0.679, "awayWinPct": 0.605}
    },
    "Miami Marlins": {
        "id": 146,
        "stats": {"r": 578, "h": 1267, "rbi": 549, "so": 1367, "obp": 0.289, "ops": 0.345, "lob": 2.6, "bb": 389, "er": 789, "winPct": 0.364, "homeWinPct": 0.395, "awayWinPct": 0.333}
    },
    "Milwaukee Brewers": {
        "id": 158,
        "stats": {"r": 728, "h": 1356, "rbi": 695, "so": 1301, "obp": 0.315, "ops": 0.398, "lob": 2.9, "bb": 501, "er": 656, "winPct": 0.556, "homeWinPct": 0.580, "awayWinPct": 0.531}
    },
    "Minnesota Twins": {
        "id": 142,
        "stats": {"r": 778, "h": 1389, "rbi": 742, "so": 1289, "obp": 0.325, "ops": 0.426, "lob": 3.0, "bb": 489, "er": 678, "winPct": 0.519, "homeWinPct": 0.556, "awayWinPct": 0.481}
    },
    "New York Mets": {
        "id": 121,
        "stats": {"r": 728, "h": 1401, "rbi": 695, "so": 1245, "obp": 0.321, "ops": 0.412, "lob": 3.0, "bb": 489, "er": 687, "winPct": 0.512, "homeWinPct": 0.543, "awayWinPct": 0.481}
    },
    "New York Yankees": {
        "id": 147,
        "stats": {"r": 845, "h": 1423, "rbi": 806, "so": 1301, "obp": 0.331, "ops": 0.443, "lob": 3.1, "bb": 523, "er": 634, "winPct": 0.599, "homeWinPct": 0.630, "awayWinPct": 0.568}
    },
    "Oakland Athletics": {
        "id": 133,
        "stats": {"r": 612, "h": 1245, "rbi": 583, "so": 1356, "obp": 0.295, "ops": 0.356, "lob": 2.6, "bb": 401, "er": 823, "winPct": 0.352, "homeWinPct": 0.383, "awayWinPct": 0.321}
    },
    "Philadelphia Phillies": {
        "id": 143,
        "stats": {"r": 806, "h": 1423, "rbi": 768, "so": 1289, "obp": 0.327, "ops": 0.424, "lob": 3.1, "bb": 501, "er": 656, "winPct": 0.574, "homeWinPct": 0.605, "awayWinPct": 0.543}
    },
    "Pittsburgh Pirates": {
        "id": 134,
        "stats": {"r": 661, "h": 1312, "rbi": 628, "so": 1356, "obp": 0.301, "ops": 0.376, "lob": 2.7, "bb": 432, "er": 745, "winPct": 0.432, "homeWinPct": 0.469, "awayWinPct": 0.395}
    },
    "San Diego Padres": {
        "id": 135,
        "stats": {"r": 762, "h": 1401, "rbi": 728, "so": 1245, "obp": 0.325, "ops": 0.412, "lob": 3.0, "bb": 489, "er": 667, "winPct": 0.531, "homeWinPct": 0.556, "awayWinPct": 0.506}
    },
    "San Francisco Giants": {
        "id": 137,
        "stats": {"r": 728, "h": 1356, "rbi": 695, "so": 1301, "obp": 0.315, "ops": 0.398, "lob": 2.9, "bb": 501, "er": 701, "winPct": 0.494, "homeWinPct": 0.531, "awayWinPct": 0.457}
    },
    "Seattle Mariners": {
        "id": 136,
        "stats": {"r": 695, "h": 1312, "rbi": 662, "so": 1356, "obp": 0.308, "ops": 0.386, "lob": 2.8, "bb": 467, "er": 634, "winPct": 0.531, "homeWinPct": 0.568, "awayWinPct": 0.494}
    },
    "St. Louis Cardinals": {
        "id": 138,
        "stats": {"r": 695, "h": 1356, "rbi": 662, "so": 1245, "obp": 0.315, "ops": 0.398, "lob": 2.9, "bb": 467, "er": 723, "winPct": 0.475, "homeWinPct": 0.506, "awayWinPct": 0.444}
    },
    "Tampa Bay Rays": {
        "id": 139,
        "stats": {"r": 728, "h": 1356, "rbi": 695, "so": 1301, "obp": 0.315, "ops": 0.398, "lob": 2.9, "bb": 489, "er": 678, "winPct": 0.506, "homeWinPct": 0.543, "awayWinPct": 0.469}
    },
    "Texas Rangers": {
        "id": 140,
        "stats": {"r": 789, "h": 1423, "rbi": 751, "so": 1245, "obp": 0.327, "ops": 0.424, "lob": 3.0, "bb": 489, "er": 678, "winPct": 0.531, "homeWinPct": 0.568, "awayWinPct": 0.494}
    },
    "Toronto Blue Jays": {
        "id": 141,
        "stats": {"r": 728, "h": 1378, "rbi": 695, "so": 1245, "obp": 0.321, "ops": 0.412, "lob": 2.9, "bb": 467, "er": 678, "winPct": 0.494, "homeWinPct": 0.531, "awayWinPct": 0.457}
    },
    "Washington Nationals": {
        "id": 120,
        "stats": {"r": 645, "h": 1312, "rbi": 612, "so": 1301, "obp": 0.301, "ops": 0.376, "lob": 2.7, "bb": 432, "er": 756, "winPct": 0.420, "homeWinPct": 0.457, "awayWinPct": 0.383}
    }
}

def get_confidence_description(confidence):
    if confidence >= 0.8:
        return "Very high confidence based on strong home/away performance and statistical advantages"
    elif confidence >= 0.7:
        return "Good confidence supported by home/away splits and team metrics"
    else:
        return "Moderate confidence - consider home/away factors and recent performance"

def get_prediction_description(probability, home_team, away_team):
    home_stats = mlb_teams[home_team]["stats"]
    away_stats = mlb_teams[away_team]["stats"]
    
    home_advantage = home_stats["homeWinPct"] - home_stats["winPct"]
    away_disadvantage = away_stats["winPct"] - away_stats["awayWinPct"]
    
    if probability >= 0.7:
        return f"Strong prediction for {home_team} ({home_stats['homeWinPct']*100:.1f}% home win rate) against {away_team} ({away_stats['awayWinPct']*100:.1f}% away win rate)"
    elif probability >= 0.6:
        return f"{home_team} has a good chance, boosted by their {home_advantage*100:.1f}% home advantage"
    elif probability >= 0.5:
        return f"Slight edge for {home_team}, despite {away_team}'s solid {away_stats['awayWinPct']*100:.1f}% road record"
    elif probability >= 0.4:
        return f"{away_team} likely to overcome {home_team}'s home advantage"
    else:
        return f"{away_team} strongly favored despite playing away ({away_stats['awayWinPct']*100:.1f}% road win rate)"

def calculate_prediction(home_team, away_team):
    if not home_team or not away_team or home_team == away_team:
        return None
    
    home_stats = mlb_teams[home_team]["stats"]
    away_stats = mlb_teams[away_team]["stats"]
    
    # Calculate weighted features
    features = {
        "runs": (home_stats["r"] - away_stats["r"]) / 1000,
        "hits": (home_stats["h"] - away_stats["h"]) / 1500,
        "rbi": (home_stats["rbi"] - away_stats["rbi"]) / 800,
        "strikeouts": (away_stats["so"] - home_stats["so"]) / 1500,
        "obp": home_stats["obp"] - away_stats["obp"],
        "ops": home_stats["ops"] - away_stats["ops"],
        "lob": (away_stats["lob"] - home_stats["lob"]) / 1200,
        "walks": (home_stats["bb"] - away_stats["bb"]) / 650,
        "earnedRuns": (away_stats["er"] - home_stats["er"]) / 800,
        "winPct": home_stats["winPct"] - away_stats["winPct"]
    }
    
    win_prob = min(max(
        0.5 + 
        features["runs"] * 0.1 +
        features["hits"] * 0.1 +
        features["rbi"] * 0.1 +
        features["strikeouts"] * 0.05 +
        features["obp"] * 0.15 +
        features["ops"] * 0.15 +
        features["lob"] * 0.05 +
        features["walks"] * 0.05 +
        features["earnedRuns"] * 0.1 +
        features["winPct"] * 0.15,
        0.1
    ), 0.9)
    
    confidence = min(0.6 + 
        abs(features["runs"]) * 0.1 +
        abs(features["hits"]) * 0.1 +
        abs(features["rbi"]) * 0.1 +
        abs(features["strikeouts"]) * 0.05 +
        abs(features["obp"]) * 0.15 +
        abs(features["ops"]) * 0.15 +
        abs(features["lob"]) * 0.05 +
        abs(features["walks"]) * 0.05 +
        abs(features["earnedRuns"]) * 0.1 +
        abs(features["winPct"]) * 0.15,
        0.9
    )
    
    return {
        "winProbability": win_prob,
        "confidence": confidence,
        "stats": {
            "home": home_stats,
            "away": away_stats
        },
        "description": get_prediction_description(win_prob, home_team, away_team),
        "confidenceDescription": get_confidence_description(confidence)
    }

def get_games_for_date(date_str):
    try:
        date_obj = datetime.strptime(date_str, '%Y-%m-%d')
        formatted_date = date_obj.strftime('%Y-%m-%d')
        
        response = requests.get(f"{MLB_API_BASE}/schedule", params={
            "sportId": 1,
            "date": formatted_date
        })
        
        data = response.json()
        games = data.get('dates', [{}])[0].get('games', [])
        
        result = []
        for game in games:
            if 'teams' in game and 'away' in game['teams'] and 'home' in game['teams']:
                away_team = game['teams']['away']['team'].get('name', '')
                home_team = game['teams']['home']['team'].get('name', '')
                
                if away_team in mlb_teams and home_team in mlb_teams:
                    prediction = calculate_prediction(home_team, away_team)
                    
                    result.append({
                        'homeTeam': home_team,
                        'awayTeam': away_team,
                        'prediction': prediction
                    })
        
        return result
    except Exception as e:
        print(f"Error fetching games: {e}")
        return []

@app.route('/')
def index():
    teams = sorted(list(mlb_teams.keys()))
    today = datetime.now().strftime('%Y-%m-%d')
    return render_template('index.html', teams=teams, today=today)

@app.route('/api/predict', methods=['POST'])
def predict():
    data = request.json
    home_team = data.get('homeTeam')
    away_team = data.get('awayTeam')
    
    if not home_team or not away_team or home_team == away_team:
        return jsonify({"error": "Invalid team selection"}), 400
    
    prediction = calculate_prediction(home_team, away_team)
    
    if prediction:
        return jsonify(prediction)
    else:
        return jsonify({"error": "Could not generate prediction"}), 400

@app.route('/api/games', methods=['GET'])
def get_games():
    date = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
    games = get_games_for_date(date)
    return jsonify(games)

@app.route('/api/teams', methods=['GET'])
def get_teams():
    return jsonify(sorted(list(mlb_teams.keys())))

if __name__ == '__main__':
    app.run(debug=True, port=5000)