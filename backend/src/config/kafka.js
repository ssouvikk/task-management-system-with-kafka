//src/config/kafka.js
const { Kafka } = require("kafkajs");
require("dotenv").config(); // Loading environment variables from .env

// Creating Kafka instance
const kafka = new Kafka({ brokers: [process.env.KAFKA_BROKER] });

// Creating producer
const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "task_group" });

const connectKafka = async () => {
  await producer.connect();
  await consumer.connect();
  console.log("🔗 Kafka Connected");
};

connectKafka();

module.exports = { kafka, producer, consumer, connectKafka };
