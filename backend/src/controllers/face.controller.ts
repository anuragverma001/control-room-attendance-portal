import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export class FaceController {
  static async uploadFace(req: Request, res: Response) {
    try {
        const id = req.params.id as string;

      const employee = await prisma.employee.findUnique({
        where: { id },
      });

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found",
        });
      }

      const imagePath = (req as any).file?.path;

      if (!imagePath) {
        return res.status(400).json({
          success: false,
          message: "Face image is required",
        });
      }

      const updatedEmployee = await prisma.employee.update({
        where: { id },
        data: {
          faceImage: imagePath,
        },
      });

      return res.status(200).json({
        success: true,
        message: "Face registered successfully",
        data: updatedEmployee,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}
