// src/services/taskConsumer.js
const { consumer } = require('../config/kafka');
const connectedClients = require('../config/socketClients');
const { AppDataSource } = require('../config/db');
const { TaskHistory } = require('../models/taskHistory.entity'); // TaskHistory মডেল ফাইল অনুযায়ী
const WebSocket = require("ws")

const startConsumer = async () => {
    await consumer.subscribe({ topic: 'task-updates', fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const taskUpdate = JSON.parse(message.value.toString());
            console.log(`Received task update:`, taskUpdate);

            // Task history টেবিলে লগ সংরক্ষণ করা
            try {
                const historyRepository = AppDataSource.getRepository(TaskHistory);
                const newHistory = historyRepository.create({
                    taskId: taskUpdate.taskId,
                    event: taskUpdate.event,
                    status: taskUpdate.status,
                    timestamp: new Date(),
                });
                await historyRepository.save(newHistory);
            } catch (err) {
                console.error("Error saving task history:", err);
            }

            // সংশ্লিষ্ট ইউজারের WebSocket এর মাধ্যমে নোটিফাই করা
            const client = connectedClients.get(taskUpdate.userId);
            // if (client && client.readyState === client.OPEN) {
            if (client && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(taskUpdate));
            }
        },
    });
};

module.exports = startConsumer;
