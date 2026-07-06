import { useEffect, useState } from "react";
import axios from "axios";
import { leaveService } from "../services/leaveService";

export default function Leave() {
  const [leaves, setLeaves] = useState<any[]>([]);
  

  const loadLeaves = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/leave/list"
      );

      setLeaves(response.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };
  const handleApprove = async (
    id: string
  ) => {
    try {
      await leaveService.approveLeave(
        id,
        "HR Admin"
      );
  
      loadLeaves();
    } catch (error) {
      console.error(error);
    }
  };
  
  const handleReject = async (
    id: string
  ) => {
    try {
      await leaveService.rejectLeave(
        id,
        "HR Admin"
      );
  
      loadLeaves();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold mb-6">
        Leave Management
      </h1>

      <div className="border rounded overflow-hidden">

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>
              <th className="p-3">Employee</th>
              <th className="p-3">Type</th>
              <th className="p-3">From</th>
              <th className="p-3">To</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>

          </thead>

          <tbody>

            {leaves.map((leave) => (
              <tr
                key={leave.id}
                className="border-t"
              >
                <td className="p-3">
                  {leave.employee?.fullName}
                </td>

                <td className="p-3">
                  {leave.leaveType}
                </td>

                <td className="p-3">
                  {new Date(
                    leave.fromDate
                  ).toLocaleDateString()}
                </td>

                <td className="p-3">
                  {new Date(
                    leave.toDate
                  ).toLocaleDateString()}
                </td>

                <td className="p-3">
  <span
    className={`px-2 py-1 rounded text-white ${
      leave.status === "APPROVED"
        ? "bg-green-600"
        : leave.status === "REJECTED"
        ? "bg-red-600"
        : "bg-yellow-500"
    }`}
  >
    {leave.status}
  </span>
</td>
                <td className="p-3">
  {leave.status ===
  "PENDING" ? (
    <div className="flex gap-2">

      <button
        onClick={() =>
          handleApprove(
            leave.id
          )
        }
        className="bg-green-600 text-white px-2 py-1 rounded"
      >
        Approve
      </button>

      <button
        onClick={() =>
          handleReject(
            leave.id
          )
        }
        className="bg-red-600 text-white px-2 py-1 rounded"
      >
        Reject
      </button>

    </div>
  ) : (
    "-"
  )}
</td>
              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}
