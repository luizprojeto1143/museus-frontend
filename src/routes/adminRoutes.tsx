import React from "react";
import { Route, Navigate, useLocation } from "react-router-dom";
import { AdminLayout } from "../modules/backoffice/equipment/AdminLayout";
import { Role } from "../modules/auth/AuthContext";
import { isGoLiveAdminPath } from "../config/golive";

const ConditionalAdminDashboard = React.lazy(() => import("../modules/backoffice/equipment/pages/ConditionalAdminDashboard").then(m => ({ default: m.ConditionalAdminDashboard })));
const AdminWorks = React.lazy(() => import("../modules/backoffice/equipment/pages/AdminWorks").then(m => ({ default: m.AdminWorks })));
const AdminWorkForm = React.lazy(() => import("../modules/backoffice/equipment/pages/AdminWorkForm").then(m => ({ default: m.AdminWorkForm })));
const AdminTrails = React.lazy(() => import("../modules/backoffice/equipment/pages/AdminTrails").then(m => ({ default: m.AdminTrails })));
const AdminTrailForm = React.lazy(() => import("../modules/backoffice/equipment/pages/AdminTrailForm").then(m => ({ default: m.AdminTrailForm })));
const AdminEvents = React.lazy(() => import("../modules/backoffice/equipment/pages/AdminEvents").then(m => ({ default: m.AdminEvents })));
const AdminEventForm = React.lazy(() => import("../modules/backoffice/equipment/pages/AdminEventForm").then(m => ({ default: m.AdminEventForm })));
const AdminEventDashboard = React.lazy(() => import("../modules/backoffice/equipment/pages/AdminEventDashboard").then(m => ({ default: m.AdminEventDashboard })));
const AdminEventCheckIn = React.lazy(() => import("../modules/backoffice/equipment/pages/AdminEventCheckIn").then(m => ({ default: m.AdminEventCheckIn })));
const AdminQRCodes = React.lazy(() => import("../modules/backoffice/equipment/pages/AdminQRCodes").then(m => ({ default: m.AdminQRCodes })));
const AdminCategories = React.lazy(() => import("../modules/backoffice/equipment/pages/AdminCategories").then(m => ({ default: m.AdminCategories })));
const AdminCategoryForm = React.lazy(() => import("../modules/backoffice/equipment/pages/AdminCategoryForm").then(m => ({ default: m.AdminCategoryForm })));
const AdminVisitors = React.lazy(() => import("../modules/backoffice/equipment/pages/AdminVisitors").then(m => ({ default: m.AdminVisitors })));
const AdminVisitorProfile = React.lazy(() => import("../modules/backoffice/equipment/pages/AdminVisitorProfile").then(m => ({ default: m.AdminVisitorProfile })));
const AdminMuseumSettings = React.lazy(() => import("../modules/backoffice/equipment/pages/AdminMuseumSettings").then(m => ({ default: m.AdminMuseumSettings })));
const AdminUploads = React.lazy(() => import("../modules/backoffice/equipment/pages/AdminUploads").then(m => ({ default: m.AdminUploads })));
const AdminInternalUsers = React.lazy(() => import("../modules/backoffice/equipment/pages/AdminInternalUsers").then(m => ({ default: m.AdminInternalUsers })));
const AdminCollaboratorForm = React.lazy(() => import("../modules/backoffice/equipment/pages/AdminCollaboratorForm").then(m => ({ default: m.AdminCollaboratorForm })));
const AdminSpaces = React.lazy(() => import("../modules/backoffice/equipment/pages/AdminSpaces").then(m => ({ default: m.AdminSpaces })));
const AdminSpaceForm = React.lazy(() => import("../modules/backoffice/equipment/pages/AdminSpaceForm").then(m => ({ default: m.AdminSpaceForm })));
const AdminCalendar = React.lazy(() => import("../modules/backoffice/equipment/pages/AdminCalendar").then(m => ({ default: m.AdminCalendar })));
const AdminTicketVerifier = React.lazy(() => import("../modules/backoffice/equipment/pages/AdminTicketVerifier").then(m => ({ default: m.AdminTicketVerifier })));
const AdminEventSurvey = React.lazy(() => import("../modules/backoffice/equipment/pages/AdminEventSurvey").then(m => ({ default: m.AdminEventSurvey })));
const AdminEventReport = React.lazy(() => import("../modules/backoffice/equipment/pages/AdminEventReport").then(m => ({ default: m.AdminEventReport })));
const AdminScanner = React.lazy(() => import("../modules/backoffice/equipment/pages/AdminScanner").then(module => ({ default: module.AdminScanner })));
const AdminInPersonServices = React.lazy(() => import("../modules/backoffice/equipment/pages/AdminInPersonServices").then(m => ({ default: m.AdminInPersonServices })));

type RequireRoleProps = { allowed: (Role | string)[]; children: React.ReactElement };

const GoLiveAdminGate: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { pathname } = useLocation();
    if (!isGoLiveAdminPath(pathname)) return <Navigate to="/admin" replace />;
    return children;
};

const ar = (Component: React.ComponentType, RequireRole: React.FC<RequireRoleProps>) => (
    <RequireRole allowed={["admin", "equipment_admin", "equipment_collaborator", "collaborator"]}>
        <GoLiveAdminGate>
            <AdminLayout>
                <Component />
            </AdminLayout>
        </GoLiveAdminGate>
    </RequireRole>
);

export function adminRoutes(RequireRole: React.FC<RequireRoleProps>) {
    return (
        <>
            <Route path="/admin" element={ar(ConditionalAdminDashboard, RequireRole)} />
            <Route path="/admin/obras" element={ar(AdminWorks, RequireRole)} />
            <Route path="/admin/obras/nova" element={ar(AdminWorkForm, RequireRole)} />
            <Route path="/admin/obras/:id" element={ar(AdminWorkForm, RequireRole)} />
            <Route path="/admin/trilhas" element={ar(AdminTrails, RequireRole)} />
            <Route path="/admin/trilhas/nova" element={ar(AdminTrailForm, RequireRole)} />
            <Route path="/admin/trilhas/:id" element={ar(AdminTrailForm, RequireRole)} />
            <Route path="/admin/eventos" element={ar(AdminEvents, RequireRole)} />
            <Route path="/admin/eventos/novo" element={ar(AdminEventForm, RequireRole)} />
            <Route path="/admin/eventos/:id" element={ar(AdminEventForm, RequireRole)} />
            <Route path="/admin/eventos/:id/dashboard" element={ar(AdminEventDashboard, RequireRole)} />
            <Route path="/admin/eventos/:id/checkin" element={ar(AdminEventCheckIn, RequireRole)} />
            <Route path="/admin/eventos/:id/pesquisa" element={ar(AdminEventSurvey, RequireRole)} />
            <Route path="/admin/eventos/:id/relatorio" element={ar(AdminEventReport, RequireRole)} />
            <Route path="/admin/espacos" element={ar(AdminSpaces, RequireRole)} />
            <Route path="/admin/espacos/novo" element={ar(AdminSpaceForm, RequireRole)} />
            <Route path="/admin/espacos/:id" element={ar(AdminSpaceForm, RequireRole)} />
            <Route path="/admin/calendario" element={ar(AdminCalendar, RequireRole)} />
            <Route path="/admin/categorias" element={ar(AdminCategories, RequireRole)} />
            <Route path="/admin/categorias/nova" element={ar(AdminCategoryForm, RequireRole)} />
            <Route path="/admin/categorias/:id" element={ar(AdminCategoryForm, RequireRole)} />
            <Route path="/admin/visitantes" element={ar(AdminVisitors, RequireRole)} />
            <Route path="/admin/visitantes/:id" element={ar(AdminVisitorProfile, RequireRole)} />
            <Route path="/admin/configuracoes" element={ar(AdminMuseumSettings, RequireRole)} />
            <Route path="/admin/configuracoes/servicos" element={ar(AdminInPersonServices, RequireRole)} />
            <Route path="/admin/uploads" element={ar(AdminUploads, RequireRole)} />
            <Route path="/admin/usuarios" element={ar(AdminInternalUsers, RequireRole)} />
            <Route path="/admin/usuarios/novo" element={ar(AdminCollaboratorForm, RequireRole)} />
            <Route path="/admin/usuarios/:id" element={ar(AdminCollaboratorForm, RequireRole)} />
            <Route path="/admin/verificar-ingressos" element={ar(AdminTicketVerifier, RequireRole)} />
            <Route path="/admin/scanner" element={ar(AdminScanner, RequireRole)} />
            <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
        </>
    );
}
