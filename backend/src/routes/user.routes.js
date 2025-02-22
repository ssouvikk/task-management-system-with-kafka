// src/routes/user.routes.js
const { Router } = require("express");
const { getUsers, assignUserToTask } = require("../controllers/user.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");
const { isAdmin } = require("../middlewares/admin.middleware");

const router = Router();

router.get("/", authenticateToken, isAdmin, getUsers);


module.exports = router;
