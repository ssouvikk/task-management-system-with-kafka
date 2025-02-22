// src/server.js
require("dotenv").config(); // Load environment variables from .env
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
const authRoutes = require("./routes/auth.routes"); // Authentication routes
const taskRoutes = require("./routes/task.routes"); // Task related routes
const { AppDataSource } = require("./config/db");

// Create Express app
const app = express();
app.use(express.json()); // Handle JSON requests
app.use(cors());

// Load the YAML file
const swaggerDocument = YAML.load(path.join(__dirname, '..', 'docs', 'swagger.yaml'));

// Set up Swagger UI at '/api-docs' route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Mount API routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes); // Task related API (if needed)

// Create HTTP server
const server = http.createServer(app);

// Set up WebSocket server
const wss = new WebSocket.Server({ server });

// WebSocket connection handler
wss.on("connection", (ws, req) => {
  // Extract token from query parameters in URL
  const parameters = url.parse(req.url, true);
  const token = parameters.query.token;

  if (!token) {
    ws.close(1008, "Unauthorized: No token provided");
    return;
  }

  let user;
  try {
    // Verify JWT token
    user = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    ws.close(1008, "Unauthorized: Invalid token");
    return;
  }

  // Store the connection in an in-memory map using user's id
  connectedClients.set(user.id, { ws, role: user.role });
  console.log(`User ${user.id} connected via WebSocket.`);

  ws.on("close", () => {
    // Perform necessary cleanup when connection is closed
    connectedClients.delete(user.id);
    console.log(`User ${user.id} disconnected.`);
  });
});

const startServer = async () => {
  // Initialize database connection.
  await AppDataSource.initialize();
  console.log("PostgreSQL Connected!");

  // Connect Kafka and start consumer
  // await connectKafka();
  await startConsumer();
  console.log('Consumer connected');
};

startServer();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
