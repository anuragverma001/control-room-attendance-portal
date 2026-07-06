import axios from "axios";

const API_URL = "http://localhost:5000/api/payroll";

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
