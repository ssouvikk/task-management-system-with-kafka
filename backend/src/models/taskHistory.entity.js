// src/models/taskHistory.entity.js
const { EntitySchema } = require("typeorm");

const TaskHistory = new EntitySchema({
  name: "TaskHistory",
  target: "TaskHistory",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    taskId: {
      type: "int",
    },
    change_type: {
      type: "varchar", // উদাহরণস্বরূপ: 'status_change', 'title_change' ইত্যাদি
    },
    previous_value: {
      type: "json",  // পূর্ববর্তী মান JSON হিসেবে সংরক্ষণ
      nullable: true,
    },
    new_value: {
      type: "json",  // নতুন মান JSON হিসেবে সংরক্ষণ
      nullable: true,
    },
    timestamp: {
      type: "timestamp",
      createDate: true,
    },
  },
  // Relation যোগ করতে চাইলে, উদাহরণস্বরূপ task_id এর জন্য Task Entity রিলেশন তৈরি করা যেতে পারে
});

module.exports = { TaskHistory };
