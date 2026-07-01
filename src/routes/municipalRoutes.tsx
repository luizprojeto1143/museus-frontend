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
const MunicipalNotices = React.lazy(() => import("../modules/backoffice/municipal/pages/MunicipalNotices").then(m => ({ default: m.MunicipalNotices })));
const MunicipalNoticeForm = React.lazy(() => import("../modules/backoffice/municipal/pages/MunicipalNoticeForm").then(m => ({ default: m.MunicipalNoticeForm })));
const MunicipalNoticeProjects = React.lazy(() => import("../modules/backoffice/municipal/pages/MunicipalNoticeProjects").then(m => ({ default: m.MunicipalNoticeProjects })));
const MunicipalProjects = React.lazy(() => import("../modules/backoffice/municipal/pages/MunicipalProjects").then(m => ({ default: m.MunicipalProjects })));
const MunicipalProjectForm = React.lazy(() => import("../modules/backoffice/municipal/pages/MunicipalProjectForm").then(m => ({ default: m.MunicipalProjectForm })));
const MunicipalProviders = React.lazy(() => import("../modules/backoffice/municipal/pages/MunicipalProviders").then(m => ({ default: m.MunicipalProviders })));
const MunicipalProviderForm = React.lazy(() => import("../modules/backoffice/municipal/pages/MunicipalProviderForm").then(m => ({ default: m.MunicipalProviderForm })));
const MunicipalTCEExport = React.lazy(() => import("../modules/backoffice/municipal/pages/MunicipalTCEExport").then(m => ({ default: m.MunicipalTCEExport })));
const MunicipalGaps = React.lazy(() => import("../modules/backoffice/municipal/pages/MunicipalGaps").then(m => ({ default: m.MunicipalGaps })));
const MunicipalHeritage = React.lazy(() => import("../modules/backoffice/municipal/pages/MunicipalHeritage").then(m => ({ default: m.MunicipalHeritage })));
const MunicipalCalendar = React.lazy(() => import("../modules/backoffice/municipal/pages/MunicipalCalendar").then(m => ({ default: m.MunicipalCalendar })));
const MunicipalSponsorships = React.lazy(() => import("../modules/backoffice/municipal/pages/MunicipalSponsorships").then(m => ({ default: m.MunicipalSponsorships })));

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
            <Route path="/municipal/equipamentos" element={mun(MunicipalEquipments)} />
            <Route path="/municipal/projects" element={mun(MunicipalNoticeProjects)} />
            <Route path="/municipal/reports" element={mun(MunicipalReports)} />
            <Route path="/municipal/acessibilidade" element={mun(MunicipalAccessibilityGaps)} />
            <Route path="/municipal/ppa" element={mun(MunicipalPPA)} />
            <Route path="/municipal/settings" element={mun(MunicipalSettings)} />

            {/* Rotas migradas do Admin */}
            <Route path="/municipal/editais" element={mun(MunicipalNotices)} />
            <Route path="/municipal/editais/novo" element={mun(MunicipalNoticeForm)} />
            <Route path="/municipal/editais/:id" element={mun(MunicipalNoticeForm)} />
            <Route path="/municipal/editais/:id/projetos" element={mun(MunicipalNoticeProjects)} />
            <Route path="/municipal/projetos" element={mun(MunicipalProjects)} />
            <Route path="/municipal/projetos/novo" element={mun(MunicipalProjectForm)} />
            <Route path="/municipal/projetos/:id" element={mun(MunicipalProjectForm)} />
            <Route path="/municipal/prestadores" element={mun(MunicipalProviders)} />
            <Route path="/municipal/prestadores/novo" element={mun(MunicipalProviderForm)} />
            <Route path="/municipal/prestadores/:id" element={mun(MunicipalProviderForm)} />
            
            <Route path="/municipal/tce" element={mun(MunicipalTCEExport)} />
            <Route path="/municipal/vazios-culturais" element={mun(MunicipalGaps)} />
            <Route path="/municipal/patrimonio" element={mun(MunicipalHeritage)} />
            <Route path="/municipal/calendario" element={mun(MunicipalCalendar)} />
            <Route path="/municipal/patrocinios" element={mun(MunicipalSponsorships)} />
        </>
    );
}
