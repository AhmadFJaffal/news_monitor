import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import HashLoader from "react-spinners/HashLoader";
import { useAuth } from "../contexts/AuthContext";

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen">
    <HashLoader size={50} color={"#123abc"} loading={true} />
  </div>
);

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export const PublicRoute: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    return <Navigate to="/posts" replace />;
  }

  return <Outlet />;
};

interface RequireAuthProps {
  redirectTo: string;
  path: string;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({
  redirectTo,
  path,
}) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return <Navigate to={isAuthenticated ? path : redirectTo} replace />;
};
