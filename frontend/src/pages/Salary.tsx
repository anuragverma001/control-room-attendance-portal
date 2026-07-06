import { useEffect, useState } from "react";
import salaryService from "../services/salaryService";

export default function Salary() {
  const [salaryList, setSalaryList] =
    useState<any[]>([]);

  const loadSalary = async () => {
    try {
      const response =
        await salaryService.getAllSalary();

      setSalaryList(
        response.data.data || []
      );
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadSalary();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Salary Management
      </h1>

      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2">
              Employee
            </th>

            <th className="border p-2">
              Basic
            </th>

            <th className="border p-2">
              HRA
            </th>

            <th className="border p-2">
              DA
            </th>

            <th className="border p-2">
              Allowance
            </th>
          </tr>
        </thead>

        <tbody>
          {salaryList.map((item) => (
            <tr key={item.id}>
              <td className="border p-2">
                {item.employee?.fullName}
              </td>

              <td className="border p-2">
                ₹{item.basicSalary}
              </td>

              <td className="border p-2">
                ₹{item.hra}
              </td>

              <td className="border p-2">
                ₹{item.da}
              </td>

              <td className="border p-2">
                ₹{item.allowance}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
