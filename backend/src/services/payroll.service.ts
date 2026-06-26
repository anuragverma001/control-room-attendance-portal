import { prisma } from "../config/prisma";

export class PayrollService {

  static async generatePayroll(
    employeeId: string,
    month: number,
    year: number
  ) {

    const employee =
      await prisma.employee.findUnique({
        where: {
          id: employeeId
        }
      });

    if (!employee) {
      throw new Error("Employee not found");
    }

    const salary =
      await prisma.salary.findUnique({
        where: {
          employeeId
        }
      });

    if (!salary) {
      throw new Error("Salary structure not found");
    }

    const existingPayroll =
      await prisma.payroll.findUnique({
        where: {
          employeeId_month_year: {
            employeeId,
            month,
            year
          }
        }
      });

    if (existingPayroll) {
      throw new Error(
        "Payroll already generated"
      );
    }

    const startDate =
      new Date(year, month - 1, 1);

    const endDate =
      new Date(year, month, 0, 23, 59, 59);

    const attendance =
      await prisma.attendance.findMany({

        where: {

          employeeId,

          attendanceDate: {

            gte: startDate,

            lte: endDate

          }

        }

      });

    const approvedLeaves =
      await prisma.leave.findMany({

        where: {

          employeeId,

          status: "APPROVED",

          fromDate: {
            lte: endDate
          },
          toDate: {
            gte: startDate
          }

        }

      });

    const grossSalary =
      salary.basicSalary +
      salary.hra +
      salary.da +
      salary.allowance;

      const daysInMonth = new Date(year, month, 0).getDate();

      const dailySalary = grossSalary / daysInMonth;


    const presentDays =
      attendance.filter(
        a =>
          a.status === "PRESENT" ||
          a.status === "LATE"
      ).length;

    const absentDays =
      attendance.filter(
        a =>
          a.status === "ABSENT"
      ).length;

    const halfDays =
      attendance.filter(
        a =>
          a.status === "HALF_DAY"
      ).length;

    const leaveDays =
      approvedLeaves.length;

    const lateCount =
      attendance.filter(
        a =>
          a.status === "LATE"
      ).length;

      const absentDeduction =
      dailySalary * absentDays;
    
    const halfDayDeduction =
      (dailySalary / 2) * halfDays;
    
    const lateDeduction =
      salary.lateDeductionPerDay * lateCount;
    
    /**
     * Current Schema
     *
     * Overtime rate is not available.
     * Keeping overtime amount zero.
     */
    
    const overtimeAmount = 0;
    
    const netSalary =
      grossSalary -
      absentDeduction -
      halfDayDeduction -
      lateDeduction +
      overtimeAmount;
    
    const payroll =
      await prisma.payroll.create({
    
        data: {
    
          employeeId,
    
          month,
    
          year,
    
          grossSalary,
    
          presentDays,
    
          absentDays,
    
          halfDays,
    
          leaveDays,
    
          lateCount,
    
          absentDeduction,
    
          halfDayDeduction,
    
          lateDeduction,
    
          overtimeAmount,
    
          netSalary,
    
          status: "GENERATED"
    
        },
    
        include: {
    
          employee: true
    
        }
    
      });
    
    return payroll;
    
      }