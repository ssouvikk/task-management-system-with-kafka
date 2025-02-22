// src/controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { AppDataSource } = require('../config/db');
const { User } = require('../models/user.entity');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt.utils');

module.exports = {

    /**
     * User registration controller
     */
    signup: async (req, res) => {
        try {
            const { email, password, username } = req.body;
            const userRepository = AppDataSource.getRepository(User);

            // Check if user already exists
            const existingUser = await userRepository.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ data: null, message: 'User already exists' });
            }

            const existingUsername = await userRepository.findOne({ where: { username } });
            if (existingUsername) {
                return res.status(400).json({ data: null, message: 'Username is already in use' });
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = userRepository.create({ email, password: hashedPassword, username });
            await userRepository.save(newUser);

            // Generate JWT tokens
            const accessToken = generateAccessToken(newUser);
            const refreshToken = generateRefreshToken(newUser);

            return res.status(201).json({
                data: { accessToken, refreshToken, user: { ...newUser, password: '' } },
                message: 'Registration successful'
            });
        } catch (error) {
            console.error('Signup Error:', error);
            return res.status(500).json({ data: null, message: 'Server error' });
        }
    },

    /**
     * User login controller
     */
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            const userRepository = AppDataSource.getRepository(User);

            const user = await userRepository.findOne({ where: { email } });
            if (!user) {
                return res.status(400).json({ data: null, message: 'Invalid credentials' });
            }

            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) {
                return res.status(400).json({ data: null, message: 'Invalid credentials' });
            }

            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);

            return res.status(200).json({
                data: { accessToken, refreshToken, user: { ...user, password: '' } },
                message: 'Login successful'
            });
        } catch (error) {
            console.error('Login Error:', error);
            return res.status(500).json({ data: null, message: 'Server error' });
        }
    },

    /**
     * Token refresh controller
     */
    refreshTokenHandler: (req, res) => {
        const { token } = req.body;
        if (!token) return res.status(401).json({ data: null, message: 'Refresh token required' });

        try {
            const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
            const newPayload = { id: payload.id, email: payload.email };
            const newAccessToken = generateAccessToken(newPayload);
            const newRefreshToken = generateRefreshToken(newPayload);

            return res.status(200).json({
                data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
                message: 'New tokens issued successfully'
            });
        } catch (error) {
            console.error('Refresh Token Error:', error);
            return res.status(403).json({ data: null, message: 'Invalid refresh token' });
        }
    },

};
