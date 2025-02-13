import { AppDataSource } from "../config/db";
import { User } from "../models/user.entity";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt.utils";

export class AuthService {
  // রেজিস্টার ফাংশন
  static async register(email: string, password: string) {
    const userRepository = AppDataSource.getRepository(User);
    const existingUser = await userRepository.findOneBy({ email });
    if (existingUser) throw new Error("User already exists");

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = userRepository.create({ email, password: hashedPassword });
    await userRepository.save(user);

    return generateToken({ id: user.id, role: user.role });
  }

  // লগইন ফাংশন
  static async login(email: string, password: string) {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ email });
    if (!user) throw new Error("Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid credentials");

    return generateToken({ id: user.id, role: user.role });
  }
}
