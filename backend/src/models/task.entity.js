// src/models/task.entity.ts
const {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} = require("typeorm");

const { User } = require("./user.entity"); // ধরে নিচ্ছি user.entity.ts পূর্বে তৈরি আছে


const TaskPriority = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
}

const TaskStatus = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
}
// টাস্কের প্রায়োরিটি ও স্ট্যাটাস এর জন্য enum ডিফাইন করা

@Entity()
class Task {
  @PrimaryGeneratedColumn()
  id;

  @Column()
  title

  @Column({ nullable: true })
  description

  @Column({
    type: "enum",
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority

  @Column({
    type: "enum",
    enum: TaskStatus,
    default: TaskStatus.TODO,
  })
  status

  @Column({ type: "timestamp", nullable: true })
  dueDate

  // টাস্কটি কোন ইউজার তৈরি করেছেন
  @ManyToOne(() => User, (user) => user.tasks)
  createdBy

  @CreateDateColumn()
  createdAt

  @UpdateDateColumn()
  updatedAt
}


module.exports = {
  Task, TaskPriority, TaskStatus
}