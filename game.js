let currentPlayer = null;
let currentGame = null;

// Login-Funktion
function login() {
    const playerName = document.getElementById('playerName').value.trim();
    if (playerName) {
        currentPlayer = {
            id: Date.now().toString(),
            name: playerName
        };
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('lobbyScreen').style.display = 'block';
        loadGames();
    }
}

// Spiele aus der Datenbank laden
function loadGames() {
    const gamesRef = database.ref('games');
    gamesRef.on('value', (snapshot) => {
        const games = snapshot.val() || {};
        const gamesList = document.getElementById('gamesList');
        gamesList.innerHTML = '';
        
        Object.entries(games).forEach(([gameId, game]) => {
            if (game.status === 'waiting' && game.player1.id !== currentPlayer.id) {
                const gameElement = document.createElement('div');
                gameElement.className = 'game-item';
                gameElement.innerHTML = `Spiel von ${game.player1.name}`;
                gameElement.onclick = () => joinGame(gameId);
                gamesList.appendChild(gameElement);
            }
        });
    });
}

// Neues Spiel erstellen
function createGame() {
    const gameId = Date.now().toString();
    const newGame = {
        id: gameId,
        player1: currentPlayer,
        status: 'waiting',
        board: Array(9).fill(''),
        currentTurn: currentPlayer.id
    };
    
    database.ref(`games/${gameId}`).set(newGame);
    joinGame(gameId);
}

// Einem Spiel beitreten
function joinGame(gameId) {
    database.ref(`games/${gameId}`).once('value', (snapshot) => {
        const game = snapshot.val();
        if (game.status === 'waiting') {
            currentGame = gameId;
            if (!game.player2) {
                database.ref(`games/${gameId}`).update({
                    player2: currentPlayer,
                    status: 'playing'
                });
            }
            showGameScreen(gameId);
            setupGameListeners(gameId);
        }
    });
}

// Spiel verlassen
function leaveGame() {
    if (currentGame) {
        database.ref(`games/${currentGame}`).remove();
        currentGame = null;
        document.getElementById('gameScreen').style.display = 'none';
        document.getElementById('lobbyScreen').style.display = 'block';
    }
}

// Spielbildschirm anzeigen
function showGameScreen(gameId) {
    document.getElementById('lobbyScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
    document.getElementById('gameId').textContent = `Spiel ID: ${gameId}`;
}

// Spielzug ausführen
function makeMove(cell) {
    if (!currentGame) return;
    
    const index = cell.getAttribute('data-index');
    database.ref(`games/${currentGame}`).once('value', (snapshot) => {
        const game = snapshot.val();
        if (game.currentTurn === currentPlayer.id && game.board[index] === '') {
            const symbol = game.player1.id === currentPlayer.id ? 'X' : 'O';
            const updates = {
                [`board/${index}`]: symbol,
                currentTurn: game.player1.id === currentPlayer.id ? game.player2.id : game.player1.id
            };
            
            database.ref(`games/${currentGame}`).update(updates);
            checkWinCondition(game.board, symbol);
        }
    });
}

// Spielstatus überwachen
function setupGameListeners(gameId) {
    database.ref(`games/${gameId}`).on('value', (snapshot) => {
        const game = snapshot.val();
        if (!game) return;

        updateBoard(game.board);
        updateGameStatus(game);
    });

    // Spielfeld-Clicks
    document.querySelectorAll('.cell').forEach(cell => {
        cell.onclick = () => makeMove(cell);
    });
}

// Spielfeld aktualisieren
function updateBoard(board) {
    board.forEach((symbol, index) => {
        const cell = document.querySelector(`[data-index="${index}"]`);
        cell.textContent = symbol;
        cell.className = `cell ${symbol.toLowerCase()}`;
    });
}

// Spielstatus aktualisieren
function updateGameStatus(game) {
    const statusElement = document.getElementById('gameStatus');
    if (game.status === 'waiting') {
        statusElement.textContent = 'Warte auf zweiten Spieler...';
    } else if (game.status === 'playing') {
        const isMyTurn = game.currentTurn === currentPlayer.id;
        statusElement.textContent = isMyTurn ? 'Du bist am Zug!' : 'Gegner ist am Zug';
    }
}

// Gewinnbedingung prüfen
function checkWinCondition(board, symbol) {
    const winningCombos = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Reihen
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Spalten
        [0, 4, 8], [2, 4, 6] // Diagonalen
    ];

    const hasWon = winningCombos.some(combo => 
        combo.every(index => board[index] === symbol)
    );

    if (hasWon) {
        database.ref(`games/${currentGame}`).update({
            status: 'finished',
            winner: currentPlayer.id
        });
    } else if (!board.includes('')) {
        database.ref(`games/${currentGame}`).update({
            status: 'finished',
            winner: 'draw'
        });
    }
}
