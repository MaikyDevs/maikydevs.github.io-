// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const rooms = {}; // Speicher für die Räume und deren Spielstatus

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('Ein Spieler hat sich verbunden:', socket.id);

    // Lobby erstellen
    socket.on('createRoom', () => {
        const roomId = Math.random().toString(36).substring(2, 7);
        rooms[roomId] = { players: [socket.id], board: Array(9).fill(''), currentPlayer: 'X' };
        socket.join(roomId);
        socket.emit('roomCreated', roomId);
        console.log(`Raum ${roomId} erstellt.`);
    });

    // Lobby beitreten
    socket.on('joinRoom', (roomId) => {
        if (rooms[roomId] && rooms[roomId].players.length === 1) {
            rooms[roomId].players.push(socket.id);
            socket.join(roomId);
            io.to(roomId).emit('startGame', roomId);
            console.log(`Spieler hat Raum ${roomId} betreten.`);
        } else {
            socket.emit('error', 'Raum existiert nicht oder ist bereits voll.');
        }
    });

    // Zug ausführen
    socket.on('makeMove', ({ roomId, index }) => {
        const room = rooms[roomId];
        if (room && room.board[index] === '' && room.currentPlayer === getPlayerSymbol(socket.id, roomId)) {
            room.board[index] = room.currentPlayer;
            io.to(roomId).emit('updateBoard', { board: room.board, player: room.currentPlayer });
            if (checkWin(room.board, room.currentPlayer)) {
                io.to(roomId).emit('gameEnd', `${room.currentPlayer} gewinnt!`);
                delete rooms[roomId];
            } else if (room.board.every(cell => cell !== '')) {
                io.to(roomId).emit('gameEnd', 'Unentschieden!');
                delete rooms[roomId];
            } else {
                room.currentPlayer = room.currentPlayer === 'X' ? 'O' : 'X';
            }
        }
    });

    // Verbindung trennen
    socket.on('disconnect', () => {
        console.log('Ein Spieler hat sich getrennt:', socket.id);
        // Aufräumen und Räume aktualisieren
        for (const roomId in rooms) {
            const room = rooms[roomId];
            if (room.players.includes(socket.id)) {
                io.to(roomId).emit('gameEnd', 'Ein Spieler hat das Spiel verlassen.');
                delete rooms[roomId];
            }
        }
    });
});

// Helper-Funktionen
function getPlayerSymbol(playerId, roomId) {
    return rooms[roomId].players[0] === playerId ? 'X' : 'O';
}

function checkWin(board, player) {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    return winPatterns.some(pattern => pattern.every(index => board[index] === player));
}

server.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));
