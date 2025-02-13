import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number; // '!' ব্যবহার করে বলে দিচ্ছি যে, পরে এই প্রপার্টি অবশ্যই ইনিশিয়ালাইজ হবে

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ default: "user" })
  role!: string;
}
