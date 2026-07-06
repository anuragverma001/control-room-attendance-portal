import axios from "axios";

const API_URL = "http://localhost:5000/api/leave";

export const leaveService = {
  getAllLeaves: () =>
    axios.get(`${API_URL}/list`),

  applyLeave: (data: any) =>
    axios.post(`${API_URL}/apply`, data),

  approveLeave: (
    id: string,
    approvedBy: string
  ) =>
    axios.put(
      `${API_URL}/approve/${id}`,
      { approvedBy }
    ),
  
  rejectLeave: (
    id: string,
    approvedBy: string
  ) =>
    axios.put(
      `${API_URL}/reject/${id}`,
      { approvedBy }
    ),
};
