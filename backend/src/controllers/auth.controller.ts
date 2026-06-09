import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

export class AuthController {
static async registerAdmin(
req: Request,
res: Response
) {
try {
const { email, password } = req.body;

  const user = await AuthService.registerAdmin({
    email,
    password,
  });

  return res.status(201).json({
    success: true,
    data: user,
  });
} catch (error: any) {
  console.error("LOGIN ERROR:", error);

    return res.status(400).json({
    success: false,
    message: error.message,
  });
}
}

static async login(
req: Request,
res: Response
) {
try {
const { email, password } = req.body;

  const result = await AuthService.login({
    email,
    password,
  });

  return res.status(200).json({
    success: true,
    data: result,
  });
} catch (error: any) {
  return res.status(400).json({
    success: false,
    message: error.message,
  });
}

}
}
