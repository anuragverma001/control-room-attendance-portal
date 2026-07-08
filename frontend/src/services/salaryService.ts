import axios from "axios";

const API_URL =
  `${import.meta.env.VITE_API_URL}/salary`;
  

const salaryService = {
  getAllSalary: () =>
    axios.get(`${API_URL}/list`),

  createSalary: (data: any) =>
    axios.post(
      `${API_URL}/create`,
      data
    ),

  updateSalary: (
    employeeId: string,
    data: any
  ) =>
    axios.put(
      `${API_URL}/update/${employeeId}`,
      data
    ),
};

export default salaryService;
