import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./modules/auth/AuthContext";
import { useIsCityMode } from "./modules/auth/TenantContext";
import { Role } from "./types/auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { ErrorBoundary } from "./components/ErrorBoundary";

import { VisitorLayout } from "./modules/visitor/VisitorLayout";
import { GamificationProvider } from "./modules/gamification/context/GamificationContext";
import { GeoFencingProvider } from "./modules/visitor/context/GeoFencingProvider";
import { AudioProvider } from "./modules/visitor/context/AudioContext";
import { ToastProvider } from "./contexts/ToastContext";
import { VisitorThemeProvider } from "./modules/visitor/context/VisitorThemeProvider";
import { PageLoader } from "./components/ui/PageLoader";
import { registerGSAPPlugins } from "./lib/gsap-utils";

// Register GSAP plugins once at app level
registerGSAPPlugins();

// Auth pages — lazy loaded
const Login = React.lazy(() => import("./modules/auth/Login").then(m => ({ default: m.Login })));
const RegisterWrapper = React.lazy(() => import("./modules/auth/RegisterWrapper").then(m => ({ default: m.RegisterWrapper })));
const RegisterProducer = React.lazy(() => import("./modules/auth/RegisterProducer").then(m => ({ default: m.RegisterProducer })));
const RegisterProvider = React.lazy(() => import("./modules/auth/RegisterProvider").then(m => ({ default: m.RegisterProvider })));
const ForgotPassword = React.lazy(() => import("./modules/auth/ForgotPassword").then(m => ({ default: m.ForgotPassword })));
const ResetPasswordPage = React.lazy(() => import("./modules/auth/ResetPassword").then(m => ({ default: m.ResetPasswordPage })));

// Public pages — lazy loaded
const LandingPage = React.lazy(() => import("./modules/public/LandingPage").then(m => ({ default: m.LandingPage })));
const Welcome = React.lazy(() => import("./modules/visitor/pages/Welcome").then(m => ({ default: m.Welcome })));
const SelectMuseum = React.lazy(() => import("./modules/visitor/pages/SelectMuseum").then(m => ({ default: m.SelectMuseum })));
const CertificateValidator = React.lazy(() => import("./modules/public/CertificateValidator").then(m => ({ default: m.CertificateValidator })));
const GlobalEvents = React.lazy(() => import("./modules/public/GlobalEvents").then(m => ({ default: m.GlobalEvents })));
const Home = React.lazy(() => import("./modules/visitor/pages/Home").then(m => ({ default: m.Home })));
const PublicPassportPage = React.lazy(() => import("./modules/visitor/pages/PublicPassportPage").then(m => ({ default: m.PublicPassportPage })));
const AccessDeniedPage = React.lazy(() => import("./modules/public/AccessDeniedPage").then(m => ({ default: m.AccessDeniedPage })));

// Route groups
import { visitorRoutes } from "./routes/visitorRoutes";
import { adminRoutes } from "./routes/adminRoutes";
import { masterRoutes } from "./routes/masterRoutes";
import { producerRoutes } from "./routes/producerRoutes";
import { theaterRoutes } from "./routes/theaterRoutes";
import { providerRoutes, totemRoutes } from "./routes/otherRoutes";
import { municipalRoutes } from "./routes/municipalRoutes";
import { sponsorRoutes } from "./routes/sponsorRoutes";
import { legacyRedirects } from "./routes/legacyRedirects";

// QueryClient — with exponential retry backoff
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: (failureCount, error: unknown) => {
        const status = (error as { response?: { status?: number } })?.response?.status;
        // Don't retry on client errors (4xx)
        if (status !== undefined && status >= 400 && status < 500) return false;
        return failureCount < 3;
      },
      retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 30000),
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



const RootRedirector: React.FC = () => {
  const { role } = useAuth();
  const isCityMode = useIsCityMode();

  if (role === "master") return <Navigate to="/master" replace />;
  if (role === "admin" || role === "municipal_admin" || role === "municipal_secretary") {
    if (isCityMode || role.startsWith("municipal")) return <Navigate to="/municipal" replace />;
    return <Navigate to="/admin" replace />;
  }
  if (role === "theater" || role === "theater_admin") return <Navigate to="/theater" replace />;
  if (role === "producer") return <Navigate to="/producer" replace />;
  if (role === "provider") return <Navigate to="/provider" replace />;
  if (role === "collaborator") return <Navigate to="/admin" replace />;

  return <Navigate to="/hub" replace />;
};

const App: React.FC = () => {
  const { isRestoring } = useAuth();

  if (isRestoring) {
    return <PageLoader />;
  }

  return (
    <ErrorBoundary>
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
              <React.Suspense fallback={<PageLoader />}>
                <Routes key={"app-routes"}>
                  {/* PUBLIC ROUTES */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/welcome" element={<Welcome />} />
                  <Route path="/select-museum" element={<SelectMuseum />} />
                  <Route path="/verify/:code" element={<CertificateValidator />} />
                  <Route path="/sou-produtor" element={<RegisterProducer />} />
                  <Route path="/sou-prestador" element={<RegisterProvider />} />
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
                  {legacyRedirects()}

                  {/* VISITOR ROUTES */}
                  {visitorRoutes(RequireRole)}

                  {/* ADMIN ROUTES */}
                  {adminRoutes(RequireRole)}

                  {/* MASTER ROUTES */}
                  {masterRoutes(RequireRole)}

                  {/* PRODUCER ROUTES */}
                  {producerRoutes(RequireRole)}

                  {/* THEATER ROUTES */}
                  {theaterRoutes(RequireRole)}

                  {/* PROVIDER ROUTES */}
                  {providerRoutes(RequireRole)}

                  {/* MUNICIPAL ROUTES */}
                  {municipalRoutes(RequireRole)}

                  {/* TOTEM / KIOSK ROUTES */}
                  {totemRoutes(RequireRole)}

                  {/* SPONSOR ROUTES */}
                  {sponsorRoutes(RequireRole)}

                  {/* 403 & 404 */}
                  <Route path="/403" element={<AccessDeniedPage />} />
                  <Route path="*" element={<Navigate to="/welcome" replace />} />
                </Routes>
              </React.Suspense>
            </ToastProvider>
          </AudioProvider>
        </GeoFencingProvider>
      </VisitorThemeProvider>
    </GamificationProvider>
    </QueryClientProvider >
    </ErrorBoundary>
  );
};

export default App;
