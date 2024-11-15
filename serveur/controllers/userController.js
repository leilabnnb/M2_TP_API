const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const BlacklistedToken = require('../models/BlacklistedToken');

exports.register = async (req, res) => {
    try {
        const { username, password, isAgent } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Nom d’utilisateur et mot de passe requis' });
        }

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ message: 'Utilisateur déjà existant' });
        }

        // Hachage du mot de passe
        //const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: password, isAgent });

        await newUser.save();
        res.status(201).json({ message: 'Utilisateur enregistré avec succès' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;


        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }


        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Mot de passe incorrect' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.logout = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const token = authHeader.split(' ')[1];
            await BlacklistedToken.create({token});
            return res.status(200).json({message: 'Déconnexion réussie'});
        }
        res.status(400).json({message: 'Token manquant'});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};