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

const employee =
  await prisma.employee.findUnique({
    where: {
      userId: user.id,
    },
  });

console.log("LOGIN EMPLOYEE:", employee);

return {
  user,
  employeeId: employee?.id || null,
  token,
};

}

static async login(data: {
  email: string;
  password: string;
}) {
  console.log("EMAIL:", data.email);

  const user = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  console.log("USER:", user);

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isPasswordValid = await bcrypt.compare(
    data.password,
    user.password
  );

  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  const token = generateToken(
    user.id,
    user.role
  );

  const employee =
    await prisma.employee.findUnique({
      where: {
        userId: user.id,
      },
    });

  console.log("LOGIN EMPLOYEE:", employee);

  return {
    user,
    employeeId: employee?.id || null,
    token,
  };
}
}
