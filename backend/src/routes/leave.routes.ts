import { Router } from "express";
import { LeaveController } from "../controllers/leave.controller";

const router = Router();

router.post(
  "/apply",
  LeaveController.applyLeave
);

router.get(
  "/list",
  LeaveController.getAllLeaves
);

router.get(
  "/pending",
  LeaveController.getPendingLeaves
);

router.get(
  "/employee/:employeeId",
  LeaveController.getLeaveByEmployee
);

router.put(
  "/approve/:id",
  LeaveController.approveLeave
);

router.put(
  "/reject/:id",
  LeaveController.rejectLeave
);

export default router;
