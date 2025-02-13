// consumer.js
const { Kafka } = require('kafkajs');
const WebSocket = require('ws');

// Kafka instance তৈরি করা হচ্ছে
const kafka = new Kafka({
  brokers: [process.env.KAFKA_BROKER]
});

// Consumer তৈরি করা হচ্ছে, গ্রুপ আইডি 'task_group' ব্যবহার করে
const consumer = kafka.consumer({ groupId: 'task_group' });

// WebSocket সার্ভার সেটআপ (পোর্ট 8080 ব্যবহার করা হয়েছে)
const wss = new WebSocket.Server({ port: process.env.SOCKET_PORT });

wss.on('connection', (ws) => {
  console.log('নতুন WebSocket কানেকশন স্থাপিত হয়েছে');
});

// সকল কানেক্টেড ক্লায়েন্টকে মেসেজ পাঠানোর জন্য ফাংশন
function broadcastMessage(message) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

// ডেমো: Task history table এ লগ করার ফাংশন
// বাস্তব পরিবেশে এখানে ডাটাবেজ অপারেশন করবেন
async function logTaskHistory(taskEvent) {
  // উদাহরণস্বরূপ, ডাটাবেজে taskEvent insert করার কোড থাকবে এখানে
  console.log('Task History Log:', taskEvent);
}

// Consumer চালু করার ফাংশন
async function runConsumer() {
  await consumer.connect();
  // 'task_updates' topic এ সাবস্ক্রাইব করা হচ্ছে
  await consumer.subscribe({ topic: 'task_updates', fromBeginning: true });
  console.log('Kafka Consumer connected and subscribed to topic: task_updates');

  // প্রতিটি মেসেজ প্রক্রিয়া করার জন্য
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      // মেসেজটি JSON এ রূপান্তর করা হচ্ছে
      const taskEvent = JSON.parse(message.value.toString());
      console.log(`Received message: ${taskEvent.eventType} for Task ID: ${taskEvent.taskId}`);

      // Task history table এ লগ করা (ডাটাবেজে সংরক্ষণ করার জন্য)
      await logTaskHistory(taskEvent);

      // WebSocket এর মাধ্যমে রিয়েল-টাইম নোটিফিকেশন পাঠানো হচ্ছে
      broadcastMessage(taskEvent);
    },
  });
}

// Consumer চালু করা
runConsumer();

module.exports = { wss };
