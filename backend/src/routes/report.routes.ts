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

router.get(
  "/employee/:employeeId",
  ReportController.getEmployeeAttendanceHistory
);
router.get(
  "/attendance/late",
  ReportController.getLateComingReport
);

export default router;
