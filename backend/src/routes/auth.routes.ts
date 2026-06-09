import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

const router = Router();

router.get("/test", (req, res) => {
res.json({
success: true,
message: "Auth Route Working",
});
});

router.post(
"/register-admin",
AuthController.registerAdmin
);

router.post(
"/login",
AuthController.login
);

export default router;
