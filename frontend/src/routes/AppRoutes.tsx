import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Employees from "../pages/Employees";
import Attendance from "../pages/Attendance";
import AddEmployee from "../pages/AddEmployee";
import EditEmployee from "../pages/EditEmployee";
import Payroll from "../pages/Payroll";
import Leave from "../pages/Leave";
import Salary from "../pages/Salary";
import Reports from "../pages/Reports";

import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "../components/ProtectedRoute";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />
          <Route
  path="/salary"
  element={<Salary />}
/>
<Route
  path="/reports"
  element={<Reports />}
/>

          <Route
            path="/employees"
            element={<Employees />}
          />

          <Route
            path="/employees/add"
            element={<AddEmployee />}
          />

          <Route
            path="/employees/edit/:id"
            element={<EditEmployee />}
          />

          <Route
            path="/attendance"
            element={<Attendance />}
          />

          <Route
            path="/leave"
            element={<Leave />}
          />

          <Route
            path="/payroll"
            element={<Payroll />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
