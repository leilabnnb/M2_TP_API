const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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

        console.log('Données reçues pour la connexion:', { username, password });

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        console.log('Utilisateur trouvé:', user);

        const isMatch = await bcrypt.compare(password, user.password);
        console.log('password:', password)
        console.log('user.password' , user.password)
        console.log('résulta de bcrypt.compare:', isMatch);
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

exports.logout = (req, res) => {
    res.status(200).json({ message: 'Déconnexion réussie' });
};
