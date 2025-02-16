// src/server.js
require("dotenv").config(); // .env থেকে পরিবেশ ভেরিয়েবল লোড করা
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const url = require("url");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const startConsumer = require("./services/taskConsumer");
// const { connectKafka } = require("./config/kafka"); 
const connectedClients = require("./config/socketClients");
const authRoutes = require("./routes/auth.routes"); // অথেনটিকেশন রাউট
const taskRoutes = require("./routes/task.routes"); // (টাস্ক রিলেটেড রাউট)
const { AppDataSource } = require("./config/db");

// Express অ্যাপ তৈরি করা
const app = express();
app.use(express.json()); // JSON রিকোয়েস্ট হ্যান্ডেলিং
app.use(cors());

// YAML ফাইলটি লোড করুন
const swaggerDocument = YAML.load(path.join(__dirname, '..', 'docs', 'swagger.yaml'));

// '/api-docs' রাউটে Swagger UI সেটআপ করুন
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API রাউট মাউন্ট করা
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes); // টাস্ক রিলেটেড API (আবশ্যক হলে)

// HTTP সার্ভার তৈরি করা
const server = http.createServer(app);

// WebSocket সার্ভার সেটআপ করা হচ্ছে
const wss = new WebSocket.Server({ server });

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
    connectedClients.delete(user.id);
    console.log(`User ${user.id} disconnected.`);
  });
});



const startServer = async () => {
  // ডাটাবেজ কানেকশন initialize করুন.
  await AppDataSource.initialize();
  console.log("PostgreSQL Connected!")

  // Kafka ও Consumer সংযোগ করুন
  // await connectKafka();
  await startConsumer();
  console.log('consumer connected')
  
  
};
startServer(); 

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});