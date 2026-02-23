import React from "react";
import { Route } from "react-router-dom";
import { AdminLayout } from "../modules/admin/AdminLayout";
import { Role } from "../modules/auth/AuthContext";

// Admin pages (converted to lazy)
const AdminDashboard = React.lazy(() => import("../modules/admin/pages/AdminDashboard").then(m => ({ default: m.AdminDashboard })));
const ConditionalAdminDashboard = React.lazy(() => import("../modules/admin/pages/ConditionalAdminDashboard").then(m => ({ default: m.ConditionalAdminDashboard })));
const AdminWorks = React.lazy(() => import("../modules/admin/pages/AdminWorks").then(m => ({ default: m.AdminWorks })));
const AdminWorkForm = React.lazy(() => import("../modules/admin/pages/AdminWorkForm").then(m => ({ default: m.AdminWorkForm })));
const AdminTrails = React.lazy(() => import("../modules/admin/pages/AdminTrails").then(m => ({ default: m.AdminTrails })));
const AdminTrailForm = React.lazy(() => import("../modules/admin/pages/AdminTrailForm").then(m => ({ default: m.AdminTrailForm })));
const AdminEvents = React.lazy(() => import("../modules/admin/pages/AdminEvents").then(m => ({ default: m.AdminEvents })));
const AdminEventForm = React.lazy(() => import("../modules/admin/pages/AdminEventForm").then(m => ({ default: m.AdminEventForm })));
const AdminEventDashboard = React.lazy(() => import("../modules/admin/pages/AdminEventDashboard").then(m => ({ default: m.AdminEventDashboard })));
const AdminEventCheckIn = React.lazy(() => import("../modules/admin/pages/AdminEventCheckIn").then(m => ({ default: m.AdminEventCheckIn })));
const AdminQRCodes = React.lazy(() => import("../modules/admin/pages/AdminQRCodes").then(m => ({ default: m.AdminQRCodes })));
const AdminCategories = React.lazy(() => import("../modules/admin/pages/AdminCategories").then(m => ({ default: m.AdminCategories })));
const AdminCategoryForm = React.lazy(() => import("../modules/admin/pages/AdminCategoryForm").then(m => ({ default: m.AdminCategoryForm })));
const AdminVisitors = React.lazy(() => import("../modules/admin/pages/AdminVisitors").then(m => ({ default: m.AdminVisitors })));
const AdminVisitorProfile = React.lazy(() => import("../modules/admin/pages/AdminVisitorProfile").then(m => ({ default: m.AdminVisitorProfile })));
const AdminMuseumSettings = React.lazy(() => import("../modules/admin/pages/AdminMuseumSettings").then(m => ({ default: m.AdminMuseumSettings })));
const AdminTreasureHunt = React.lazy(() => import("../modules/admin/pages/AdminTreasureHunt").then(m => ({ default: m.AdminTreasureHunt })));
const AdminAchievements = React.lazy(() => import("../modules/admin/pages/AdminAchievements").then(m => ({ default: m.AdminAchievements })));
const AdminAchievementForm = React.lazy(() => import("../modules/admin/pages/AdminAchievementForm").then(m => ({ default: m.AdminAchievementForm })));
const AdminAIAssistant = React.lazy(() => import("../modules/admin/pages/AdminAIAssistant").then(m => ({ default: m.AdminAIAssistant })));
const AdminAnalytics = React.lazy(() => import("../modules/admin/pages/AdminAnalytics").then(m => ({ default: m.AdminAnalytics })));
const AdminUploads = React.lazy(() => import("../modules/admin/pages/AdminUploads").then(m => ({ default: m.AdminUploads })));
const AdminInternalUsers = React.lazy(() => import("../modules/admin/pages/AdminInternalUsers").then(m => ({ default: m.AdminInternalUsers })));
const AdminCertificates = React.lazy(() => import("../modules/admin/certificates").then(m => ({ default: m.AdminCertificates })));
const AdminReviews = React.lazy(() => import("../modules/admin/pages/AdminReviews").then(m => ({ default: m.AdminReviews })));
const AdminShop = React.lazy(() => import("../modules/admin/pages/AdminShop").then(m => ({ default: m.AdminShop })));
const AdminSpaces = React.lazy(() => import("../modules/admin/pages/AdminSpaces").then(m => ({ default: m.AdminSpaces })));
const AdminSpaceForm = React.lazy(() => import("../modules/admin/pages/AdminSpaceForm").then(m => ({ default: m.AdminSpaceForm })));
const AdminCalendar = React.lazy(() => import("../modules/admin/pages/AdminCalendar").then(m => ({ default: m.AdminCalendar })));
const AdminMapEditor = React.lazy(() => import("../modules/admin/pages/AdminMapEditor").then(m => ({ default: m.AdminMapEditor })));
const AdminTicketVerifier = React.lazy(() => import("../modules/admin/pages/AdminTicketVerifier").then(m => ({ default: m.AdminTicketVerifier })));
const AdminEventSurvey = React.lazy(() => import("../modules/admin/pages/AdminEventSurvey").then(m => ({ default: m.AdminEventSurvey })));
const AdminEventReport = React.lazy(() => import("../modules/admin/pages/AdminEventReport").then(m => ({ default: m.AdminEventReport })));
const AdminNotices = React.lazy(() => import("../modules/admin/pages/AdminNotices").then(m => ({ default: m.AdminNotices })));
const AdminNoticeForm = React.lazy(() => import("../modules/admin/pages/AdminNoticeForm").then(m => ({ default: m.AdminNoticeForm })));
const AdminProjects = React.lazy(() => import("../modules/admin/pages/AdminProjects").then(m => ({ default: m.AdminProjects })));
const AdminProjectForm = React.lazy(() => import("../modules/admin/pages/AdminProjectForm").then(m => ({ default: m.AdminProjectForm })));
const AdminProviders = React.lazy(() => import("../modules/admin/pages/AdminProviders").then(m => ({ default: m.AdminProviders })));
const AdminProviderForm = React.lazy(() => import("../modules/admin/pages/AdminProviderForm").then(m => ({ default: m.AdminProviderForm })));
const AdminAccessibilityManagement = React.lazy(() => import("../modules/admin/pages/AdminAccessibilityManagement").then(m => ({ default: m.AdminAccessibilityManagement })));
const AdminAccessibilityForm = React.lazy(() => import("../modules/admin/pages/AdminAccessibilityForm").then(m => ({ default: m.AdminAccessibilityForm })));
const AdminEquipments = React.lazy(() => import("../modules/admin/pages/AdminEquipments").then(m => ({ default: m.AdminEquipments })));
const AdminEquipmentForm = React.lazy(() => import("../modules/admin/pages/AdminEquipmentForm").then(m => ({ default: m.AdminEquipmentForm })));
const AdminReports = React.lazy(() => import("../modules/admin/pages/AdminReports").then(m => ({ default: m.AdminReports })));
const SecretaryDashboard = React.lazy(() => import("../modules/admin/pages/SecretaryDashboard"));
const LegalCompliance = React.lazy(() => import("../modules/admin/pages/LegalCompliance"));
const AccessibilityTimeline = React.lazy(() => import("../modules/admin/pages/AccessibilityTimeline"));
const AIUsageDashboard = React.lazy(() => import("../modules/admin/pages/AIUsageDashboard"));

const AdminScannerTrainer = React.lazy(() => import("../modules/admin/pages/AdminScannerTrainer").then(module => ({ default: module.AdminScannerTrainer })));

type RequireRoleProps = { allowed: Role[]; children: React.ReactElement };

/** Helper to wrap admin page with layout + role guard */
const ar = (Component: React.ComponentType, RequireRole: React.FC<RequireRoleProps>) => (
    <RequireRole allowed={["admin"]}>
        <AdminLayout>
            <Component />
        </AdminLayout>
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
            <Route path="/admin/equipamentos" element={ar(AdminEquipments, RequireRole)} />
            <Route path="/admin/equipamentos/novo" element={ar(AdminEquipmentForm, RequireRole)} />
            <Route path="/admin/equipamentos/:id" element={ar(AdminEquipmentForm, RequireRole)} />
            <Route path="/admin/calendario" element={ar(AdminCalendar, RequireRole)} />
            <Route path="/admin/qrcodes" element={ar(AdminQRCodes, RequireRole)} />
            <Route path="/admin/categorias" element={ar(AdminCategories, RequireRole)} />
            <Route path="/admin/categorias/nova" element={ar(AdminCategoryForm, RequireRole)} />
            <Route path="/admin/categorias/:id" element={ar(AdminCategoryForm, RequireRole)} />
            <Route path="/admin/visitantes" element={ar(AdminVisitors, RequireRole)} />
            <Route path="/admin/visitantes/:id" element={ar(AdminVisitorProfile, RequireRole)} />
            <Route path="/admin/configuracoes" element={ar(AdminMuseumSettings, RequireRole)} />
            <Route path="/admin/treasure-hunt" element={ar(AdminTreasureHunt, RequireRole)} />
            <Route path="/admin/conquistas" element={ar(AdminAchievements, RequireRole)} />
            <Route path="/admin/conquistas/nova" element={ar(AdminAchievementForm, RequireRole)} />
            <Route path="/admin/conquistas/:id" element={ar(AdminAchievementForm, RequireRole)} />
            <Route path="/admin/ia" element={ar(AdminAIAssistant, RequireRole)} />
            <Route path="/admin/analytics" element={ar(AdminAnalytics, RequireRole)} />
            <Route path="/admin/uploads" element={ar(AdminUploads, RequireRole)} />
            <Route path="/admin/usuarios" element={ar(AdminInternalUsers, RequireRole)} />
            <Route path="/admin/reviews" element={ar(AdminReviews, RequireRole)} />
            <Route path="/admin/loja" element={ar(AdminShop, RequireRole)} />
            <Route path="/admin/scanner-treinamento" element={ar(AdminScannerTrainer, RequireRole)} />
            <Route path="/admin/mapa-editor" element={ar(AdminMapEditor, RequireRole)} />
            <Route path="/admin/verificar-ingressos" element={ar(AdminTicketVerifier, RequireRole)} />
            <Route path="/admin/certificates/*" element={ar(AdminCertificates, RequireRole)} />
            {/* Municipal Management */}
            <Route path="/admin/editais" element={ar(AdminNotices, RequireRole)} />
            <Route path="/admin/editais/novo" element={ar(AdminNoticeForm, RequireRole)} />
            <Route path="/admin/editais/:id" element={ar(AdminNoticeForm, RequireRole)} />
            <Route path="/admin/projetos" element={ar(AdminProjects, RequireRole)} />
            <Route path="/admin/projetos/novo" element={ar(AdminProjectForm, RequireRole)} />
            <Route path="/admin/projetos/:id" element={ar(AdminProjectForm, RequireRole)} />
            <Route path="/admin/prestadores" element={ar(AdminProviders, RequireRole)} />
            <Route path="/admin/prestadores/novo" element={ar(AdminProviderForm, RequireRole)} />
            <Route path="/admin/prestadores/:id" element={ar(AdminProviderForm, RequireRole)} />
            <Route path="/admin/acessibilidade-gestao" element={ar(AdminAccessibilityManagement, RequireRole)} />
            <Route path="/admin/acessibilidade/novo" element={ar(AdminAccessibilityForm, RequireRole)} />
            <Route path="/admin/acessibilidade/:id" element={ar(AdminAccessibilityForm, RequireRole)} />
            <Route path="/admin/relatorios" element={ar(AdminReports, RequireRole)} />
            {/* Governance / Executive */}
            <Route path="/admin/secretaria" element={ar(SecretaryDashboard, RequireRole)} />
            <Route path="/admin/conformidade-legal" element={ar(LegalCompliance, RequireRole)} />
            <Route path="/admin/timeline-acessibilidade" element={ar(AccessibilityTimeline, RequireRole)} />
            <Route path="/admin/uso-ia" element={ar(AIUsageDashboard, RequireRole)} />
        </>
    );
}
