//src/middlewares/auth.middleware.js
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
            // Token verify করে decoded ডেটা পাওয়া যাচ্ছে
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // decoded থেকে id নিয়ে ইউজারের সম্পূর্ণ তথ্য ডাটাবেজ থেকে খুঁজে বের করুন
            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOne({ where: { id: decoded.id } });

            if (!user) {
                return res.status(404).json({ message: "User not found", data: null });
            }

            // পূর্ণ ইউজার ডেটা req.user-এ সেট করুন
            req.user = user;
            next();
        } catch (error) {
            return res.status(403).json({ message: "Invalid Token", data: null });
        }
    },
};
