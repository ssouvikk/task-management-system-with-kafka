// import "reflect-metadata";
const { DataSource } = require("typeorm");
const { Pool } = require('pg');
require("dotenv").config(); // .env থেকে পরিবেশ ভেরিয়েবল লোড করা

const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  entities: ["src/models/*.ts"],
  synchronize: true, // Dev mode only, use migrations for production
});

AppDataSource.initialize()
  .then(() => console.log("📦 PostgreSQL Connected!"))
  .catch((error) => console.error("❌ Database Connection Error:", error));


// PostgreSQL সংযোগের জন্য পুল সেটআপ (DATABASE_URL .env থেকে নেওয়া)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = {
  pool, AppDataSource
}