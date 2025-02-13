import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const generateToken = (user: { id: number; role: string }) => {
    return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!, {
        expiresIn: "24h",
    });
};
