import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id

  @Column({ unique: true })
  email

  @Column()
  password

  @Column({ default: "user" })
  role
}
