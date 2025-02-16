// src/routes/auth.routes.js
const { Router } = require('express');
const { signup, login, refreshTokenHandler } = require('../controllers/auth.controller');

const router = Router();

// User registration route
router.post('/signup', signup);

// User login route
router.post('/login', login);

// Token refresh route
router.post('/refresh-token', refreshTokenHandler);

module.exports = router;
