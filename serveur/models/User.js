// models/userController.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const userSchema = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAgent: { type: Boolean, default: false },
});

// Hashage du mot de passe avant sauvegarde
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) { // Ne hache que si le mot de passe est modifié
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

// Méthode pour vérifier le mot de passe lors de la connexion
userSchema.methods.isValidPassword = async function (password) {
    try {
        return await bcrypt.compare(password, this.password);
    } catch (error) {
        throw error;
    }
};

module.exports = mongoose.model('User', userSchema);