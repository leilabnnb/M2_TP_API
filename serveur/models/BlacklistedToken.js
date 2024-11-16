const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const blacklistedTokenSchema = new Schema({
    token: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: '1h' } // Le token expirera après 1h
});

module.exports = mongoose.model('BlacklistedToken', blacklistedTokenSchema);
