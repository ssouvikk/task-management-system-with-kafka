const { EntitySchema } = require("typeorm");

// Task এর প্রাধান্য (Priority) ও স্ট্যাটাস (Status) এর জন্য enum এর মত ভ্যালুসমূহ
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
      createDate: true, // স্বয়ংক্রিয়ভাবে তৈরি হওয়ার তারিখ
    },
    updatedAt: {
      type: "timestamp",
      updateDate: true, // স্বয়ংক্রিয়ভাবে আপডেট হওয়ার তারিখ
    },
  },
  relations: {
    // Task এর মালিক (creator) কে User এর সাথে relation করা হয়েছে
    createdBy: {
      target: "User",
      type: "many-to-one",
      joinColumn: true, // foreign key column তৈরি করবে
      onDelete: "CASCADE", // ইউজার ডিলিট হলে তার Task গুলোও ডিলিট হবে
    },
  },
});

module.exports = {
  Task,
  TaskPriority,
  TaskStatus,
};
