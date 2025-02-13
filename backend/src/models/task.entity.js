// src/models/task.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
  } from "typeorm";
  import { User } from "./user.entity"; // ধরে নিচ্ছি user.entity.ts পূর্বে তৈরি আছে
  
  // টাস্কের প্রায়োরিটি ও স্ট্যাটাস এর জন্য enum ডিফাইন করা
  export const TaskPriority = {
    LOW : "Low",
    MEDIUM : "Medium",
    HIGH : "High",
  }
  
  export const TaskStatus = {
    TODO : "To Do",
    IN_PROGRESS : "In Progress",
    DONE : "Done",
  }
  
  @Entity()
  export class Task {
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
  