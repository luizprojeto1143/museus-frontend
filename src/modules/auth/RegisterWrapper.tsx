import React from "react";
import { useLocation } from "react-router-dom";
import { Register } from "./Register";

export const RegisterWrapper: React.FC = () => {
  const location = useLocation();
  const state = location.state as { 
    tenantId?: string; 
    tenantName?: string; 
    cityId?: string; 
    equipamentoId?: string 
  } | null;

  // Allow platform-level registration without a museum selected.
  // tenantId is optional — the backend handles null tenantId fine.
  return (
    <Register 
      tenantId={state?.tenantId || ""}
      tenantName={state?.tenantName || ""}
      cityId={state?.cityId || ""}
      equipamentoId={state?.equipamentoId || ""}
    />
  );
};
