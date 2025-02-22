// src/models/task.entity.js
const { EntitySchema } = require("typeorm");

// Enum values for Task Priority and Status
const TaskPriority = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

const TaskStatus = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

const Task = new EntitySchema({
  name: "Task",
  target: "Task",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    title: {
      type: "varchar",
    },
    description: {
      type: "text",
      nullable: true,
    },
    priority: {
      type: "enum",
      enum: Object.values(TaskPriority),
      default: TaskPriority.MEDIUM,
    },
    status: {
      type: "enum",
      enum: Object.values(TaskStatus),
      default: TaskStatus.TODO,
    },
    dueDate: {
      type: "timestamp",
      nullable: true,
    },
    // assignedUser ফিল্ডটি এখন "relations" এ থাকবে, "columns" এ নয়
    createdAt: {
      type: "timestamp",
      createDate: true,
    },
    updatedAt: {
      type: "timestamp",
      updateDate: true,
    },
  },
  relations: {
    // Task-এর creator relation
    createdBy: {
      target: "User",
      type: "many-to-one",
      joinColumn: true,
      onDelete: "CASCADE",
    },
    // assignedUser relation: Task কে যেই ইউজারকে অ্যাসাইন করা হয়েছে, তা নির্দেশ করে
    assignedUser: {
      target: "User",
      type: "many-to-one",
      joinColumn: true,
      nullable: true,
    },
  },
});

module.exports = {
  Task,
  TaskPriority,
  TaskStatus,
};
