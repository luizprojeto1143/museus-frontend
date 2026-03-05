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
const AdminNoticeProjects = React.lazy(() => import("../modules/admin/pages/AdminNoticeProjects").then(m => ({ default: m.AdminNoticeProjects })));
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
const AdminScanner = React.lazy(() => import("../modules/admin/pages/AdminScanner").then(module => ({ default: module.AdminScanner })));
const AdminFinance = React.lazy(() => import("../modules/admin/pages/AdminFinance").then(module => ({ default: module.AdminFinance })));
const AdminCoupons = React.lazy(() => import("../modules/admin/pages/AdminCoupons").then(m => ({ default: m.AdminCoupons })));
const AdminNotifications = React.lazy(() => import("../modules/admin/pages/AdminNotifications").then(m => ({ default: m.AdminNotifications })));
const AdminDonations = React.lazy(() => import("../modules/admin/pages/AdminDonations").then(m => ({ default: m.AdminDonations })));
const AdminContacts = React.lazy(() => import("../modules/admin/pages/AdminContacts").then(m => ({ default: m.AdminContacts })));
const AdminNewsletter = React.lazy(() => import("../modules/admin/pages/AdminNewsletter").then(m => ({ default: m.AdminNewsletter })));
const AdminCuratorNotes = React.lazy(() => import("../modules/admin/pages/AdminCuratorNotes").then(m => ({ default: m.AdminCuratorNotes })));
const AdminNPS = React.lazy(() => import("../modules/admin/pages/AdminNPS").then(m => ({ default: m.AdminNPS })));
const AdminSentimentAnalysis = React.lazy(() => import("../modules/admin/pages/AdminSentimentAnalysis").then(m => ({ default: m.AdminSentimentAnalysis })));
const AdminHeatmap = React.lazy(() => import("../modules/admin/pages/AdminHeatmap").then(m => ({ default: m.AdminHeatmap })));
const AdminFunnel = React.lazy(() => import("../modules/admin/pages/AdminFunnel").then(m => ({ default: m.AdminFunnel })));
const AdminTeachers = React.lazy(() => import("../modules/admin/pages/AdminTeachers").then(m => ({ default: m.AdminTeachers })));
const AdminMemberships = React.lazy(() => import("../modules/admin/pages/AdminMemberships").then(m => ({ default: m.AdminMemberships })));
const AdminVolunteers = React.lazy(() => import("../modules/admin/pages/AdminVolunteers").then(m => ({ default: m.AdminVolunteers })));
const AdminConservation = React.lazy(() => import("../modules/admin/pages/AdminConservation").then(m => ({ default: m.AdminConservation })));
const AdminPPA = React.lazy(() => import("../modules/admin/pages/AdminPPA").then(m => ({ default: m.AdminPPA })));
const AdminCollectibles = React.lazy(() => import("../modules/admin/pages/AdminCollectibles").then(m => ({ default: m.AdminCollectibles })));
const AdminTranslations = React.lazy(() => import("../modules/admin/pages/AdminTranslations").then(m => ({ default: m.AdminTranslations })));
const AdminModeration = React.lazy(() => import("../modules/admin/pages/AdminModeration").then(m => ({ default: m.AdminModeration })));
const AdminMuseumBattle = React.lazy(() => import("../modules/admin/pages/AdminMuseumBattle").then(m => ({ default: m.AdminMuseumBattle })));
const AdminSponsorships = React.lazy(() => import("../modules/admin/pages/AdminSponsorships").then(m => ({ default: m.AdminSponsorships })));
const AdminMunicipalCalendar = React.lazy(() => import("../modules/admin/pages/AdminMunicipalCalendar").then(m => ({ default: m.AdminMunicipalCalendar })));
const AdminTCEExport = React.lazy(() => import("../modules/admin/pages/AdminTCEExport").then(m => ({ default: m.AdminTCEExport })));
const AdminKidsMode = React.lazy(() => import("../modules/admin/pages/AdminKidsMode").then(m => ({ default: m.AdminKidsMode })));
const AdminAIDescriptions = React.lazy(() => import("../modules/admin/pages/AdminAIDescriptions").then(m => ({ default: m.AdminAIDescriptions })));
const AdminInstagramCard = React.lazy(() => import("../modules/admin/pages/AdminInstagramCard").then(m => ({ default: m.AdminInstagramCard })));
const AdminHeritage = React.lazy(() => import("../modules/admin/pages/AdminHeritage").then(m => ({ default: m.AdminHeritage })));
const AdminMunicipalGaps = React.lazy(() => import("../modules/admin/pages/AdminMunicipalGaps").then(m => ({ default: m.AdminMunicipalGaps })));
const AdminGroupTickets = React.lazy(() => import("../modules/admin/pages/AdminGroupTickets").then(m => ({ default: m.AdminGroupTickets })));

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
            <Route path="/admin/scanner" element={ar(AdminScanner, RequireRole)} />
            <Route path="/admin/financeiro" element={ar(AdminFinance, RequireRole)} />
            <Route path="/admin/cupons" element={ar(AdminCoupons, RequireRole)} />
            <Route path="/admin/notificacoes" element={ar(AdminNotifications, RequireRole)} />
            <Route path="/admin/certificates/*" element={ar(AdminCertificates, RequireRole)} />
            {/* Municipal Management */}
            <Route path="/admin/editais" element={ar(AdminNotices, RequireRole)} />
            <Route path="/admin/editais/novo" element={ar(AdminNoticeForm, RequireRole)} />
            <Route path="/admin/editais/:id" element={ar(AdminNoticeForm, RequireRole)} />
            <Route path="/admin/editais/:id/projetos" element={ar(AdminNoticeProjects, RequireRole)} />
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
            <Route path="/admin/doacoes" element={ar(AdminDonations, RequireRole)} />
            <Route path="/admin/contatos" element={ar(AdminContacts, RequireRole)} />
            <Route path="/admin/newsletter" element={ar(AdminNewsletter, RequireRole)} />
            {/* Phase 1 — Analytics & UX */}
            <Route path="/admin/notas-curador" element={ar(AdminCuratorNotes, RequireRole)} />
            <Route path="/admin/nps" element={ar(AdminNPS, RequireRole)} />
            <Route path="/admin/sentimento" element={ar(AdminSentimentAnalysis, RequireRole)} />
            <Route path="/admin/heatmap" element={ar(AdminHeatmap, RequireRole)} />
            <Route path="/admin/funil" element={ar(AdminFunnel, RequireRole)} />
            {/* Phase 2 — Education */}
            <Route path="/admin/educacao" element={ar(AdminTeachers, RequireRole)} />
            {/* Phase 3 — Monetization */}
            <Route path="/admin/assinaturas" element={ar(AdminMemberships, RequireRole)} />
            {/* Phase 4 — Municipal */}
            <Route path="/admin/voluntarios" element={ar(AdminVolunteers, RequireRole)} />
            <Route path="/admin/conservacao" element={ar(AdminConservation, RequireRole)} />
            <Route path="/admin/metas-ppa" element={ar(AdminPPA, RequireRole)} />
            {/* Phase 5 — Gamification, AI & i18n */}
            <Route path="/admin/colecao" element={ar(AdminCollectibles, RequireRole)} />
            <Route path="/admin/traducoes" element={ar(AdminTranslations, RequireRole)} />
            <Route path="/admin/moderacao" element={ar(AdminModeration, RequireRole)} />
            <Route path="/admin/battle" element={ar(AdminMuseumBattle, RequireRole)} />
            {/* Monetization extras */}
            <Route path="/admin/patrocinios" element={ar(AdminSponsorships, RequireRole)} />
            {/* Municipal extras */}
            <Route path="/admin/calendario-municipal" element={ar(AdminMunicipalCalendar, RequireRole)} />
            <Route path="/admin/tce" element={ar(AdminTCEExport, RequireRole)} />
            {/* Advanced Features */}
            <Route path="/admin/modo-crianca" element={ar(AdminKidsMode, RequireRole)} />
            <Route path="/admin/ia-descricoes" element={ar(AdminAIDescriptions, RequireRole)} />
            <Route path="/admin/instagram" element={ar(AdminInstagramCard, RequireRole)} />
            {/* Final Batch */}
            <Route path="/admin/patrimonio" element={ar(AdminHeritage, RequireRole)} />
            <Route path="/admin/vazios" element={ar(AdminMunicipalGaps, RequireRole)} />
            <Route path="/admin/ingressos-grupo" element={ar(AdminGroupTickets, RequireRole)} />
        </>
    );
}
