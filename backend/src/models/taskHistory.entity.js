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
      type: "varchar", // For example: 'status_change', 'title_change', etc.
    },
    previous_value: {
      type: "json",  // Store the previous value as JSON
      nullable: true,
    },
    new_value: {
      type: "json",  // Store the new value as JSON
      nullable: true,
    },
    timestamp: {
      type: "timestamp",
      createDate: true,
    },
  },
  // If needed, a relation can be added, for example, to create a relation for task_id with the Task entity
});

module.exports = { TaskHistory };
