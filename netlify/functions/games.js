const axios = require('axios');
const { format } = require('date-fns');

exports.handler = async (event) => {
  try {
    const date = event.queryStringParameters?.date || format(new Date(), 'yyyy-MM-dd');
    
    // Get API key from environment variables
    const mlbApiKey = process.env.MLB_API_KEY;
    const useRealApi = mlbApiKey && mlbApiKey !== 'your_api_key_here';
    
    console.log(`Fetching games for date: ${date}`);
    console.log(`Using real MLB API: ${useRealApi}`);
    
    let games = [];
    
    // Try to fetch real games from MLB API if key is provided
    if (useRealApi) {
      try {
        console.log('Attempting to fetch from MLB API...');
        const response = await axios.get(`https://statsapi.mlb.com/api/v1/schedule`, {
          params: {
            sportId: 1,
            date: date
          },
          headers: mlbApiKey !== 'your_api_key_here' ? {
            'Authorization': `Bearer ${mlbApiKey}`
          } : {}
        });
        
        const mlbData = response.data;
        console.log('MLB API response received');
        
        if (mlbData.dates && mlbData.dates.length > 0) {
          // MLB Teams data for stats
          const mlbTeams = {
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
          };
          
          for (const game of mlbData.dates[0].games) {
            if (game.teams && game.teams.away && game.teams.home) {
              const homeTeam = game.teams.home.team.name;
              const awayTeam = game.teams.away.team.name;
              
              // Check if we have data for these teams
              if (mlbTeams[homeTeam] && mlbTeams[awayTeam]) {
                const prediction = calculatePrediction(homeTeam, awayTeam, mlbTeams);
                
                games.push({
                  homeTeam,
                  awayTeam,
                  prediction,
                  gameTime: game.gameDate,
                  venue: game.venue?.name || 'Unknown Venue',
                  status: game.status?.detailedState || 'Scheduled'
                });
              }
            }
          }
          console.log(`Found ${games.length} games from MLB API`);
        } else {
          console.log('No games found in MLB API response');
        }
      } catch (error) {
        console.log('Error fetching MLB API data:', error.message);
        // We'll fall back to generating sample games below
      }
    }
    
    // If we couldn't get any games, generate samples
    if (games.length === 0) {
      console.log('Generating sample games');
      games = generateSampleGames();
    }

    return {
      statusCode: 200,
      body: JSON.stringify(games),
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    };
  } catch (error) {
    console.log('Error in games function:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: "Failed to fetch games",
        message: error.message,
        stack: error.stack
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    };
  }
};

// Helper function to generate sample games
function generateSampleGames() {
  const mlbTeams = {
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
  };
  
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
    const prediction = calculatePrediction(homeTeam, awayTeam, mlbTeams);
    
    // Generate a random game time today
    const now = new Date();
    const gameHour = 12 + Math.floor(Math.random() * 8); // Between 12pm and 8pm
    const gameTime = new Date(now);
    gameTime.setHours(gameHour, Math.floor(Math.random() * 60), 0);
    
    games.push({
      homeTeam,
      awayTeam,
      prediction,
      gameTime: gameTime.toISOString(),
      venue: `${homeTeam} Stadium`,
      status: Math.random() > 0.5 ? 'Scheduled' : 'In Progress'
    });
  }
  
  return games;
}

// Helper function to calculate prediction
function calculatePrediction(homeTeam, awayTeam, mlbTeams) {
  if (!homeTeam || !awayTeam || homeTeam === awayTeam) {
    return null;
  }
  
  const homeStats = mlbTeams[homeTeam].stats;
  const awayStats = mlbTeams[awayTeam].stats;
  
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
  const homeAdvantageWeight = parseFloat(process.env.HOME_ADVANTAGE_WEIGHT) || 0.15;
  const opsWeight = parseFloat(process.env.OPS_WEIGHT) || 0.2;
  const obpWeight = parseFloat(process.env.OBP_WEIGHT) || 0.2;
  const runsWeight = parseFloat(process.env.RUNS_WEIGHT) || 0.15;
  const earnedRunsWeight = parseFloat(process.env.EARNED_RUNS_WEIGHT) || 0.15;
  const homeAwayWeight = parseFloat(process.env.HOME_AWAY_WEIGHT) || 0.2;
  const winPctWeight = parseFloat(process.env.WIN_PCT_WEIGHT) || 0.1;
  
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

  function getConfidenceDescription(confidence) {
    if (confidence >= 0.8) {
      return "Very high confidence based on strong home/away performance and statistical advantages";
    } else if (confidence >= 0.7) {
      return "Good confidence supported by home/away splits and team metrics";
    } else {
      return "Moderate confidence - consider home/away factors and recent performance";
    }
  }

  function getPredictionDescription(probability, homeTeam, awayTeam) {
    const homeAdvantage = homeStats.homeWinPct - homeStats.winPct;
    const awayDisadvantage = awayStats.winPct - awayStats.awayWinPct;
    
    if (probability >= 0.7) {
      return `Strong prediction for ${homeTeam} (${(homeStats.homeWinPct*100).toFixed(1)}% home win rate) against ${awayTeam} (${(awayStats.awayWinPct*100).toFixed(1)}% away win rate)`;
    } else if (probability >= 0.6) {
      return `${homeTeam} has a good chance, boosted by their ${(homeAdvantage*100).toFixed(1)}% home advantage`;
    } else if (probability >= 0.5) {
      return `Slight edge for ${homeTeam}, despite ${awayTeam}'s solid ${(awayStats.awayWinPct*100).toFixed(1)}% road record`;
    } else if (probability >= 0.4) {
      return `${awayTeam} likely to overcome ${homeTeam}'s home advantage`;
    } else {
      return `${awayTeam} strongly favored despite playing away (${(awayStats.awayWinPct*100).toFixed(1)}% road win rate)`;
    }
  }
  
  return {
    winProbability: winProb,
    confidence: confidence,
    stats: {
      home: homeStats,
      away: awayStats
    },
    description: getPredictionDescription(winProb, homeTeam, awayTeam),
    confidenceDescription: getConfidenceDescription(confidence)
  };
}