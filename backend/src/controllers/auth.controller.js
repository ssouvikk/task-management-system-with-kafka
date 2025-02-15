// src/controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { AppDataSource } = require('../config/db');
const { User } = require('../models/user.entity');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt.utils');


module.exports = {

    /**
     * ইউজার রেজিস্ট্রেশন কন্ট্রোলার
     * - নতুন ইউজার রেজিস্টার করে
     * - পাসওয়ার্ড হ্যাশ করে ডাটাবেজে সংরক্ষণ করে
     * - JWT টোকেন জেনারেট করে রেসপন্স হিসেবে দেয়
     */
    signup: async (req, res) => {
        try {
            const { email, password, username } = req.body;
            const userRepository = AppDataSource.getRepository(User);

            // ইউজার ইতিমধ্যে আছে কিনা যাচাই করা
            const existingUser = await userRepository.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ message: 'ইউজার পূর্বেই বিদ্যমান' });
            }

            const existingUsername = await userRepository.findOne({ where: { username } });
            if (existingUsername) {
                return res.status(400).json({ message: 'username is already used' });
            }

            // পাসওয়ার্ড হ্যাশ করা
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = userRepository.create({ email, password: hashedPassword, username });
            await userRepository.save(newUser);

            // JWT টোকেন জেনারেশন
            const tokenPayload = { id: newUser.id, email: newUser.email, username };
            const accessToken = generateAccessToken(tokenPayload);
            const refreshToken = generateRefreshToken(tokenPayload);

            // রিফ্রেশ টোকেন সংরক্ষণ (প্রোডাকশনে ডাটাবেজ/ক্যাশ ব্যবহার করা উচিত)
            // refreshTokenStore.add(refreshToken);

            return res.status(201).json({ accessToken, refreshToken });
        } catch (error) {
            console.error('Signup Error:', error);
            return res.status(500).json({ message: 'সার্ভার এরর' });
        }
    },

    /**
     * ইউজার লগিন কন্ট্রোলার
     * - ইউজারের ক্রেডেনশিয়াল যাচাই করে
     * - সফল হলে JWT টোকেন প্রদান করে
     */
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            const userRepository = AppDataSource.getRepository(User);

            const user = await userRepository.findOne({ where: { email } });
            if (!user) {
                return res.status(400).json({ message: 'ভুল ক্রেডেনশিয়াল' });
            }

            // পাসওয়ার্ড যাচাই
            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) {
                return res.status(400).json({ message: 'ভুল ক্রেডেনশিয়াল' });
            }

            // JWT টোকেন জেনারেশন
            const tokenPayload = { id: user.id, email: user.email };
            const accessToken = generateAccessToken(tokenPayload);
            const refreshToken = generateRefreshToken(tokenPayload);

            return res.status(200).json({ accessToken, refreshToken });
        } catch (error) {
            console.error('Login Error:', error);
            return res.status(500).json({ message: 'সার্ভার এরর' });
        }
    },

    /**
     * টোকেন রিফ্রেশ কন্ট্রোলার
     * - ক্লায়েন্ট থেকে প্রাপ্ত রিফ্রেশ টোকেন যাচাই করে
     * - বৈধ হলে নতুন অ্যাক্সেস এবং রিফ্রেশ টোকেন প্রদান করে
     */
    refreshTokenHandler: (req, res) => {
        const { token } = req.body;
        if (!token) return res.status(401).json({ message: 'রিফ্রেশ টোকেন প্রয়োজন' });

        // রিফ্রেশ টোকেন স্টোর (ডেমো: ইন-মেমরি)
        // if (!refreshTokenStore.has(token)) return res.status(403).json({ message: 'অননুমোদিত রিফ্রেশ টোকেন' });

        try {
            const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
            // টোকেন রোটেশন: পুরানো টোকেন সরিয়ে নতুন টোকেন ইস্যু করা
            // refreshTokenStore.delete(token);

            const newPayload = { id: payload.id, email: payload.email };
            const newAccessToken = generateAccessToken(newPayload);
            const newRefreshToken = generateRefreshToken(newPayload);

            // refreshTokenStore.add(newRefreshToken);

            return res.status(200).json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
        } catch (error) {
            console.error('Refresh Token Error:', error);
            return res.status(403).json({ message: 'রিফ্রেশ টোকেন অবৈধ' });
        }
    },

}
