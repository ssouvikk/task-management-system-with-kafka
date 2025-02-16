// src/routes/task.routes.js
const { Router } = require("express");
const {
    createTask,
    getTasks,
    updateTask,
    deleteTask,
} = require("../controllers/task.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

const router = Router();

// JWT authentication middleware for every route
router.post("/", authenticateToken, createTask);
router.get("/", authenticateToken, getTasks);
router.put("/:id", authenticateToken, updateTask);
router.delete("/:id", authenticateToken, deleteTask);

module.exports = router;
