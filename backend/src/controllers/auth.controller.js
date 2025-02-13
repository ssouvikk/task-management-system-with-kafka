import bcrypt from "bcryptjs";
import { AppDataSource } from "../config/db";
import { User } from "../models/user.entity";
import { generateToken } from "../utils/jwt.utils";

export const register = async (req, res) => {
    const { email, password } = req.body;
    const userRepository = AppDataSource.getRepository(User);

    const existingUser = await userRepository.findOneBy({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = userRepository.create({ email, password: hashedPassword });
    await userRepository.save(user);

    res.status(201).json({ token: generateToken({ id: user.id, role: user.role }) });
};
