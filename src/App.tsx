import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth, Role } from "./modules/auth/AuthContext";

import { VisitorLayout } from "./modules/visitor/VisitorLayout";
import { AdminLayout } from "./modules/admin/AdminLayout";
import { MasterLayout } from "./modules/master/MasterLayout";

// Auth
import { Login } from "./modules/auth/Login";
import { RegisterWrapper } from "./modules/auth/RegisterWrapper";
import { GamificationProvider } from "./modules/gamification/context/GamificationContext";
import { GeoFencingProvider } from "./modules/visitor/context/GeoFencingProvider";
import { AudioProvider } from "./modules/visitor/context/AudioContext";

// Public pages
import { Welcome } from "./modules/visitor/pages/Welcome";
import { SelectMuseum } from "./modules/visitor/pages/SelectMuseum";

// Visitor pages
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
import { ScannerHub } from "./modules/visitor/pages/ScannerHub";
import { ScannerPage } from "./modules/visitor/pages/ScannerPage";
import { SchedulingPage } from "./modules/visitor/pages/SchedulingPage";
import { GuestbookPage } from "./modules/visitor/pages/GuestbookPage";
import { VisualScannerPage } from "./modules/visitor/pages/VisualScannerPage";
import { LeaderboardPage } from "./modules/visitor/pages/LeaderboardPage";
import { VisitorProfile } from "./modules/visitor/pages/VisitorProfile";
import { CertificateValidator } from "./modules/public/CertificateValidator";
import { ShopPage } from "./modules/visitor/pages/ShopPage";
import { ChallengesPage } from "./modules/visitor/pages/ChallengesPage";
import { MuseumPlatformer } from "./modules/visitor/pages/MuseumPlatformer";
import { useNavigate } from "react-router-dom";

const MuseumPlatformerPageWrapper = () => {
  const navigate = useNavigate();
  return <MuseumPlatformer onClose={() => navigate(-1)} />;
};

// Admin pages
import { AdminDashboard } from "./modules/admin/pages/AdminDashboard";
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

import { AdminScannerTrainer } from "./modules/admin/pages/AdminScannerTrainer";
import { AdminMapEditor } from "./modules/admin/pages/AdminMapEditor";

// Master pages
import { MasterDashboard } from "./modules/master/pages/MasterDashboard";
import { TenantsList } from "./modules/master/pages/TenantsList";
import { TenantForm } from "./modules/master/pages/TenantForm";
import { MasterUsers } from "./modules/master/pages/MasterUsers";
import { MasterUserForm } from "./modules/master/pages/MasterUserForm";
import { MasterAchievements } from "./modules/master/pages/MasterAchievements";
import { MasterAchievementForm } from "./modules/master/pages/MasterAchievementForm";
import { MasterAuditLogs } from "./modules/master/pages/MasterAuditLogs";
import { MasterAccessibilityRequests } from "./modules/master/pages/MasterAccessibilityRequests";
import { MasterSystemHealth } from "./modules/master/pages/MasterSystemHealth";

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
    <GamificationProvider>
      <GeoFencingProvider>
        <AudioProvider>
          <Routes>
            {/* PUBLIC ROUTES */}
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/select-museum" element={<SelectMuseum />} />
            <Route path="/verify/:code" element={<CertificateValidator />} />
            <Route path="/register" element={<RegisterWrapper />} />
            <Route path="/login" element={<Login />} />

            {/* VISITANTE */}
            <Route
              path="/"
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
              path="/arcade"
              element={
                <RequireRole allowed={["visitor", "admin", "master"]}>
                  <MuseumPlatformerPageWrapper />
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
              path="/caca-tesouro"
              element={
                <RequireRole allowed={["visitor", "admin", "master"]}>
                  <VisitorLayout>
                    <TreasureHunt />
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

            {/* ADMIN */}
            <Route
              path="/admin"
              element={
                <RequireRole allowed={["admin"]}>
                  <AdminLayout>
                    <AdminDashboard />
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


            {/* MASTER (multi-tenant) */}
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
            <Route path="/login" element={<Login />} />

            {/* 404 - Redireciona para Welcome se não autenticado, senão para home */}
            <Route path="*" element={<Navigate to="/welcome" replace />} />
          </Routes>
        </AudioProvider>
      </GeoFencingProvider>
    </GamificationProvider>
  );
};

export default App;
