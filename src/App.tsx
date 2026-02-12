import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth, Role } from "./modules/auth/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

import { VisitorLayout } from "./modules/visitor/VisitorLayout";
import { AdminLayout } from "./modules/admin/AdminLayout";
import { MasterLayout } from "./modules/master/MasterLayout";

// Auth
import { Login } from "./modules/auth/Login";
import { RegisterWrapper } from "./modules/auth/RegisterWrapper";
import { RegisterProducer } from "./modules/auth/RegisterProducer"; // NEW
import { LandingPage } from "./modules/public/LandingPage"; // NEW
import { GamificationProvider } from "./modules/gamification/context/GamificationContext";
import { GeoFencingProvider } from "./modules/visitor/context/GeoFencingProvider";
import { AudioProvider } from "./modules/visitor/context/AudioContext";
import { ToastProvider } from "./contexts/ToastContext"; // NEW

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

// Public pages
import { Welcome } from "./modules/visitor/pages/Welcome";
import { SelectMuseum } from "./modules/visitor/pages/SelectMuseum";

// Visitor pages
// Visitor pages - Lazy Loaded AI Components
const VisualScannerPage = React.lazy(() => import("./modules/visitor/pages/VisualScannerPage").then(module => ({ default: module.VisualScannerPage })));
const ScannerHub = React.lazy(() => import("./modules/visitor/pages/ScannerHub").then(module => ({ default: module.ScannerHub })));
const ScannerPage = React.lazy(() => import("./modules/visitor/pages/ScannerPage").then(module => ({ default: module.ScannerPage })));

// Visitor pages - Standard
import { Home } from "./modules/visitor/pages/Home";
import { WorksList } from "./modules/visitor/pages/WorksList";
import { WorkDetail } from "./modules/visitor/pages/WorkDetail";
import { TrailsList } from "./modules/visitor/pages/TrailsList";
import { TrailDetail } from "./modules/visitor/pages/TrailDetail";
import { MapView } from "./modules/visitor/pages/MapView";
import { EventsList } from "./modules/visitor/pages/EventsList";
import { EventDetail } from "./modules/visitor/pages/EventDetail";
import { Favorites } from "./modules/visitor/pages/Favorites";
import ChatAI from "./modules/visitor/pages/ChatAI";
import Souvenir from "./modules/visitor/pages/Souvenir";
import Passport from "./modules/visitor/pages/Passport";
import Achievements from "./modules/visitor/pages/Achievements";
import { QrVisit } from "./modules/visitor/pages/QrVisit";
import TreasureHunt from "./modules/visitor/pages/TreasureHunt";
import { SmartItineraryWizard } from "./modules/visitor/pages/SmartItineraryWizard";
import { SmartItineraryResult } from "./modules/visitor/pages/SmartItineraryResult";
import { SchedulingPage } from "./modules/visitor/pages/SchedulingPage";
import { GuestbookPage } from "./modules/visitor/pages/GuestbookPage";
import { LeaderboardPage } from "./modules/visitor/pages/LeaderboardPage";
import { VisitorProfile } from "./modules/visitor/pages/VisitorProfile";
import { CertificateValidator } from "./modules/public/CertificateValidator";
import { ShopPage } from "./modules/visitor/pages/ShopPage";
import { ChallengesPage } from "./modules/visitor/pages/ChallengesPage";
import { EventSurveyPage } from "./modules/visitor/pages/EventSurveyPage";


// Admin pages
import { AdminDashboard } from "./modules/admin/pages/AdminDashboard";
import { ConditionalAdminDashboard } from "./modules/admin/pages/ConditionalAdminDashboard";
import { AdminWorks } from "./modules/admin/pages/AdminWorks";
import { AdminWorkForm } from "./modules/admin/pages/AdminWorkForm";
import { AdminTrails } from "./modules/admin/pages/AdminTrails";
import { AdminTrailForm } from "./modules/admin/pages/AdminTrailForm";
import { AdminEvents } from "./modules/admin/pages/AdminEvents";
import { AdminEventForm } from "./modules/admin/pages/AdminEventForm";
import { AdminEventDashboard } from "./modules/admin/pages/AdminEventDashboard";
import { AdminEventCheckIn } from "./modules/admin/pages/AdminEventCheckIn";
import { AdminQRCodes } from "./modules/admin/pages/AdminQRCodes";
import { AdminCategories } from "./modules/admin/pages/AdminCategories";
import { AdminCategoryForm } from "./modules/admin/pages/AdminCategoryForm";
import { AdminVisitors } from "./modules/admin/pages/AdminVisitors";
import { AdminVisitorProfile } from "./modules/admin/pages/AdminVisitorProfile";
import { AdminMuseumSettings } from "./modules/admin/pages/AdminMuseumSettings";
import { AdminTreasureHunt } from "./modules/admin/pages/AdminTreasureHunt";
import { AdminAchievements } from "./modules/admin/pages/AdminAchievements";
import { AdminAchievementForm } from "./modules/admin/pages/AdminAchievementForm";
import { AdminAIAssistant } from "./modules/admin/pages/AdminAIAssistant";
import { AdminAnalytics } from "./modules/admin/pages/AdminAnalytics";
import { AdminUploads } from "./modules/admin/pages/AdminUploads";
import { AdminInternalUsers } from "./modules/admin/pages/AdminInternalUsers";
import { AdminCertificates } from "./modules/admin/certificates";
import { AdminReviews } from "./modules/admin/pages/AdminReviews";
import { AdminShop } from "./modules/admin/pages/AdminShop";
import { AdminSpaces } from "./modules/admin/pages/AdminSpaces";
import { AdminSpaceForm } from "./modules/admin/pages/AdminSpaceForm";
import { AdminCalendar } from "./modules/admin/pages/AdminCalendar";

// Lazy Loaded Admin Component
const AdminScannerTrainer = React.lazy(() => import("./modules/admin/pages/AdminScannerTrainer").then(module => ({ default: module.AdminScannerTrainer })));

import { AdminMapEditor } from "./modules/admin/pages/AdminMapEditor";
import { AdminTicketVerifier } from "./modules/admin/pages/AdminTicketVerifier";
import { AdminEventSurvey } from "./modules/admin/pages/AdminEventSurvey";
import { AdminEventReport } from "./modules/admin/pages/AdminEventReport";

// Municipal Management Pages
import { AdminNotices } from "./modules/admin/pages/AdminNotices";
import { AdminNoticeForm } from "./modules/admin/pages/AdminNoticeForm";
import { AdminProjects } from "./modules/admin/pages/AdminProjects";
import { AdminProjectForm } from "./modules/admin/pages/AdminProjectForm";
import { AdminProviders } from "./modules/admin/pages/AdminProviders";
import { AdminProviderForm } from "./modules/admin/pages/AdminProviderForm";
import { AdminAccessibilityManagement } from "./modules/admin/pages/AdminAccessibilityManagement";
import { AdminAccessibilityForm } from "./modules/admin/pages/AdminAccessibilityForm";
import { AdminEquipments } from "./modules/admin/pages/AdminEquipments";
import { AdminReports } from "./modules/admin/pages/AdminReports";

// Governance / Executive Pages
import SecretaryDashboard from "./modules/admin/pages/SecretaryDashboard";
import LegalCompliance from "./modules/admin/pages/LegalCompliance";
import AccessibilityTimeline from "./modules/admin/pages/AccessibilityTimeline";
import AIUsageDashboard from "./modules/admin/pages/AIUsageDashboard";

// Master pages
import { MasterDashboard } from "./modules/master/pages/MasterDashboard";
import { TenantsList } from "./modules/master/pages/TenantsList";
import { TenantForm } from "./modules/master/pages/TenantForm";
import { MasterSeeder } from "./modules/master/pages/MasterSeeder";
import { MasterUsers } from "./modules/master/pages/MasterUsers";
import { MasterUserForm } from "./modules/master/pages/MasterUserForm";
import { MasterAchievements } from "./modules/master/pages/MasterAchievements";
import { MasterAchievementForm } from "./modules/master/pages/MasterAchievementForm";
import { MasterAuditLogs } from "./modules/master/pages/MasterAuditLogs";
import { MasterAccessibilityRequests } from "./modules/master/pages/MasterAccessibilityRequests";
import { MasterSystemHealth } from "./modules/master/pages/MasterSystemHealth";
import { MasterMessages } from "./modules/master/pages/MasterMessages";
import MasterPlans from "./modules/master/pages/MasterPlans";
import { MasterProviders } from "./modules/master/pages/MasterProviders";

import { GlobalEvents } from "./modules/public/GlobalEvents";
import { ForgotPassword } from "./modules/auth/ForgotPassword";
import { NotFound } from "./modules/public/NotFound";

// Producer pages
import { ProducerLayout } from "./modules/producer/ProducerLayout";
import { ProducerDashboard } from "./modules/producer/ProducerDashboard";
import { ProducerEvents } from "./modules/producer/ProducerEvents"; // NEW
import { ProducerProjects } from "./modules/producer/ProducerProjects"; // NEW
import { ProducerEventForm } from "./modules/producer/ProducerEventForm"; // NEW
import { ProducerProjectForm } from "./modules/producer/ProducerProjectForm"; // NEW
import { ProducerServices } from "./modules/producer/ProducerServices";
import { ProducerTickets } from "./modules/producer/ProducerTickets";

// Totem Pages
import { TotemLayout } from "./modules/totem/TotemLayout";
import { TotemDashboard } from "./modules/totem/pages/TotemDashboard";
import { TotemValidator } from "./modules/totem/pages/TotemValidator";
import { TotemEvents } from "./modules/totem/pages/TotemEvents";
import { TotemEventDetails } from "./modules/totem/pages/TotemEventDetails";
import { TotemSearch } from "./modules/totem/pages/TotemSearch";

import { ProducerAudience } from "./modules/producer/ProducerAudience";
import { ProducerReports } from "./modules/producer/ProducerReports";
import { ProducerNotices } from "./modules/producer/ProducerNotices"; // NEW
import { ProducerProfile } from "./modules/producer/ProducerProfile"; // NEW
import { ProducerSettings } from "./modules/producer/ProducerSettings"; // NEW

const RequireRole: React.FC<{ allowed: Role[]; children: React.ReactElement }> = ({
  allowed,
  children
}) => {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !role) {
    return <Navigate to="/welcome" replace state={{ from: location }} />;
  }

  if (!allowed.includes(role)) {
    // visitante logado tentando acessar área não permitida
    return <Navigate to="/" replace />;
  }

  return children;
};

const RootRedirector: React.FC = () => {
  const { role } = useAuth();
  if (role === "master") return <Navigate to="/master" replace />;
  if (role === "admin") return <Navigate to="/admin" replace />;

  return (
    <VisitorLayout>
      <Home />
    </VisitorLayout>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { background: "#333", color: "#fff" },
          success: { style: { background: "#10b981" } },
          error: { style: { background: "#ef4444" } }
        }}
      />
      <GamificationProvider>
        <GeoFencingProvider>
          <AudioProvider>
            <ToastProvider> {/* NEW */}
              <React.Suspense fallback={
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#1a1a1a', color: '#d4af37' }}>
                  Loading...
                </div>
              }>
                <Routes>
                  {/* PUBLIC ROUTES */}
                  <Route path="/welcome" element={<Welcome />} />
                  <Route path="/select-museum" element={<SelectMuseum />} />
                  <Route path="/verify/:code" element={<CertificateValidator />} />
                  <Route path="users" element={<MasterUsers />} />

                  <Route path="tenants" element={<TenantsList />} />

                  {/* Landing Page Institucional (Raiz) */}
                  <Route path="/" element={<LandingPage />} />

                  {/* Cadastro de Produtor - Novo Fluxo */}
                  <Route path="/sou-produtor" element={<RegisterProducer />} />

                  {/* Redirecionamento legado para quem já está logado ou quer ir direto pro app */}
                  <Route
                    path="/app"
                    element={
                      <RequireRole allowed={["visitor", "admin", "master"]}>
                        <RootRedirector />
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/home"
                    element={
                      <RequireRole allowed={["visitor", "admin", "master"]}>
                        <VisitorLayout>
                          <Home />
                        </VisitorLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/obras"
                    element={
                      <RequireRole allowed={["visitor", "admin", "master"]}>
                        <VisitorLayout>
                          <WorksList />
                        </VisitorLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/obras/:id"
                    element={
                      <RequireRole allowed={["visitor", "admin", "master"]}>
                        <VisitorLayout>
                          <WorkDetail />
                        </VisitorLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/trilhas"
                    element={
                      <RequireRole allowed={["visitor", "admin", "master"]}>
                        <VisitorLayout>
                          <TrailsList />
                        </VisitorLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/trilhas/:id"
                    element={
                      <RequireRole allowed={["visitor", "admin", "master"]}>
                        <VisitorLayout>
                          <TrailDetail />
                        </VisitorLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/mapa"
                    element={
                      <RequireRole allowed={["visitor", "admin", "master"]}>
                        <VisitorLayout>
                          <MapView />
                        </VisitorLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/eventos"
                    element={
                      <RequireRole allowed={["visitor", "admin", "master"]}>
                        <VisitorLayout>
                          <EventsList />
                        </VisitorLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/eventos/:id"
                    element={
                      <RequireRole allowed={["visitor", "admin", "master"]}>
                        <VisitorLayout>
                          <EventDetail />
                        </VisitorLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/eventos/:id/pesquisa"
                    element={
                      <RequireRole allowed={["visitor", "admin", "master"]}>
                        <VisitorLayout>
                          <EventSurveyPage />
                        </VisitorLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/favoritos"
                    element={
                      <RequireRole allowed={["visitor", "admin", "master"]}>
                        <VisitorLayout>
                          <Favorites />
                        </VisitorLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/loja"
                    element={
                      <RequireRole allowed={["visitor", "admin", "master"]}>
                        <VisitorLayout>
                          <ShopPage />
                        </VisitorLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/desafios"
                    element={
                      <RequireRole allowed={["visitor", "admin", "master"]}>
                        <VisitorLayout>
                          <ChallengesPage />
                        </VisitorLayout>
                      </RequireRole>
                    }
                  />



                  <Route
                    path="/perfil"
                    element={
                      <RequireRole allowed={["visitor", "admin", "master"]}>
                        <VisitorLayout>
                          <VisitorProfile />
                        </VisitorLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/chat"
                    element={
                      <RequireRole allowed={["visitor", "admin", "master"]}>
                        <VisitorLayout>
                          <ChatAI />
                        </VisitorLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/souvenir"
                    element={
                      <RequireRole allowed={["visitor", "admin", "master"]}>
                        <VisitorLayout>
                          <Souvenir />
                        </VisitorLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/passaporte"
                    element={
                      <RequireRole allowed={["visitor", "admin", "master"]}>
                        <VisitorLayout>
                          <Passport />
                        </VisitorLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/conquistas"
                    element={
                      <RequireRole allowed={["visitor", "admin", "master"]}>
                        <VisitorLayout>
                          <Achievements />
                        </VisitorLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/livro-visitas"
                    element={
                      <RequireRole allowed={["visitor", "admin", "master"]}>
                        <VisitorLayout>
                          <GuestbookPage />
                        </VisitorLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/roteiro-inteligente"
                    element={
                      <RequireRole allowed={["visitor", "admin", "master"]}>
                        <VisitorLayout>
                          <SmartItineraryWizard />
                        </VisitorLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/agendar"
                    element={
                      <RequireRole allowed={["visitor", "admin", "master"]}>
                        <VisitorLayout>
                          <SchedulingPage />
                        </VisitorLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/roteiro-inteligente/resultado"
                    element={
                      <RequireRole allowed={["visitor", "admin", "master"]}>
                        <VisitorLayout>
                          <SmartItineraryResult />
                        </VisitorLayout>
                      </RequireRole>
                    }
                  />
                  {/* SCANNER HUB & SUB-ROUTES */}
                  <Route
                    path="/scanner"
                    element={
                      <RequireRole allowed={["visitor", "admin", "master"]}>
                        <VisitorLayout>
                          <ScannerHub />
                        </VisitorLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/scanner/qr"
                    element={
                      <RequireRole allowed={["visitor", "admin", "master"]}>
                        <VisitorLayout>
                          <ScannerPage />
                        </VisitorLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/scanner/ai"
                    element={
                      <RequireRole allowed={["visitor", "admin", "master"]}>
                        <VisualScannerPage />
                      </RequireRole>
                    }
                  />

                  <Route
                    path="/ranking"
                    element={
                      <RequireRole allowed={["visitor", "admin", "master"]}>
                        <VisitorLayout>
                          <LeaderboardPage />
                        </VisitorLayout>
                      </RequireRole>
                    }
                  />

                  {/* QR Code gamificado */}
                  <Route
                    path="/qr/:code"
                    element={
                      <RequireRole allowed={["visitor", "admin", "master"]}>
                        <VisitorLayout>
                          <QrVisit />
                        </VisitorLayout>
                      </RequireRole>
                    }
                  />

                  {/* TOTEM / KIOSK MODE */}
                  <Route
                    path="/totem"
                    element={
                      <RequireRole allowed={["admin", "master"]}>
                        <TotemLayout />
                      </RequireRole>
                    }
                  >
                    <Route index element={<TotemDashboard />} />
                    <Route path="validar" element={<TotemValidator />} />
                    <Route path="eventos" element={<TotemEvents />} />
                    <Route path="eventos/:id" element={<TotemEventDetails />} />
                    <Route path="busca" element={<TotemSearch />} />
                  </Route>

                  {/* ADMIN */}
                  <Route
                    path="/admin"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <ConditionalAdminDashboard />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/admin/obras"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <AdminWorks />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/admin/obras/nova"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <AdminWorkForm />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/admin/obras/:id"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <AdminWorkForm />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/admin/trilhas"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <AdminTrails />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/admin/trilhas/nova"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <AdminTrailForm />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/admin/trilhas/:id"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <AdminTrailForm />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/admin/eventos"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <AdminEvents />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/admin/espacos"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <AdminSpaces />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/admin/espacos/novo"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <AdminSpaceForm />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/admin/espacos/:id"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <AdminSpaceForm />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/admin/certificates/*"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <AdminCertificates />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/admin/eventos/novo"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <AdminEventForm />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/admin/eventos/:id"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <AdminEventForm />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/admin/eventos/:id/dashboard"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <AdminEventDashboard />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/admin/eventos/:id/checkin"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <AdminEventCheckIn />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/admin/calendario"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <AdminCalendar />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/admin/qrcodes"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <AdminQRCodes />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/admin/categorias"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <AdminCategories />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/admin/categorias/nova"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <AdminCategoryForm />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/admin/categorias/:id"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <AdminCategoryForm />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/admin/visitantes"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <AdminVisitors />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/admin/visitantes/:id"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <AdminVisitorProfile />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/admin/configuracoes"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <AdminMuseumSettings />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/admin/treasure-hunt"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <AdminTreasureHunt />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />

                  <Route
                    path="/admin/conquistas"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <AdminAchievements />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/admin/conquistas/nova"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <AdminAchievementForm />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/admin/conquistas/:id"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <AdminAchievementForm />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />

                  <Route
                    path="/master/providers"
                    element={
                      <RequireRole allowed={["master"]}>
                        <MasterLayout>
                          <MasterProviders />
                        </MasterLayout>
                      </RequireRole>
                    }
                  />

                  <Route
                    path="/master/messages"
                    element={
                      <RequireRole allowed={["master"]}>
                        <MasterLayout>
                          <MasterMessages />
                        </MasterLayout>
                      </RequireRole>
                    }
                  />

                  <Route
                    path="/admin/ia"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <AdminAIAssistant />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />

                  <Route
                    path="/admin/analytics"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <AdminAnalytics />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />

                  {/* 404 - Catch All */}
                  <Route path="*" element={<NotFound />} />

                  <Route
                    path="/admin/uploads"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <AdminUploads />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />

                  <Route
                    path="/admin/usuarios"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <AdminInternalUsers />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />

                  {/* Admin Reviews and Shop */}
                  <Route
                    path="/admin/reviews"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <AdminReviews />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />

                  <Route
                    path="/admin/loja"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <AdminShop />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />

                  <Route
                    path="/admin/scanner-treinamento"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <AdminScannerTrainer />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/admin/mapa-editor"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <AdminMapEditor />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />

                  <Route
                    path="/admin/verificar-ingressos"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <AdminTicketVerifier />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />

                  <Route
                    path="/admin/eventos/:id/pesquisa"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <AdminEventSurvey />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/admin/eventos/:id/relatorio"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <AdminEventReport />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />

                  {/* MUNICIPAL MANAGEMENT ROUTES */}
                  <Route
                    path="/admin/editais"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <AdminNotices />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/admin/projetos"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <AdminProjects />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/admin/prestadores"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <AdminProviders />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/admin/acessibilidade-gestao"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <AdminAccessibilityManagement />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/admin/equipamentos"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <AdminEquipments />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />
                  {/* MUNICIPAL FORM ROUTES */}
                  <Route
                    path="/admin/editais/novo"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <AdminNoticeForm />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/admin/editais/:id"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <AdminNoticeForm />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/admin/projetos/novo"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <AdminProjectForm />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/admin/projetos/:id"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <AdminProjectForm />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/admin/prestadores/novo"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <AdminProviderForm />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/admin/prestadores/:id"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <AdminProviderForm />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/admin/acessibilidade/novo"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <AdminAccessibilityForm />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/admin/acessibilidade/:id"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <AdminAccessibilityForm />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/admin/relatorios"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <AdminReports />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />

                  {/* GOVERNANCE / EXECUTIVE ROUTES */}
                  <Route
                    path="/admin/secretaria"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <SecretaryDashboard />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/admin/conformidade-legal"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <LegalCompliance />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/admin/timeline-acessibilidade"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <AccessibilityTimeline />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/admin/uso-ia"
                    element={
                      <RequireRole allowed={["admin"]}>
                        <AdminLayout>
                          <AIUsageDashboard />
                        </AdminLayout>
                      </RequireRole>
                    }
                  />

                  <Route
                    path="/master"
                    element={
                      <RequireRole allowed={["master"]}>
                        <MasterLayout>
                          <MasterDashboard />
                        </MasterLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/master/tenants"
                    element={
                      <RequireRole allowed={["master"]}>
                        <MasterLayout>
                          <TenantsList />
                        </MasterLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/master/messages"
                    element={
                      <RequireRole allowed={["master"]}>
                        <MasterLayout>
                          <MasterMessages />
                        </MasterLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/master/plans"
                    element={
                      <RequireRole allowed={["master"]}>
                        <MasterLayout>
                          <MasterPlans />
                        </MasterLayout>
                      </RequireRole>
                    }
                  />

                  {/* ROTAS DO PRODUTOR (NOVO) */}
                  {/* ROTAS DO PRODUTOR (NOVO) */}
                  <Route
                    path="/producer"
                    element={
                      <RequireRole allowed={["admin", "producer"]}>
                        <ProducerLayout>
                          <ProducerDashboard />
                        </ProducerLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/producer/projects"
                    element={
                      <RequireRole allowed={["admin", "producer"]}>
                        <ProducerLayout>
                          <ProducerProjects />
                        </ProducerLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/producer/projects/new"
                    element={
                      <RequireRole allowed={["admin", "producer"]}>
                        <ProducerLayout>
                          <ProducerProjectForm />
                        </ProducerLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/producer/projects/:id"
                    element={
                      <RequireRole allowed={["admin", "producer"]}>
                        <ProducerLayout>
                          <ProducerProjectForm />
                        </ProducerLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/producer/editais"
                    element={
                      <RequireRole allowed={["admin", "producer"]}>
                        <ProducerLayout>
                          <ProducerNotices />
                        </ProducerLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/producer/profile"
                    element={
                      <RequireRole allowed={["admin", "producer"]}>
                        <ProducerLayout>
                          <ProducerProfile />
                        </ProducerLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/producer/settings"
                    element={
                      <RequireRole allowed={["admin", "producer"]}>
                        <ProducerLayout>
                          <ProducerSettings />
                        </ProducerLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/producer/events"
                    element={
                      <RequireRole allowed={["admin", "producer"]}>
                        <ProducerLayout>
                          <ProducerEvents />
                        </ProducerLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/producer/events/new"
                    element={
                      <RequireRole allowed={["admin", "producer"]}>
                        <ProducerLayout>
                          <ProducerEventForm />
                        </ProducerLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/producer/events/:id"
                    element={
                      <RequireRole allowed={["admin", "producer"]}>
                        <ProducerLayout>
                          <ProducerEventForm />
                        </ProducerLayout>
                      </RequireRole>
                    }
                  />
                  {/* Museum Features for Producer */}
                  <Route
                    path="/producer/works"
                    element={
                      <RequireRole allowed={["admin", "producer"]}>
                        <ProducerLayout>
                          <AdminWorks />
                        </ProducerLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/producer/works/new"
                    element={
                      <RequireRole allowed={["admin", "producer"]}>
                        <ProducerLayout>
                          <AdminWorkForm />
                        </ProducerLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/producer/works/:id"
                    element={
                      <RequireRole allowed={["admin", "producer"]}>
                        <ProducerLayout>
                          <AdminWorkForm />
                        </ProducerLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/producer/gamification"
                    element={
                      <RequireRole allowed={["admin", "producer"]}>
                        <ProducerLayout>
                          <AdminAchievements />
                        </ProducerLayout>
                      </RequireRole>
                    }
                  />

                  {/* Legacy/Other Routes */}
                  <Route
                    path="/producer/services"
                    element={
                      <RequireRole allowed={["admin", "producer"]}>
                        <ProducerLayout>
                          <ProducerServices />
                        </ProducerLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/producer/tickets"
                    element={
                      <RequireRole allowed={["admin", "producer"]}>
                        <ProducerLayout>
                          <ProducerTickets />
                        </ProducerLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/producer/audience"
                    element={
                      <RequireRole allowed={["admin", "producer"]}>
                        <ProducerLayout>
                          <ProducerAudience />
                        </ProducerLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/producer/reports"
                    element={
                      <RequireRole allowed={["admin", "producer"]}>
                        <ProducerLayout>
                          <ProducerReports />
                        </ProducerLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/producer/*"
                    element={
                      <RequireRole allowed={["admin", "producer"]}>
                        <ProducerLayout>
                          <ProducerDashboard />
                        </ProducerLayout>
                      </RequireRole>
                    }
                  />

                  <Route
                    path="/master/tenants/novo"
                    element={
                      <RequireRole allowed={["master"]}>
                        <MasterLayout>
                          <TenantForm />
                        </MasterLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/master/tenants/:id"
                    element={
                      <RequireRole allowed={["master"]}>
                        <MasterLayout>
                          <TenantForm />
                        </MasterLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/master/users"
                    element={
                      <RequireRole allowed={["master"]}>
                        <MasterLayout>
                          <MasterUsers />
                        </MasterLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/master/seeder"
                    element={
                      <RequireRole allowed={["master"]}>
                        <MasterLayout>
                          <MasterSeeder />
                        </MasterLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/master/users/novo"
                    element={
                      <RequireRole allowed={["master"]}>
                        <MasterLayout>
                          <MasterUserForm />
                        </MasterLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/master/users/:id"
                    element={
                      <RequireRole allowed={["master"]}>
                        <MasterLayout>
                          <MasterUserForm />
                        </MasterLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/master/achievements"
                    element={
                      <RequireRole allowed={["master"]}>
                        <MasterLayout>
                          <MasterAchievements />
                        </MasterLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/master/achievements/novo"
                    element={
                      <RequireRole allowed={["master"]}>
                        <MasterLayout>
                          <MasterAchievementForm />
                        </MasterLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/master/achievements/:id"
                    element={
                      <RequireRole allowed={["master"]}>
                        <MasterLayout>
                          <MasterAchievementForm />
                        </MasterLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/master/accessibility-requests"
                    element={
                      <RequireRole allowed={["master"]}>
                        <MasterLayout>
                          <MasterAccessibilityRequests />
                        </MasterLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/master/audit-logs"
                    element={
                      <RequireRole allowed={["master"]}>
                        <MasterLayout>
                          <MasterAuditLogs />
                        </MasterLayout>
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/master/system-health"
                    element={
                      <RequireRole allowed={["master"]}>
                        <MasterLayout>
                          <MasterSystemHealth />
                        </MasterLayout>
                      </RequireRole>
                    }
                  />

                  {/* AUTH */}
                  <Route path="/register" element={<RegisterWrapper />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />

                  {/* PUBLIC */}
                  <Route path="/events" element={<GlobalEvents />} />

                  {/* 404 - Redireciona para Welcome se não autenticado, senão para home */}
                  <Route path="*" element={<Navigate to="/welcome" replace />} />
                </Routes>
              </React.Suspense>
            </ToastProvider>
          </AudioProvider>
        </GeoFencingProvider>
      </GamificationProvider>
    </QueryClientProvider >
  );
};

export default App;
