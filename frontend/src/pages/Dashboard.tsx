export default function Dashboard() {
    return (
      <div>
        <h1 className="text-3xl font-bold">
          Dashboard
        </h1>
  
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-white shadow p-5 rounded">
            Total Employees
          </div>
  
          <div className="bg-white shadow p-5 rounded">
            Present Today
          </div>
  
          <div className="bg-white shadow p-5 rounded">
            Absent Today
          </div>
  
          <div className="bg-white shadow p-5 rounded">
            Pending Leaves
          </div>
        </div>
      </div>
    );
  }
  