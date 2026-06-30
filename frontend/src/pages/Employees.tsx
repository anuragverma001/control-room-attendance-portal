import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  getEmployees,
  deleteEmployee,
} from "../api/employeeApi";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const response = await getEmployees();
      setEmployees(response.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (
    id: string
  ) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this employee?"
    );

    if (!confirmDelete) return;

    try {
      await deleteEmployee(id);

      alert("Employee deleted successfully");

      loadEmployees();
    } catch (error) {
      console.error(error);
      alert("Failed to delete employee");
    }
  };

  if (loading) {
    return <div>Loading employees...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Employees
        </h1>

        <Link
          to="/employees/add"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Employee
        </Link>
      </div>

      <table className="w-full bg-white shadow rounded">
        <thead>
          <tr className="border-b bg-slate-100">
            <th className="p-3 text-left">
              Code
            </th>

            <th className="p-3 text-left">
              Name
            </th>

            <th className="p-3 text-left">
              Email
            </th>

            <th className="p-3 text-left">
              Mobile
            </th>

            <th className="p-3 text-left">
              Shift
            </th>

            <th className="p-3 text-left">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {employees.map((employee: any) => (
            <tr
              key={employee.id}
              className="border-b"
            >
              <td className="p-3">
                {employee.employeeCode}
              </td>

              <td className="p-3">
                {employee.fullName}
              </td>

              <td className="p-3">
                {employee.email}
              </td>

              <td className="p-3">
                {employee.mobile}
              </td>

              <td className="p-3">
                {employee.shiftType}
              </td>

              <td className="p-3">
              <Link
  to={`/employees/edit/${employee.id}`}
  className="bg-yellow-500 text-white px-3 py-1 rounded mr-2 inline-block"
>
  Edit
</Link>


                <button
                  onClick={() =>
                    handleDelete(employee.id)
                  }
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
