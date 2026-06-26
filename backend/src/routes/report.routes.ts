import { Router } from "express";
import { ReportController } from "../controllers/report.controller";

const router = Router();

router.get(
  "/attendance/daily",
  ReportController.getDailyAttendanceReport
);

router.get(
  "/attendance/monthly",
  ReportController.getMonthlyAttendanceReport
);

export default router;
