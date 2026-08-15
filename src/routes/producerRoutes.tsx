import React from "react";
import { Route, Navigate } from "react-router-dom";
import { ProducerLayout } from "../modules/backoffice/producer/ProducerLayout";
import { Role } from "../modules/auth/AuthContext";

// Producer pages
const ProducerDashboard = React.lazy(() => import("../modules/backoffice/producer/ProducerDashboard").then(m => ({ default: m.ProducerDashboard })));
const ProducerEvents = React.lazy(() => import("../modules/backoffice/producer/ProducerEvents").then(m => ({ default: m.ProducerEvents })));
const ProducerProjects = React.lazy(() => import("../modules/backoffice/producer/ProducerProjects").then(m => ({ default: m.ProducerProjects })));
const ProducerEventForm = React.lazy(() => import("../modules/backoffice/producer/ProducerEventForm").then(m => ({ default: m.ProducerEventForm })));
const ProducerProjectForm = React.lazy(() => import("../modules/backoffice/producer/ProducerProjectForm").then(m => ({ default: m.ProducerProjectForm })));
const ProducerServices = React.lazy(() => import("../modules/backoffice/producer/ProducerServices").then(m => ({ default: m.ProducerServices })));
const ProducerTickets = React.lazy(() => import("../modules/backoffice/producer/ProducerTickets").then(m => ({ default: m.ProducerTickets })));
const ProducerInbox = React.lazy(() => import("../modules/backoffice/producer/ProducerInbox").then(m => ({ default: m.ProducerInbox })));
const ProducerAudience = React.lazy(() => import("../modules/backoffice/producer/ProducerAudience").then(m => ({ default: m.ProducerAudience })));
const ProducerReports = React.lazy(() => import("../modules/backoffice/producer/ProducerReports").then(m => ({ default: m.ProducerReports })));
const ProducerNotices = React.lazy(() => import("../modules/backoffice/producer/ProducerNotices").then(m => ({ default: m.ProducerNotices })));
const ProducerProfile = React.lazy(() => import("../modules/backoffice/producer/ProducerProfile").then(m => ({ default: m.ProducerProfile })));
const ProducerSettings = React.lazy(() => import("../modules/backoffice/producer/ProducerSettings").then(m => ({ default: m.ProducerSettings })));
const ProducerNoticeResults = React.lazy(() => import("../modules/backoffice/producer/ProducerNoticeResults").then(m => ({ default: m.ProducerNoticeResults })));
const ProducerNoticeTransparency = React.lazy(() => import("../modules/backoffice/producer/ProducerNoticeTransparency").then(m => ({ default: m.ProducerNoticeTransparency })));
const ProducerDocuments = React.lazy(() => import("../modules/backoffice/producer/ProducerDocuments").then(m => ({ default: m.ProducerDocuments })));
const ProducerProviders = React.lazy(() => import("../modules/backoffice/producer/ProducerProviders").then(m => ({ default: m.ProducerProviders })));
const ProducerFinance = React.lazy(() => import("../modules/backoffice/producer/pages/ProducerFinance").then(m => ({ default: m.ProducerFinance })));

// Reused admin components for museum features (converted to lazy)
const AdminWorks = React.lazy(() => import("../modules/backoffice/equipment/pages/AdminWorks").then(m => ({ default: m.AdminWorks })));
const AdminWorkForm = React.lazy(() => import("../modules/backoffice/equipment/pages/AdminWorkForm").then(m => ({ default: m.AdminWorkForm })));
const AdminAchievements = React.lazy(() => import("../modules/backoffice/equipment/pages/AdminAchievements").then(m => ({ default: m.AdminAchievements })));
const AdminCalendar = React.lazy(() => import("../modules/backoffice/equipment/pages/AdminCalendar").then(m => ({ default: m.AdminCalendar })));

type RequireRoleProps = { allowed: (Role | string)[]; children: React.ReactElement };

const pr = (Component: React.ComponentType, RequireRole: React.FC<RequireRoleProps>) => (
    <RequireRole allowed={["producer", "master", "municipal_admin", "admin"]}>
        <ProducerLayout>
            <Component />
        </ProducerLayout>
    </RequireRole>
);

export function producerRoutes(RequireRole: React.FC<RequireRoleProps>) {
    return (
        <>
            <Route path="/producer" element={pr(ProducerDashboard, RequireRole)} />
            <Route path="/producer/projects" element={pr(ProducerProjects, RequireRole)} />
            <Route path="/producer/projects/new" element={pr(ProducerProjectForm, RequireRole)} />
            <Route path="/producer/projects/:id" element={pr(ProducerProjectForm, RequireRole)} />
            <Route path="/producer/editais" element={pr(ProducerNotices, RequireRole)} />
            <Route path="/producer/editais/:id/results" element={pr(ProducerNoticeResults, RequireRole)} />
            <Route path="/producer/editais/:id/transparencia" element={pr(ProducerNoticeTransparency, RequireRole)} />
            <Route path="/producer/documents" element={pr(ProducerDocuments, RequireRole)} />
            <Route path="/producer/providers" element={pr(ProducerProviders, RequireRole)} />
            <Route path="/producer/profile" element={pr(ProducerProfile, RequireRole)} />
            <Route path="/producer/settings" element={pr(ProducerSettings, RequireRole)} />
            <Route path="/producer/events" element={pr(ProducerEvents, RequireRole)} />
            <Route path="/producer/events/new" element={pr(ProducerEventForm, RequireRole)} />
            <Route path="/producer/events/:id" element={pr(ProducerEventForm, RequireRole)} />
            <Route path="/producer/calendario" element={pr(AdminCalendar, RequireRole)} />
            <Route path="/producer/works" element={pr(AdminWorks, RequireRole)} />
            <Route path="/producer/works/new" element={pr(AdminWorkForm, RequireRole)} />
            <Route path="/producer/works/:id" element={pr(AdminWorkForm, RequireRole)} />
            <Route path="/producer/gamification" element={pr(AdminAchievements, RequireRole)} />
            <Route path="/producer/services" element={pr(ProducerServices, RequireRole)} />
            <Route path="/producer/tickets" element={pr(ProducerTickets, RequireRole)} />
            <Route path="/producer/inbox" element={pr(ProducerInbox, RequireRole)} />
            <Route path="/producer/audience" element={pr(ProducerAudience, RequireRole)} />
            <Route path="/producer/reports" element={pr(ProducerReports, RequireRole)} />
            <Route path="/producer/finance" element={pr(ProducerFinance, RequireRole)} />

            {/* Redirect legacy /producer/theater to dedicated standalone /theater module */}
            <Route path="/producer/theater/*" element={<Navigate to="/theater" replace />} />

            <Route path="/producer/*" element={pr(ProducerDashboard, RequireRole)} />
        </>
    );
}
