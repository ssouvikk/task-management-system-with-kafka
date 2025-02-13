import { Kafka } from "kafkajs";
import dotenv from "dotenv";
dotenv.config();

// Kafka instance তৈরি করা হচ্ছে। 
const kafka = new Kafka({ brokers: [process.env.KAFKA_BROKER] });

// Producer তৈরি করা
export const producer = kafka.producer();
export const consumer = kafka.consumer({ groupId: "task_group" });

const connectKafka = async () => {
  await producer.connect();
  await consumer.connect();
  console.log("🔗 Kafka Connected");
};

connectKafka();
