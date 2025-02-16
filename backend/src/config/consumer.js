// consumer.js
const { Kafka } = require('kafkajs');
const WebSocket = require('ws');

// Creating Kafka instance
const kafka = new Kafka({
  brokers: [process.env.KAFKA_BROKER]
});

// Creating consumer using group id 'task_group'
const consumer = kafka.consumer({ groupId: 'task_group' });

// Setting up WebSocket server (using port from SOCKET_PORT)
const wss = new WebSocket.Server({ port: process.env.SOCKET_PORT });

wss.on('connection', (ws) => {
  console.log('New WebSocket connection established');
});

// Function to broadcast messages to all connected clients
function broadcastMessage(message) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

// Demo: Function to log into Task history table
// In a real environment, perform database operations here
async function logTaskHistory(taskEvent) {
  // For example, code to insert taskEvent into the database would be here
  console.log('Task History Log:', taskEvent);
}

// Function to start the consumer
async function runConsumer() {
  await consumer.connect();
  // Subscribing to the 'task_updates' topic
  await consumer.subscribe({ topic: 'task_updates', fromBeginning: true });
  console.log('Kafka Consumer connected and subscribed to topic: task_updates');

  // Processing each message
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      // Converting message to JSON
      const taskEvent = JSON.parse(message.value.toString());
      console.log(`Received message: ${taskEvent.eventType} for Task ID: ${taskEvent.taskId}`);

      // Logging into Task history table (to store in database)
      await logTaskHistory(taskEvent);

      // Sending real-time notification through WebSocket
      broadcastMessage(taskEvent);
    },
  });
}

// Starting consumer
runConsumer();

module.exports = { wss };
