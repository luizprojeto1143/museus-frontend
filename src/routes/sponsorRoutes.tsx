import React from 'react';
import { Route } from 'react-router-dom';

const SponsorLanding = React.lazy(() => import('../modules/sponsor').then(m => ({ default: m.SponsorLanding })));
const SponsorBrowseWorks = React.lazy(() => import('../modules/sponsor').then(m => ({ default: m.SponsorBrowseWorks })));
const SponsorCheckout = React.lazy(() => import('../modules/sponsor').then(m => ({ default: m.SponsorCheckout })));
const SponsorDashboard = React.lazy(() => import('../modules/sponsor').then(m => ({ default: m.SponsorDashboard })));
const SponsorSuccess = React.lazy(() => import('../modules/sponsor').then(m => ({ default: m.SponsorSuccess })));

export const sponsorRoutes = (RequireRole: any) => (
  <>
    <Route path="/patrocinar" element={<SponsorLanding />} />
    <Route path="/patrocinar/obras" element={<SponsorBrowseWorks />} />
    <Route path="/patrocinar/checkout/:workId" element={
      <RequireRole allowed={["visitor", "admin", "master", "producer"]}>
        <SponsorCheckout />
      </RequireRole>
    } />
    <Route path="/patrocinar/dashboard" element={
      <RequireRole allowed={["visitor", "admin", "master", "producer"]}>
        <SponsorDashboard />
      </RequireRole>
    } />
    <Route path="/patrocinar/sucesso" element={
      <RequireRole allowed={["visitor", "admin", "master", "producer"]}>
        <SponsorSuccess />
      </RequireRole>
    } />
  </>
);
