import { prisma } from "../config/prisma";
import {
  LeaveStatus,
  LeaveType,
} from "@prisma/client";

export class LeaveService {

  static async applyLeave(data: {
    employeeId: string;
    leaveType: LeaveType;
    fromDate: string;
    toDate: string;
    reason?: string;
  }) {

    const employee =
      await prisma.employee.findUnique({
        where: {
          id: data.employeeId,
        },
      });

    if (!employee) {
      throw new Error(
        "Employee not found"
      );
    }

    if (
      new Date(data.fromDate) >
      new Date(data.toDate)
    ) {
      throw new Error(
        "Invalid leave dates"
      );
    }

    return await prisma.leave.create({
      data: {
        employeeId: data.employeeId,

        leaveType: data.leaveType,

        fromDate:
          new Date(data.fromDate),

        toDate:
          new Date(data.toDate),

        reason: data.reason,
      },
    });
  }

  static async getAllLeaves() {

    return await prisma.leave.findMany({
      include: {
        employee: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  }

  static async getLeaveByEmployee(
    employeeId: string
  ) {

    return await prisma.leave.findMany({
      where: {
        employeeId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  }

  static async approveLeave(
    leaveId: string,
    approvedBy: string
  ) {

    return await prisma.leave.update({
      where: {
        id: leaveId,
      },
      data: {
        status:
          LeaveStatus.APPROVED,

        approvedBy,

        approvedAt:
          new Date(),
      },
    });

  }

  static async rejectLeave(
    leaveId: string,
    approvedBy: string
  ) {

    return await prisma.leave.update({
      where: {
        id: leaveId,
      },
      data: {
        status:
          LeaveStatus.REJECTED,

        approvedBy,

        approvedAt:
          new Date(),
      },
    });

  }

  static async getPendingLeaves() {

    return await prisma.leave.findMany({
      where: {
        status:
          LeaveStatus.PENDING,
      },
      include: {
        employee: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  }

}