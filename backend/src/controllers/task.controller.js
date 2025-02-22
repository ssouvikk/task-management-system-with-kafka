// src/controllers/task.controller.js
const { AppDataSource } = require("../config/db");
const { Task, TaskPriority, TaskStatus } = require("../models/task.entity");
const { producer } = require("../config/kafka");
const connectedClients = require("../config/socketClients");

const sendTaskUpdate = async (changeType, task, previousData = null) => {
    const newData = changeType === "taskDeleted" ? null : {
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate,
        assignedTo: task.assignedTo,
    };

    const payload = {
        change_type: changeType,
        taskId: task.id,
        userId: task.createdBy.id,
        previous_value: previousData,
        new_value: newData,
        updatedAt: new Date(),
    };

    await producer.send({
        topic: 'task-updates',
        messages: [{ key: String(task.id), value: JSON.stringify(payload) }],
    });

    // Creator-কে নোটিফাই করা
    const creatorClient = connectedClients.get(task.createdBy.id);
    if (creatorClient && creatorClient.ws.readyState === 1) {
        creatorClient.ws.send(JSON.stringify(payload));
    }

    // Assignee থাকলে, তাকে নোটিফাই করা (যদি creator এর সাথে আলাদা হয়)
    if (task.assignedTo && task.assignedTo !== task.createdBy.id) {
        const assigneeClient = connectedClients.get(task.assignedTo);
        if (assigneeClient && assigneeClient.ws.readyState === 1) {
            assigneeClient.ws.send(JSON.stringify(payload));
        }
    }

    // সকল অ্যাডমিনকে নোটিফাই করা
    connectedClients.forEach(({ ws, role }) => {
        if (role === "admin" && ws.readyState === 1) {
            ws.send(JSON.stringify({ message: "Task updated", payload }));
        }
    });
};

module.exports = {
    createTask: async (req, res) => {
        try {
            const { title, description, priority, status, dueDate, assignedTo } = req.body;
            if (!title) return res.status(400).json({ data: null, message: "Title is required" });
            if (priority && !Object.values(TaskPriority).includes(priority)) {
                return res.status(400).json({ data: null, message: "Invalid priority value" });
            }
            if (status && !Object.values(TaskStatus).includes(status)) {
                return res.status(400).json({ data: null, message: "Invalid status value" });
            }

            const taskRepository = AppDataSource.getRepository(Task);
            const newTask = taskRepository.create({
                title,
                description,
                priority: priority || TaskPriority.MEDIUM,
                status: status || TaskStatus.TODO,
                dueDate: dueDate ? new Date(dueDate) : null,
                createdBy: req.user,
                assignedTo, // এখানে অ্যাডমিন চেক করে আগের মত set করা যাবে (এটি createTask এ admin বা user উভয়ের জন্য কাজ করতে পারে)
            });

            await taskRepository.save(newTask);
            await sendTaskUpdate("taskCreated", newTask);

            return res.status(201).json({ data: newTask, message: "Task created successfully" });
        } catch (error) {
            console.error("Error in createTask:", error);
            return res.status(500).json({ data: null, message: "Server error" });
        }
    },

    getTasks: async (req, res) => {
        try {
            const { priority, status, dueDate } = req.query;
            const perPage = Math.min(Number(req.query.perPage) || 10, 100);
            const pageNumber = Number(req.query.pageNumber) || 1;
            const skip = (pageNumber - 1) * perPage;

            const taskRepository = AppDataSource.getRepository(Task);
            const query = taskRepository
                .createQueryBuilder("task")
                .leftJoinAndSelect("task.createdBy", "user");

            if (req.user.role !== "admin") {
                query.where("user.id = :userId", { userId: req.user.id });
            }

            if (priority) {
                query.andWhere("task.priority = :priority", { priority });
            }
            if (status) {
                query.andWhere("task.status = :status", { status });
            }
            if (dueDate) {
                query.andWhere("DATE(task.dueDate) = DATE(:dueDate)", { dueDate });
            }

            query.skip(skip).take(perPage);
            const [tasks, total] = await query.getManyAndCount();

            return res.status(200).json({
                data: { tasks, total, pageNumber, perPage },
                message: ""
            });
        } catch (error) {
            console.error("Error in getTasks:", error);
            return res.status(500).json({ data: null, message: "Server error" });
        }
    },

    updateTask: async (req, res) => {
        try {
            const taskId = Number(req.params.id);
            const { title, description, priority, status, dueDate, assignedTo } = req.body;
            if (priority && !Object.values(TaskPriority).includes(priority)) {
                return res.status(400).json({ data: null, message: "Invalid priority value" });
            }
            if (status && !Object.values(TaskStatus).includes(status)) {
                return res.status(400).json({ data: null, message: "Invalid status value" });
            }
            const taskRepository = AppDataSource.getRepository(Task);
            const task = await taskRepository.findOne({ where: { id: taskId }, relations: ["createdBy"] });
            if (!task) return res.status(404).json({ data: null, message: "Task not found" });
            // যদি admin ইউজার এডিট করে, তাহলে assignedTo ফিল্ড আপডেট হবে
            if (req.user.role === "admin" && assignedTo !== undefined) {
                task.assignedTo = assignedTo;
            }

            const previousData = { ...task };

            // অন্যান্য ফিল্ড আপডেট
            Object.assign(task, { title, description, priority, status, dueDate: dueDate ? new Date(dueDate) : null });
            await taskRepository.save(task);
            await sendTaskUpdate("taskUpdated", task, previousData);

            return res.status(200).json({ data: task, message: "Task updated successfully" });
        } catch (error) {
            console.error("Error in updateTask:", error);
            return res.status(500).json({ data: null, message: "Server error" });
        }
    },

    deleteTask: async (req, res) => {
        try {
            const taskId = Number(req.params.id);
            const taskRepository = AppDataSource.getRepository(Task);
            const task = await taskRepository.findOne({ where: { id: taskId }, relations: ["createdBy"] });
            if (!task) return res.status(404).json({ data: null, message: "Task not found" });
            if (task.createdBy.id !== req.user.id && req.user.role !== "admin") {
                return res.status(403).json({ data: null, message: "Not authorized to delete this task" });
            }

            const previousData = { ...task };
            await taskRepository.remove(task);
            await sendTaskUpdate("taskDeleted", task, previousData);

            return res.status(200).json({ data: null, message: "Task deleted successfully" });
        } catch (error) {
            console.error("Error in deleteTask:", error);
            return res.status(500).json({ data: null, message: "Server error" });
        }
    },
};
