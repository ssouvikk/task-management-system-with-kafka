// src/routes/auth.routes.js
import { Router } from 'express';
import { signup, login, refreshTokenHandler } from '../controllers/auth.controller';

const router = Router();

// ইউজার রেজিস্ট্রেশন রুট
router.post('/signup', signup);

// ইউজার লগিন রুট
router.post('/login', login);

// টোকেন রিফ্রেশ রুট
router.post('/token', refreshTokenHandler);

export default router;
