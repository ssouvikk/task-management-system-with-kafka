// src/config/db.js
const { DataSource } = require("typeorm");
const { Pool } = require('pg');
require("dotenv").config(); // Loading environment variables from .env

const { User } = require("../models/user.entity");
const { Task } = require("../models/task.entity");
const { TaskHistory } = require("../models/taskHistory.entity");

const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  entities: [User, Task, TaskHistory],
  synchronize: true, // For development; use migrations in production
});

AppDataSource.initialize()
  .then(() => console.log("📦 PostgreSQL Connected!"))
  .catch((error) => console.error("❌ Database Connection Error:", error));

// Pool setup for PostgreSQL connection (DATABASE_URL from .env)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = {
  pool, AppDataSource
}
