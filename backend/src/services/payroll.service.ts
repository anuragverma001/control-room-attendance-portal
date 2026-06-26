import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";

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
  /**
 * ======================================================
 * Generate Payroll For All Employees
 * ======================================================
 */

static async generatePayrollForAllEmployees(
  month: number,
  year: number
) {

  const employees = await prisma.employee.findMany({
    include: {
      salary: true
    }
  });

  const result = {
    totalEmployees: employees.length,
    generated: 0,
    skipped: 0,
    failed: 0,
    payrolls: [] as any[],
    errors: [] as any[]
  };

  for (const employee of employees) {

    if (!employee.salary) {

      result.skipped++;

      result.errors.push({
        employeeId: employee.id,
        employeeCode: employee.employeeCode,
        employeeName: employee.fullName,
        message: "Salary structure not found"
      });

      continue;

    }

    try {

      const payroll =
        await this.generatePayroll(
          employee.id,
          month,
          year
        );

      result.generated++;

      result.payrolls.push(payroll);

    } catch (error: any) {

      if (
        error.message ===
        "Payroll already generated"
      ) {

        result.skipped++;

      } else {

        result.failed++;

      }

      result.errors.push({

        employeeId: employee.id,

        employeeCode: employee.employeeCode,

        employeeName: employee.fullName,

        message: error.message

      });

    }

  }

  return {

    success: true,

    message:
      "Payroll generation completed.",

    summary: {

      totalEmployees:
        result.totalEmployees,

      generated:
        result.generated,

      skipped:
        result.skipped,

      failed:
        result.failed

    },

    payrolls:
      result.payrolls,

    errors:
      result.errors

  };

}
/**
 * ======================================================
 * Get All Payrolls
 * ======================================================
 */

static async getAllPayrolls(

  page: number = 1,

  limit: number = 10,

  month?: number,

  year?: number,

  employeeId?: string

) {

  const skip = (page - 1) * limit;

  const where: Prisma.PayrollWhereInput = {};

  if (month) {
    where.month = month;
  }

  if (year) {
    where.year = year;
  }

  if (employeeId) {
    where.employeeId = employeeId;
  }

  const [payrolls, total] =
    await prisma.$transaction([

      prisma.payroll.findMany({

        where,

        skip,

        take: limit,

        orderBy: {

          generatedAt: "desc"

        },

        include: {

          employee: {

            select: {

              id: true,

              employeeCode: true,

              fullName: true,

              mobile: true,

              shiftType: true

            }

          }

        }

      }),

      prisma.payroll.count({

        where

      })

    ]);

  return {

    success: true,

    data: payrolls,

    pagination: {

      page,

      limit,

      total,

      totalPages: Math.ceil(total / limit),

      hasNext: page * limit < total,

      hasPrevious: page > 1

    }

  };

}
/**
 * ======================================================
 * Get Payroll By Id
 * ======================================================
 */

static async getPayrollById(
  payrollId: string
) {

  const payroll =
    await prisma.payroll.findUnique({

      where: {
        id: payrollId
      },

      include: {

        employee: {

          include: {

            salary: true,

            user: {
              select: {
                id: true,
                email: true,
                mobile: true,
                role: true
              }
            }

          }

        }

      }

    });

  if (!payroll) {
    throw new Error("Payroll not found");
  }

  return {

    success: true,

    data: payroll

  };

}
/**
 * ======================================================
 * Get Employee Payroll History
 * ======================================================
 */

static async getEmployeePayrollHistory(
  employeeId: string,
  page: number = 1,
  limit: number = 10
) {

  const employee = await prisma.employee.findUnique({
    where: {
      id: employeeId
    }
  });

  if (!employee) {
    throw new Error("Employee not found");
  }

  const skip = (page - 1) * limit;

  const [payrolls, total] =
    await prisma.$transaction([

      prisma.payroll.findMany({

        where: {
          employeeId
        },

        orderBy: [
          {
            year: "desc"
          },
          {
            month: "desc"
          }
        ],

        skip,

        take: limit

      }),

      prisma.payroll.count({

        where: {
          employeeId
        }

      })

    ]);

  return {

    success: true,

    employee: {

      id: employee.id,

      employeeCode: employee.employeeCode,

      fullName: employee.fullName

    },

    payrolls,

    pagination: {

      page,

      limit,

      total,

      totalPages:
        Math.ceil(total / limit),

      hasNext:
        page * limit < total,

      hasPrevious:
        page > 1

    }

  };

}
/**
 * ======================================================
 * Mark Payroll As Paid
 * ======================================================
 */

static async markAsPaid(
  payrollId: string
) {

  const payroll =
    await prisma.payroll.findUnique({

      where: {
        id: payrollId
      }

    });

  if (!payroll) {
    throw new Error("Payroll not found");
  }

  if (payroll.status === "PAID") {
    throw new Error(
      "Payroll already marked as paid"
    );
  }

  if (payroll.status === "CANCELLED") {
    throw new Error(
      "Cancelled payroll cannot be marked as paid"
    );
  }

  const updatedPayroll =
    await prisma.payroll.update({

      where: {
        id: payrollId
      },

      data: {

        status: "PAID"

      },

      include: {

        employee: {

          select: {

            id: true,

            employeeCode: true,

            fullName: true

          }

        }

      }

    });

  return {

    success: true,

    message: "Payroll marked as paid successfully.",

    data: updatedPayroll

  };

}
/**
 * ======================================================
 * Cancel Payroll
 * ======================================================
 */

static async cancelPayroll(
  payrollId: string
) {

  const payroll = await prisma.payroll.findUnique({
    where: {
      id: payrollId
    }
  });

  if (!payroll) {
    throw new Error("Payroll not found");
  }

  if (payroll.status === "CANCELLED") {
    throw new Error("Payroll is already cancelled");
  }

  if (payroll.status === "PAID") {
    throw new Error(
      "Paid payroll cannot be cancelled"
    );
  }

  const updatedPayroll =
    await prisma.payroll.update({

      where: {
        id: payrollId
      },

      data: {
        status: "CANCELLED"
      },

      include: {

        employee: {

          select: {

            id: true,

            employeeCode: true,

            fullName: true,

            mobile: true

          }

        }

      }

    });

  return {

    success: true,

    message: "Payroll cancelled successfully.",

    data: updatedPayroll

  };

}
/**
 * ======================================================
 * Delete Payroll
 * ======================================================
 */

static async deletePayroll(
  payrollId: string
) {

  const payroll =
    await prisma.payroll.findUnique({

      where: {
        id: payrollId
      },

      include: {

        employee: {

          select: {

            id: true,

            employeeCode: true,

            fullName: true

          }

        }

      }

    });

  if (!payroll) {
    throw new Error("Payroll not found");
  }

  if (payroll.status === "PAID") {
    throw new Error(
      "Paid payroll cannot be deleted"
    );
  }

  await prisma.payroll.delete({

    where: {
      id: payrollId
    }

  });

  return {

    success: true,

    message: "Payroll deleted successfully.",

    deletedPayroll: {

      id: payroll.id,

      employeeId: payroll.employee.id,

      employeeCode: payroll.employee.employeeCode,

      employeeName: payroll.employee.fullName,

      month: payroll.month,

      year: payroll.year

    }

  };

}
}
