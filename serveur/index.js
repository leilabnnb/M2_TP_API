const express = require('express');
const app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./api/openapi.yaml');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');

// Connexion à MongoDB
mongoose.connect('mongodb://localhost:27017/agence', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialisation de Passport
app.use(passport.initialize());
require('./config/passport')(passport);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
const annonceRoutes = require('./routes/annonceRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/annonce', annonceRoutes);
app.use('/user', userRoutes);

// Démarrage du serveur
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Le serveur tourne sur le port ${port}`);
});
