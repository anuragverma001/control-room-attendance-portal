import { Router } from "express";
import { AttendanceController } from "../controllers/attendance.controller";

const router = Router();

router.post(
  "/check-in",
  AttendanceController.checkIn
);

router.put(
  "/check-out/:id",
  AttendanceController.checkOut
);

router.get(
  "/list",
  AttendanceController.getAllAttendance
);

router.get(
  "/today",
  AttendanceController.getTodayAttendance
);
router.get(
  "/employee/:employeeId",
  AttendanceController.getAttendanceByEmployee
);
router.get(
  "/monthly/:employeeId",
  AttendanceController.getMonthlyAttendance
);
export default router;
