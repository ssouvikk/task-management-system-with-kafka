// src/models/user.entity.js
const { EntitySchema } = require("typeorm");

const User = new EntitySchema({
  name: "User", // Entity এর নাম
  target: "User", // Model এর নাম
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true,
    },
    username: {
      type: "varchar",
      unique: true, // প্রতিটি ইউজারের username ইউনিক হবে
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
