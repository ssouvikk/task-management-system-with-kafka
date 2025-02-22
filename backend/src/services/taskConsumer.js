// src/services/taskConsumer.js
const { consumer } = require('../config/kafka');
const { AppDataSource } = require('../config/db');
const { TaskHistory } = require('../models/taskHistory.entity');

const startConsumer = async () => {
    await consumer.subscribe({ topic: 'task-updates', fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const taskUpdate = JSON.parse(message.value.toString());
            console.log(`Received task update:`, taskUpdate);

            try {
                const historyRepository = AppDataSource.getRepository(TaskHistory);
                const newHistory = historyRepository.create({
                    taskId: taskUpdate.taskId,
                    change_type: taskUpdate.change_type,
                    previous_value: taskUpdate.previous_value,
                    new_value: taskUpdate.new_value,
                    timestamp: new Date(),
                });
                await historyRepository.save(newHistory);
            } catch (err) {
                console.error("Error saving task history:", err);
            }
        },
    });
};

module.exports = startConsumer;
