// producer.js
const { Kafka } = require('kafkajs');

// Kafka instance তৈরি করা হচ্ছে। 
const kafka = new Kafka({
  brokers: [process.env.KAFKA_BROKER]
});

// Producer তৈরি করা
const producer = kafka.producer();

// Producer কে Kafka ব্রোকারের সাথে কানেক্ট করা
async function runProducer() {
  await producer.connect();
  console.log('Kafka Producer connected.');
}

// Producer চালু করা
runProducer();

// ফাংশন: টাস্ক ইভেন্ট পাবলিশ করা
// message parameter এ টাস্কের তথ্য পাঠানো হবে যেমন eventType, taskId, ইত্যাদি।
function publishTaskUpdate(message) {
  producer.send({
    topic: 'task_updates', // Kafka topic যেখানে টাস্ক আপডেটের মেসেজ পাবলিশ হবে
    messages: [
      { value: JSON.stringify(message) }
    ]
  })
  .then(() => console.log('Message published:', message))
  .catch(err => console.error('Error publishing message:', err));
}

// Exports: অন্য মডিউল থেকে এই ফাংশনটি ব্যবহার করা যাবে
module.exports = { publishTaskUpdate };
