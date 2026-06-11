import { Router } from "express";
import { EmployeeController } from "../controllers/employee.controller";

const router = Router();

router.post(
  "/create",
  EmployeeController.createEmployee
);

router.get(
  "/list",
  EmployeeController.getAllEmployees
);

router.get(
  "/:id",
  EmployeeController.getEmployeeById
);
router.put(
  "/:id",
  EmployeeController.updateEmployee
);
router.delete(
  "/:id",
  EmployeeController.deleteEmployee
);
export default router;