// src/routes/auth.routes.js
const { Router } = require('express');
const { signup, login, refreshTokenHandler, getProfile } = require('../controllers/auth.controller');
const { authenticateToken } = require("../middlewares/auth.middleware");


const router = Router();

// User registration route
router.post('/signup', signup);

// User login route
router.post('/login', login);

// Token refresh route
router.post('/refresh-token', refreshTokenHandler);
router.get("/profile", authenticateToken, getProfile);

module.exports = router;
