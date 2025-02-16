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
    // নতুন মান হিসেবে টাস্কের বর্তমান তথ্য; "taskDeleted" হলে newData = null
    const newData = changeType === "taskDeleted" ? null : {
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate,
        assignedTo: task.assignedTo,
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
                createdBy: req.user, // JWT middleware দ্বারা সেট করা user object
                assignedTo,
            });

            await taskRepository.save(newTask);

            // Kafka-তে "taskCreated" ইভেন্ট পাঠানো (previous_value নেই)
            await sendTaskUpdateToKafka("taskCreated", newTask);

            return res.status(201).json({ data: newTask, message: "Task created successfully" });
        } catch (error) {
            console.error("Error in createTask:", error);
            return res.status(500).json({ data: null, message: "Server error" });
        }
    },

    /**
     * ২. ইউজার-সুনির্দিষ্ট টাস্ক রিট্রিভ করা
     */
    getTasks: async (req, res) => {
        try {
            const { priority, status, dueDate } = req.query;
            const perPage = Math.min(Number(req.query.perPage) || 10, 100); // সর্বোচ্চ 100
            const pageNumber = Number(req.query.pageNumber) || 1;
            const skip = (pageNumber - 1) * perPage;
    
            const taskRepository = AppDataSource.getRepository(Task);
            const query = taskRepository
                .createQueryBuilder("task")
                .leftJoinAndSelect("task.createdBy", "user");
    
            // যদি ব্যবহারকারী admin না হন, তাহলে শুধু তার টাস্ক দেখানো হবে
            if (req.user.role !== "admin") {
                query.where("user.id = :userId", { userId: req.user.id });
            }
    
            // অন্যান্য ফিল্টার যোগ করুন
            if (priority) {
                query.andWhere("task.priority = :priority", { priority });
            }
            if (status) {
                query.andWhere("task.status = :status", { status });
            }
            if (dueDate) {
                query.andWhere("DATE(task.dueDate) = DATE(:dueDate)", { dueDate });
            }
    
            // Pagination: limit এবং offset যোগ করুন
            query.skip(skip).take(perPage);
    
            // টোটাল রেকর্ড সংখ্যা পেতে আলাদা count query
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
     * ৩. টাস্ক আপডেট করা
     * - পূর্বের তথ্য সংগ্রহ করা (previousData)
     * - টাস্ক আপডেট করে সেভ করা
     * - Kafka-তে "taskUpdated" ইভেন্ট পাঠানো, যেখানে previous_value ও new_value অন্তর্ভুক্ত থাকবে
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

            // পূর্বের তথ্য সংগ্রহ (previous_value)
            const previousData = {
                title: task.title,
                description: task.description,
                priority: task.priority,
                status: task.status,
                dueDate: task.dueDate,
                assignedTo: task.assignedTo,
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

            return res.status(200).json({ data: task, message: "Task updated successfully" });
        } catch (error) {
            console.error("Error in updateTask:", error);
            return res.status(500).json({ data: null, message: "Server error" });
        }
    },

    /**
     * ৪. টাস্ক মুছে ফেলা
     * - পূর্বের তথ্য সংগ্রহ করা (previousData)
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
                return res.status(404).json({ data: null, message: "Task not found" });
            }
            if (task.createdBy.id !== req.user.id && req.user.role !== "admin") {
                return res.status(403).json({ data: null, message: "Not authorized to delete this task" });
            }

            // পূর্বের তথ্য সংগ্রহ
            const previousData = {
                title: task.title,
                description: task.description,
                priority: task.priority,
                status: task.status,
                dueDate: task.dueDate,
                assignedTo: task.assignedTo,
            };

            await taskRepository.remove(task);

            // Kafka-তে "taskDeleted" ইভেন্ট পাঠানো, new_value হিসেবে null
            await sendTaskUpdateToKafka("taskDeleted", { id: taskId, createdBy: { id: task.createdBy.id } }, previousData);

            return res.status(200).json({ data: null, message: "Task deleted successfully" });
        } catch (error) {
            console.error("Error in deleteTask:", error);
            return res.status(500).json({ data: null, message: "Server error" });
        }
    },

};
