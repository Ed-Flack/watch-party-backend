const express = require('express')
const http = require('http')
const app = express()
const server = http.createServer(app)

const io = require('socket.io')(server, {
    cors: {
        origin: "https://melodic-snickerdoodle-9548dc.netlify.app",
        methods: ['GET', 'POST']
    }
});

const socketMap = new Map();

io.on('connection', (socket) => {
    let lal = socket.id;
    socket.emit('myId', lal);

    socket.on('disconnect', () => {
        const partnerId = socketMap.get(socket.id);
        io.to(partnerId).emit('callEnded');
        socketMap.delete(socket.id);
        socketMap.delete(partnerId);
    });

    socket.on('callUser', (data) => {
        io.to(data.userToCall).emit('callUser', { signal: data.signalData, from: data.from, name: data.name });
    });

    socket.on('answerCall', (data) => {
        socketMap.set(socket.id, data.to);
        socketMap.set(data.to, socket.id);
        io.to(data.to).emit('callAccepted', data.signal);
    });

    socket.on('sendMessage', (data) => {
        socket.to(data.to).emit('receiveMessage', data);
    });

    socket.on('play', (data) => {
        socket.to(data.to).emit('receivePlay', data);
    });

    socket.on('pause', (data) => {
        socket.to(data.to).emit('receivePause', data);
    });

    socket.on('updateTime', (data) => {
        socket.to(data.to).emit('receiveUpdateTime', data);
    });
})
port = process.env.PORT || 5000;
// server.listen(5000, () => console.log('server is running on port ' + 5000));
server.listen(port, () => console.log('server is running on port ' + port));