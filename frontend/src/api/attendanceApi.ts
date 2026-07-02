import api from "./axios";

export const attendanceApi = {
  checkIn: (formData: FormData) =>
    api.post("/attendance/check-in", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  checkOut: (id: string) =>
    api.put(`/attendance/check-out/${id}`),

  getTodayAttendance: () =>
    api.get("/attendance/today"),

  getAllAttendance: () =>
    api.get("/attendance/list"),
};
