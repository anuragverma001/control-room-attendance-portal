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

export default router;
