// src/controllers/task.controller.js
const { AppDataSource } = require("../config/db");
const { Task, TaskPriority, TaskStatus } = require("../models/task.entity");
const { producer } = require("../config/kafka");
const connectedClients = require("../config/socketClients");

const sendTaskUpdate = async (changeType, task, previousData = null) => {
    // নিশ্চিত করুন যে taskId null নয়, পূর্বের ডেটা থেকেও সংগ্রহ করতে পারেন
    const taskId = task.id || (previousData && previousData.id);

    const newData = changeType === "taskDeleted" ? null : {
        id: taskId,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate,
        assignedUser: task.assignedUser ? {
            id: task.assignedUser.id,
            username: task.assignedUser.username,
            email: task.assignedUser.email,
        } : null,
    };

    const payload = {
        taskId,
        change_type: changeType,
        userId: task.createdBy.id,
        previous_value: previousData,
        new_value: newData,
        updatedAt: new Date(),
    };

    await producer.send({
        topic: 'task-updates',
        messages: [{ key: String(taskId), value: JSON.stringify(payload) }],
    });

    const creatorClient = connectedClients.get(task.createdBy.id);
    if (creatorClient && creatorClient.ws.readyState === 1) {
        creatorClient.ws.send(JSON.stringify(payload));
    }

    if (task.assignedUser && task.assignedUser.id !== task.createdBy.id) {
        const assigneeClient = connectedClients.get(task.assignedUser.id);
        if (assigneeClient && assigneeClient.ws.readyState === 1) {
            assigneeClient.ws.send(JSON.stringify(payload));
        }
    }

    connectedClients.forEach(({ ws, role }, key) => {
        if (role === "admin" && key !== task.createdBy.id && ws.readyState === 1) {
            ws.send(JSON.stringify(payload));
        }
    });
};

module.exports = {
    createTask: async (req, res) => {
        try {
            const { title, description, priority, status, dueDate, assignedUser } = req.body;
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
                // শুধুমাত্র অ্যাডমিন ইউজার assignedUser প্রদান করলে, খালি স্ট্রিং থাকলে null নতুবা ইন্টিজারে রূপান্তর
                assignedUser: (req.user.role === 'admin' && assignedUser && assignedUser !== "")
                    ? { id: Number(assignedUser) }
                    : null,
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
                .leftJoinAndSelect("task.createdBy", "user")
                .leftJoinAndSelect("task.assignedUser", "assignedUser");

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
            const { title, description, priority, status, dueDate, assignedUser } = req.body;
            if (priority && !Object.values(TaskPriority).includes(priority)) {
                return res.status(400).json({ data: null, message: "Invalid priority value" });
            }
            if (status && !Object.values(TaskStatus).includes(status)) {
                return res.status(400).json({ data: null, message: "Invalid status value" });
            }
            const taskRepository = AppDataSource.getRepository(Task);
            const task = await taskRepository.findOne({ where: { id: taskId }, relations: ["createdBy", "assignedUser"] });
            if (!task) return res.status(404).json({ data: null, message: "Task not found" });

            const previousData = { ...task };

            // শুধুমাত্র অ্যাডমিন ইউজারই assignedUser আপডেট করতে পারবে
            if (req.user.role === "admin") {
                if (assignedUser && assignedUser !== "") {
                    task.assignedUser = { id: Number(assignedUser) };
                } else {
                    task.assignedUser = null;
                }
            }

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
