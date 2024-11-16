const Annonce = require('../models/Annonce');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

/**
 * Obtenir la liste des annonces
 */
exports.getAnnonces = async (req, res) => {
    try {

        const annonces = await Annonce.find({ publicationStatus: 'Publiée' });

        res.json(annonces);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Ajouter une nouvelle annonce avec photos
 */
exports.addAnnonceWithPhotos = async (req, res) => {
    try {
        const { title, propertyType, publicationStatus, propertyStatus, description, price, availabilityDate } = req.body;
        const user = req.user;

        if (!user.isAgent) {
            return res.status(403).json({ message: 'Utilisateur non autorisé' });
        }

        const newAnnonce = new Annonce({
            title,
            propertyType,
            publicationStatus,
            propertyStatus,
            description,
            price,
            availabilityDate,
            userName: user.username,
        });

        // Gestion des photos
        if (req.files && req.files.photos) {
            const photoPaths = req.files.photos.map((file) => file.filename);
            newAnnonce.photos = photoPaths;
        }

        const savedAnnonce = await newAnnonce.save();
        res.status(201).json(savedAnnonce);
        console.log("Annonce ajoutée avec succès");
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

/**
 * Obtenir les détails d'une annonce par ID
 */
exports.getAnnonceById = async (req, res) => {
    try {
        const { id } = req.params;

        const annonce = await Annonce.findById(id);

        if (!annonce) {
            return res.status(404).json({ message: 'Annonce non trouvée' });
        }

        // Vérification des droits d'accès
        if (annonce.publicationStatus !== 'Publiée') {
            return res.status(403).json({ message: 'Accès interdit' });
        }

        res.json(annonce);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Mettre à jour une annonce
 */
exports.updateAnnonce = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const { title, propertyType, publicationStatus, propertyStatus, description, price, availabilityDate } = req.body;

        const annonce = await Annonce.findById(id);

        if (!annonce) {
            return res.status(404).json({ message: 'Annonce non trouvée' });
        }

        if (!user.isAgent) {
            return res.status(403).json({ message: 'Utilisateur non autorisé' });
        }

        // Mise à jour des champs
        annonce.title = title || annonce.title;
        annonce.propertyType = propertyType || annonce.propertyType;
        annonce.publicationStatus = publicationStatus || annonce.publicationStatus;
        annonce.propertyStatus = propertyStatus || annonce.propertyStatus;
        annonce.description = description || annonce.description;
        annonce.price = price || annonce.price;
        annonce.availabilityDate = availabilityDate || annonce.availabilityDate;

        // Gestion des nouvelles photos si présentes
        if (req.files && req.files.photos) {
            const photoPaths = req.files.photos.map((file) => file.filename);
            annonce.photos.push(...photoPaths);
        }

        const updatedAnnonce = await annonce.save();
        res.json(updatedAnnonce);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

/**
 * Supprimer une annonce
 */
exports.deleteAnnonce = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;

        const annonce = await Annonce.findById(id);

        if (!annonce) {
            return res.status(404).json({ message: 'Annonce non trouvée' });
        }

        if (!user.isAgent) {
            return res.status(403).json({ message: 'Utilisateur non autorisé' });
        }

        // Suppression des photos du serveur
        annonce.photos.forEach((photo) => {
            const filePath = path.join(__dirname, '..', 'public', 'uploads', photo);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });

        await Annonce.findByIdAndDelete(id);
        res.json({ message: 'Annonce supprimée avec succès' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Ajouter des photos à une annonce existante
 */
exports.addPhotosToAnnonce = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;

        const annonce = await Annonce.findById(id);

        if (!annonce) {
            return res.status(404).json({ message: 'Annonce non trouvée' });
        }

        if (user.username !== annonce.userName) {
            return res.status(403).json({ message: 'Utilisateur non autorisé' });
        }

        // Ajout des nouvelles photos
        if (req.files && req.files.photos) {
            const photoPaths = req.files.photos.map((file) => file.filename);
            annonce.photos.push(...photoPaths);
        }

        const updatedAnnonce = await annonce.save();
        res.json(updatedAnnonce);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

/**
 * Poser une question sur une annonce
 */
exports.askQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const { question } = req.body;
        const user = req.user;

        const annonce = await Annonce.findById(id);

        if (!annonce) {
            return res.status(404).json({ message: 'Annonce non trouvée' });
        }

        if (annonce.propertyStatus !== 'Disponible') {
            return res.status(400).json({ message: 'Vous ne pouvez poser une question que sur les annonces disponibles' });
        }

        annonce.questions.push({
            user: user.username,
            question,
        });

        const updatedAnnonce = await annonce.save();
        res.json(updatedAnnonce);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

/**
 * Répondre à une question sur une annonce
 */
exports.answerQuestion = async (req, res) => {
    try {
        const { id, questionId } = req.params;
        const { answer } = req.body;
        const user = req.user;

        const annonce = await Annonce.findById(id);

        if (!annonce) {
            return res.status(404).json({ message: 'Annonce non trouvée' });
        }

        if (!user.isAgent) {
            return res.status(403).json({ message: 'Utilisateur non autorisé' });
        }

        const question = annonce.questions.id(questionId);

        if (!question) {
            return res.status(404).json({ message: 'Question non trouvée' });
        }

        question.answers.push({ user: user.username, answer });
        const updatedAnnonce = await annonce.save();
        res.json(updatedAnnonce);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
