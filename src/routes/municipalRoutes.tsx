import React from "react";
import { Route } from "react-router-dom";
import { Role } from "../modules/auth/AuthContext";

import { MunicipalLayout } from "../modules/backoffice/municipal/MunicipalLayout";
import { MunicipalDashboard } from "../modules/backoffice/municipal/MunicipalDashboard";
import { MunicipalReports } from "../modules/backoffice/municipal/MunicipalReports";
import { MunicipalEquipments } from "../modules/backoffice/municipal/MunicipalEquipments";
import { MunicipalSettings } from "../modules/backoffice/municipal/MunicipalSettings";
import { MunicipalNoticeProjects } from "../modules/backoffice/municipal/MunicipalNoticeProjects";
import { MunicipalAccessibilityGaps } from "../modules/backoffice/municipal/MunicipalAccessibilityGaps";
import { MunicipalPPA } from "../modules/backoffice/municipal/MunicipalPPA";

// Moved from Admin
const AdminNotices = React.lazy(() => import("../modules/backoffice/equipment/pages/AdminNotices").then(m => ({ default: m.AdminNotices })));
const AdminNoticeForm = React.lazy(() => import("../modules/backoffice/equipment/pages/AdminNoticeForm").then(m => ({ default: m.AdminNoticeForm })));
const AdminNoticeProjects = React.lazy(() => import("../modules/backoffice/equipment/pages/AdminNoticeProjects").then(m => ({ default: m.AdminNoticeProjects })));
const AdminProjects = React.lazy(() => import("../modules/backoffice/equipment/pages/AdminProjects").then(m => ({ default: m.AdminProjects })));
const AdminProjectForm = React.lazy(() => import("../modules/backoffice/equipment/pages/AdminProjectForm").then(m => ({ default: m.AdminProjectForm })));
const AdminProviders = React.lazy(() => import("../modules/backoffice/equipment/pages/AdminProviders").then(m => ({ default: m.AdminProviders })));
const AdminProviderForm = React.lazy(() => import("../modules/backoffice/equipment/pages/AdminProviderForm").then(m => ({ default: m.AdminProviderForm })));
const AdminTCEExport = React.lazy(() => import("../modules/backoffice/equipment/pages/AdminTCEExport").then(m => ({ default: m.AdminTCEExport })));
const AdminMunicipalGaps = React.lazy(() => import("../modules/backoffice/equipment/pages/AdminMunicipalGaps").then(m => ({ default: m.AdminMunicipalGaps })));
const AdminHeritage = React.lazy(() => import("../modules/backoffice/equipment/pages/AdminHeritage").then(m => ({ default: m.AdminHeritage })));
const AdminMunicipalCalendar = React.lazy(() => import("../modules/backoffice/equipment/pages/AdminMunicipalCalendar").then(m => ({ default: m.AdminMunicipalCalendar })));

type RequireRoleProps = { allowed: Role[]; children: React.ReactElement };

export function municipalRoutes(RequireRole: React.FC<RequireRoleProps>) {
    const mun = (Component: React.ComponentType) => (
        <RequireRole allowed={["admin", "master"]}>
            <MunicipalLayout>
                <Component />
            </MunicipalLayout>
        </RequireRole>
    );

    return (
        <>
            <Route path="/municipal" element={mun(MunicipalDashboard)} />
            <Route path="/municipal/equipments" element={mun(MunicipalEquipments)} />
            <Route path="/municipal/projects" element={mun(MunicipalNoticeProjects)} />
            <Route path="/municipal/reports" element={mun(MunicipalReports)} />
            <Route path="/municipal/compliance" element={mun(MunicipalAccessibilityGaps)} />
            <Route path="/municipal/ppa" element={mun(MunicipalPPA)} />
            <Route path="/municipal/settings" element={mun(MunicipalSettings)} />

            {/* Rotas migradas do Admin */}
            <Route path="/municipal/editais" element={mun(AdminNotices)} />
            <Route path="/municipal/editais/novo" element={mun(AdminNoticeForm)} />
            <Route path="/municipal/editais/:id" element={mun(AdminNoticeForm)} />
            <Route path="/municipal/editais/:id/projetos" element={mun(AdminNoticeProjects)} />
            <Route path="/municipal/projetos" element={mun(AdminProjects)} />
            <Route path="/municipal/projetos/novo" element={mun(AdminProjectForm)} />
            <Route path="/municipal/projetos/:id" element={mun(AdminProjectForm)} />
            <Route path="/municipal/prestadores" element={mun(AdminProviders)} />
            <Route path="/municipal/prestadores/novo" element={mun(AdminProviderForm)} />
            <Route path="/municipal/prestadores/:id" element={mun(AdminProviderForm)} />
            
            <Route path="/municipal/tce" element={mun(AdminTCEExport)} />
            <Route path="/municipal/vazios-culturais" element={mun(AdminMunicipalGaps)} />
            <Route path="/municipal/patrimonio" element={mun(AdminHeritage)} />
            <Route path="/municipal/calendario" element={mun(AdminMunicipalCalendar)} />
        </>
    );
}
