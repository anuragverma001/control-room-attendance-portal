import { useEffect, useState } from "react";
import api from "../services/api";


export default function Reports() {
  const [attendance, setAttendance] =
    useState<any[]>([]);

  const [payrolls, setPayrolls] =
    useState<any[]>([]);

  const [leaves, setLeaves] =
    useState<any[]>([]);

  const exportCSV = (
    data: any[],
    filename: string
  ) => {
    if (!data.length) return;

    const headers = Object.keys(data[0]);

    const csv = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((field) => row[field])
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob(
      [csv],
      { type: "text/csv" }
    );

    const url =
      window.URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download = filename;
    link.click();
  };

  const loadReports = async () => {
    try {
      const [
        attendanceRes,
        payrollRes,
        leaveRes,
      ] = await Promise.all([

        api.get("/attendance/list"),
        api.get("/payroll/list"),
        api.get("/leave/list"),
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
        Reports Dashboard
      </h1>

      {/* Summary Cards */}

      <div className="grid grid-cols-3 gap-4 mb-8">

        <div className="border p-5 rounded shadow">
          <h3>Total Attendance</h3>
          <p className="text-3xl font-bold">
            {attendance.length}
          </p>
        </div>

        <div className="border p-5 rounded shadow">
          <h3>Total Leaves</h3>
          <p className="text-3xl font-bold">
            {leaves.length}
          </p>
        </div>

        <div className="border p-5 rounded shadow">
          <h3>Total Payrolls</h3>
          <p className="text-3xl font-bold">
            {payrolls.length}
          </p>
        </div>

      </div>

      {/* Export Buttons */}

      <div className="flex gap-4 mb-8">
        <button
          onClick={() =>
            exportCSV(
              attendance,
              "attendance-report.csv"
            )
          }
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Export Attendance CSV
        </button>

        <button
          onClick={() =>
            exportCSV(
              leaves,
              "leave-report.csv"
            )
          }
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Export Leave CSV
        </button>

        <button
          onClick={() =>
            exportCSV(
              payrolls,
              "payroll-report.csv"
            )
          }
          className="bg-purple-600 text-white px-4 py-2 rounded"
        >
          Export Payroll CSV
        </button>
      </div>

      {/* Attendance Table */}

      <h2 className="text-xl font-bold mb-2">
        Attendance Records
      </h2>

      <table className="w-full border mb-8">
        <thead>
          <tr>
            <th className="border p-2">
              Employee
            </th>
            <th className="border p-2">
              Status
            </th>
            <th className="border p-2">
              Hours
            </th>
          </tr>
        </thead>

        <tbody>
          {attendance.slice(0, 10).map((a) => (
            <tr key={a.id}>
              <td className="border p-2">
                {a.employee?.fullName}
              </td>

              <td className="border p-2">
                {a.status}
              </td>

              <td className="border p-2">
                {Number(
                  a.totalHours || 0
                ).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Leave Table */}

      <h2 className="text-xl font-bold mb-2">
        Leave Records
      </h2>

      <table className="w-full border mb-8">
        <thead>
          <tr>
            <th className="border p-2">
              Employee
            </th>
            <th className="border p-2">
              Type
            </th>
            <th className="border p-2">
              Status
            </th>
          </tr>
        </thead>

        <tbody>
          {leaves.slice(0, 10).map((l) => (
            <tr key={l.id}>
              <td className="border p-2">
                {l.employee?.fullName}
              </td>

              <td className="border p-2">
                {l.leaveType}
              </td>

              <td className="border p-2">
                {l.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Payroll Table */}

      <h2 className="text-xl font-bold mb-2">
        Payroll Records
      </h2>

      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2">
              Employee
            </th>

            <th className="border p-2">
              Net Salary
            </th>

            <th className="border p-2">
              Status
            </th>
          </tr>
        </thead>

        <tbody>
          {payrolls.slice(0, 10).map((p) => (
            <tr key={p.id}>
              <td className="border p-2">
                {p.employee?.fullName}
              </td>

              <td className="border p-2">
                ₹{p.netSalary}
              </td>

              <td className="border p-2">
                {p.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}
