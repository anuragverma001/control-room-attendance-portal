import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getEmployeeById,
  updateEmployee,
} from "../api/employeeApi";

export default function EditEmployee() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    shiftType: "GENERAL",
  });

  useEffect(() => {
    loadEmployee();
  }, []);

  const loadEmployee = async () => {
    try {
      const response =
        await getEmployeeById(
          id as string
        );

      setFormData({
        fullName:
          response.data.fullName,
        email:
          response.data.email,
        mobile:
          response.data.mobile,
        shiftType:
          response.data.shiftType,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      await updateEmployee(
        id as string,
        formData
      );

      alert(
        "Employee updated successfully"
      );

      navigate("/employees");
    } catch (error) {
      console.error(error);

      alert(
        "Failed to update employee"
      );
    }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">
        Edit Employee
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow space-y-4"
      >
        <input
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          className="w-full border p-3 rounded"
        />

        <input
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full border p-3 rounded"
        />

        <input
          name="mobile"
          value={formData.mobile}
          onChange={handleChange}
          className="w-full border p-3 rounded"
        />

        <select
          name="shiftType"
          value={formData.shiftType}
          onChange={handleChange}
          className="w-full border p-3 rounded"
        >
          <option value="GENERAL">
            General
          </option>

          <option value="MORNING">
            Morning
          </option>

          <option value="EVENING">
            Evening
          </option>

          <option value="NIGHT">
            Night
          </option>
        </select>

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-3 rounded"
        >
          Update Employee
        </button>
      </form>
    </div>
  );
}
