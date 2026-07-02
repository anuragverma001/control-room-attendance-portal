import { useEffect, useState } from "react";
import { attendanceApi } from "../api/attendanceApi";

export default function Attendance() {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [todayStats, setTodayStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const statsRes =
        await attendanceApi.getTodayAttendance();

      const attendanceRes =
        await attendanceApi.getAllAttendance();

      setTodayStats(statsRes.data.data);
      setAttendance(attendanceRes.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCheckIn = async () => {
    try {
      setLoading(true);

      navigator.geolocation.getCurrentPosition(
        async (position) => {

          const formData = new FormData();

          formData.append(
            "employeeId",
            localStorage.getItem("employeeId") || ""
          );
          

          formData.append(
            "latitude",
            String(position.coords.latitude)
          );

          formData.append(
            "longitude",
            String(position.coords.longitude)
          );

          // Temporary
          formData.append(
            "faceVerified",
            "true"
          );

          formData.append(
            "faceScore",
            "95"
          );

          await attendanceApi.checkIn(
            formData
          );

          alert("Check-In Successful");

          loadData();
        }
      );
    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
          "Check-In Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Attendance</h2>

      <button
        onClick={handleCheckIn}
        disabled={loading}
      >
        Check In
      </button>

      <br />
      <br />

      {todayStats && (
        <div>
          <h3>Today's Summary</h3>

          <p>Total: {todayStats.total}</p>
          <p>Present: {todayStats.present}</p>
          <p>Late: {todayStats.late}</p>
          <p>Half Day: {todayStats.halfDay}</p>
          <p>Absent: {todayStats.absent}</p>
        </div>
      )}

      <hr />

      <table border={1}>
        <thead>
          <tr>
            <th>Employee</th>
            <th>Status</th>
            <th>Check In</th>
          </tr>
        </thead>

        <tbody>
          {attendance.map((item) => (
            <tr key={item.id}>
              <td>
                {item.employee?.fullName}
              </td>

              <td>{item.status}</td>

              <td>
                {item.checkInTime
                  ? new Date(
                      item.checkInTime
                    ).toLocaleString()
                  : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
