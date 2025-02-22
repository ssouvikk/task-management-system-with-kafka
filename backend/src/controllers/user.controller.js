// src/controllers/user.controller.js
const { AppDataSource } = require("../config/db");
const { User } = require("../models/user.entity");
const { Task } = require("../models/task.entity");

module.exports = {
    // ইউজার লিস্ট API: শুধুমাত্র অ্যাডমিন ইউজারদের জন্য
    getUsers: async (req, res) => {
        try {
            const userRepository = AppDataSource.getRepository(User);
            const users = await userRepository.find();
            return res.status(200).json({ data: users, message: "User list retrieved successfully" });
        } catch (error) {
            console.error("Error in getUsers:", error);
            return res.status(500).json({ data: null, message: "Server error" });
        }
    },

    // ইউজারকে টাস্কে অ্যাসাইন করার API: শুধুমাত্র অ্যাডমিন ইউজারদের জন্য
    assignUserToTask: async (req, res) => {
        try {
            const { taskId, userId } = req.body;
            if (!taskId || !userId) {
                return res.status(400).json({ data: null, message: "taskId and userId are required" });
            }

            const taskRepository = AppDataSource.getRepository(Task);
            const userRepository = AppDataSource.getRepository(User);

            const task = await taskRepository.findOne({ where: { id: taskId } });
            if (!task) {
                return res.status(404).json({ data: null, message: "Task not found" });
            }

            const user = await userRepository.findOne({ where: { id: userId } });
            if (!user) {
                return res.status(404).json({ data: null, message: "User not found" });
            }

            // ইউজারকে টাস্কে অ্যাসাইন করা
            task.assignedTo = user.id;
            await taskRepository.save(task);
            return res.status(200).json({ data: task, message: "User assigned to task successfully" });
        } catch (error) {
            console.error("Error in assignUserToTask:", error);
            return res.status(500).json({ data: null, message: "Server error" });
        }
    },
};
