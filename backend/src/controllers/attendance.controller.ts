import { Request, Response } from "express";
import { AttendanceService } from "../services/attendance.service";

export class AttendanceController {
  static async checkIn(
    req: Request,
    res: Response
  ) {
    try {
  
      const attendance =
        await AttendanceService.checkIn({
          employeeId:
            req.body.employeeId,
  
          checkInLatitude:
            Number(req.body.latitude),
  
          checkInLongitude:
            Number(req.body.longitude),
  
          checkInSelfie:
            (req as any).file?.path,
            faceVerified:
  req.body.faceVerified === "true" ||
  req.body.faceVerified === true,

faceScore:
  Number(req.body.faceScore),

        });
  
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
      const id =
        req.params.id as string;

      const attendance =
        await AttendanceService.checkOut(
          id
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

  static async getTodayAttendance(
    req: Request,
    res: Response
  ) {
    try {
      const data =
        await AttendanceService.getTodayAttendance();

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getAttendanceByEmployee(
    req: Request,
    res: Response
  ) {
    try {
      const employeeId =
        req.params.employeeId as string;

      const attendance =
  await AttendanceService.getAttendanceByEmployee(
    employeeId
  );

return res.status(200).json({
  success: true,
  data: attendance,
});
    }catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
  static async getMonthlyAttendance(
    req: Request,
    res: Response
  ) {
    try {
      const employeeId =
        req.params.employeeId as string;
  
      const data =
        await AttendanceService.getMonthlyAttendance(
          employeeId
        );
  
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}
