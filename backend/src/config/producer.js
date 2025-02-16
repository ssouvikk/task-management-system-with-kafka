// producer.js
const { Kafka } = require('kafkajs');

// Creating Kafka instance
const kafka = new Kafka({
  brokers: [process.env.KAFKA_BROKER]
});

// Creating producer
const producer = kafka.producer();

// Connecting producer to Kafka broker
async function runProducer() {
  await producer.connect();
  console.log('Kafka Producer connected.');
}

// Starting producer
runProducer();

// Function: Publish task event
// The message parameter will include task information such as eventType, taskId, etc.
function publishTaskUpdate(message) {
  producer.send({
    topic: 'task_updates', // Kafka topic where the task update message will be published
    messages: [
      { value: JSON.stringify(message) }
    ]
  })
    .then(() => console.log('Message published:', message))
    .catch(err => console.error('Error publishing message:', err));
}

// Exports: This function can be used in other modules
module.exports = { publishTaskUpdate };
