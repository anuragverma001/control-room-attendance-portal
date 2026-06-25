import { Request, Response } from "express";
import { LeaveService } from "../services/leave.service";

export class LeaveController {

  static async applyLeave(
    req: Request,
    res: Response
  ) {
    try {
      const leave =
        await LeaveService.applyLeave(req.body);

      return res.status(201).json({
        success: true,
        data: leave,
      });

    } catch (error: any) {

      return res.status(400).json({
        success: false,
        message: error.message,
      });

    }
  }

  static async getAllLeaves(
    req: Request,
    res: Response
  ) {

    try {

      const leaves =
        await LeaveService.getAllLeaves();

      return res.status(200).json({
        success: true,
        data: leaves,
      });

    } catch (error: any) {

      return res.status(400).json({
        success: false,
        message: error.message,
      });

    }

  }

  static async getLeaveByEmployee(
    req: Request,
    res: Response
  ) {

    try {

      const leaves =
        await LeaveService.getLeaveByEmployee(
            req.params.employeeId as string
        );

      return res.status(200).json({
        success: true,
        data: leaves,
      });

    } catch (error: any) {

      return res.status(400).json({
        success: false,
        message: error.message,
      });

    }

  }

  static async getPendingLeaves(
    req: Request,
    res: Response
  ) {

    try {

      const leaves =
        await LeaveService.getPendingLeaves();

      return res.status(200).json({
        success: true,
        data: leaves,
      });

    } catch (error: any) {

      return res.status(400).json({
        success: false,
        message: error.message,
      });

    }

  }

  static async approveLeave(
    req: Request,
    res: Response
  ) {

    try {

      const leave =
        await LeaveService.approveLeave(
            req.params.id as string,
          req.body.approvedBy
        );

      return res.status(200).json({
        success: true,
        data: leave,
      });

    } catch (error: any) {

      return res.status(400).json({
        success: false,
        message: error.message,
      });

    }

  }

  static async rejectLeave(
    req: Request,
    res: Response
  ) {

    try {

      const leave =
        await LeaveService.rejectLeave(
            req.params.id as string,
          req.body.approvedBy
        );

      return res.status(200).json({
        success: true,
        data: leave,
      });

    } catch (error: any) {

      return res.status(400).json({
        success: false,
        message: error.message,
      });

    }

  }

}
