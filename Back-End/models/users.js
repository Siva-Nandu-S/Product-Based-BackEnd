const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: 'string',
        required: true
    },
    username: { 
        type: 'string', 
        required: true
    },
    balance: {
        type: 'number',
        required: true,
        min: 0
    },
    password: {
        type: 'string',
        required: true
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;