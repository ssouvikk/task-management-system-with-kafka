const { Entity, PrimaryGeneratedColumn, Column } = require("typeorm");

@Entity()
class User {
  @PrimaryGeneratedColumn()
  id

  @Column({ unique: true })
  email

  @Column()
  password

  @Column({ default: "user" })
  role
}

module.exports = { User }