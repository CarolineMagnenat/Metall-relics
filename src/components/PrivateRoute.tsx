import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

interface PrivateRouteProps {
  element: React.ReactNode;
  requiredAccessLevel?: number; // Valfritt om du vill kräva en specifik roll
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  element,
  requiredAccessLevel,
}) => {
  const { isLoggedIn, user } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  if (
    requiredAccessLevel !== undefined &&
    (!user || user.access_level < requiredAccessLevel)
  ) {
    return <Navigate to="/" />;
  }

  return <>{element}</>;
};

export default PrivateRoute;
