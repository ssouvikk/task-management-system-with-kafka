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
    event: {
      type: "varchar",
    },
    status: {
      type: "varchar",
      nullable: true,
    },
    timestamp: {
      type: "timestamp",
      createDate: true, // রেকর্ড তৈরির সময় স্বয়ংক্রিয়ভাবে সেট হবে
    },
  },
  // যদি Relation যোগ করতে চান, তবে এখানে যোগ করুন
});

module.exports = { TaskHistory };
