// src/routes/auth.routes.js
const { Router } = require('express');
const { signup, login, refreshTokenHandler } = require('../controllers/auth.controller');

const router = Router();

// ইউজার রেজিস্ট্রেশন রুট
router.post('/signup', signup);

// ইউজার লগিন রুট
router.post('/login', login);

// টোকেন রিফ্রেশ রুট
router.post('/refresh-token', refreshTokenHandler);

module.exports = router
