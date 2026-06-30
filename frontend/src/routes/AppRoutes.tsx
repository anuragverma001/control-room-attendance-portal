import EditEmployee from "../pages/EditEmployee";
import AddEmployee from "../pages/AddEmployee";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Employees from "../pages/Employees";

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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
