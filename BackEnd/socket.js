const { spawn } = require('child_process');
const Room = require('./models/room.model.js');

module.exports = function(io) {
    io.on('connection', (socket) => {
        console.log(`[Socket] User connected: ${socket.id}`);

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
            const { roomId } = socket.data;
            if (roomId) {
                const socketsInRoom = await io.in(roomId).fetchSockets();
                const users = socketsInRoom.map(s => ({ id: s.id, username: s.data.username }));
                io.to(roomId).emit('updateUserList', users);
            }
            console.log(`[Socket] User disconnected: ${socket.id}`);
        });
    });
};
