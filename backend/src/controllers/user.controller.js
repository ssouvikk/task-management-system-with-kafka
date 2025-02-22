// src/controllers/user.controller.js
const { AppDataSource } = require("../config/db");
const { User } = require("../models/user.entity");

module.exports = {
    getUsers: async (req, res) => {
        try {
            const userRepository = AppDataSource.getRepository(User);
            const users = await userRepository.find({ where: { role: "user" } });
            return res.status(200).json({ data: users, message: "" });
        } catch (error) {
            console.error("Error in getUsers:", error);
            return res.status(500).json({ data: null, message: "Server error" });
        }
    },
};
