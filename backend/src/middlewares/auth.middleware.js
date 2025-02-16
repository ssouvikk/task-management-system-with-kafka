const jwt = require("jsonwebtoken");

module.exports = {
    
    authenticateToken: (req, res, next) => {
        const token = req.header("Authorization")?.split(" ")[1];
        if (!token) return res.status(401).json({ message: "Access Denied", data: null });

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (error) {
            res.status(403).json({ message: /* error.message || */ "Invalid Token", data: null });
        }
    },

}
