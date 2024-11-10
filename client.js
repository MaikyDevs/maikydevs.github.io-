// client.js
const socket = io();
let currentRoom = null;
let currentPlayer = null;

// Raum erstellen
function createRoom() {
    socket.emit('createRoom');
}

// Raum beitreten
function joinRoom() {
    const roomId = document.getElementById('roomIdInput').value;
    socket.emit('joinRoom', roomId);
}

// Spielfeld konfigurieren
document.querySelectorAll('.cell').forEach(cell => {
    cell.addEventListener('click', () => {
        if (currentRoom && currentPlayer) {
            socket.emit('makeMove', { roomId: currentRoom, index: cell.getAttribute('data-index') });
        }
    });
});

// Socket.io-Ereignisse
socket.on('roomCreated', (roomId) => {
    currentRoom = roomId;
    alert(`Raum ${roomId} wurde erstellt. Teilen Sie die ID mit Ihrem Gegner.`);
});

socket.on('startGame', (roomId) => {
    currentRoom = roomId;
    currentPlayer = 'X';
    document.getElementById('gameStatus').textContent = 'Spiel gestartet!';
});

socket.on('updateBoard', ({ board, player }) => {
    document.querySelectorAll('.cell').forEach((cell, index) => {
        cell.textContent = board[index];
    });
    document.getElementById('gameStatus').textContent = `Spieler ${player} ist am Zug`;
});

socket.on('gameEnd', (message) => {
    document.getElementById('gameStatus').textContent = message;
    currentRoom = null;
    currentPlayer = null;
});
