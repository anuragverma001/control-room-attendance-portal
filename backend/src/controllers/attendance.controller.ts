import { Request, Response } from "express";
import { AttendanceService } from "../services/attendance.service";

export class AttendanceController {
  static async checkIn(
    req: Request,
    res: Response
  ) {
    try {
      const attendance =
        await AttendanceService.checkIn(
          req.body
        );

      return res.status(201).json({
        success: true,
        data: attendance,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async checkOut(
    req: Request,
    res: Response
  ) {
    try {
      const { id } = req.params;

      const attendance =
        await AttendanceService.checkOut(
          id as string
        );

      return res.status(200).json({
        success: true,
        data: attendance,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getAllAttendance(
    req: Request,
    res: Response
  ) {
    try {
      const attendance =
        await AttendanceService.getAllAttendance();

      return res.status(200).json({
        success: true,
        data: attendance,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}