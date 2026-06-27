import { useEffect, useState } from "react";
import { getEmployees } from "../api/employeeApi";

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

  if (loading) {
    return <div>Loading employees...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Employees
      </h1>

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
    </tr>
  ))}
</tbody>
      </table>
    </div>
  );
}
