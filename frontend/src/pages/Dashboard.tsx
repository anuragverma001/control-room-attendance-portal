import { useEffect, useState } from "react";
import api from "../services/api";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    pendingLeaves: 0,
  });

  const loadDashboard = async () => {
    try {
      const [
        employeeRes,
        attendanceRes,
        leaveRes,
      ] = await Promise.all([
      
        api.get("/employee/list"),
      
        api.get("/attendance/today"),
      
        api.get("/leave/pending"),
      
      ]);

      setStats({
        totalEmployees:
          employeeRes.data.data.length || 0,

        presentToday:
          attendanceRes.data.data.present || 0,

        absentToday:
          attendanceRes.data.data.absent || 0,

        pendingLeaves:
          leaveRes.data.data.length || 0,
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold">
        Dashboard
      </h1>

      <div className="grid grid-cols-4 gap-4 mt-6">

        <div className="bg-white shadow p-5 rounded">
          <h3 className="text-gray-500">
            Total Employees
          </h3>

          <p className="text-3xl font-bold">
            {stats.totalEmployees}
          </p>
        </div>

        <div className="bg-white shadow p-5 rounded">
          <h3 className="text-gray-500">
            Present Today
          </h3>

          <p className="text-3xl font-bold">
            {stats.presentToday}
          </p>
        </div>

        <div className="bg-white shadow p-5 rounded">
          <h3 className="text-gray-500">
            Absent Today
          </h3>

          <p className="text-3xl font-bold">
            {stats.absentToday}
          </p>
        </div>

        <div className="bg-white shadow p-5 rounded">
          <h3 className="text-gray-500">
            Pending Leaves
          </h3>

          <p className="text-3xl font-bold">
            {stats.pendingLeaves}
          </p>
        </div>

      </div>
    </div>
  );
}
