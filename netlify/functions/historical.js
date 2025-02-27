exports.handler = async () => {
  try {
    // Generate sample data for the 2023 MLB season
    const teams = [
      "Los Angeles Dodgers", "Atlanta Braves", "New York Yankees", "Philadelphia Phillies",
      "Houston Astros", "Baltimore Orioles", "Tampa Bay Rays", "Texas Rangers",
      "Minnesota Twins", "Toronto Blue Jays", "Seattle Mariners", "Arizona Diamondbacks",
      "Chicago Cubs", "Boston Red Sox", "San Diego Padres", "Cleveland Guardians",
      "San Francisco Giants", "Milwaukee Brewers", "New York Mets", "Miami Marlins",
      "Detroit Tigers", "Cincinnati Reds", "Los Angeles Angels", "Pittsburgh Pirates",
      "Kansas City Royals", "Washington Nationals", "St. Louis Cardinals", "Chicago White Sox",
      "Colorado Rockies", "Oakland Athletics"
    ];
    
    const results = [];
    
    // Generate data for each month of the 2023 season (April-October)
    for (let month = 4; month <= 10; month++) {
      // Number of games per month varies
      const gamesInMonth = month === 10 ? 15 : 30; // Fewer games in October (postseason)
      
      for (let i = 0; i < gamesInMonth; i++) {
        // Random day in month
        const day = Math.floor(Math.random() * 28) + 1;
        const date = `2023-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        
        // Random teams
        const homeIndex = Math.floor(Math.random() * teams.length);
        let awayIndex;
        do {
          awayIndex = Math.floor(Math.random() * teams.length);
        } while (awayIndex === homeIndex);
        
        const homeTeam = teams[homeIndex];
        const awayTeam = teams[awayIndex];
        
        // Generate prediction data
        const winProbability = Math.random() * 0.5 + 0.3; // Between 0.3 and 0.8
        const confidence = Math.random() * 0.4 + 0.5; // Between 0.5 and 0.9
        const predictedWinner = winProbability >= 0.5 ? homeTeam : awayTeam;
        
        // Determine actual winner - higher confidence should correlate with more correct predictions
        const correctnessFactor = Math.random() + (confidence - 0.5);
        const correct = correctnessFactor > 0.8;
        const actualWinner = correct ? predictedWinner : (predictedWinner === homeTeam ? awayTeam : homeTeam);
        
        results.push({
          date,
          homeTeam,
          awayTeam,
          predictedWinner,
          actualWinner,
          winProbability,
          confidence,
          correct
        });
      }
    }
    
    // Sort by date, newest first
    const sortedResults = results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Calculate overall prediction accuracy
    const totalGames = sortedResults.length;
    const correctPredictions = sortedResults.filter(g => g.correct).length;
    const accuracy = totalGames > 0 ? (correctPredictions / totalGames) * 100 : 0;
    
    // Calculate high confidence prediction accuracy
    const highConfidenceGames = sortedResults.filter(g => g.confidence >= 0.7);
    const highConfidenceCorrect = highConfidenceGames.filter(g => g.correct).length;
    const highConfidenceAccuracy = highConfidenceGames.length > 0 ? 
      (highConfidenceCorrect / highConfidenceGames.length) * 100 : 0;
    
    // Calculate low confidence prediction accuracy
    const lowConfidenceGames = sortedResults.filter(g => g.confidence < 0.7);
    const lowConfidenceCorrect = lowConfidenceGames.filter(g => g.correct).length;
    const lowConfidenceAccuracy = lowConfidenceGames.length > 0 ? 
      (lowConfidenceCorrect / lowConfidenceGames.length) * 100 : 0;
    
    // Calculate home team win rate
    const homeTeamWins = sortedResults.filter(g => g.actualWinner === g.homeTeam).length;
    const homeTeamWinRate = totalGames > 0 ? (homeTeamWins / totalGames) * 100 : 0;
    
    // Calculate average confidence
    const totalConfidence = sortedResults.reduce((sum, g) => sum + g.confidence, 0);
    const averageConfidence = totalGames > 0 ? (totalConfidence / totalGames) * 100 : 0;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
      body: JSON.stringify({
        games: sortedResults,
        stats: {
          totalGames,
          correctPredictions,
          accuracy,
          highConfidenceGames: highConfidenceGames.length,
          highConfidenceCorrect,
          highConfidenceAccuracy,
          lowConfidenceGames: lowConfidenceGames.length,
          lowConfidenceCorrect,
          lowConfidenceAccuracy,
          homeTeamWins,
          homeTeamWinRate,
          averageConfidence
        }
      })
    };
  } catch (error) {
    console.log('Error in historical function:', error.message);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: "Failed to fetch historical data",
        message: error.message
      })
    };
  }
};