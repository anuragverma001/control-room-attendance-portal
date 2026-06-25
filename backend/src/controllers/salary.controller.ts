import { Request, Response } from "express";
import { SalaryService } from "../services/salary.service";

export class SalaryController {
  static async createSalary(
    req: Request,
    res: Response
  ) {
    try {
      const salary =
        await SalaryService.createSalary(req.body);

      res.status(201).json({
        success: true,
        data: salary,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async updateSalary(
    req: Request,
    res: Response
  ) {
    try {
      const salary =
        await SalaryService.updateSalary(
          req.params.employeeId as string,
          req.body
        );

      res.json({
        success: true,
        data: salary,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getSalaryByEmployee(
    req: Request,
    res: Response
  ) {
    try {
      const salary =
        await SalaryService.getSalaryByEmployee(
          req.params.employeeId as string
        );

      res.json({
        success: true,
        data: salary,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getAllSalary(
    req: Request,
    res: Response
  ) {
    try {
      const salary =
        await SalaryService.getAllSalary();

      res.json({
        success: true,
        data: salary,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}
