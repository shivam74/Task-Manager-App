const socketio = require('socket.io');

let io;

const initSockets = (server) => {
    io = socketio(server, {
        cors: {
            origin: "*", // allow all in dev, should restrict in prod
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log(`New WebSocket Connection: ${socket.id}`);

        socket.on('disconnect', () => {
            console.log(`WebSocket Disconnected: ${socket.id}`);
        });
    });

    return io;
}

const getIo = () => {
    if(!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
}

module.exports = {
    initSockets,
    getIo
};
