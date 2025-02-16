// src/controllers/task.controller.js

const { AppDataSource } = require("../config/db");
const { Task, TaskPriority, TaskStatus } = require("../models/task.entity");
const { producer } = require("../config/kafka");

/**
 * Kafka-তে ইভেন্ট পাঠানোর ফাংশন
 * @param {string} changeType - ইভেন্টের ধরন (উদাহরণস্বরূপ, "taskCreated", "taskUpdated", "taskDeleted")
 * @param {object} task - টাস্ক অবজেক্ট (যেখানে 'createdBy' থেকে userId নেওয়া হবে)
 * @param {object|null} previousData - আপডেট বা ডিলিটের পূর্বের তথ্য (JSON), যদি থাকে
 */
const sendTaskUpdateToKafka = async (changeType, task, previousData = null) => {
    // নতুন মান হিসেবে টাস্কের বর্তমান তথ্য
    const newData = changeType === "taskDeleted" ? null : {
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate,
    };

    const payload = {
        change_type: changeType,        // ইভেন্টের ধরন
        taskId: task.id,                // টাস্ক আইডি
        userId: task.createdBy.id,      // টাস্কের ক্রিয়েটর এর আইডি
        previous_value: previousData,   // পূর্বের মান (যদি থাকে)
        new_value: newData,             // নতুন মান
        updatedAt: new Date(),          // ইভেন্টের সময়
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
     * ১. নতুন টাস্ক তৈরি করা
     * - ইনপুট যাচাই করে, নতুন টাস্ক তৈরি ও সেভ করা
     * - Kafka-তে "taskCreated" ইভেন্ট পাঠানো
     */
    createTask: async (req, res) => {
        try {
            const { title, description, priority, status, dueDate, assignedTo } = req.body;
            if (!title) {
                return res.status(400).json({ message: "Title is required" });
            }
            if (priority && !Object.values(TaskPriority).includes(priority)) {
                return res.status(400).json({ message: "Invalid priority value" });
            }
            if (status && !Object.values(TaskStatus).includes(status)) {
                return res.status(400).json({ message: "Invalid status value" });
            }

            const taskRepository = AppDataSource.getRepository(Task);
            const newTask = taskRepository.create({
                title,
                description,
                priority: priority || TaskPriority.MEDIUM,
                status: status || TaskStatus.TODO,
                dueDate: dueDate ? new Date(dueDate) : null,
                createdBy: req.user, // JWT middleware দ্বারা সেট করা user object
                assignedTo,
            });

            await taskRepository.save(newTask);

            // Kafka-তে "taskCreated" ইভেন্ট (previous_data নেই)
            await sendTaskUpdateToKafka("taskCreated", newTask);

            res.status(201).json(newTask);
        } catch (error) {
            console.error("Error in createTask:", error);
            res.status(500).json({ message: "Server error" });
        }
    },

    /**
     * ২. ইউজার-সুনির্দিষ্ট টাস্ক রিট্রিভ করা
     */
    getTasks: async (req, res) => {
        try {
            const { priority, status, dueDate } = req.query;
            const taskRepository = AppDataSource.getRepository(Task);

            const query = taskRepository
                .createQueryBuilder("task")
                .leftJoinAndSelect("task.createdBy", "user")
                .where("user.id = :userId", { userId: req.user.id });

            if (priority) {
                query.andWhere("task.priority = :priority", { priority });
            }
            if (status) {
                query.andWhere("task.status = :status", { status });
            }
            if (dueDate) {
                query.andWhere("DATE(task.dueDate) = DATE(:dueDate)", { dueDate });
            }

            const tasks = await query.getMany();
            res.status(200).json(tasks);
        } catch (error) {
            console.error("Error in getTasks:", error);
            res.status(500).json({ message: "Server error" });
        }
    },

    /**
     * ৩. টাস্ক আপডেট করা
     * - আপডেটের পূর্বে পূর্বের তথ্য সংগ্রহ করা (previousData)
     * - টাস্ক আপডেট করে সেভ করা
     * - Kafka-তে "taskUpdated" ইভেন্ট পাঠানো, যেখানে previous_value ও new_value উভয়ই অন্তর্ভুক্ত থাকবে
     */
    updateTask: async (req, res) => {
        try {
            const taskId = Number(req.params.id);
            const { title, description, priority, status, dueDate, assignedTo } = req.body;

            if (priority && !Object.values(TaskPriority).includes(priority)) {
                return res.status(400).json({ message: "Invalid priority value" });
            }
            if (status && !Object.values(TaskStatus).includes(status)) {
                return res.status(400).json({ message: "Invalid status value" });
            }

            const taskRepository = AppDataSource.getRepository(Task);
            const task = await taskRepository.findOne({
                where: { id: taskId },
                relations: ["createdBy"],
            });
            if (!task) {
                return res.status(404).json({ message: "Task not found" });
            }
            if (task.createdBy.id !== req.user.id && req.user.role !== "admin") {
                return res.status(403).json({ message: "Not authorized to update this task" });
            }

            // পূর্বের তথ্য সংগ্রহ (previous_value)
            const previousData = {
                title: task.title,
                description: task.description,
                priority: task.priority,
                status: task.status,
                dueDate: task.dueDate,
            };

            // টাস্কের পরিবর্তনসমূহ আপডেট করা
            if (title !== undefined) task.title = title;
            if (description !== undefined) task.description = description;
            if (priority !== undefined) task.priority = priority;
            if (status !== undefined) task.status = status;
            if (assignedTo !== undefined) task.assignedTo = assignedTo;
            if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;

            await taskRepository.save(task);

            // Kafka-তে "taskUpdated" ইভেন্ট পাঠানো, যেখানে previous_value ও new_value অন্তর্ভুক্ত থাকবে
            await sendTaskUpdateToKafka("taskUpdated", task, previousData);

            res.status(200).json(task);
        } catch (error) {
            console.error("Error in updateTask:", error);
            res.status(500).json({ message: "Server error" });
        }
    },

    /**
     * ৪. টাস্ক মুছে ফেলা
     * - ডিলিটের পূর্বে, পূর্ববর্তী তথ্য সংগ্রহ করা (previousData)
     * - টাস্ক ডিলিট করা
     * - Kafka-তে "taskDeleted" ইভেন্ট পাঠানো, যেখানে previous_value থাকবে এবং new_value হবে null
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
                return res.status(404).json({ message: "Task not found" });
            }
            if (task.createdBy.id !== req.user.id && req.user.role !== "admin") {
                return res.status(403).json({ message: "Not authorized to delete this task" });
            }

            // পূর্বের তথ্য সংগ্রহ
            const previousData = {
                title: task.title,
                description: task.description,
                priority: task.priority,
                status: task.status,
                dueDate: task.dueDate,
            };

            await taskRepository.remove(task);

            // Kafka-তে "taskDeleted" ইভেন্ট পাঠানো, new_value হিসেবে null পাঠানো যেতে পারে
            await sendTaskUpdateToKafka("taskDeleted", { id: taskId, createdBy: { id: task.createdBy.id } }, previousData);

            res.status(200).json({ message: "Task deleted successfully" });
        } catch (error) {
            console.error("Error in deleteTask:", error);
            res.status(500).json({ message: "Server error" });
        }
    },

};
