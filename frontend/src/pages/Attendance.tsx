import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { attendanceApi } from "../api/attendanceApi";

export default function Attendance() {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [todayStats, setTodayStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeAttendance, setActiveAttendance] =useState<any>(null);
  const [location, setLocation] = useState<any>(null);
  const [cameraOpen, setCameraOpen] =
    useState(false);

  const [capturedImage, setCapturedImage] =
    useState<string | null>(null);

  const webcamRef = useRef<Webcam>(null);

  const loadData = async () => {
    try {
      const statsRes =
        await attendanceApi.getTodayAttendance();
  
        const attendanceRes =
        await attendanceApi.getAllAttendance();
      
      console.log(
        "ATTENDANCE DATA",
        attendanceRes.data.data
      );
      console.log(
        JSON.stringify(
          attendanceRes.data.data,
          null,
          2
        )
      );

      
  
      setTodayStats(statsRes.data.data);
      setAttendance(attendanceRes.data.data);
  
      const employeeId =
        localStorage.getItem("employeeId");
  
      const todayRecord =
        attendanceRes.data.data.find(
          (item: any) =>
            item.employeeId === employeeId &&
            !item.checkOutTime
      );
  
      setActiveAttendance(todayRecord);
    } catch (error) {
      console.error(error);
    }
  };


  useEffect(() => {
    loadData();
  }, []);
  console.log("Active Attendance:", activeAttendance);

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

  const captureSelfie = () => {
    const imageSrc =
      webcamRef.current?.getScreenshot();

    if (imageSrc) {
      setCapturedImage(imageSrc);
      setCameraOpen(false);
    }
  };

  const dataURLtoFile = (
    dataurl: string,
    filename: string
  ) => {
    const arr = dataurl.split(",");

    const mime =
      arr[0].match(/:(.*?);/)?.[1] || "";

    const bstr = atob(arr[1]);

    let n = bstr.length;

    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File(
      [u8arr],
      filename,
      { type: mime }
    );
  };

  const handleCheckIn = async () => {
    try {
      setLoading(true);

      if (!location) {
        alert("Please get GPS location first");
        return;
      }

      if (!capturedImage) {
        alert("Please capture selfie");
        return;
      }

      const selfieFile =
        dataURLtoFile(
          capturedImage,
          "selfie.jpg"
        );

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
        selfieFile
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
  const handleCheckOut = async () => {
    try {
      if (!activeAttendance) {
        alert("No active attendance found");
        return;
      }
  
      await attendanceApi.checkOut(
        activeAttendance.id
      );
  
      alert("Check-Out Successful");
  
      loadData();
    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
          "Check-Out Failed"
      );
    }
  };



  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Attendance Management
      </h1>

      <div className="flex gap-4 mb-6 flex-wrap">
        <button
          onClick={getLocation}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Get GPS
        </button>

        <button
          type="button"
          onClick={() =>
            setCameraOpen(true)
          }
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Open Camera
        </button>

        <button
          onClick={handleCheckIn}
          disabled={loading}
          className="bg-purple-600 text-white px-4 py-2 rounded"
        >
          {loading
            ? "Checking..."
            : "Check In"}
        </button>
        <button
  onClick={handleCheckOut}
  disabled={!activeAttendance}
  className="bg-red-600 text-white px-4 py-2 rounded"
>
  Check Out
</button>

      </div>

      {cameraOpen && (
        <div className="mb-4">
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="rounded border"
            videoConstraints={{
              facingMode: "user",
            }}
          />

          <button
            type="button"
            onClick={captureSelfie}
            className="mt-2 bg-orange-600 text-white px-4 py-2 rounded"
          >
            Capture Selfie
          </button>
          
        </div>
      )}

      {capturedImage && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">
            Selfie Preview
          </h3>

          <img
            src={capturedImage}
            alt="Selfie"
            width={250}
            className="border rounded"
          />
        </div>
      )}

      {location && (
        <div className="mb-4 p-3 border rounded">
          <p>
            Latitude: {location.latitude}
          </p>

          <p>
            Longitude: {location.longitude}
          </p>
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
            <th className="border p-2 bg-gray-100">
  Check Out
</th>

<th className="border p-2 bg-gray-100">
  Working Hours
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
  <span
    className={`px-2 py-1 rounded text-white text-sm ${
      item.status === "PRESENT"
        ? "bg-green-600"
        : item.status === "LATE"
        ? "bg-yellow-500"
        : item.status === "HALF_DAY"
        ? "bg-orange-500"
        : item.status === "ABSENT"
        ? "bg-red-600"
        : "bg-gray-500"
    }`}
  >
    {item.status}
  </span>
</td>

              <td className="border p-2">
                {item.checkInTime
                  ? new Date(
                      item.checkInTime
                    ).toLocaleString()
                  : "-"}
              </td>
              <td className="border p-2">
  {item.checkOutTime
    ? new Date(
        item.checkOutTime
      ).toLocaleString()
    : "-"}
</td>

<td className="border p-2">
  {Number(
    item.totalHours || 0
  ).toFixed(2)} hrs
</td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
