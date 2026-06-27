import axios from "./axios";

export const getEmployees = async () => {
  const response = await axios.get(
    "/employee/list"
  );

  return response.data;
};
