// src/utils/jwt.utils.js
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

function generateAccessToken(user) {
  const { id, email, username, role } = user
  return jwt.sign({ id, email, username, role }, process.env.JWT_SECRET, { expiresIn: '1m' });
}

function generateRefreshToken(user) {
  const { id, email, username, role } = user
  return jwt.sign({ id, email, username, role }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

module.exports = {
  generateAccessToken, generateRefreshToken
};
