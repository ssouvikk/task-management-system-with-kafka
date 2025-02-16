// src/controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { AppDataSource } = require('../config/db');
const { User } = require('../models/user.entity');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt.utils');

module.exports = {

    /**
     * ইউজার রেজিস্ট্রেশন কন্ট্রোলার
     */
    signup: async (req, res) => {
        try {
            const { email, password, username } = req.body;
            const userRepository = AppDataSource.getRepository(User);

            // ইউজার ইতিমধ্যে আছে কিনা যাচাই
            const existingUser = await userRepository.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ data: null, message: 'ইউজার পূর্বেই বিদ্যমান' });
            }

            const existingUsername = await userRepository.findOne({ where: { username } });
            if (existingUsername) {
                return res.status(400).json({ data: null, message: 'Username ইতিমধ্যে ব্যবহৃত হচ্ছে' });
            }

            // পাসওয়ার্ড হ্যাশ করা
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = userRepository.create({ email, password: hashedPassword, username });
            await userRepository.save(newUser);

            // JWT টোকেন জেনারেশন
            const tokenPayload = { id: newUser.id, email: newUser.email, username };
            const accessToken = generateAccessToken(tokenPayload);
            const refreshToken = generateRefreshToken(tokenPayload);

            return res.status(201).json({
                data: { accessToken, refreshToken },
                message: 'সফলভাবে রেজিস্ট্রেশন হয়েছে'
            });
        } catch (error) {
            console.error('Signup Error:', error);
            return res.status(500).json({ data: null, message: 'সার্ভার এরর' });
        }
    },

    /**
     * ইউজার লগিন কন্ট্রোলার
     */
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            const userRepository = AppDataSource.getRepository(User);

            const user = await userRepository.findOne({ where: { email } });
            if (!user) {
                return res.status(400).json({ data: null, message: 'ভুল ক্রেডেনশিয়াল' });
            }

            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) {
                return res.status(400).json({ data: null, message: 'ভুল ক্রেডেনশিয়াল' });
            }

            const tokenPayload = { id: user.id, email: user.email };
            const accessToken = generateAccessToken(tokenPayload);
            const refreshToken = generateRefreshToken(tokenPayload);

            return res.status(200).json({
                data: { accessToken, refreshToken },
                message: 'সফলভাবে লগইন হয়েছে'
            });
        } catch (error) {
            console.error('Login Error:', error);
            return res.status(500).json({ data: null, message: 'সার্ভার এরর' });
        }
    },

    /**
     * টোকেন রিফ্রেশ কন্ট্রোলার
     */
    refreshTokenHandler: (req, res) => {
        const { token } = req.body;
        if (!token) return res.status(401).json({ data: null, message: 'রিফ্রেশ টোকেন প্রয়োজন' });

        try {
            const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
            const newPayload = { id: payload.id, email: payload.email };
            const newAccessToken = generateAccessToken(newPayload);
            const newRefreshToken = generateRefreshToken(newPayload);

            return res.status(200).json({
                data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
                message: 'নতুন টোকেন সফলভাবে ইস্যু হয়েছে'
            });
        } catch (error) {
            console.error('Refresh Token Error:', error);
            return res.status(403).json({ data: null, message: 'রিফ্রেশ টোকেন অবৈধ' });
        }
    },

};
