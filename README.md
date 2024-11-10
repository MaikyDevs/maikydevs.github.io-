<!DOCTYPE html>
<html>
<head>
    <title>Casino Games - Tic Tac Toe</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            text-align: center;
            background: #f0f0f0;
        }
        #game-container {
            display: none;
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .board {
            display: grid;
            grid-template-columns: repeat(3, 100px);
            gap: 5px;
            margin: 20px auto;
            width: 310px;
        }
        .cell {
            width: 100px;
            height: 100px;
            border: 2px solid #333;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
            cursor: pointer;
            background: #fff;
            transition: background-color 0.3s;
        }
        .cell:hover {
            background: #f0f0f0;
        }
        .leaderboard {
            margin-top: 20px;
            border: 1px solid #ccc;
            padding: 10px;
            background: white;
            border-radius: 5px;
        }
        #player-form {
            margin: 20px;
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .info {
            margin: 10px;
            font-size: 18px;
        }
        input[type="text"] {
            padding: 8px;
            margin: 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
            width: 200px;
        }
        button {
            padding: 8px 16px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.3s;
        }
        button:hover {
            background: #45a049;
        }
        .leaderboard-entry {
            padding: 5px;
            margin: 5px 0;
            border-bottom: 1px solid #eee;
        }
        .header {
            margin-bottom: 20px;
        }
        .score-info {
            display: flex;
            justify-content: space-around;
            margin: 10px 0;
            padding: 10px;
            background: #f8f8f8;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎮 Tic Tac Toe Challenge</h1>
    </div>
    
    <div id="player-form">
        <h2>Willkommen zum Spiel!</h2>
        <p>Fordere den Bot heraus und erreiche den Highscore</p>
        <input type="text" id="player-name" placeholder="Dein Name">
        <button onclick="startGame()">Spiel starten</button>
    </div>

    <div id="game-container">
        <div class="score-info">
            <div>Spieler: <span id="current-player"></span></div>
            <div>Level: <span id="level">1</span></div>
            <div>Punkte: <span id="score">0</span></div>
        </div>

        <div class="board" id="board">
            <div class="cell" onclick="makeMove(0)"></div>
            <div class="cell" onclick="makeMove(1)"></div>
            <div class="cell" onclick="makeMove(2)"></div>
            <div class="cell" onclick="makeMove(3)"></div>
            <div class="cell" onclick="makeMove(4)"></div>
            <div class="cell" onclick="makeMove(5)"></div>
            <div class="cell" onclick="makeMove(6)"></div>
            <div class="cell" onclick="makeMove(7)"></div>
            <div class="cell" onclick="makeMove(8)"></div>
        </div>

        <div class="leaderboard">
            <h2>🏆 Leaderboard</h2>
            <div id="leaderboard-list"></div>
        </div>
    </div>

    <script>
        let currentPlayer = 'X';
        let board = ['', '', '', '', '', '', '', '', ''];
        let gameActive = false;
        let playerName = '';
        let currentLevel = 1;
        let currentScore = 0;
        let leaderboard = [];
        
        // GitHub Configuration
        const GITHUB_TOKEN = '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'; // Ersetze dies mit deinem Token
        const REPO_OWNER = 'Casino-a';
        const REPO_NAME = 'Casino-a.github.io';

        async function loadLeaderboard() {
            try {
                const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/leaderboard.json`, {
                    headers: {
                        'Authorization': `token ${GITHUB_TOKEN}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });

                if (response.status === 404) {
                    leaderboard = [];
                    return;
                }

                const data = await response.json();
                const content = atob(data.content);
                leaderboard = JSON.parse(content);
                updateLeaderboardDisplay();
            } catch (error) {
                console.error('Fehler beim Laden des Leaderboards:', error);
            }
        }

        async function saveLeaderboard() {
            try {
                // Get current file SHA if it exists
                let sha = '';
                try {
                    const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/leaderboard.json`, {
                        headers: {
                            'Authorization': `token ${GITHUB_TOKEN}`,
                            'Accept': 'application/vnd.github.v3+json'
                        }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        sha = data.sha;
                    }
                } catch (e) {}

                const content = btoa(JSON.stringify(leaderboard, null, 2));
                const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/leaderboard.json`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `token ${GITHUB_TOKEN}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: 'Update Leaderboard',
                        content: content,
                        sha: sha || undefined
                    })
                });

                if (!response.ok) {
                    throw new Error('Fehler beim Speichern des Leaderboards');
                }
            } catch (error) {
                console.error('Fehler beim Speichern:', error);
            }
        }

        function startGame() {
            playerName = document.getElementById('player-name').value.trim();
            if (playerName === '') {
                alert('Bitte gib einen Namen ein!');
                return;
            }
            document.getElementById('player-form').style.display = 'none';
            document.getElementById('game-container').style.display = 'block';
            document.getElementById('current-player').textContent = playerName;
            resetGame();
            loadLeaderboard();
        }

        function resetGame() {
            board = ['', '', '', '', '', '', '', '', ''];
            gameActive = true;
            currentPlayer = 'X';
            document.querySelectorAll('.cell').forEach(cell => cell.textContent = '');
            document.getElementById('level').textContent = currentLevel;
        }

        function makeMove(index) {
            if (!gameActive || board[index] !== '' || currentPlayer === 'O') return;

            board[index] = 'X';
            document.querySelectorAll('.cell')[index].textContent = 'X';
            
            if (checkWinner()) {
                handleGameWon();
                return;
            }
            
            if (board.includes('')) {
                currentPlayer = 'O';
                setTimeout(() => botMove(), 500);
            } else {
                handleDraw();
            }
        }

        function botMove() {
            if (!gameActive) return;

            let index;
            switch(currentLevel) {
                case 1:
                    index = getRandomMove();
                    break;
                case 2:
                    index = Math.random() < 0.5 ? getSmartMove() : getRandomMove();
                    break;
                default:
                    index = getSmartMove();
                    break;
            }

            board[index] = 'O';
            document.querySelectorAll('.cell')[index].textContent = 'O';
            
            if (checkWinner()) {
                handleGameLost();
                return;
            }
            
            if (board.includes('')) {
                currentPlayer = 'X';
            } else {
                handleDraw();
            }
        }

        function getRandomMove() {
            let emptyCells = board.reduce((acc, cell, index) => {
                if (cell === '') acc.push(index);
                return acc;
            }, []);
            return emptyCells[Math.floor(Math.random() * emptyCells.length)];
        }

        function getSmartMove() {
            // Versuche zu gewinnen
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'O';
                    if (checkWinner()) {
                        board[i] = '';
                        return i;
                    }
                    board[i] = '';
                }
            }

            // Blockiere Spieler-Gewinnzug
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'X';
                    if (checkWinner()) {
                        board[i] = '';
                        return i;
                    }
                    board[i] = '';
                }
            }

            // Nimm die Mitte, wenn frei
            if (board[4] === '') return 4;

            // Nimm eine zufällige freie Ecke
            const corners = [0, 2, 6, 8].filter(i => board[i] === '');
            if (corners.length > 0) {
                return corners[Math.floor(Math.random() * corners.length)];
            }

            // Nimm ein zufälliges freies Feld
            return getRandomMove();
        }

        function checkWinner() {
            const winPatterns = [
                [0, 1, 2], [3, 4, 5], [6, 7, 8], // Horizontal
                [0, 3, 6], [1, 4, 7], [2, 5, 8], // Vertikal
                [0, 4, 8], [2, 4, 6] // Diagonal
            ];

            return winPatterns.some(pattern => {
                const [a, b, c] = pattern;
                return board[a] !== '' && board[a] === board[b] && board[b] === board[c];
            });
        }

        function handleGameWon() {
            gameActive = false;
            currentScore++;
            document.getElementById('score').textContent = currentScore;
            setTimeout(() => {
                alert('Gewonnen! Nächstes Level!');
                currentLevel++;
                resetGame();
            }, 100);
        }

        async function handleGameLost() {
            gameActive = false;
            if (currentScore > 0) {
                leaderboard.push({
                    name: playerName,
                    score: currentScore,
                    date: new Date().toISOString()
                });
                leaderboard.sort((a, b) => b.score - a.score);
                leaderboard = leaderboard.slice(0, 10); // Top 10 behalten
                await saveLeaderboard();
                updateLeaderboardDisplay();
            }
            
            setTimeout(() => {
                alert(`Spiel vorbei! Deine Punkte: ${currentScore}`);
                resetGame();
                currentLevel = 1;
                currentScore = 0;
                document.getElementById('score').textContent = currentScore;
            }, 100);
        }

        function handleDraw() {
            gameActive = false;
            setTimeout(() => {
                alert('Unentschieden!');
                resetGame();
            }, 100);
        }

        function updateLeaderboardDisplay() {
            const leaderboardHtml = leaderboard
                .map((entry, index) => {
                    const date = new Date(entry.date).toLocaleDateString();
                    return `<div class="leaderboard-entry">${index + 1}. ${entry.name}: ${entry.score} Punkte (${date})</div>`;
                })
                .join('');
            document.getElementById('leaderboard-list').innerHTML = leaderboardHtml || 'Noch keine Einträge';
        }

        // Initial load
        loadLeaderboard();
    </script>
</body>
</html>
