// src/controllers/task.controller.ts
const { AppDataSource } = require("../config/db");
const { Task, TaskPriority, TaskStatus } = require("../models/task.entity");
const { producer } = require("../config/kafka");


const sendTaskUpdateToKafka = async (event, task) => {
    await producer.send({
        topic: 'task-updates',
        messages: [
            {
                key: String(task.id),
                value: JSON.stringify({
                    event,
                    taskId: task.id,
                    title: task.title,
                    status: task.status,
                    updatedAt: new Date(),
                }),
            },
        ],
    });
};


module.exports = {

    /**
     * ১. নতুন টাস্ক তৈরি করা
     * - ইনপুট ভ্যালিডেশন: title চেক করা হচ্ছে; priority ও status এর মান যাচাই করা হচ্ছে।
     * - JWT middleware থেকে প্রাপ্ত req.user ব্যবহার করে task.createdBy ফিল্ড সেট করা।
     */
    createTask: async (req, res) => {
        try {
            const { title, description, priority, status, dueDate } = req.body;
            if (!title) {
                return res.status(400).json({ message: "Title is required" });
            }
            // priority ও status এর সঠিকতা যাচাই
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
                createdBy: req.user, // req.user middleware দ্বারা সেট করা হয়েছে
            });

            await taskRepository.save(newTask);

            // Kafka তে মেসেজ পাঠানো
            await sendTaskUpdateToKafka("taskCreated", newTask);

            res.status(201).json(newTask);
        } catch (error) {
            console.error("Error in createTask:", error);
            res.status(500).json({ message: "Server error" });
        }
    },

    /**
     * ২. ইউজার-সুনির্দিষ্ট টাস্ক রিট্রিভ করা
     * - ফিল্টার হিসেবে priority, status, ও dueDate URL query parameters হিসেবে নেওয়া হচ্ছে।
     * - শুধুমাত্র ওই ইউজারের টাস্ক দেখানো হচ্ছে।
     */
    getTasks: async (req, res) => {
        try {
            const { priority, status, dueDate } = req.query;
            const taskRepository = AppDataSource.getRepository(Task);

            // QueryBuilder ব্যবহার করে টাস্ক ফিল্টার করা
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
     * - টাস্কের মালিকানা যাচাই করা হচ্ছে: যদি টাস্কের মালিক না হন বা ইউজারের role "admin" না হয়, তবে আপডেট অনুমোদিত হবে না।
     */
    updateTask: async (req, res) => {
        try {
            const taskId = Number(req.params.id);
            const { title, description, priority, status, dueDate } = req.body;

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
            // Role-based access control: শুধুমাত্র task owner বা admin আপডেট করতে পারবে
            if (task.createdBy.id !== req.user.id && req.user.role !== "admin") {
                return res.status(403).json({ message: "Not authorized to update this task" });
            }

            // ফিল্ডগুলো আপডেট করা হচ্ছে, যদি নতুন মান প্রদান করা হয়
            if (title !== undefined) task.title = title;
            if (description !== undefined) task.description = description;
            if (priority !== undefined) task.priority = priority;
            if (status !== undefined) task.status = status;
            if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;

            await taskRepository.save(task);

            // Kafka তে মেসেজ পাঠানো
            await sendTaskUpdateToKafka("taskUpdated", task);

            res.status(200).json(task);
        } catch (error) {
            console.error("Error in updateTask:", error);
            res.status(500).json({ message: "Server error" });
        }
    },

    /**
     * ৪. টাস্ক মুছে ফেলা
     * - টাস্কের মালিকানা যাচাই করা হচ্ছে: শুধুমাত্র task owner বা admin ডিলিট করতে পারবেন।
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
            // Role-based access control: শুধুমাত্র task owner বা admin ডিলিট করতে পারবেন
            if (task.createdBy.id !== req.user.id && req.user.role !== "admin") {
                return res.status(403).json({ message: "Not authorized to delete this task" });
            }

            await taskRepository.remove(task);

            // Kafka তে মেসেজ পাঠানো
            await sendTaskUpdateToKafka("taskDeleted", { id: taskId });

            res.status(200).json({ message: "Task deleted successfully" });
        } catch (error) {
            console.error("Error in deleteTask:", error);
            res.status(500).json({ message: "Server error" });
        }
    },

}
