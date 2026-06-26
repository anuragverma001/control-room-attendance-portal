import { Request, Response } from "express";
import { ReportService } from "../services/report.service";

export class ReportController {

  static async getDailyAttendanceReport(
    req: Request,
    res: Response
  ) {
    try {

      const date = req.query.date
        ? new Date(req.query.date as string)
        : new Date();

      const report =
        await ReportService.getDailyAttendanceReport(
          date
        );

      return res.status(200).json({
        success: true,
        data: report
      });

    } catch (error: any) {

      return res.status(500).json({
        success: false,
        message: error.message
      });

    }
  }
  static async getMonthlyAttendanceReport(
    req: Request,
    res: Response
  ) {
    try {
  
      const month = Number(req.query.month);
      const year = Number(req.query.year);
  
      if (!month || !year) {
        return res.status(400).json({
          success: false,
          message: "month and year are required"
        });
      }
  
      const report =
        await ReportService.getMonthlyAttendanceReport(
          month,
          year
        );
  
      return res.status(200).json({
        success: true,
        data: report
      });
  
    } catch (error: any) {
  
      return res.status(500).json({
        success: false,
        message: error.message
      });
  
    }
  }
  static async getEmployeeAttendanceHistory(
    req: Request,
    res: Response
  ) {
    try {
  
      const employeeId = String(req.params.employeeId);
  
      const report =
        await ReportService.getEmployeeAttendanceHistory(
          employeeId
        );
  
      return res.status(200).json({
        success: true,
        data: report
      });
  
    } catch (error: any) {
  
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  static async getLateComingReport(
    req: Request,
    res: Response
  ) {
    try {
  
      const report =
        await ReportService.getLateComingReport();
  
      return res.status(200).json({
        success: true,
        data: report
      });
  
    } catch (error: any) {
  
      return res.status(500).json({
        success: false,
        message: error.message
      });
  
    }
}
}

