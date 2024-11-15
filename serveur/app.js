require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const userRoutes = require('./routes/userRoutes');
const annonceRoutes = require('./routes/annonceRoutes');
const checkBlacklist = require('./middleware/checkBlacklist');
const requireAuth = passport.authenticate('jwt', { session: false });


const app = express();

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
