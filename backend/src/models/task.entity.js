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
    assignedUser: {
      target: "User",
      type: "many-to-one",
      joinColumn: true,
      nullable: true,
    },
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
    // The task's creator is related to the User entity
    createdBy: {
      target: "User",
      type: "many-to-one",
      joinColumn: true,
      onDelete: "CASCADE",
    },
  },
});

module.exports = {
  Task,
  TaskPriority,
  TaskStatus,
};
