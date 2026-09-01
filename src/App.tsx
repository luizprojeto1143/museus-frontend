import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./modules/auth/AuthContext";
import { Role } from "./types/auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { ErrorBoundary } from "./components/ErrorBoundary";

import { GamificationProvider } from "./modules/gamification/context/GamificationContext";
import { GeoFencingProvider } from "./modules/visitor/context/GeoFencingProvider";
import { AudioProvider } from "./modules/visitor/context/AudioContext";
import { ToastProvider } from "./contexts/ToastContext";
import { VisitorThemeProvider } from "./modules/visitor/context/VisitorThemeProvider";
import { PageLoader } from "./components/ui/PageLoader";
import { registerGSAPPlugins } from "./lib/gsap-utils";

registerGSAPPlugins();

const Login = React.lazy(() => import("./modules/auth/Login").then(m => ({ default: m.Login })));
const RegisterWrapper = React.lazy(() => import("./modules/auth/RegisterWrapper").then(m => ({ default: m.RegisterWrapper })));
const ForgotPassword = React.lazy(() => import("./modules/auth/ForgotPassword").then(m => ({ default: m.ForgotPassword })));
const ResetPasswordPage = React.lazy(() => import("./modules/auth/ResetPassword").then(m => ({ default: m.ResetPasswordPage })));

const LandingPage = React.lazy(() => import("./modules/public/LandingPage").then(m => ({ default: m.LandingPage })));
const Welcome = React.lazy(() => import("./modules/visitor/pages/Welcome").then(m => ({ default: m.Welcome })));
const SelectMuseum = React.lazy(() => import("./modules/visitor/pages/SelectMuseum").then(m => ({ default: m.SelectMuseum })));
const CertificateValidator = React.lazy(() => import("./modules/public/CertificateValidator").then(m => ({ default: m.CertificateValidator })));
const GlobalEvents = React.lazy(() => import("./modules/public/GlobalEvents").then(m => ({ default: m.GlobalEvents })));
const NationalCulturePage = React.lazy(() => import("./modules/public/NationalCulturePage").then(m => ({ default: m.NationalCulturePage })));
const PublicPassportPage = React.lazy(() => import("./modules/visitor/pages/PublicPassportPage").then(m => ({ default: m.PublicPassportPage })));
const AccessDeniedPage = React.lazy(() => import("./modules/public/AccessDeniedPage").then(m => ({ default: m.AccessDeniedPage })));
const CheckoutReturnPage = React.lazy(() => import("./modules/public/CheckoutReturnPage").then(m => ({ default: m.CheckoutReturnPage })));

import { visitorRoutes } from "./routes/visitorRoutes";
import { adminRoutes } from "./routes/adminRoutes";
import { masterRoutes } from "./routes/masterRoutes";
import { legacyRedirects } from "./routes/legacyRedirects";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: (failureCount, error: unknown) => {
        const status = (error as { response?: { status?: number } })?.response?.status;
        if (status !== undefined && status >= 400 && status < 500) return false;
        return failureCount < 3;
      },
      retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 30000),
      refetchOnWindowFocus: false
    }
  }
});

const RequireRole: React.FC<{ allowed: (Role | string)[]; children: React.ReactElement }> = ({
  allowed,
  children
}) => {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (allowed.includes("visitor")) {
    return children;
  }

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
  if (role === "master") return <Navigate to="/master" replace />;
  if (role === "equipment_admin" || role === "equipment_collaborator" || role === "collaborator" || role === "municipal_admin" || role === "municipal_secretary") {
    return <Navigate to="/admin" replace />;
  }
  if (role === "theater_admin" || role === "producer" || role === "provider" || role === "sponsor") {
    return <Navigate to="/welcome" replace />;
  }

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
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/welcome" element={<Welcome />} />
                  <Route path="/select-museum" element={<SelectMuseum />} />
                  <Route path="/verify/:code" element={<CertificateValidator />} />
                  <Route path="/sou-produtor" element={<Navigate to="/welcome" replace />} />
                  <Route path="/sou-prestador" element={<Navigate to="/welcome" replace />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/register" element={<RegisterWrapper />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/events" element={<GlobalEvents />} />
                  <Route path="/nacional" element={<NationalCulturePage />} />
                  <Route path="/p/:id" element={<PublicPassportPage />} />
                  <Route path="/inbox/:id/success" element={<RequireRole allowed={["provider", "producer", "master", "equipment_admin"]}><CheckoutReturnPage status="success" context="inbox-payment" /></RequireRole>} />
                  <Route path="/inbox/:id/cancel" element={<RequireRole allowed={["provider", "producer", "master", "equipment_admin"]}><CheckoutReturnPage status="cancel" context="inbox-payment" /></RequireRole>} />
                  <Route path="/accessibility/success" element={<RequireRole allowed={["provider", "producer", "master", "equipment_admin"]}><CheckoutReturnPage status="success" context="accessibility" /></RequireRole>} />
                  <Route path="/app" element={
                    <RequireRole allowed={["visitor", "equipment_admin", "equipment_collaborator", "master"]}>
                      <RootRedirector />
                    </RequireRole>
                  } />
                  {legacyRedirects()}
                  {visitorRoutes(RequireRole)}
                  {adminRoutes(RequireRole)}
                  {masterRoutes(RequireRole)}
                  <Route path="/producer/*" element={<Navigate to="/welcome" replace />} />
                  <Route path="/theater/*" element={<Navigate to="/welcome" replace />} />
                  <Route path="/provider/*" element={<Navigate to="/welcome" replace />} />
                  <Route path="/municipal/*" element={<Navigate to="/welcome" replace />} />
                  <Route path="/totem/*" element={<Navigate to="/welcome" replace />} />
                  <Route path="/sponsor/*" element={<Navigate to="/welcome" replace />} />
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
