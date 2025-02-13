// index.js
require("dotenv").config(); // .env থেকে পরিবেশ ভেরিয়েবল লোড করা
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const url = require("url");

// ডাটাবেজ কনফিগারেশন, রাউট ইত্যাদি আলাদা ফাইল থেকে ইম্পোর্ট করা হচ্ছে
const { pool } = require("./config/db"); // ডাটাবেজ সংযোগ (আলাদা ফাইলে রাখা উচিত)
const authRoutes = require("./routes/auth.routes"); // অথেনটিকেশন রাউট
const taskRoutes = require("./routes/task.routes"); // (যদি টাস্ক রিলেটেড রাউট থাকে)

// Express অ্যাপ তৈরি করা
const app = express();
app.use(express.json()); // JSON রিকোয়েস্ট হ্যান্ডেলিং

// API রাউট মাউন্ট করা
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes); // টাস্ক রিলেটেড API (আবশ্যক হলে)

// HTTP সার্ভার তৈরি করা
const server = http.createServer(app);

// WebSocket সার্ভার সেটআপ করা হচ্ছে
const wss = new WebSocket.Server({ server });

// Map তৈরি করা হয়েছে যাতে প্রতিটি ইউজারের WebSocket connection সংরক্ষণ করা যায়
const connectedClients = new Map();

// WebSocket কানেকশন হ্যান্ডলার
wss.on("connection", (ws, req) => {
  // URL থেকে query parameters থেকে token বের করা
  const parameters = url.parse(req.url, true);
  const token = parameters.query.token;

  if (!token) {
    ws.close(1008, "Unauthorized: No token provided");
    return;
  }

  let user;
  try {
    // JWT টোকেন যাচাই করা হচ্ছে
    const jwt = require("jsonwebtoken");
    user = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    ws.close(1008, "Unauthorized: Invalid token");
    return;
  }

  // এখানে আপনি একটি in-memory Map বা অন্য কোনো স্টোরে
  // ইউজারের id অনুযায়ী connection সংরক্ষণ করা
  connectedClients.set(user.id, ws);
  console.log(`User ${user.id} connected via WebSocket.`);

  ws.on("close", () => {
    // কানেকশন ক্লোজ হলে, প্রয়োজনীয় ক্লিনআপ করুন
    console.log(`User ${user.id} disconnected.`);
  });
});



/**
 * API রুট: টাস্ক স্ট্যাটাস পরিবর্তনের ইভেন্ট simulate করা
 * - এই রুটে POST রিকোয়েস্টের মাধ্যমে { userId, taskId, newStatus } পাওয়া যাবে
 * - নির্দিষ্ট ইউজারের সাথে সংযুক্ত থাকলে, WebSocket এর মাধ্যমে নোটিফিকেশন পাঠানো হবে
 */
app.post('/simulate-task-update', (req, res) => {
  const { userId, taskId, newStatus } = req.body;

  // নোটিফিকেশন অবজেক্ট তৈরি করা হচ্ছে
  const notification = {
    event: 'taskStatusChanged',
    taskId,
    newStatus,
    timestamp: new Date()
  };

  // নির্দিষ্ট ইউজারের WebSocket connection খোঁজা
  const client = connectedClients.get(userId);
  if (client && client.readyState === WebSocket.OPEN) {
    // WebSocket এর মাধ্যমে নোটিফিকেশন পাঠানো
    client.send(JSON.stringify(notification));
    res.json({ message: 'Notification sent.' });
  } else {
    res.status(404).json({ message: 'User is not connected.' });
  }
});

// সার্ভার স্টার্ট করা হচ্ছে
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
