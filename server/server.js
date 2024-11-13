const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path'); // For handling file paths

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../app')));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '../app', 'index.html');
});

io.on('connection', (socket) => {
    let userNickname = ''; // Нікнейм користувача
    let currentRoom = ''; // Назва поточної кімнати

    // Отримання нікнейма та приєднання до кімнати
    socket.on('set nickname', (nickname, room) => {
        userNickname = nickname;
        currentRoom = room;
        socket.join(room);

        // Повідомлення для всіх у кімнаті про новоприєднаного користувача
        socket.emit('chat message', `Ви приєдналися до кімнати: ${room} як ${nickname}`);
        socket.to(room).emit('chat message', `${nickname} приєднався до кімнати`);
    });

    // Обробка повідомлень у кімнаті
    socket.on('chat message', (msg) => {
        if (msg === '') {
            return; // Prevent sending empty messages
        }
        if (currentRoom) {
            io.to(currentRoom).emit('chat message', `${userNickname}: ${msg}`);
        }
    });

    // Повідомлення про вихід користувача
    socket.on('disconnect', () => {
        if (currentRoom) {
            socket.to(currentRoom).emit('chat message', `${userNickname} покинув кімнату`);
        }
    });
});

server.listen(3000, () => {
    console.log('listening on port 3000');
});
