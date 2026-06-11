import { Request, Response } from "express";
import { EmployeeService } from "../services/employee.service";

export class EmployeeController {
static async createEmployee(
req: Request,
res: Response
) {
try {
const employee =
await EmployeeService.createEmployee(
req.body
);

  return res.status(201).json({
    success: true,
    data: employee,
  });
} catch (error: any) {
  console.error(
    "CREATE EMPLOYEE ERROR:",
    error
  );

  return res.status(400).json({
    success: false,
    message: error.message,
  });
}

}

static async getAllEmployees(
req: Request,
res: Response
) {
try {
const employees =
await EmployeeService.getAllEmployees();

  return res.status(200).json({
    success: true,
    data: employees,
  });
} catch (error: any) {
  return res.status(400).json({
    success: false,
    message: error.message,
  });
}

}

static async getEmployeeById(
req: Request,
res: Response
) {
try {
const { id } = req.params;

const employee = await EmployeeService.getEmployeeById(
  id as string
);

  return res.status(200).json({
    success: true,
    data: employee,
  });
} catch (error: any) {
  return res.status(400).json({
    success: false,
    message: error.message,
  });
}
}
static async updateEmployee(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params;

    const employee =
      await EmployeeService.updateEmployee(
        id as string,
        req.body
      );

    return res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}
static async deleteEmployee(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params;

    const employee =
      await EmployeeService.deleteEmployee(
        id as string
      );

    return res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}
}