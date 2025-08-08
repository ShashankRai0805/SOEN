import http from 'http';
import app from './app.js';
import {Server} from 'socket.io';
import jwt from 'jsonwebtoken';

const server= http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        credentials: true
    }
});

io.use((socket, next) => {
    try {
        
        const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[1];
        if (!token) {
            return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            return next(new Error('Invalid token'));
        }

        socket.user = decoded;

        next();

    } catch (error) {
        next(error);
    }
})

io.on('connection', socket => {
    console.log('A user connected:', socket.id, socket.user.email);
    
    // Join user to a room (project-specific or general)
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.user.email} joined room ${roomId}`);
        
        // Send updated user list to room
        const room = io.sockets.adapter.rooms.get(roomId);
        const usersInRoom = [];
        if (room) {
            room.forEach(socketId => {
                const clientSocket = io.sockets.sockets.get(socketId);
                if (clientSocket && clientSocket.user) {
                    usersInRoom.push(clientSocket.user);
                }
            });
        }
        io.to(roomId).emit('users-update', usersInRoom);
    });

    // Handle sending messages
    socket.on('send-message', (messageData) => {
        const message = {
            ...messageData,
            sender: socket.user,
            timestamp: new Date()
        };
        
        const room = messageData.room || 'general';
        io.to(room).emit('message', message);
        console.log(`Message sent to room ${room}:`, message.text);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.user.email);
        // Update user lists in all rooms this user was in
        socket.rooms.forEach(room => {
            if (room !== socket.id) {
                const roomSockets = io.sockets.adapter.rooms.get(room);
                const usersInRoom = [];
                if (roomSockets) {
                    roomSockets.forEach(socketId => {
                        const clientSocket = io.sockets.sockets.get(socketId);
                        if (clientSocket && clientSocket.user && socketId !== socket.id) {
                            usersInRoom.push(clientSocket.user);
                        }
                    });
                }
                socket.to(room).emit('users-update', usersInRoom);
            }
        });
    });
});

server.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
});