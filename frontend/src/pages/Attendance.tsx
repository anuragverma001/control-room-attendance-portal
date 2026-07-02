import { useEffect, useState } from "react";
import { attendanceApi } from "../api/attendanceApi";

export default function Attendance() {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [todayStats, setTodayStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [location, setLocation] = useState<any>(null);

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

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        alert("Unable to fetch location");
      }
    );
  };

  const handleCheckIn = async () => {
    try {
      setLoading(true);

      if (!location) {
        alert("Please get GPS location first");
        return;
      }

      if (!selfie) {
        alert("Please upload selfie");
        return;
      }

      const formData = new FormData();

      formData.append(
        "employeeId",
        localStorage.getItem("employeeId") || ""
      );

      formData.append(
        "latitude",
        String(location.latitude)
      );

      formData.append(
        "longitude",
        String(location.longitude)
      );

      formData.append(
        "selfie",
        selfie
      );

      formData.append(
        "faceVerified",
        "true"
      );

      formData.append(
        "faceScore",
        "95"
      );

      await attendanceApi.checkIn(formData);

      alert("Check-In Successful");

      loadData();
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
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Attendance Management
      </h1>

      <div className="flex gap-4 mb-6">
        <button
          onClick={getLocation}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Get GPS
        </button>

        <button
          onClick={handleCheckIn}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Checking..." : "Check In"}
        </button>
      </div>

      <input
        type="file"
        accept="image/*"
        onChange={(e) =>
          setSelfie(
            e.target.files?.[0] || null
          )
        }
        className="mb-4"
      />

      {location && (
        <div className="mb-4 p-3 border rounded">
          <p>Latitude: {location.latitude}</p>
          <p>Longitude: {location.longitude}</p>
        </div>
      )}

      {todayStats && (
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="border p-4 rounded">
            Total: {todayStats.total}
          </div>

          <div className="border p-4 rounded">
            Present: {todayStats.present}
          </div>

          <div className="border p-4 rounded">
            Late: {todayStats.late}
          </div>

          <div className="border p-4 rounded">
            Half Day: {todayStats.halfDay}
          </div>

          <div className="border p-4 rounded">
            Absent: {todayStats.absent}
          </div>
        </div>
      )}

      <table className="w-full border border-gray-300">
        <thead>
          <tr>
            <th className="border p-2 bg-gray-100">
              Employee
            </th>

            <th className="border p-2 bg-gray-100">
              Status
            </th>

            <th className="border p-2 bg-gray-100">
              Check In
            </th>
          </tr>
        </thead>

        <tbody>
          {attendance.map((item) => (
            <tr key={item.id}>
              <td className="border p-2">
                {item.employee?.fullName}
              </td>

              <td className="border p-2">
                {item.status}
              </td>

              <td className="border p-2">
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
