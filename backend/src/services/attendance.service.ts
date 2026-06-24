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

let attendanceDate =
  new Date(today);

if (
  employee.shiftType === "NIGHT" &&
  today.getHours() < 12
) {
  attendanceDate.setDate(
    attendanceDate.getDate() - 1
  );
}

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

      attendanceDate,

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

const employee =
  await prisma.employee.findUnique({
    where: {
      id: attendance.employeeId,
    },
  });

if (!employee) {
  throw new Error(
    "Employee not found"
  );
}

const checkOutTime =
  new Date();

const shift =
  getShiftTiming(
    employee.shiftType
  );

const shiftEnd =
  new Date(checkOutTime);

shiftEnd.setHours(
  shift.endHour,
  shift.endMinute,
  0,
  0
);

if (
  "isOvernight" in shift &&
  shift.isOvernight
) {
  shiftEnd.setDate(
    shiftEnd.getDate() + 1
  );
}

let overtimeMinutes = 0;

if (
  checkOutTime.getTime() >
  shiftEnd.getTime()
) {
  overtimeMinutes =
    Math.floor(
      (
        checkOutTime.getTime() -
        shiftEnd.getTime()
      ) /
        (1000 * 60)
    );
}

const totalHours =
(
checkOutTime.getTime() -
attendance.checkInTime!.getTime()
) /
(1000 * 60 * 60);

let finalStatus =
attendance.status;

if (totalHours < 4) {
finalStatus =
AttendanceStatus.ABSENT;
} else if (
totalHours < 6
) {
finalStatus =
AttendanceStatus.HALF_DAY;
}

return await prisma.attendance.update({
where: {
id: attendanceId,
},
data: {
checkOutTime,
totalHours,
overtimeMinutes,
status: finalStatus,
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

static async getTodayAttendance() {
const startOfDay = new Date();
startOfDay.setHours(
0,
0,
0,
0
);
const endOfDay = new Date();
endOfDay.setHours(
  23,
  59,
  59,
  999
);

const attendance =
  await prisma.attendance.findMany({
    where: {
      attendanceDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });
return {
  total: attendance.length,

  present: attendance.filter(
    (a) =>
      a.status === "PRESENT"
  ).length,

  late: attendance.filter(
    (a) =>
      a.status === "LATE"
  ).length,

  halfDay: attendance.filter(
    (a) =>
      a.status === "HALF_DAY"
  ).length,

  absent: attendance.filter(
    (a) =>
      a.status === "ABSENT"
  ).length,
};
}
static async getAttendanceByEmployee(
employeeId: string
) {
return await prisma.attendance.findMany({
where: {
employeeId,
},
include: {
employee: true,
},
orderBy: {
attendanceDate: "desc",
},
});
}

static async getMonthlyAttendance(
employeeId: string
) {
const now = new Date();
const startOfMonth =
  new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  );

const endOfMonth =
  new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );

const records =
  await prisma.attendance.findMany({
    where: {
      employeeId,
      attendanceDate: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    include: {
      employee: true,
    },
  });

const totalHours =
  records.reduce(
    (sum, record) =>
      sum +
      (record.totalHours || 0),
    0
  );

return {
  employeeName:
    records[0]?.employee
      ?.fullName || "",

  month:
    now.getMonth() + 1,

  year:
    now.getFullYear(),

  totalDays:
    records.length,

  present:
    records.filter(
      (r) =>
        r.status === "PRESENT"
    ).length,

  late:
    records.filter(
      (r) =>
        r.status === "LATE"
    ).length,

  halfDay:
    records.filter(
      (r) =>
        r.status === "HALF_DAY"
    ).length,

  leave:
    records.filter(
      (r) =>
        r.status === "LEAVE"
    ).length,

  absent:
    records.filter(
      (r) =>
        r.status === "ABSENT"
    ).length,

  totalHours,
};
}
}
