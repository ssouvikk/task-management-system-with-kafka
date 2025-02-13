import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
const { Pool } = require('pg');


dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  entities: ["src/models/*.ts"],
  synchronize: true, // Dev mode only, use migrations for production
});

AppDataSource.initialize()
  .then(() => console.log("📦 PostgreSQL Connected!"))
  .catch((error) => console.error("❌ Database Connection Error:", error));


// PostgreSQL সংযোগের জন্য পুল সেটআপ (DATABASE_URL .env থেকে নেওয়া)
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});