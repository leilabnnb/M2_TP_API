const BlacklistedToken = require('../models/BlacklistedToken');

const checkBlacklist = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        // Vérifier si le token est dans la blacklist
        const blacklistedToken = await BlacklistedToken.findOne({ token });
        if (blacklistedToken) {
            return res.status(401).json({ message: 'Token invalide ou expiré' });
        }
    }
    next();
};

module.exports = checkBlacklist;
