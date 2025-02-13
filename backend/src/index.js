// index.js
require('dotenv').config(); // .env ফাইল থেকে পরিবেশ ভেরিয়েবল লোড করা
const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json()); // JSON রিকোয়েস্ট পাসিং

// PostgreSQL সংযোগের জন্য পুল সেটআপ (DATABASE_URL .env থেকে নেওয়া)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// In-memory store (ডেমো উদ্দেশ্যে) - প্রোডাকশনে ডাটাবেজ বা ক্যাশ ব্যবহার করা উচিত
let refreshTokens = [];

/**
 * অ্যাক্সেস টোকেন জেনারেট করার ফাংশন
 * @param {Object} user - ইউজারের ডাটা (id ও email)
 * @returns {String} JWT Access Token (15 মিনিটের মেয়াদ)
 */
function generateAccessToken(user) {
  return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '15m' });
}

/**
 * রিফ্রেশ টোকেন জেনারেট করার ফাংশন
 * @param {Object} user - ইউজারের ডাটা (id ও email)
 * @returns {String} JWT Refresh Token (7 দিনের মেয়াদ)
 */
function generateRefreshToken(user) {
  return jwt.sign(user, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

/**
 * ইউজার সাইনআপ রুট
 * - নতুন ইউজার রেজিস্টার করা হয়
 * - পাসওয়ার্ড হ্যাশ করে সংরক্ষণ করা হয়
 * - সফল হলে JWT টোকেন (অ্যাক্সেস ও রিফ্রেশ) প্রদান করা হয়
 */
app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    // চেক করা হচ্ছে ইউজার পূর্বেই আছে কিনা
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'ইউজার পূর্বেই বিদ্যমান' });
    }
    // bcrypt ব্যবহার করে পাসওয়ার্ড হ্যাশ করা (সাল্ট সহ)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // নতুন ইউজার ডাটাবেজে সেভ করা
    const newUser = await pool.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *',
      [email, hashedPassword]
    );
    // JWT টোকেন জেনারেট করা
    const user = { id: newUser.rows[0].id, email: newUser.rows[0].email };
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    // রিফ্রেশ টোকেন সংরক্ষণ (ডেমো উদ্দেশ্যে)
    refreshTokens.push(refreshToken);
    res.status(201).json({ accessToken, refreshToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'সার্ভার এরর' });
  }
});

/**
 * ইউজার লগিন রুট
 * - ইউজার প্রদত্ত ইমেল ও পাসওয়ার্ড যাচাই করা হয়
 * - সফল হলে JWT অ্যাক্সেস ও রিফ্রেশ টোকেন প্রদান করা হয়
 */
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // ইউজারকে ইমেল দিয়ে খুঁজে বের করা
    const userQuery = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userQuery.rows.length === 0) {
      return res.status(400).json({ message: 'ভুল ক্রেডেনশিয়াল' });
    }
    const user = userQuery.rows[0];
    // পাসওয়ার্ড যাচাই করা
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'ভুল ক্রেডেনশিয়াল' });
    }
    // JWT টোকেন জেনারেশন
    const userPayload = { id: user.id, email: user.email };
    const accessToken = generateAccessToken(userPayload);
    const refreshToken = generateRefreshToken(userPayload);
    refreshTokens.push(refreshToken);
    res.status(200).json({ accessToken, refreshToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'সার্ভার এরর' });
  }
});

/**
 * Middleware: API রুট প্রোটেক্ট করার জন্য JWT যাচাইকরণ
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  // 'Bearer <token>' ফরম্যাটে টোকেন পাঠানো হয়
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401); // Unauthorized

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Forbidden
    req.user = user; // যাচাইকৃত ইউজার ডাটা রিকোয়েস্টে সংযুক্ত করা
    next();
  });
}

/**
 * একটি প্রটেক্টেড রুটের উদাহরণ
 * শুধুমাত্র বৈধ JWT টোকেনের মাধ্যমে অ্যাক্সেসযোগ্য
 */
app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'এই রুটটি প্রটেক্টেড', user: req.user });
});

/**
 * রিফ্রেশ টোকেন রুট:
 * - ক্লায়েন্ট দ্বারা প্রেরিত রিফ্রেশ টোকেন যাচাই করা হয়
 * - বৈধ হলে নতুন অ্যাক্সেস টোকেন (এবং প্রয়োজন হলে নতুন রিফ্রেশ টোকেন) প্রদান করা হয়
 */
app.post('/token', (req, res) => {
  const { token } = req.body;
  if (!token) return res.sendStatus(401); // Unauthorized
  if (!refreshTokens.includes(token)) return res.sendStatus(403); // Forbidden

  jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    // টোকেন রোটেশন: পুরানো রিফ্রেশ টোকেন সরিয়ে নতুন টোকেন ইস্যু করা
    refreshTokens = refreshTokens.filter(rt => rt !== token);

    const userPayload = { id: user.id, email: user.email };
    const newAccessToken = generateAccessToken(userPayload);
    const newRefreshToken = generateRefreshToken(userPayload);
    refreshTokens.push(newRefreshToken);

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  });
});

/**
 * Logout রুট (ঐচ্ছিক):
 * - রিফ্রেশ টোকেন অবৈধ করা হয়
 */
app.post('/logout', (req, res) => {
  const { token } = req.body;
  refreshTokens = refreshTokens.filter(rt => rt !== token);
  res.sendStatus(204);
});

// সার্ভার চালু করা
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
