import { prisma } from "../config/prisma";

export class DashboardService {

  static async getDashboardStats() {

    const totalEmployees =
      await prisma.employee.count();

      const activeEmployees =
      await prisma.employee.count();
    

    const today = new Date();

    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );

    const presentToday =
      await prisma.attendance.count({
        where: {
          attendanceDate: {
            gte: startOfDay,
            lt: endOfDay
          },
          status: "PRESENT"
        }
      });

    const absentToday =
      await prisma.attendance.count({
        where: {
          attendanceDate: {
            gte: startOfDay,
            lt: endOfDay
          },
          status: "ABSENT"
        }
      });

    const leaveToday =
      await prisma.leave.count({
        where: {
          status: "APPROVED",
          fromDate: {
            lte: today
          },
          toDate: {
            gte: today
          }
        }
      });

    return {
      totalEmployees,
      activeEmployees,
      presentToday,
      absentToday,
      leaveToday
    };
  }
}
