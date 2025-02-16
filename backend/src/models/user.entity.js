// src/models/user.entity.js
const { EntitySchema } = require("typeorm");

const User = new EntitySchema({
  name: "User", // Name of the entity
  target: "User", // Name of the model
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    username: {
      type: "varchar",
      unique: true, // Each user's username will be unique
    },
    email: {
      type: "varchar",
      unique: true,
    },
    password: {
      type: "varchar",
    },
    role: {
      type: "varchar",
      default: "user",
    },
  },
  relations: {
    tasks: {
      target: "Task",
      type: "one-to-many",
      inverseSide: "createdBy",
    },
  },
});

module.exports = { User };
v