// app.js
require('dotenv').config(); // Charger les variables d'environnement
const express = require('express');
const app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./api/openapi.yaml');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const path = require('path');
const { graphqlHTTP } = require('express-graphql');
const schema = require('./graphql/schema');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/agence', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir les fichiers statiques (photos)
app.use('/public', express.static(path.join(__dirname, 'public')));

// Initialisation de Passport
app.use(passport.initialize());
require('./config/passport')(passport);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Middleware pour extraire l'utilisateur du token pour GraphQL
app.use(async (req, res, next) => {
    const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id);
        } catch (error) {
            console.error('Token invalide', error);
        }
    }
    next();
});

// Routes
const annonceRoutes = require('./routes/annonceRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/annonce', annonceRoutes);
app.use('/user', userRoutes);

// Point d'entrée GraphQL
app.use(
    '/graphql',
    graphqlHTTP((req) => ({
        schema,
        graphiql: true,
        context: { user: req.user },
    }))
);

// Démarrage du serveur
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Le serveur tourne sur le port ${port}`);
    console.log(`Swagger-ui est disponible sur http://localhost:${port}/api-docs`);
});
