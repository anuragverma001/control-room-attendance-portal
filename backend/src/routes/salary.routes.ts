import { Router } from "express";
import { SalaryController } from "../controllers/salary.controller";

const router = Router();

router.post(
  "/create",
  SalaryController.createSalary
);

router.put(
  "/update/:employeeId",
  SalaryController.updateSalary
);

router.get(
  "/list",
  SalaryController.getAllSalary
);

router.get(
  "/:employeeId",
  SalaryController.getSalaryByEmployee
);

export default router;
