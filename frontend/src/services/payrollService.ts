import axios from "axios";

const API_URL =
  `${import.meta.env.VITE_API_URL}/payroll`;
  
const payrollService = {

  async getAllPayrolls() {
    const response = await axios.get(
      `${API_URL}/list`
    );

    return response.data;
  },

  async generatePayroll(
    month: number,
    year: number
  ) {
    const response = await axios.post(
      `${API_URL}/generate-all`,
      {
        month,
        year,
      }
    );

    return response.data;
  },

};

export default payrollService;
