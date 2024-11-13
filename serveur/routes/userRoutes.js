// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/', userController.register);
router.post('/login', userController.login);
router.post('/logout', userController.logout);

module.exports = router;
