import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/modules/auth/AuthContext";
import { TenantType } from "@/types/auth";

export const RequireTenantType: React.FC<{ allowed: TenantType[]; children: React.ReactElement }> = ({
  allowed,
  children
}) => {
  const { isAuthenticated, tenantType } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/welcome" replace state={{ from: location }} />;
  }

  if (!tenantType || !allowed.includes(tenantType)) {
    return <Navigate to="/" replace />;
  }

  return children;
};
