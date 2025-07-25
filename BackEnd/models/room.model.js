const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    code: {
        type: String,
        default: '// Welcome to your new HiveMind room!',
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

const Room = mongoose.model('Room', roomSchema);
module.exports = Room;
