import React from "react";
import { Route } from "react-router-dom";
import { MasterLayout } from "../modules/master/MasterLayout";
import { Role } from "../modules/auth/AuthContext";

import { MasterDashboard } from "../modules/master/pages/MasterDashboard";
import { TenantsList } from "../modules/master/pages/TenantsList";
import { TenantForm } from "../modules/master/pages/TenantForm";
import { MasterSeeder } from "../modules/master/pages/MasterSeeder";
import { MasterUsers } from "../modules/master/pages/MasterUsers";
import { MasterUserForm } from "../modules/master/pages/MasterUserForm";
import { MasterAchievements } from "../modules/master/pages/MasterAchievements";
import { MasterAchievementForm } from "../modules/master/pages/MasterAchievementForm";
import { MasterAuditLogs } from "../modules/master/pages/MasterAuditLogs";
import { MasterAccessibilityRequests } from "../modules/master/pages/MasterAccessibilityRequests";
import { MasterSystemHealth } from "../modules/master/pages/MasterSystemHealth";
import { MasterMessages } from "../modules/master/pages/MasterMessages";
import MasterPlans from "../modules/master/pages/MasterPlans";
import { MasterProviders } from "../modules/master/pages/MasterProviders";
import { MasterAICosts } from "../modules/master/pages/MasterAICosts";

type RequireRoleProps = { allowed: Role[]; children: React.ReactElement };

const mr = (Component: React.ComponentType, RequireRole: React.FC<RequireRoleProps>) => (
    <RequireRole allowed={["master"]}>
        <MasterLayout>
            <Component />
        </MasterLayout>
    </RequireRole>
);

export function masterRoutes(RequireRole: React.FC<RequireRoleProps>) {
    return (
        <>
            <Route path="/master" element={mr(MasterDashboard, RequireRole)} />
            <Route path="/master/tenants" element={mr(TenantsList, RequireRole)} />
            <Route path="/master/tenants/novo" element={mr(TenantForm, RequireRole)} />
            <Route path="/master/tenants/:id" element={mr(TenantForm, RequireRole)} />
            <Route path="/master/users" element={mr(MasterUsers, RequireRole)} />
            <Route path="/master/users/novo" element={mr(MasterUserForm, RequireRole)} />
            <Route path="/master/users/:id" element={mr(MasterUserForm, RequireRole)} />
            <Route path="/master/seeder" element={mr(MasterSeeder, RequireRole)} />
            <Route path="/master/achievements" element={mr(MasterAchievements, RequireRole)} />
            <Route path="/master/achievements/novo" element={mr(MasterAchievementForm, RequireRole)} />
            <Route path="/master/achievements/:id" element={mr(MasterAchievementForm, RequireRole)} />
            <Route path="/master/accessibility-requests" element={mr(MasterAccessibilityRequests, RequireRole)} />
            <Route path="/master/audit-logs" element={mr(MasterAuditLogs, RequireRole)} />
            <Route path="/master/system-health" element={mr(MasterSystemHealth, RequireRole)} />
            <Route path="/master/messages" element={mr(MasterMessages, RequireRole)} />
            <Route path="/master/plans" element={mr(MasterPlans, RequireRole)} />
            <Route path="/master/providers" element={mr(MasterProviders, RequireRole)} />
            <Route path="/master/ai-costs" element={mr(MasterAICosts, RequireRole)} />
        </>
    );
}
