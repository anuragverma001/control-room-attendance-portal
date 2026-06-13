import { prisma } from "../config/prisma";
import { AttendanceStatus } from "@prisma/client";
import { getShiftTiming } from "../utils/shift.util";

export class AttendanceService {
  static async checkIn(data: {
    employeeId: string;
    checkInSelfie?: string;
    checkInLatitude?: number;
    checkInLongitude?: number;
  }) {
    const today = new Date();

    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAttendance =
      await prisma.attendance.findFirst({
        where: {
          employeeId: data.employeeId,
          attendanceDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

    if (existingAttendance) {
      throw new Error(
        "Attendance already marked for today"
      );
    }

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

    const shift =
      getShiftTiming(
        employee.shiftType
      );

    const shiftStart =
      new Date(today);

    shiftStart.setHours(
      shift.startHour,
      shift.startMinute,
      0,
      0
    );

    const lateMinutes = Math.max(
      0,
      Math.floor(
        (
          today.getTime() -
          shiftStart.getTime()
        ) /
          (1000 * 60)
      )
    );

    const status =
  lateMinutes > 15
    ? AttendanceStatus.LATE
    : AttendanceStatus.PRESENT;

    const attendance =
      await prisma.attendance.create({
        data: {
          employeeId: data.employeeId,

          attendanceDate: today,

          checkInTime: today,

          checkInSelfie:
            data.checkInSelfie,

          checkInLatitude:
            data.checkInLatitude,

          checkInLongitude:
            data.checkInLongitude,

          lateMinutes,

          status,
        },
      });

    return attendance;
  }

  static async checkOut(
    attendanceId: string
  ) {
    const attendance =
      await prisma.attendance.findUnique({
        where: {
          id: attendanceId,
        },
      });

    if (!attendance) {
      throw new Error(
        "Attendance record not found"
      );
    }

    if (attendance.checkOutTime) {
      throw new Error(
        "Already checked out"
      );
    }

    const checkOutTime =
      new Date();

    const totalHours =
      (
        checkOutTime.getTime() -
        attendance.checkInTime!.getTime()
      ) /
      (1000 * 60 * 60);

    return await prisma.attendance.update({
      where: {
        id: attendanceId,
      },
      data: {
        checkOutTime,
        totalHours,
      },
    });
  }

  static async getAllAttendance() {
    return await prisma.attendance.findMany({
      include: {
        employee: true,
      },
      orderBy: {
        attendanceDate: "desc",
      },
    });
  }
}
