const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Vérifiez que `userController` est bien importé
console.log('userController:', userController);

router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/logout', userController.logout);

module.exports = router;
