import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/modules/auth/AuthContext";
import { Permission } from "@/types/auth";

export const RequirePermission: React.FC<{ permission: Permission; children: React.ReactElement }> = ({
  permission,
  children
}) => {
  const { isAuthenticated, hasPermission } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/welcome" replace state={{ from: location }} />;
  }

  if (!hasPermission(permission)) {
    return <Navigate to="/" replace />;
  }

  return children;
};
