// middleware/upload.js
const multer = require('multer');
const path = require('path');

// Configuration du stockage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads'); // Dossier où les photos seront stockées
    },
    filename: function (req, file, cb) {
        // Nomme le fichier de manière unique
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

// Filtrage des types de fichiers (images uniquement)
const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Seules les images sont autorisées'));
    }
};

// Initialisation de Multer
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limite de taille de 5MB par fichier
    fileFilter: fileFilter,
});

module.exports = upload;