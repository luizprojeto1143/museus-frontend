import React from "react";
import { Route } from "react-router-dom";
import { MasterLayout } from "../modules/master/MasterLayout";
import { Role } from "../types/auth";

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
import { MasterInPersonServices } from "../modules/master/pages/MasterInPersonServices";
import { MasterSkinManager } from "../modules/master/pages/MasterSkinManager";
import { MasterBadgeQueue } from "../modules/master/pages/MasterBadgeQueue";
import { MasterErrorMonitor } from "../modules/master/pages/MasterErrorMonitor";
import { MasterCardManager } from "../modules/master/pages/MasterCardManager";
import { MasterFinancialSettings } from "../modules/master/pages/MasterFinancialSettings";
import { MasterFinancialFees } from "../modules/master/pages/MasterFinancialFees";

import { MasterMonitoring } from "../modules/master/pages/MasterMonitoring";
import { MasterErrorLogs } from "../modules/master/pages/MasterErrorLogs";
import { MasterSecurityEvents } from "../modules/master/pages/MasterSecurityEvents";
import { MasterIntegrationLogs } from "../modules/master/pages/MasterIntegrationLogs";
import { MasterJobLogs } from "../modules/master/pages/MasterJobLogs";
import { MasterTenantActivity } from "../modules/master/pages/MasterTenantActivity";

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
            <Route path="/master/servicos-presenciais" element={mr(MasterInPersonServices, RequireRole)} />
            <Route path="/master/skins" element={mr(MasterSkinManager, RequireRole)} />
            <Route path="/master/badges" element={mr(MasterBadgeQueue, RequireRole)} />
            <Route path="/master/error-monitor" element={mr(MasterErrorMonitor, RequireRole)} />
            <Route path="/master/cards" element={mr(MasterCardManager, RequireRole)} />
            <Route path="/master/financeiro" element={mr(MasterFinancialSettings, RequireRole)} />
            <Route path="/master/financeiro/taxas" element={mr(MasterFinancialFees, RequireRole)} />

            {/* Sprint 14 Observability Routes */}
            <Route path="/master/monitoramento" element={mr(MasterMonitoring, RequireRole)} />
            <Route path="/master/monitoramento/erros" element={mr(MasterErrorLogs, RequireRole)} />
            <Route path="/master/monitoramento/auditoria" element={mr(MasterAuditLogs, RequireRole)} />
            <Route path="/master/monitoramento/seguranca" element={mr(MasterSecurityEvents, RequireRole)} />
            <Route path="/master/monitoramento/integracoes" element={mr(MasterIntegrationLogs, RequireRole)} />
            <Route path="/master/monitoramento/jobs" element={mr(MasterJobLogs, RequireRole)} />
            <Route path="/master/tenants/:tenantId/activity" element={mr(MasterTenantActivity, RequireRole)} />
        </>
    );
}
