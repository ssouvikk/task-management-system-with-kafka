// src/utils/jwt.utils.js
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

/**
 * Function to generate an access token
 * @param {Object} user - User data (id and email)
 * @returns {String} JWT Access Token (valid for 15 minutes)
 */
function generateAccessToken(user) {
  return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '15m' });
}

/**
 * Function to generate a refresh token
 * @param {Object} user - User data (id and email)
 * @returns {String} JWT Refresh Token (valid for 7 days)
 */
function generateRefreshToken(user) {
  return jwt.sign(user, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

module.exports = {
  generateAccessToken, generateRefreshToken
};
