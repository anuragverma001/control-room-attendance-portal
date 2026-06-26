import { prisma } from "../config/prisma";

export class ReportService {

  /**
   * Daily Attendance Report
   */
  static async getDailyAttendanceReport(
    date: Date
  ) {

    const startOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    const endOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() + 1
    );

    const records =
      await prisma.attendance.findMany({

        where: {
          attendanceDate: {
            gte: startOfDay,
            lt: endOfDay
          }
        },

        include: {
          employee: true
        },

        orderBy: {
          attendanceDate: "desc"
        }

      });

    return {
      totalRecords: records.length,
      records
    };
  }
/**
 * Monthly Attendance Report
 */
static async getMonthlyAttendanceReport(
    month: number,
    year: number
  ) {
  
    const startDate =
      new Date(year, month - 1, 1);
  
    const endDate =
      new Date(year, month, 1);
  
    const records =
      await prisma.attendance.findMany({
  
        where: {
          attendanceDate: {
            gte: startDate,
            lt: endDate
          }
        },
  
        include: {
          employee: true
        },
  
        orderBy: {
          attendanceDate: "desc"
        }
  
      });
  
    return {
      month,
      year,
      totalRecords: records.length,
      records
    };
  }
}
