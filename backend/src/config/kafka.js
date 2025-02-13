const { Kafka } = require("kafkajs");
require("dotenv").config(); // .env থেকে পরিবেশ ভেরিয়েবল লোড করা

// Kafka instance তৈরি করা হচ্ছে। 
const kafka = new Kafka({ brokers: [process.env.KAFKA_BROKER] });

// Producer তৈরি করা
const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "task_group" });

const connectKafka = async () => {
  await producer.connect();
  await consumer.connect();
  console.log("🔗 Kafka Connected");
};

connectKafka();


module.exports = {
  producer, consumer
}