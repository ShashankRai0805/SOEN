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
        
        // Send system message that user joined
        const joinMessage = {
            text: `👋 ${socket.user.email} joined the chat`,
            room: roomId,
            isSystem: true
        };
        socket.to(roomId).emit('system-message', joinMessage);
        
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
        console.log(`Users in room ${roomId}:`, usersInRoom.map(u => u.email));
        io.to(roomId).emit('users-update', usersInRoom);
    });

    // Handle sending messages
    socket.on('send-message', async (messageData) => {
        console.log(`Received message from ${socket.user.email}:`, messageData);
        
        // Check if message starts with @ai
        if (messageData.text.startsWith('@ai ')) {
            // Handle AI command
            const aiPrompt = messageData.text.substring(4); // Remove '@ai ' prefix
            console.log(`AI prompt: ${aiPrompt}`);
            
            try {
                // Import AI service dynamically to avoid circular dependencies
                const { generateResult } = await import('./service/ai.service.js');
                const aiResponse = await generateResult(aiPrompt);
                
                // Send AI response as a system message
                const aiMessage = {
                    text: `🤖 AI Response: ${aiResponse}`,
                    timestamp: new Date(),
                    room: messageData.room || 'general',
                    sender: { email: 'AI Assistant', isAI: true },
                    isAI: true
                };
                
                const room = messageData.room || 'general';
                io.to(room).emit('message', aiMessage);
                console.log(`AI response sent to room ${room}`);
                
            } catch (error) {
                console.error('AI service error:', error);
                
                // Send error message
                const errorMessage = {
                    text: `❌ AI Error: ${error.message}`,
                    timestamp: new Date(),
                    room: messageData.room || 'general',
                    sender: { email: 'AI Assistant', isAI: true },
                    isAI: true,
                    isError: true
                };
                
                const room = messageData.room || 'general';
                io.to(room).emit('message', errorMessage);
            }
        } else {
            // Handle regular message
            const message = {
                ...messageData,
                sender: socket.user,
                timestamp: new Date()
            };
            
            const room = messageData.room || 'general';
            console.log(`Broadcasting message to room ${room}:`, message.text);
            io.to(room).emit('message', message);
            console.log(`Message sent to room ${room}:`, message.text);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.user.email);
        // Update user lists in all rooms this user was in
        socket.rooms.forEach(room => {
            if (room !== socket.id) {
                // Send system message that user left
                const leaveMessage = {
                    text: `👋 ${socket.user.email} left the chat`,
                    room: room,
                    isSystem: true
                };
                socket.to(room).emit('system-message', leaveMessage);
                
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