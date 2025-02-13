// src/routes/task.routes.ts
const { Router } = require("express");
const {
    createTask,
    getTasks,
    updateTask,
    deleteTask,
} = require("../controllers/task.controller");
const { authenticateToken } = require("../middlewares/auth.middleware")

const router = Router();

// প্রতিটি রাউটে আগে JWT যাচাইকরণ করা হচ্ছে
router.post("/", authenticateToken, createTask);
router.get("/", authenticateToken, getTasks);
router.put("/:id", authenticateToken, updateTask);
router.delete("/:id", authenticateToken, deleteTask);

module.exports = router
