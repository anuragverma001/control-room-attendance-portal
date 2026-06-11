import { prisma } from "../config/prisma";

export class EmployeeService {
  static async createEmployee(data: any) {
    const employee = await prisma.employee.create({
      data: {
        employeeCode: data.employeeCode,
        fullName: data.fullName,
        email: data.email,
        mobile: data.mobile,

        aadhaarNumber: data.aadhaarNumber,
        panNumber: data.panNumber,

        address: data.address,
        emergencyContact: data.emergencyContact,

        shiftType: data.shiftType,
        weeklyOffDay: data.weeklyOffDay,

        userId: data.userId,
      },
    });

    return employee;
  }

  static async getAllEmployees() {
    return await prisma.employee.findMany({
      include: {
        user: true,
      },
    });
  }

  static async getEmployeeById(id: string) {
    return await prisma.employee.findUnique({
      where: {
        id,
      },
      include: {
        user: true,
      },
    });
  }

  static async updateEmployee(
    id: string,
    data: any
  ) {
    return await prisma.employee.update({
      where: {
        id,
      },
      data,
    });
  }
  static async deleteEmployee(
    id: string
  ) {
    return await prisma.employee.delete({
      where: {
        id,
      },
    });
  }  
}