import axios from "./axios";

export const getEmployees = async () => {
  const response = await axios.get(
    "/employee/list"
  );

  return response.data;
};

export const createEmployee = async (
  data: any
) => {
  const response = await axios.post(
    "/employee/create",
    data
  );

  return response.data;
};

export const getEmployeeById = async (
  id: string
) => {
  const response = await axios.get(
    `/employee/${id}`
  );

  return response.data;
};

export const updateEmployee = async (
  id: string,
  data: any
) => {
  const response = await axios.put(
    `/employee/${id}`,
    data
  );

  return response.data;
};

export const deleteEmployee = async (
  id: string
) => {
  const response = await axios.delete(
    `/employee/${id}`
  );

  return response.data;
};
