import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const generateToken = (user) => {
    return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: "1h",
    });
};


/**
 * অ্যাক্সেস টোকেন জেনারেট করার ফাংশন
 * @param {Object} user - ইউজারের ডাটা (id ও email)
 * @returns {String} JWT Access Token (15 মিনিটের মেয়াদ)
 */
export function generateAccessToken(user) {
  return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '15m' });
}

/**
 * রিফ্রেশ টোকেন জেনারেট করার ফাংশন
 * @param {Object} user - ইউজারের ডাটা (id ও email)
 * @returns {String} JWT Refresh Token (7 দিনের মেয়াদ)
 */
export function generateRefreshToken(user) {
  return jwt.sign(user, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
}
