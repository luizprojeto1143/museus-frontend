import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useIsCityMode, useTenant } from "../../auth/TenantContext";
import { AdminDashboard } from "./AdminDashboard";
import SecretaryDashboard from "./SecretaryDashboard";

/**
 * Conditional dashboard that renders SecretaryDashboard for City mode,
 * ProducerDashboard for Producer mode, and AdminDashboard for Museum mode.
 */
export const ConditionalAdminDashboard: React.FC = () => {
    const isCityMode = useIsCityMode();
    const tenant = useTenant();
    const navigate = useNavigate();

    useEffect(() => {
        if (tenant?.type === 'PRODUCER') {
            navigate("/producer", { replace: true });
        }
    }, [tenant, navigate]);

    // Prevent rendering wrong dashboard while redirecting
    if (tenant?.type === 'PRODUCER') {
        return null;
    }

    if (isCityMode) {
        return <SecretaryDashboard />;
    }

    return <AdminDashboard />;
};
