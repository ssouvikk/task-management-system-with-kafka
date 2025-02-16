// src/controllers/task.controller.js
const { AppDataSource } = require("../config/db");
const { Task, TaskPriority, TaskStatus } = require("../models/task.entity");
const { producer } = require("../config/kafka");

/**
 * Function to send event to Kafka
 * @param {string} changeType - Type of event (e.g., "taskCreated", "taskUpdated", "taskDeleted")
 * @param {object} task - Task object (from which 'createdBy' contains the user ID)
 * @param {object|null} previousData - Previous data (JSON) if available for update or delete
 */
const sendTaskUpdateToKafka = async (changeType, task, previousData = null) => {
    // Use current task data as new value; for "taskDeleted", newData = null
    const newData = changeType === "taskDeleted" ? null : {
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate,
        assignedTo: task.assignedTo,
    };

    const payload = {
        change_type: changeType,        // Type of event
        taskId: task.id,                // Task ID
        userId: task.createdBy.id,      // Creator's user ID
        previous_value: previousData,   // Previous value (if available)
        new_value: newData,             // New value
        updatedAt: new Date(),          // Event time
    };

    await producer.send({
        topic: 'task-updates',
        messages: [
            {
                key: String(task.id),
                value: JSON.stringify(payload),
            },
        ],
    });
};

module.exports = {

    /**
     * 1. Create a new task
     * - Validate input, create and save the new task
     * - Send a "taskCreated" event to Kafka
     */
    createTask: async (req, res) => {
        try {
            const { title, description, priority, status, dueDate, assignedTo } = req.body;
            if (!title) {
                return res.status(400).json({ data: null, message: "Title is required" });
            }
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
                createdBy: req.user, // User object set by JWT middleware
                assignedTo,
            });

            await taskRepository.save(newTask);

            // Send a "taskCreated" event to Kafka (no previous_value)
            await sendTaskUpdateToKafka("taskCreated", newTask);

            return res.status(201).json({ data: newTask, message: "Task created successfully" });
        } catch (error) {
            console.error("Error in createTask:", error);
            return res.status(500).json({ data: null, message: "Server error" });
        }
    },

    /**
     * 2. Retrieve tasks specific to the user
     */
    getTasks: async (req, res) => {
        try {
            const { priority, status, dueDate } = req.query;
            const perPage = Math.min(Number(req.query.perPage) || 10, 100); // Maximum 100
            const pageNumber = Number(req.query.pageNumber) || 1;
            const skip = (pageNumber - 1) * perPage;

            const taskRepository = AppDataSource.getRepository(Task);
            const query = taskRepository
                .createQueryBuilder("task")
                .leftJoinAndSelect("task.createdBy", "user");

            // If the user is not admin, show only their tasks
            if (req.user.role !== "admin") {
                query.where("user.id = :userId", { userId: req.user.id });
            }

            // Add additional filters
            if (priority) {
                query.andWhere("task.priority = :priority", { priority });
            }
            if (status) {
                query.andWhere("task.status = :status", { status });
            }
            if (dueDate) {
                query.andWhere("DATE(task.dueDate) = DATE(:dueDate)", { dueDate });
            }

            // Pagination: add limit and offset
            query.skip(skip).take(perPage);

            // Execute count query to get total records
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

    /**
     * 3. Update a task
     * - Retrieve previous data
     * - Update and save the task
     * - Send a "taskUpdated" event to Kafka with previous_value and new_value
     */
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
            const task = await taskRepository.findOne({
                where: { id: taskId },
                relations: ["createdBy"],
            });
            if (!task) {
                return res.status(404).json({ data: null, message: "Task not found" });
            }
            if (task.createdBy.id !== req.user.id && req.user.role !== "admin") {
                return res.status(403).json({ data: null, message: "Not authorized to update this task" });
            }

            // Retrieve previous data
            const previousData = {
                title: task.title,
                description: task.description,
                priority: task.priority,
                status: task.status,
                dueDate: task.dueDate,
                assignedTo: task.assignedTo,
            };

            // Update task fields
            if (title !== undefined) task.title = title;
            if (description !== undefined) task.description = description;
            if (priority !== undefined) task.priority = priority;
            if (status !== undefined) task.status = status;
            if (assignedTo !== undefined) task.assignedTo = assignedTo;
            if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;

            await taskRepository.save(task);

            // Send a "taskUpdated" event to Kafka with previous_value and new_value
            await sendTaskUpdateToKafka("taskUpdated", task, previousData);

            return res.status(200).json({ data: task, message: "Task updated successfully" });
        } catch (error) {
            console.error("Error in updateTask:", error);
            return res.status(500).json({ data: null, message: "Server error" });
        }
    },

    /**
     * 4. Delete a task
     * - Retrieve previous data
     * - Delete the task
     * - Send a "taskDeleted" event to Kafka with previous_value and new_value as null
     */
    deleteTask: async (req, res) => {
        try {
            const taskId = Number(req.params.id);
            const taskRepository = AppDataSource.getRepository(Task);
            const task = await taskRepository.findOne({
                where: { id: taskId },
                relations: ["createdBy"],
            });
            if (!task) {
                return res.status(404).json({ data: null, message: "Task not found" });
            }
            if (task.createdBy.id !== req.user.id && req.user.role !== "admin") {
                return res.status(403).json({ data: null, message: "Not authorized to delete this task" });
            }

            // Retrieve previous data
            const previousData = {
                title: task.title,
                description: task.description,
                priority: task.priority,
                status: task.status,
                dueDate: task.dueDate,
                assignedTo: task.assignedTo,
            };

            await taskRepository.remove(task);

            // Send a "taskDeleted" event to Kafka with new_value as null
            await sendTaskUpdateToKafka("taskDeleted", { id: taskId, createdBy: { id: task.createdBy.id } }, previousData);

            return res.status(200).json({ data: null, message: "Task deleted successfully" });
        } catch (error) {
            console.error("Error in deleteTask:", error);
            return res.status(500).json({ data: null, message: "Server error" });
        }
    },

};
