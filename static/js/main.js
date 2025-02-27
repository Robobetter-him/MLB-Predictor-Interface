document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const predictorTab = document.getElementById('predictor-tab');
    const picksTab = document.getElementById('picks-tab');
    const predictorSection = document.getElementById('predictor-section');
    const picksSection = document.getElementById('picks-section');
    const homeTeamSelect = document.getElementById('home-team');
    const awayTeamSelect = document.getElementById('away-team');
    const predictButton = document.getElementById('predict-button');
    const teamError = document.getElementById('team-error');
    const predictionResults = document.getElementById('prediction-results');
    const winProbability = document.getElementById('win-probability');
    const confidence = document.getElementById('confidence');
    const matchup = document.getElementById('matchup');
    const predictionDescription = document.getElementById('prediction-description');
    const confidenceDescription = document.getElementById('confidence-description');
    const homeTeamName = document.getElementById('home-team-name');
    const awayTeamName = document.getElementById('away-team-name');
    const homeStats = document.getElementById('home-stats').querySelector('.stats-grid');
    const awayStats = document.getElementById('away-stats').querySelector('.stats-grid');
    const gameDate = document.getElementById('game-date');
    const gamesContainer = document.getElementById('games-container');

    // Tab switching
    predictorTab.addEventListener('click', function() {
        predictorTab.classList.add('active');
        picksTab.classList.remove('active');
        predictorSection.classList.remove('hidden');
        picksSection.classList.add('hidden');
    });

    picksTab.addEventListener('click', function() {
        picksTab.classList.add('active');
        predictorTab.classList.remove('active');
        picksSection.classList.remove('hidden');
        predictorSection.classList.add('hidden');
        loadGames(gameDate.value);
    });

    // Team selection validation
    function validateTeamSelection() {
        const homeTeam = homeTeamSelect.value;
        const awayTeam = awayTeamSelect.value;
        
        if (homeTeam && awayTeam) {
            if (homeTeam === awayTeam) {
                predictButton.disabled = true;
                teamError.classList.remove('hidden');
            } else {
                predictButton.disabled = false;
                teamError.classList.add('hidden');
            }
        } else {
            predictButton.disabled = true;
            teamError.classList.add('hidden');
        }
    }

    homeTeamSelect.addEventListener('change', function() {
        validateTeamSelection();
        predictionResults.classList.add('hidden');
    });

    awayTeamSelect.addEventListener('change', function() {
        validateTeamSelection();
        predictionResults.classList.add('hidden');
    });

    // Generate prediction
    predictButton.addEventListener('click', function() {
        const homeTeam = homeTeamSelect.value;
        const awayTeam = awayTeamSelect.value;
        
        fetch('/api/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                homeTeam: homeTeam,
                awayTeam: awayTeam
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
                return;
            }
            
            // Update prediction results
            winProbability.textContent = `${(data.winProbability * 100).toFixed(1)}%`;
            confidence.textContent = `${(data.confidence * 100).toFixed(1)}%`;
            matchup.textContent = `${homeTeam} vs ${awayTeam}`;
            predictionDescription.textContent = data.description;
            confidenceDescription.textContent = data.confidenceDescription;
            
            // Update team names
            homeTeamName.textContent = homeTeam;
            awayTeamName.textContent = awayTeam;
            
            // Populate stats
            populateTeamStats(homeStats, data.stats.home);
            populateTeamStats(awayStats, data.stats.away);
            
            // Show results
            predictionResults.classList.remove('hidden');
            
            // Scroll to results
            predictionResults.scrollIntoView({ behavior: 'smooth' });
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while generating the prediction.');
        });
    });

    // Populate team stats
    function populateTeamStats(container, stats) {
        container.innerHTML = '';
        
        // Win Percentages
        const winPercentages = document.createElement('div');
        winPercentages.className = 'stat-category';
        winPercentages.innerHTML = `
            <h4>Win Percentages</h4>
            <div class="stat-item">
                <div class="stat-label"><span>📊</span> Overall</div>
                <div class="stat-value">${(stats.winPct * 100).toFixed(1)}%</div>
            </div>
            <div class="stat-item">
                <div class="stat-label"><span>📈</span> Home</div>
                <div class="stat-value">${(stats.homeWinPct * 100).toFixed(1)}%</div>
            </div>
            <div class="stat-item">
                <div class="stat-label"><span>📉</span> Away</div>
                <div class="stat-value">${(stats.awayWinPct * 100).toFixed(1)}%</div>
            </div>
        `;
        
        // Batting Stats
        const battingStats = document.createElement('div');
        battingStats.className = 'stat-category';
        battingStats.innerHTML = `
            <h4>Batting</h4>
            <div class="stat-item">
                <div class="stat-label"><span>🎯</span> OBP</div>
                <div class="stat-value">${stats.obp.toFixed(3)}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label"><span>📊</span> OPS</div>
                <div class="stat-value">${stats.ops.toFixed(3)}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label"><span>⭐</span> Hits</div>
                <div class="stat-value">${stats.h}</div>
            </div>
        `;
        
        // Run Production
        const runProduction = document.createElement('div');
        runProduction.className = 'stat-category';
        runProduction.innerHTML = `
            <h4>Run Production</h4>
            <div class="stat-item">
                <div class="stat-label"><span>⚡</span> Runs</div>
                <div class="stat-value">${stats.r}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label"><span>👥</span> RBI</div>
                <div class="stat-value">${stats.rbi}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label"><span>📉</span> LOB</div>
                <div class="stat-value">${stats.lob.toFixed(1)}</div>
            </div>
        `;
        
        // Plate Discipline
        const plateDiscipline = document.createElement('div');
        plateDiscipline.className = 'stat-category';
        plateDiscipline.innerHTML = `
            <h4>Plate Discipline</h4>
            <div class="stat-item">
                <div class="stat-label"><span>📉</span> Strikeouts</div>
                <div class="stat-value">${stats.so}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label"><span>📈</span> Walks</div>
                <div class="stat-value">${stats.bb}</div>
            </div>
            <div class="stat-item">
                <div class="stat-label"><span>📊</span> Earned Runs</div>
                <div class="stat-value">${stats.er}</div>
            </div>
        `;
        
        container.appendChild(winPercentages);
        container.appendChild(battingStats);
        container.appendChild(runProduction);
        container.appendChild(plateDiscipline);
    }

    // Load games for a specific date
    function loadGames(date) {
        gamesContainer.innerHTML = '<div class="loading">Loading games...</div>';
        
        fetch(`/api/games?date=${date}`)
            .then(response => response.json())
            .then(games => {
                if (games.length === 0) {
                    gamesContainer.innerHTML = '<div class="loading">No games found for this date.</div>';
                    return;
                }
                
                gamesContainer.innerHTML = '';
                
                games.forEach(game => {
                    const gameCard = document.createElement('div');
                    gameCard.className = 'game-card';
                    
                    const prediction = game.prediction;
                    if (!prediction) {
                        return;
                    }
                    
                    gameCard.innerHTML = `
                        <div class="game-header">
                            <div class="game-teams">
                                <div class="icon">🏆</div>
                                <h3>${game.homeTeam} vs ${game.awayTeam}</h3>
                            </div>
                            <div class="game-probability">${(prediction.winProbability * 100).toFixed(1)}%</div>
                        </div>
                        <p class="game-description">${prediction.description}</p>
                        <div class="game-confidence">
                            <span>📈</span>
                            <span>Confidence: ${(prediction.confidence * 100).toFixed(1)}%</span>
                        </div>
                    `;
                    
                    gamesContainer.appendChild(gameCard);
                });
            })
            .catch(error => {
                console.error('Error:', error);
                gamesContainer.innerHTML = '<div class="loading">Error loading games. Please try again.</div>';
            });
    }

    // Date change event
    gameDate.addEventListener('change', function() {
        loadGames(this.value);
    });

    // Initialize
    validateTeamSelection();
});