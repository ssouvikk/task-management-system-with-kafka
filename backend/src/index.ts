import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { AppDataSource } from "./config/db";
import { producer } from "./config/kafka";
import authRoutes from "./routes/auth.routes";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    await AppDataSource.initialize();
    await producer.connect();
    console.log(`🚀 Server running on port ${PORT}`);
});
