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
    assignedTo: {
      type: "varchar",
      nullable: true,
    },
    createdAt: {
      type: "timestamp",
      createDate: true, // Automatically set creation date
    },
    updatedAt: {
      type: "timestamp",
      updateDate: true, // Automatically set update date
    },
  },
  relations: {
    // The task's creator is related to the User entity
    createdBy: {
      target: "User",
      type: "many-to-one",
      joinColumn: true, // Will create a foreign key column
      onDelete: "CASCADE", // If the user is deleted, their tasks will also be deleted
    },
  },
});

module.exports = {
  Task,
  TaskPriority,
  TaskStatus,
};
