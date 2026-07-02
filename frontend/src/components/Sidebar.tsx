import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen">
      <div className="p-5 text-xl font-bold">
        AVSOFT
      </div>

      <nav className="flex flex-col gap-2 p-4">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/employees">Employees</Link>
        <Link to="/attendance">Attendance</Link>
        <Link to="/leave">Leave</Link>
        <Link to="/salary">Salary</Link>
      </nav>
      <li>
  <Link to="/attendance">
    Attendance
  </Link>
</li>
    </div>
  );
}
