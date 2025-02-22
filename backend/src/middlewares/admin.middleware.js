// src/middlewares/admin.middleware.js
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        return res.status(403).json({ data: null, message: "Admin privileges required" });
    }
};

module.exports = { isAdmin };
