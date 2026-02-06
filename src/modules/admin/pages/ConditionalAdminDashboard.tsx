import React from "react";
import { useIsCityMode } from "../../auth/TenantContext";
import { AdminDashboard } from "./AdminDashboard";
import SecretaryDashboard from "./SecretaryDashboard";

/**
 * Conditional dashboard that renders SecretaryDashboard for City mode
 * and AdminDashboard for Museum mode.
 */
export const ConditionalAdminDashboard: React.FC = () => {
    const isCityMode = useIsCityMode();

    if (isCityMode) {
        return <SecretaryDashboard />;
    }

    return <AdminDashboard />;
};
