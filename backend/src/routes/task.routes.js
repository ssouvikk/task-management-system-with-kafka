// src/routes/task.routes.ts
import { Router } from "express";
import {
    createTask,
    getTasks,
    updateTask,
    deleteTask,
} from "../controllers/task.controller";
import { authenticateToken } from "../middlewares/auth.middleware"; // পূর্বে তৈরি JWT middleware

const router = Router();

// প্রতিটি রাউটে আগে JWT যাচাইকরণ করা হচ্ছে
router.post("/", authenticateToken, createTask);
router.get("/", authenticateToken, getTasks);
router.put("/:id", authenticateToken, updateTask);
router.delete("/:id", authenticateToken, deleteTask);

export default router;
