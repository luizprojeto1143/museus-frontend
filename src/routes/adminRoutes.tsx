import React from "react";
import { Route } from "react-router-dom";
import { AdminLayout } from "../modules/admin/AdminLayout";
import { Role } from "../modules/auth/AuthContext";

// Admin pages
import { AdminDashboard } from "../modules/admin/pages/AdminDashboard";
import { ConditionalAdminDashboard } from "../modules/admin/pages/ConditionalAdminDashboard";
import { AdminWorks } from "../modules/admin/pages/AdminWorks";
import { AdminWorkForm } from "../modules/admin/pages/AdminWorkForm";
import { AdminTrails } from "../modules/admin/pages/AdminTrails";
import { AdminTrailForm } from "../modules/admin/pages/AdminTrailForm";
import { AdminEvents } from "../modules/admin/pages/AdminEvents";
import { AdminEventForm } from "../modules/admin/pages/AdminEventForm";
import { AdminEventDashboard } from "../modules/admin/pages/AdminEventDashboard";
import { AdminEventCheckIn } from "../modules/admin/pages/AdminEventCheckIn";
import { AdminQRCodes } from "../modules/admin/pages/AdminQRCodes";
import { AdminCategories } from "../modules/admin/pages/AdminCategories";
import { AdminCategoryForm } from "../modules/admin/pages/AdminCategoryForm";
import { AdminVisitors } from "../modules/admin/pages/AdminVisitors";
import { AdminVisitorProfile } from "../modules/admin/pages/AdminVisitorProfile";
import { AdminMuseumSettings } from "../modules/admin/pages/AdminMuseumSettings";
import { AdminTreasureHunt } from "../modules/admin/pages/AdminTreasureHunt";
import { AdminAchievements } from "../modules/admin/pages/AdminAchievements";
import { AdminAchievementForm } from "../modules/admin/pages/AdminAchievementForm";
import { AdminAIAssistant } from "../modules/admin/pages/AdminAIAssistant";
import { AdminAnalytics } from "../modules/admin/pages/AdminAnalytics";
import { AdminUploads } from "../modules/admin/pages/AdminUploads";
import { AdminInternalUsers } from "../modules/admin/pages/AdminInternalUsers";
import { AdminCertificates } from "../modules/admin/certificates";
import { AdminReviews } from "../modules/admin/pages/AdminReviews";
import { AdminShop } from "../modules/admin/pages/AdminShop";
import { AdminSpaces } from "../modules/admin/pages/AdminSpaces";
import { AdminSpaceForm } from "../modules/admin/pages/AdminSpaceForm";
import { AdminCalendar } from "../modules/admin/pages/AdminCalendar";
import { AdminMapEditor } from "../modules/admin/pages/AdminMapEditor";
import { AdminTicketVerifier } from "../modules/admin/pages/AdminTicketVerifier";
import { AdminEventSurvey } from "../modules/admin/pages/AdminEventSurvey";
import { AdminEventReport } from "../modules/admin/pages/AdminEventReport";
import { AdminNotices } from "../modules/admin/pages/AdminNotices";
import { AdminNoticeForm } from "../modules/admin/pages/AdminNoticeForm";
import { AdminProjects } from "../modules/admin/pages/AdminProjects";
import { AdminProjectForm } from "../modules/admin/pages/AdminProjectForm";
import { AdminProviders } from "../modules/admin/pages/AdminProviders";
import { AdminProviderForm } from "../modules/admin/pages/AdminProviderForm";
import { AdminAccessibilityManagement } from "../modules/admin/pages/AdminAccessibilityManagement";
import { AdminAccessibilityForm } from "../modules/admin/pages/AdminAccessibilityForm";
import { AdminEquipments } from "../modules/admin/pages/AdminEquipments";
import { AdminEquipmentForm } from "../modules/admin/pages/AdminEquipmentForm";
import { AdminReports } from "../modules/admin/pages/AdminReports";
import SecretaryDashboard from "../modules/admin/pages/SecretaryDashboard";
import LegalCompliance from "../modules/admin/pages/LegalCompliance";
import AccessibilityTimeline from "../modules/admin/pages/AccessibilityTimeline";
import AIUsageDashboard from "../modules/admin/pages/AIUsageDashboard";

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
