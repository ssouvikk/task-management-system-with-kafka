// src/services/taskConsumer.js
const { consumer } = require('../config/kafka');

const startConsumer = async () => {
    await consumer.subscribe({ topic: 'task-updates', fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const taskUpdate = JSON.parse(message.value.toString());
            console.log(`Received task update:`, taskUpdate);

            // এখানে টাস্ক পরিবর্তনের হিস্ট্রি ডাটাবেজে সংরক্ষণ করুন (History Table)
            const historyRepository = AppDataSource.getRepository(TaskHistory);
            const newHistory = historyRepository.create({
                taskId: taskUpdate.taskId,
                event: taskUpdate.event,
                status: taskUpdate.status,
                timestamp: new Date(),
            });

            await historyRepository.save(newHistory);

            // সংশ্লিষ্ট ইউজারদের WebSocket এর মাধ্যমে নোটিফাই করা
            const client = connectedClients.get(taskUpdate.userId);
            if (client && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(taskUpdate));
            }
        },
    });
};

module.exports = startConsumer;
