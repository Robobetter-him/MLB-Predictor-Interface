const axios = require('axios');
const cheerio = require('cheerio');

// Cache for scraped data
let teamsCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

exports.handler = async (event) => {
  try {
    // Check if we have valid cached data
    const now = Date.now();
    if (teamsCache && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION)) {
      console.log('Returning cached MLB team data');
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=86400'
        },
        body: JSON.stringify(teamsCache)
      };
    }

    console.log('Scraping MLB team data...');
    
    // Scrape team data from Baseball Reference
    const teams = await scrapeTeamData();
    
    // Cache the results
    teamsCache = teams;
    cacheTimestamp = now;
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
      },
      body: JSON.stringify(teams)
    };
  } catch (error) {
    console.error('Error scraping MLB data:', error);
    
    // If we have cached data, return it even if it's expired
    if (teamsCache) {
      console.log('Returning expired cached data due to scraping error');
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(teamsCache)
      };
    }
    
    // If no cache is available, return the fallback data
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(getFallbackTeamData())
    };
  }
};

async function scrapeTeamData() {
  try {
    // Scrape team standings from Baseball Reference
    const standingsResponse = await axios.get('https://www.baseball-reference.com/leagues/majors/2023-standings.shtml', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(standingsResponse.data);
    const teams = {};
    
    // Process AL teams
    $('#standings_AL tbody tr').each((i, elem) => {
      const teamName = $(elem).find('th a').text().trim();
      if (!teamName) return; // Skip header rows
      
      const fullName = getFullTeamName(teamName);
      if (!fullName) return;
      
      const wins = parseInt($(elem).find('td[data-stat="W"]').text().trim(), 10);
      const losses = parseInt($(elem).find('td[data-stat="L"]').text().trim(), 10);
      const winPct = parseFloat($(elem).find('td[data-stat="win_loss_perc"]').text().trim());
      
      teams[fullName] = {
        id: getTeamId(fullName),
        stats: {
          winPct: isNaN(winPct) ? 0.5 : winPct,
          homeWinPct: 0, // Will be updated later
          awayWinPct: 0, // Will be updated later
          // Default values for other stats
          r: 0, h: 0, rbi: 0, so: 0, obp: 0, ops: 0, lob: 0, bb: 0, er: 0
        }
      };
    });
    
    // Process NL teams
    $('#standings_NL tbody tr').each((i, elem) => {
      const teamName = $(elem).find('th a').text().trim();
      if (!teamName) return; // Skip header rows
      
      const fullName = getFullTeamName(teamName);
      if (!fullName) return;
      
      const wins = parseInt($(elem).find('td[data-stat="W"]').text().trim(), 10);
      const losses = parseInt($(elem).find('td[data-stat="L"]').text().trim(), 10);
      const winPct = parseFloat($(elem).find('td[data-stat="win_loss_perc"]').text().trim());
      
      teams[fullName] = {
        id: getTeamId(fullName),
        stats: {
          winPct: isNaN(winPct) ? 0.5 : winPct,
          homeWinPct: 0, // Will be updated later
          awayWinPct: 0, // Will be updated later
          // Default values for other stats
          r: 0, h: 0, rbi: 0, so: 0, obp: 0, ops: 0, lob: 0, bb: 0, er: 0
        }
      };
    });
    
    // Scrape team batting stats
    const battingResponse = await axios.get('https://www.baseball-reference.com/leagues/majors/2023-standard-batting.shtml', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $batting = cheerio.load(battingResponse.data);
    
    $batting('#teams_standard_batting tbody tr').each((i, elem) => {
      const teamName = $batting(elem).find('th a').text().trim();
      if (!teamName) return; // Skip header rows
      
      const fullName = getFullTeamName(teamName);
      if (!fullName || !teams[fullName]) return;
      
      const runs = parseInt($batting(elem).find('td[data-stat="R"]').text().trim(), 10);
      const hits = parseInt($batting(elem).find('td[data-stat="H"]').text().trim(), 10);
      const rbi = parseInt($batting(elem).find('td[data-stat="RBI"]').text().trim(), 10);
      const strikeouts = parseInt($batting(elem).find('td[data-stat="SO"]').text().trim(), 10);
      const walks = parseInt($batting(elem).find('td[data-stat="BB"]').text().trim(), 10);
      const obp = parseFloat($batting(elem).find('td[data-stat="onbase"]').text().trim());
      const ops = parseFloat($batting(elem).find('td[data-stat="onbase_plus_slugging"]').text().trim());
      
      teams[fullName].stats.r = isNaN(runs) ? 700 : runs;
      teams[fullName].stats.h = isNaN(hits) ? 1350 : hits;
      teams[fullName].stats.rbi = isNaN(rbi) ? 670 : rbi;
      teams[fullName].stats.so = isNaN(strikeouts) ? 1250 : strikeouts;
      teams[fullName].stats.bb = isNaN(walks) ? 450 : walks;
      teams[fullName].stats.obp = isNaN(obp) ? 0.315 : obp;
      teams[fullName].stats.ops = isNaN(ops) ? 0.400 : ops;
      teams[fullName].stats.lob = 3.0; // Default value, hard to scrape
    });
    
    // Scrape team pitching stats
    const pitchingResponse = await axios.get('https://www.baseball-reference.com/leagues/majors/2023-standard-pitching.shtml', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $pitching = cheerio.load(pitchingResponse.data);
    
    $pitching('#teams_standard_pitching tbody tr').each((i, elem) => {
      const teamName = $pitching(elem).find('th a').text().trim();
      if (!teamName) return; // Skip header rows
      
      const fullName = getFullTeamName(teamName);
      if (!fullName || !teams[fullName]) return;
      
      const earnedRuns = parseInt($pitching(elem).find('td[data-stat="ER"]').text().trim(), 10);
      
      teams[fullName].stats.er = isNaN(earnedRuns) ? 700 : earnedRuns;
    });
    
    // Scrape home/away records
    const homeAwayResponse = await axios.get('https://www.baseball-reference.com/leagues/majors/2023-standings.shtml#expanded_standings_overall', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $homeAway = cheerio.load(homeAwayResponse.data);
    
    $homeAway('#expanded_standings_overall tbody tr').each((i, elem) => {
      const teamName = $homeAway(elem).find('th a').text().trim();
      if (!teamName) return; // Skip header rows
      
      const fullName = getFullTeamName(teamName);
      if (!fullName || !teams[fullName]) return;
      
      const homeWins = parseInt($homeAway(elem).find('td[data-stat="home_wins"]').text().trim(), 10);
      const homeLosses = parseInt($homeAway(elem).find('td[data-stat="home_losses"]').text().trim(), 10);
      const awayWins = parseInt($homeAway(elem).find('td[data-stat="away_wins"]').text().trim(), 10);
      const awayLosses = parseInt($homeAway(elem).find('td[data-stat="away_losses"]').text().trim(), 10);
      
      const homeWinPct = homeWins / (homeWins + homeLosses);
      const awayWinPct = awayWins / (awayWins + awayLosses);
      
      teams[fullName].stats.homeWinPct = isNaN(homeWinPct) ? teams[fullName].stats.winPct + 0.03 : homeWinPct;
      teams[fullName].stats.awayWinPct = isNaN(awayWinPct) ? teams[fullName].stats.winPct - 0.03 : awayWinPct;
    });
    
    // Fill in any missing teams with fallback data
    const fallbackData = getFallbackTeamData();
    Object.keys(fallbackData).forEach(teamName => {
      if (!teams[teamName]) {
        teams[teamName] = fallbackData[teamName];
      }
    });
    
    return teams;
  } catch (error) {
    console.error('Error in scrapeTeamData:', error);
    return getFallbackTeamData();
  }
}

// Helper function to get full team name from abbreviated name
function getFullTeamName(abbr) {
  const teamMap = {
    'ARI': 'Arizona Diamondbacks',
    'ATL': 'Atlanta Braves',
    'BAL': 'Baltimore Orioles',
    'BOS': 'Boston Red Sox',
    'CHC': 'Chicago Cubs',
    'CHW': 'Chicago White Sox',
    'CIN': 'Cincinnati Reds',
    'CLE': 'Cleveland Guardians',
    'COL': 'Colorado Rockies',
    'DET': 'Detroit Tigers',
    'HOU': 'Houston Astros',
    'KCR': 'Kansas City Royals',
    'LAA': 'Los Angeles Angels',
    'LAD': 'Los Angeles Dodgers',
    'MIA': 'Miami Marlins',
    'MIL': 'Milwaukee Brewers',
    'MIN': 'Minnesota Twins',
    'NYM': 'New York Mets',
    'NYY': 'New York Yankees',
    'OAK': 'Oakland Athletics',
    'PHI': 'Philadelphia Phillies',
    'PIT': 'Pittsburgh Pirates',
    'SDP': 'San Diego Padres',
    'SFG': 'San Francisco Giants',
    'SEA': 'Seattle Mariners',
    'STL': 'St. Louis Cardinals',
    'TBR': 'Tampa Bay Rays',
    'TEX': 'Texas Rangers',
    'TOR': 'Toronto Blue Jays',
    'WSN': 'Washington Nationals',
    // Also handle full names
    'Arizona': 'Arizona Diamondbacks',
    'Atlanta': 'Atlanta Braves',
    'Baltimore': 'Baltimore Orioles',
    'Boston': 'Boston Red Sox',
    'Chicago Cubs': 'Chicago Cubs',
    'Chicago White Sox': 'Chicago White Sox',
    'Cincinnati': 'Cincinnati Reds',
    'Cleveland': 'Cleveland Guardians',
    'Colorado': 'Colorado Rockies',
    'Detroit': 'Detroit Tigers',
    'Houston': 'Houston Astros',
    'Kansas City': 'Kansas City Royals',
    'Los Angeles Angels': 'Los Angeles Angels',
    'Los Angeles Dodgers': 'Los Angeles Dodgers',
    'Miami': 'Miami Marlins',
    'Milwaukee': 'Milwaukee Brewers',
    'Minnesota': 'Minnesota Twins',
    'New York Mets': 'New York Mets',
    'New York Yankees': 'New York Yankees',
    'Oakland': 'Oakland Athletics',
    'Philadelphia': 'Philadelphia Phillies',
    'Pittsburgh': 'Pittsburgh Pirates',
    'San Diego': 'San Diego Padres',
    'San Francisco': 'San Francisco Giants',
    'Seattle': 'Seattle Mariners',
    'St. Louis': 'St. Louis Cardinals',
    'Tampa Bay': 'Tampa Bay Rays',
    'Texas': 'Texas Rangers',
    'Toronto': 'Toronto Blue Jays',
    'Washington': 'Washington Nationals'
  };
  
  return teamMap[abbr] || null;
}

// Helper function to get team ID
function getTeamId(teamName) {
  const teamIds = {
    "Arizona Diamondbacks": 109,
    "Atlanta Braves": 144,
    "Baltimore Orioles": 110,
    "Boston Red Sox": 111,
    "Chicago Cubs": 112,
    "Chicago White Sox": 145,
    "Cincinnati Reds": 113,
    "Cleveland Guardians": 114,
    "Colorado Rockies": 115,
    "Detroit Tigers": 116,
    "Houston Astros": 117,
    "Kansas City Royals": 118,
    "Los Angeles Angels": 108,
    "Los Angeles Dodgers": 119,
    "Miami Marlins": 146,
    "Milwaukee Brewers": 158,
    "Minnesota Twins": 142,
    "New York Mets": 121,
    "New York Yankees": 147,
    "Oakland Athletics": 133,
    "Philadelphia Phillies": 143,
    "Pittsburgh Pirates": 134,
    "San Diego Padres": 135,
    "San Francisco Giants": 137,
    "Seattle Mariners": 136,
    "St. Louis Cardinals": 138,
    "Tampa Bay Rays": 139,
    "Texas Rangers": 140,
    "Toronto Blue Jays": 141,
    "Washington Nationals": 120
  };
  
  return teamIds[teamName] || 100;
}

// Fallback data in case scraping fails
function getFallbackTeamData() {
  return {
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
}