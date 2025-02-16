// src/middlewares/auth.middleware.js
const jwt = require("jsonwebtoken");
const { AppDataSource } = require("../config/db");
const { User } = require("../models/user.entity");

module.exports = {
    authenticateToken: async (req, res, next) => {
        const token = req.header("Authorization")?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Access Denied", data: null });
        }

        try {
            // Verifying the token to obtain decoded data
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Retrieve complete user information from the database using the id from decoded token
            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOne({ where: { id: decoded.id } });

            if (!user) {
                return res.status(404).json({ message: "User not found", data: null });
            }

            // Set the full user data to req.user
            req.user = user;
            next();
        } catch (error) {
            return res.status(403).json({ message: "Invalid Token", data: null });
        }
    },
};
