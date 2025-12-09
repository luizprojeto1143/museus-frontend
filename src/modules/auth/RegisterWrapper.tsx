import React from "react";
import { useLocation, Navigate } from "react-router-dom";
import { Register } from "./Register";

export const RegisterWrapper: React.FC = () => {
  const location = useLocation();
  const state = location.state as { tenantId?: string; tenantName?: string };

  if (!state?.tenantId || !state?.tenantName) {
    return <Navigate to="/select-museum" replace />;
  }

  return <Register tenantId={state.tenantId} tenantName={state.tenantName} />;
};
