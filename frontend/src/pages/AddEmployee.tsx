import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createEmployee } from "../api/employeeApi";

export default function AddEmployee() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    employeeCode: "",
    fullName: "",
    email: "",
    mobile: "",
    shiftType: "GENERAL",
    weeklyOffDay: "Sunday",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      setLoading(true);

      await createEmployee(formData);

      alert("Employee Created Successfully");

      navigate("/employees");
    } catch (error) {
      console.error(error);
      alert("Failed to create employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">
        Add Employee
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow space-y-4"
      >
        <input
          type="text"
          name="employeeCode"
          placeholder="Employee Code"
          className="w-full border p-3 rounded"
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          className="w-full border p-3 rounded"
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full border p-3 rounded"
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="mobile"
          placeholder="Mobile"
          className="w-full border p-3 rounded"
          onChange={handleChange}
          required
        />

        <select
          name="shiftType"
          className="w-full border p-3 rounded"
          onChange={handleChange}
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
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded"
        >
          {loading
            ? "Creating..."
            : "Create Employee"}
        </button>
      </form>
    </div>
  );
}
