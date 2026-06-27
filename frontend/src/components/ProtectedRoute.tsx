import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({
  children,
}: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to="/" replace />
  );
};

export default ProtectedRoute;

