import { prisma } from "../config/prisma";

export class SalaryService {
  static async createSalary(data: {
    employeeId: string;
    basicSalary: number;
    hra?: number;
    da?: number;
    allowance?: number;
    lateDeductionPerDay?: number;
  }) {
    const employee = await prisma.employee.findUnique({
      where: {
        id: data.employeeId,
      },
    });

    if (!employee) {
      throw new Error("Employee not found");
    }

    const existingSalary = await prisma.salary.findUnique({
      where: {
        employeeId: data.employeeId,
      },
    });

    if (existingSalary) {
      throw new Error(
        "Salary structure already exists"
      );
    }

    return await prisma.salary.create({
      data: {
        employeeId: data.employeeId,
        basicSalary: data.basicSalary,
        hra: data.hra ?? 0,
        da: data.da ?? 0,
        allowance: data.allowance ?? 0,
        lateDeductionPerDay:
          data.lateDeductionPerDay ?? 0,
      },
    });
  }

  static async updateSalary(
    employeeId: string,
    data: {
      basicSalary?: number;
      hra?: number;
      da?: number;
      allowance?: number;
      lateDeductionPerDay?: number;
    }
  ) {
    const salary = await prisma.salary.findUnique({
      where: {
        employeeId,
      },
    });

    if (!salary) {
      throw new Error(
        "Salary structure not found"
      );
    }

    return await prisma.salary.update({
      where: {
        employeeId,
      },
      data,
    });
  }

  static async getSalaryByEmployee(
    employeeId: string
  ) {
    return await prisma.salary.findUnique({
      where: {
        employeeId,
      },
      include: {
        employee: true,
      },
    });
  }

  static async getAllSalary() {
    return await prisma.salary.findMany({
      include: {
        employee: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}