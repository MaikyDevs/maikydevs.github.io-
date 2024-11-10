// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const rooms = {}; // Speichert Spielräume

app.use(express.static('public')); // Frontend-Dateien im Ordner `public`

io.on('connection', (socket) => {
    console.log('Ein Spieler hat sich verbunden:', socket.id);

    socket.on('createRoom', () => {
        const roomId = Math.random().toString(36).substring(2, 7);
        rooms[roomId] = { players: [socket.id], board: Array(9).fill('') };
        socket.join(roomId);
        socket.emit('roomCreated', roomId);
        console.log(`Raum erstellt mit ID: ${roomId}`);
    });

    socket.on('joinRoom', (roomId) => {
        if (rooms[roomId] && rooms[roomId].players.length === 1) {
            rooms[roomId].players.push(socket.id);
            socket.join(roomId);
            io.to(roomId).emit('startGame', roomId);
            console.log(`Spieler hat Raum ${roomId} betreten`);
        } else {
            socket.emit('error', 'Raum existiert nicht oder ist voll.');
        }
    });

    socket.on('makeMove', (data) => {
        const { roomId, index, player } = data;
        if (rooms[roomId]) {
            rooms[roomId].board[index] = player;
            io.to(roomId).emit('updateBoard', { board: rooms[roomId].board, player });
            // Hier könnte eine Funktion zur Gewinn- und Unentschiedenprüfung hinzugefügt werden
        }
    });

    socket.on('disconnect', () => {
        console.log('Ein Spieler hat sich getrennt:', socket.id);
        // Räume und Spieler aufräumen
    });
});

server.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
});
