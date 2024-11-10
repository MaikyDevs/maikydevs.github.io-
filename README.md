
<html>
<head>
    <title>Tic Tac Toe vs Bot</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            text-align: center;
        }
        #game-container {
            display: none;
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
        }
        .cell:hover {
            background: #f0f0f0;
        }
        .leaderboard {
            margin-top: 20px;
            border: 1px solid #ccc;
            padding: 10px;
        }
        #player-form {
            margin: 20px;
        }
        .info {
            margin: 10px;
            font-size: 18px;
        }
    </style>
</head>
<body>
    <h1>Tic Tac Toe vs Bot</h1>
    
    <div id="player-form">
        <h2>Spielername eingeben</h2>
        <input type="text" id="player-name" placeholder="Dein Name">
        <button onclick="startGame()">Spiel starten</button>
    </div>

    <div id="game-container">
        <div class="info">
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
            <h2>Leaderboard</h2>
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
        let leaderboard = JSON.parse(localStorage.getItem('tictactoeLeaderboard')) || [];

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
            updateLeaderboard();
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

        function handleGameLost() {
            gameActive = false;
            updateLeaderboard();
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

        function updateLeaderboard() {
            if (currentScore > 0) {
                leaderboard.push({
                    name: playerName,
                    score: currentScore
                });
                leaderboard.sort((a, b) => b.score - a.score);
                leaderboard = leaderboard.slice(0, 10); // Top 10 behalten
                localStorage.setItem('tictactoeLeaderboard', JSON.stringify(leaderboard));
            }

            const leaderboardHtml = leaderboard
                .map((entry, index) => `<div>${index + 1}. ${entry.name}: ${entry.score} Punkte</div>`)
                .join('');
            document.getElementById('leaderboard-list').innerHTML = leaderboardHtml;
        }
    </script>
</body>
</html>
