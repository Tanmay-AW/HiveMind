const { spawn } = require('child_process');
const Room = require('./models/room.model.js');

module.exports = function(io) {
    io.on('connection', (socket) => {
        console.log(`[Socket] User connected: ${socket.id}`);

        // Handle new room joining format
        socket.on('join-room', async ({ roomId, user }) => {
            try {
                const username = user || 'Anonymous';
                socket.data.username = username;
                socket.data.roomId = roomId;
                await socket.join(roomId);
                
                console.log(`[Socket] ${username} joined room: ${roomId}`);

                // Create or update room
                const room = await Room.findOneAndUpdate(
                    { roomId },
                    { $setOnInsert: { roomId, code: `// Welcome to HiveMind Room: ${roomId}` } },
                    { upsert: true, new: true }
                );
                
                // Send current code to the joining user
                socket.emit('codeUpdate', room.code);

                // Get all users in room and notify everyone
                const socketsInRoom = await io.in(roomId).fetchSockets();
                const users = socketsInRoom.map(s => s.data.username).filter(Boolean);
                
                // Notify others that a user joined
                socket.to(roomId).emit('user-joined', { user: username, room: roomId });
                
                // Send full user list to everyone in room
                io.to(roomId).emit('room-users', users);
                
            } catch (error) {
                console.error('[Socket] Error in join-room:', error);
                socket.emit('error', 'Failed to join room');
            }
        });

        // Legacy joinRoom event for compatibility
        socket.on('joinRoom', async ({ roomId, username }) => {
            try {
                socket.data.username = username || 'Guest';
                socket.data.roomId = roomId;
                await socket.join(roomId);
                
                const room = await Room.findOneAndUpdate(
                    { roomId },
                    { $setOnInsert: { roomId, code: `// Welcome to HiveMind Room: ${roomId}` } },
                    { upsert: true, new: true }
                );
                
                socket.emit('codeUpdate', room.code);

                const socketsInRoom = await io.in(roomId).fetchSockets();
                const users = socketsInRoom.map(s => ({ id: s.id, username: s.data.username }));
                io.to(roomId).emit('updateUserList', users);
            } catch (error) {
                console.error('[Socket] Error in joinRoom:', error);
            }
        });

        socket.on('codeChange', async ({ roomId, code }) => {
            await Room.updateOne({ roomId }, { code });
            socket.to(roomId).emit('codeUpdate', code);
        });

        socket.on('executeCode', ({ language, code }) => {
            let command, args;
            if (language === 'javascript') {
                command = 'node'; args = ['-e', code];
            } else if (language === 'python') {
                command = 'python'; args = ['-c', code];
            } else {
                return socket.emit('executionResult', { output: 'Unsupported language', error: true });
            }

            const child = spawn(command, args, { timeout: 10000 });
            let output = '';
            let errorOutput = '';

            child.stdout.on('data', (data) => { output += data.toString(); });
            child.stderr.on('data', (data) => { errorOutput += data.toString(); });
            
            child.on('close', (exitCode) => {
                socket.emit('executionResult', {
                    output: errorOutput || output || 'Execution finished with no output.',
                    error: !!errorOutput
                });
            });
        });

        socket.on('disconnect', async () => {
            const { roomId, username } = socket.data;
            if (roomId && username) {
                console.log(`[Socket] ${username} left room: ${roomId}`);
                
                // Notify others that user left
                socket.to(roomId).emit('user-left', { user: username, room: roomId });
                
                // Get remaining users and update user list
                const socketsInRoom = await io.in(roomId).fetchSockets();
                const users = socketsInRoom.map(s => s.data.username).filter(Boolean);
                io.to(roomId).emit('room-users', users);
                
                // Legacy event for compatibility
                const legacyUsers = socketsInRoom.map(s => ({ id: s.id, username: s.data.username }));
                io.to(roomId).emit('updateUserList', legacyUsers);
            }
            console.log(`[Socket] User disconnected: ${socket.id}`);
        });
    });
};
