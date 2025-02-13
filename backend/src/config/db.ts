import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
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
