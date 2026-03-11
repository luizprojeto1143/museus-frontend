import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth, Role } from "./modules/auth/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

import { VisitorLayout } from "./modules/visitor/VisitorLayout";
import { GamificationProvider } from "./modules/gamification/context/GamificationContext";
import { GeoFencingProvider } from "./modules/visitor/context/GeoFencingProvider";
import { AudioProvider } from "./modules/visitor/context/AudioContext";
import { ToastProvider } from "./contexts/ToastContext";
import { VisitorThemeProvider } from "./modules/visitor/context/VisitorThemeProvider";

// Auth pages
import { Login } from "./modules/auth/Login";
import { RegisterWrapper } from "./modules/auth/RegisterWrapper";
import { RegisterProducer } from "./modules/auth/RegisterProducer";
import { ForgotPassword } from "./modules/auth/ForgotPassword";
import { ResetPasswordPage } from "./modules/auth/ResetPassword";

// Public pages
import { LandingPage } from "./modules/public/LandingPage";
import { Welcome } from "./modules/visitor/pages/Welcome";
import { SelectMuseum } from "./modules/visitor/pages/SelectMuseum";
import { CertificateValidator } from "./modules/public/CertificateValidator";
import { GlobalEvents } from "./modules/public/GlobalEvents";
import { NotFound } from "./modules/public/NotFound";
import { Home } from "./modules/visitor/pages/Home";
import { PublicPassportPage } from "./modules/visitor/pages/PublicPassportPage";

// Route groups
import { visitorRoutes } from "./routes/visitorRoutes";
import { adminRoutes } from "./routes/adminRoutes";
import { masterRoutes } from "./routes/masterRoutes";
import { producerRoutes } from "./routes/producerRoutes";
import { providerRoutes, municipalRoutes, totemRoutes } from "./routes/otherRoutes";

// QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

// Auth guards
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
    return <Navigate to="/" replace />;
  }

  return children;
};

const RequireProvider: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, hasProviderProfile } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/welcome" replace state={{ from: location }} />;
  }

  if (!hasProviderProfile) {
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
        <VisitorThemeProvider>
          <GeoFencingProvider>
            <AudioProvider>
              <ToastProvider>
              <React.Suspense fallback={
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#1a1a1a', color: '#d4af37' }}>
                  Loading...
                </div>
              }>
                <Routes>
                  {/* PUBLIC ROUTES */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/welcome" element={<Welcome />} />
                  <Route path="/select-museum" element={<SelectMuseum />} />
                  <Route path="/verify/:code" element={<CertificateValidator />} />
                  <Route path="/sou-produtor" element={<RegisterProducer />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/register" element={<RegisterWrapper />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/events" element={<GlobalEvents />} />
                  <Route path="/p/:id" element={<PublicPassportPage />} />

                  {/* Legacy redirect */}
                  <Route path="/app" element={
                    <RequireRole allowed={["visitor", "admin", "master"]}>
                      <RootRedirector />
                    </RequireRole>
                  } />

                  {/* VISITOR ROUTES */}
                  {visitorRoutes(RequireRole)}

                  {/* ADMIN ROUTES */}
                  {adminRoutes(RequireRole)}

                  {/* MASTER ROUTES */}
                  {masterRoutes(RequireRole)}

                  {/* PRODUCER ROUTES */}
                  {producerRoutes(RequireRole)}

                  {/* PROVIDER ROUTES */}
                  {providerRoutes(RequireProvider)}

                  {/* MUNICIPAL ROUTES */}
                  {municipalRoutes(RequireRole)}

                  {/* TOTEM / KIOSK ROUTES */}
                  {totemRoutes(RequireRole)}

                  {/* 404 */}
                  <Route path="*" element={<Navigate to="/welcome" replace />} />
                </Routes>
              </React.Suspense>
            </ToastProvider>
          </AudioProvider>
        </GeoFencingProvider>
      </VisitorThemeProvider>
    </GamificationProvider>
    </QueryClientProvider >
  );
};

export default App;
