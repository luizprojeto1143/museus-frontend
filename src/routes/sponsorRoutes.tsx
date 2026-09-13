import React from 'react';
import { Navigate, Route, useLocation } from 'react-router-dom';
import { SponsorLayout } from '../modules/sponsor/layouts/SponsorLayout';
import { useAuth } from '../modules/auth/AuthContext';

const SponsorLanding = React.lazy(() => import('../modules/backoffice/sponsor').then(m => ({ default: m.SponsorLanding })));
const SponsorBrowseWorks = React.lazy(() => import('../modules/backoffice/sponsor').then(m => ({ default: m.SponsorBrowseWorks })));
const SponsorCheckout = React.lazy(() => import('../modules/backoffice/sponsor').then(m => ({ default: m.SponsorCheckout })));
const SponsorSuccess = React.lazy(() => import('../modules/backoffice/sponsor').then(m => ({ default: m.SponsorSuccess })));

const SponsorImpact = React.lazy(() => import('../modules/backoffice/sponsor').then(m => ({ default: m.SponsorImpact })));
const SponsorDashboard = React.lazy(() => import('../modules/backoffice/sponsor').then(m => ({ default: m.SponsorDashboard })));
const SponsorOpportunities = React.lazy(() => import('../modules/backoffice/sponsor').then(m => ({ default: m.SponsorOpportunities })));
const SponsorAssets = React.lazy(() => import('../modules/backoffice/sponsor').then(m => ({ default: m.SponsorAssets })));
const SponsorCertificates = React.lazy(() => import('../modules/backoffice/sponsor').then(m => ({ default: m.SponsorCertificates })));
const SponsorLoginPage = React.lazy(() => import('../modules/backoffice/sponsor').then(m => ({ default: m.SponsorLoginPage })));
const SponsorRegisterPage = React.lazy(() => import('../modules/backoffice/sponsor').then(m => ({ default: m.SponsorRegisterPage })));

import { Role } from '../types/auth';

const SPONSOR_ALLOWED_ROLES = ["sponsor", "master", "municipal_admin", "admin", "equipment_admin"];

const RequireSponsorAccess: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, isGuest, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || isGuest || !role || role === "visitor") {
    return <Navigate to="/sponsor/login" replace state={{ from: location }} />;
  }

  if (!SPONSOR_ALLOWED_ROLES.includes(role)) {
    return <Navigate to="/403" replace />;
  }

  return children;
};

export const sponsorRoutes = (_RequireRole: React.FC<{ allowed: (Role | string)[]; children: React.ReactElement }>) => (
  <>
    {/* Dedicated Sponsor Auth routes */}
    <Route path="/sponsor/login" element={<SponsorLoginPage />} />
    <Route path="/patrocinar/login" element={<SponsorLoginPage />} />
    <Route path="/sponsor/register" element={<SponsorRegisterPage />} />
    <Route path="/patrocinar/cadastro" element={<SponsorRegisterPage />} />

    {/* Public/Landing paths */}
    <Route path="/patrocinar" element={<SponsorLanding />} />
    <Route path="/patrocinar/obras" element={<SponsorBrowseWorks />} />
    <Route path="/patrocinar/dashboard" element={
      <RequireSponsorAccess>
        <SponsorImpact />
      </RequireSponsorAccess>
    } />
    <Route path="/patrocinar/checkout/:workId" element={
      <RequireSponsorAccess>
        <SponsorCheckout />
      </RequireSponsorAccess>
    } />
    <Route path="/patrocinar/sucesso" element={
      <RequireSponsorAccess>
        <SponsorSuccess />
      </RequireSponsorAccess>
    } />

    {/* New Premium Sponsor Portal under SponsorLayout */}
    <Route path="/sponsor" element={
      <RequireSponsorAccess>
        <SponsorLayout />
      </RequireSponsorAccess>
    }>
      <Route index element={<SponsorImpact />} />
      <Route path="dashboard" element={<SponsorImpact />} />
      <Route path="browse" element={<SponsorBrowseWorks />} />
      <Route path="my-sponsorships" element={<SponsorDashboard />} />
      <Route path="opportunities" element={<SponsorOpportunities />} />
      <Route path="contracts" element={<SponsorAssets />} />
      <Route path="certificates" element={<SponsorCertificates />} />
    </Route>
  </>
);
