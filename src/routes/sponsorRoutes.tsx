import React from 'react';
import { Route } from 'react-router-dom';
import { SponsorLayout } from '../modules/sponsor/layouts/SponsorLayout';

const SponsorLanding = React.lazy(() => import('../modules/backoffice/sponsor').then(m => ({ default: m.SponsorLanding })));
const SponsorBrowseWorks = React.lazy(() => import('../modules/backoffice/sponsor').then(m => ({ default: m.SponsorBrowseWorks })));
const SponsorCheckout = React.lazy(() => import('../modules/backoffice/sponsor').then(m => ({ default: m.SponsorCheckout })));
const SponsorSuccess = React.lazy(() => import('../modules/backoffice/sponsor').then(m => ({ default: m.SponsorSuccess })));

const SponsorImpact = React.lazy(() => import('../modules/backoffice/sponsor').then(m => ({ default: m.SponsorImpact })));
const SponsorDashboard = React.lazy(() => import('../modules/backoffice/sponsor').then(m => ({ default: m.SponsorDashboard })));
const SponsorOpportunities = React.lazy(() => import('../modules/backoffice/sponsor').then(m => ({ default: m.SponsorOpportunities })));
const SponsorAssets = React.lazy(() => import('../modules/backoffice/sponsor').then(m => ({ default: m.SponsorAssets })));
const SponsorCertificates = React.lazy(() => import('../modules/backoffice/sponsor').then(m => ({ default: m.SponsorCertificates })));

import { Role } from '../types/auth';

const SPONSOR_ALLOWED_ROLES = ["sponsor", "master", "municipal_admin", "admin", "producer", "visitor"];

export const sponsorRoutes = (RequireRole: React.FC<{ allowed: (Role | string)[]; children: React.ReactElement }>) => (
  <>
    {/* Public/Landing paths */}
    <Route path="/patrocinar" element={<SponsorLanding />} />
    <Route path="/patrocinar/obras" element={<SponsorBrowseWorks />} />
    <Route path="/patrocinar/dashboard" element={<SponsorImpact />} />
    <Route path="/patrocinar/checkout/:workId" element={
      <RequireRole allowed={SPONSOR_ALLOWED_ROLES}>
        <SponsorCheckout />
      </RequireRole>
    } />
    <Route path="/patrocinar/sucesso" element={
      <RequireRole allowed={SPONSOR_ALLOWED_ROLES}>
        <SponsorSuccess />
      </RequireRole>
    } />

    {/* New Premium Sponsor Portal under SponsorLayout */}
    <Route path="/sponsor" element={
      <RequireRole allowed={SPONSOR_ALLOWED_ROLES}>
        <SponsorLayout />
      </RequireRole>
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
