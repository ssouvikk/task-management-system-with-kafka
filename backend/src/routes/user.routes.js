// src/routes/user.routes.js
const { Router } = require("express");
const { getUsers, assignUserToTask } = require("../controllers/user.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");
const { isAdmin } = require("../middlewares/admin.middleware");

const router = Router();

// শুধুমাত্র অ্যাডমিন ইউজাররা ইউজার লিস্ট দেখতে পারবেন
router.get("/", authenticateToken, isAdmin, getUsers);

// শুধুমাত্র অ্যাডমিন ইউজাররা টাস্কে ইউজার অ্যাসাইন করতে পারবেন
router.post("/assign-task", authenticateToken, isAdmin, assignUserToTask);

module.exports = router;
