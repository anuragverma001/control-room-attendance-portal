import { Request, Response } from "express";
import { PayrollService } from "../services/payroll.service";

export class PayrollController {

  static async generatePayroll(
    req: Request,
    res: Response
  ) {
    try {
      const { employeeId, month, year } = req.body;

      const payroll =
        await PayrollService.generatePayroll(
          employeeId,
          Number(month),
          Number(year)
        );

      return res.status(201).json({
        success: true,
        data: payroll,
      });

    } catch (error: any) {

      return res.status(400).json({
        success: false,
        message: error.message,
      });

    }
  }

  static async generateAllPayrolls(
    req: Request,
    res: Response
  ) {
    try {
      const { month, year } = req.body;

      const result =
        await PayrollService.generatePayrollForAllEmployees(
          Number(month),
          Number(year)
        );

      return res.status(200).json(result);

    } catch (error: any) {

      return res.status(400).json({
        success: false,
        message: error.message,
      });

    }
  }

  static async getAllPayrolls(
    req: Request,
    res: Response
  ) {
    try {

      const page =
        Number(req.query.page) || 1;

      const limit =
        Number(req.query.limit) || 10;

      const month =
        req.query.month
          ? Number(req.query.month)
          : undefined;

      const year =
        req.query.year
          ? Number(req.query.year)
          : undefined;

      const employeeId =
        req.query.employeeId as string;

      const result =
        await PayrollService.getAllPayrolls(
          page,
          limit,
          month,
          year,
          employeeId
        );

      return res.status(200).json(result);

    } catch (error: any) {

      return res.status(400).json({
        success: false,
        message: error.message,
      });

    }
  }

  static async getPayrollById(
    req: Request,
    res: Response
  ) {
    try {

      const result =
      await PayrollService.getPayrollById(
        String(req.params.id)
      );

      return res.status(200).json(result);

    } catch (error: any) {

      return res.status(404).json({
        success: false,
        message: error.message,
      });

    }
  }

  static async markAsPaid(
    req: Request,
    res: Response
  ) {
    try {

      const result =
      await PayrollService.markAsPaid(
        String(req.params.id)
      );

      return res.status(200).json(result);

    } catch (error: any) {

      return res.status(400).json({
        success: false,
        message: error.message,
      });

    }
  }
}
