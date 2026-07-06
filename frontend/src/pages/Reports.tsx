import { useEffect, useState } from "react";
import axios from "axios";

export default function Reports() {
  const [attendance, setAttendance] =
    useState<any[]>([]);

  const [payrolls, setPayrolls] =
    useState<any[]>([]);

  const [leaves, setLeaves] =
    useState<any[]>([]);

  const loadReports = async () => {
    try {
      const [
        attendanceRes,
        payrollRes,
        leaveRes,
      ] = await Promise.all([
        axios.get(
          "http://localhost:5000/api/attendance/list"
        ),
        axios.get(
          "http://localhost:5000/api/payroll/list"
        ),
        axios.get(
          "http://localhost:5000/api/leave/list"
        ),
      ]);

      setAttendance(
        attendanceRes.data.data || []
      );

      setPayrolls(
        payrollRes.data.data || []
      );

      setLeaves(
        leaveRes.data.data || []
      );
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Reports
      </h1>

      <div className="grid grid-cols-3 gap-4">

        <div className="border p-5 rounded">
          <h3>Total Attendance</h3>
          <p className="text-3xl font-bold">
            {attendance.length}
          </p>
        </div>

        <div className="border p-5 rounded">
          <h3>Total Leaves</h3>
          <p className="text-3xl font-bold">
            {leaves.length}
          </p>
        </div>

        <div className="border p-5 rounded">
          <h3>Total Payrolls</h3>
          <p className="text-3xl font-bold">
            {payrolls.length}
          </p>
        </div>

      </div>
    </div>
  );
}
