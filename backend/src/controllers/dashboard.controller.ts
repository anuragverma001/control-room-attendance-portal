import { Request, Response } from "express";
import { DashboardService } from "../services/dashboard.service";

export class DashboardController {

  static async getDashboardStats(
    req: Request,
    res: Response
  ) {
    try {

      const data =
        await DashboardService.getDashboardStats();

      return res.status(200).json({
        success: true,
        data
      });

    } catch (error: any) {

      return res.status(500).json({
        success: false,
        message: error.message
      });

    }
  }

}
