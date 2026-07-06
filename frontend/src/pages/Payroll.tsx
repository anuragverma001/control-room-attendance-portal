import { useEffect, useState } from "react";
import payrollService from "../services/payrollService";

export default function Payroll() {
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPayrolls = async () => {
    try {
      setLoading(true);

      const response =
        await payrollService.getAllPayrolls();

      setPayrolls(response.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayrolls();
  }, []);

  return (
    <div className="p-6">

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Payroll Management
        </h1>

        <button
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Generate Payroll
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">

        <div className="border p-4 rounded">
          <h3>Total Payrolls</h3>
          <p className="text-2xl font-bold">
            {payrolls.length}
          </p>
        </div>

        <div className="border p-4 rounded">
          <h3>Generated</h3>
          <p className="text-2xl font-bold">
            {
              payrolls.filter(
                p => p.status === "GENERATED"
              ).length
            }
          </p>
        </div>

        <div className="border p-4 rounded">
          <h3>Paid</h3>
          <p className="text-2xl font-bold">
            {
              payrolls.filter(
                p => p.status === "PAID"
              ).length
            }
          </p>
        </div>

        <div className="border p-4 rounded">
          <h3>Total Net Salary</h3>
          <p className="text-2xl font-bold">
            ₹
            {
              payrolls.reduce(
                (sum, item) =>
                  sum + item.netSalary,
                0
              ).toFixed(0)
            }
          </p>
        </div>

      </div>

      <div className="border rounded overflow-hidden">

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>
              <th className="p-3 text-left">
                Employee
              </th>

              <th className="p-3 text-left">
                Month
              </th>

              <th className="p-3 text-left">
                Gross Salary
              </th>

              <th className="p-3 text-left">
                Net Salary
              </th>

              <th className="p-3 text-left">
                Status
              </th>
            </tr>

          </thead>

          <tbody>

            {loading ? (
              <tr>
                <td colSpan={5}>
                  Loading...
                </td>
              </tr>
            ) : (
              payrolls.map((item) => (
                <tr
                  key={item.id}
                  className="border-t"
                >
                  <td className="p-3">
                    {item.employee?.fullName}
                  </td>

                  <td className="p-3">
                    {item.month}/{item.year}
                  </td>

                  <td className="p-3">
                    ₹{item.grossSalary}
                  </td>

                  <td className="p-3">
                    ₹{item.netSalary}
                  </td>

                  <td className="p-3">
                    {item.status}
                  </td>
                </tr>
              ))
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}
