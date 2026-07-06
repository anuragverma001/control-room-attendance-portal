import { Router } from "express";
import { PayrollController } from "../controllers/payroll.controller";

const router = Router();

router.post(
  "/generate",
  PayrollController.generatePayroll
);

router.post(
  "/generate-all",
  PayrollController.generateAllPayrolls
);

router.get(
  "/list",
  PayrollController.getAllPayrolls
);

router.get(
  "/:id",
  PayrollController.getPayrollById
);

router.put(
  "/paid/:id",
  PayrollController.markAsPaid
);

export default router;
