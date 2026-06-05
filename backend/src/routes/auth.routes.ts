import { Router } from "express";

const router = Router();

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Auth Route Working",
  });
});

export default router;
