const { EntitySchema } = require("typeorm");

const User = new EntitySchema({
  name: "User", // Entity এর নাম
  target: "User", // Model এর নাম (Dynamic ORM mapping এর জন্য)
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true, // স্বয়ংক্রিয়ভাবে আইডি তৈরি হবে
    },
    email: {
      type: "varchar",
      unique: true, // প্রতিটি ইউজারের ইমেইল ইউনিক হবে
    },
    password: {
      type: "varchar",
    },
    role: {
      type: "varchar",
      default: "user", // ডিফল্ট ভ্যালু হিসেবে "user"
    },
  },
  // যদি আপনার relation (উদাহরণস্বরূপ, User এর অনেক Task থাকে) প্রয়োজন হয়:
  relations: {
    tasks: {
      target: "Task", // Task Entity এর নাম
      type: "one-to-many",
      inverseSide: "createdBy", // Task এ relation এর নাম
    },
  },
});

module.exports = { User };
