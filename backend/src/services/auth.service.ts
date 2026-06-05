import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";
import { generateToken } from "../utils/jwt";

export class AuthService {
  static async registerAdmin(data: {
    email: string;
    password: string;
  }) {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword =
      await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        role: "HR_ADMIN",
      },
    });

    const token = generateToken(
      user.id,
      user.role
    );

    return {
      user,
      token,
    };
  }
}