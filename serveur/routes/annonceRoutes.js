const express = require('express');
const router = express.Router();
const annonceController = require('../controllers/annonceController');
const passport = require('passport');
const upload = require('../middleware/upload'); // Import du middleware Multer

// Middleware pour protéger les routes
const requireAuth = passport.authenticate('jwt', { session: false });

// Routes principales
router.get('/', annonceController.getAnnonces);
router.post(
    '/',
    requireAuth,
    upload.fields([{ name: 'photos', maxCount: 10 }]), // Configuration Multer pour les photos
    annonceController.addAnnonceWithPhotos
);

// Route pour obtenir une annonce par ID
router.get('/:id', requireAuth, annonceController.getAnnonceById);

// Route pour mettre à jour une annonce
router.put(
    '/:id',
    requireAuth,
    upload.fields([{ name: 'photos', maxCount: 10 }]), // Permet de télécharger des photos lors de la mise à jour
    annonceController.updateAnnonce
);

// Route pour supprimer une annonce
router.delete('/:id', requireAuth, annonceController.deleteAnnonce);

// Route pour ajouter des photos à une annonce existante
router.post(
    '/:id/photos',
    requireAuth,
    upload.fields([{ name: 'photos', maxCount: 10 }]),
    annonceController.addPhotosToAnnonce
);

// Route pour poser une question sur une annonce
router.put('/:id/ask', requireAuth, annonceController.askQuestion);

// Route pour répondre à une question sur une annonce
router.put('/:id/question/:questionId/answer', requireAuth, annonceController.answerQuestion);

module.exports = router;
