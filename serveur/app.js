require('dotenv').config();
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const userRoutes = require('./routes/userRoutes');
const annonceRoutes = require('./routes/annonceRoutes');
const checkBlacklist = require('./middleware/checkBlacklist');
const requireAuth = passport.authenticate('jwt', { session: false });
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const app = express();

let swaggerDocument;
try {
    const swaggerYaml = fs.readFileSync(path.join(__dirname, 'api', 'openapi.yaml'), 'utf8');
    swaggerDocument = yaml.load(swaggerYaml);
} catch (e) {
    console.error('Erreur lors du chargement du fichier Swagger YAML:', e);
}

if(swaggerDocument) {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} else {
    console.error('Impossible de charger le fichier Swagger YAML');
}

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Middleware
app.use(bodyParser.json());
app.use(passport.initialize());
require('./config/passport')(passport);

// Routes
app.use('/user', userRoutes);
app.use('/annonce', annonceRoutes, requireAuth, checkBlacklist);

module.exports = app;
