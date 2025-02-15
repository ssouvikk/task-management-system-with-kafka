// src/config/db.js
// import "reflect-metadata";
const { DataSource } = require("typeorm");
const { Pool } = require('pg');
require("dotenv").config(); // .env থেকে পরিবেশ ভেরিয়েবল লোড করা

const { User } = require("../models/user.entity");
const { Task } = require("../models/task.entity");
const { TaskHistory } = require("../models/taskHistory.entity");

const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  entities: [User, Task, TaskHistory],
  synchronize: true, // Development-এর জন্য, প্রোডাকশনে migration ব্যবহার করুন
});


// PostgreSQL সংযোগের জন্য পুল সেটআপ (DATABASE_URL .env থেকে নেওয়া)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = {
  pool, AppDataSource
}