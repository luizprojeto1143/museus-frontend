import React from "react";
import { Route } from "react-router-dom";
import { ProducerLayout } from "../modules/producer/ProducerLayout";
import { Role } from "../modules/auth/AuthContext";

// Producer pages
const ProducerDashboard = React.lazy(() => import("../modules/producer/ProducerDashboard").then(m => ({ default: m.ProducerDashboard })));
const ProducerEvents = React.lazy(() => import("../modules/producer/ProducerEvents").then(m => ({ default: m.ProducerEvents })));
const ProducerProjects = React.lazy(() => import("../modules/producer/ProducerProjects").then(m => ({ default: m.ProducerProjects })));
const ProducerEventForm = React.lazy(() => import("../modules/producer/ProducerEventForm").then(m => ({ default: m.ProducerEventForm })));
const ProducerProjectForm = React.lazy(() => import("../modules/producer/ProducerProjectForm").then(m => ({ default: m.ProducerProjectForm })));
const ProducerServices = React.lazy(() => import("../modules/producer/ProducerServices").then(m => ({ default: m.ProducerServices })));
const ProducerTickets = React.lazy(() => import("../modules/producer/ProducerTickets").then(m => ({ default: m.ProducerTickets })));
const ProducerInbox = React.lazy(() => import("../modules/producer/ProducerInbox").then(m => ({ default: m.ProducerInbox })));
const ProducerAudience = React.lazy(() => import("../modules/producer/ProducerAudience").then(m => ({ default: m.ProducerAudience })));
const ProducerReports = React.lazy(() => import("../modules/producer/ProducerReports").then(m => ({ default: m.ProducerReports })));
const ProducerNotices = React.lazy(() => import("../modules/producer/ProducerNotices").then(m => ({ default: m.ProducerNotices })));
const ProducerProfile = React.lazy(() => import("../modules/producer/ProducerProfile").then(m => ({ default: m.ProducerProfile })));
const ProducerSettings = React.lazy(() => import("../modules/producer/ProducerSettings").then(m => ({ default: m.ProducerSettings })));
const ProducerNoticeResults = React.lazy(() => import("../modules/producer/ProducerNoticeResults").then(m => ({ default: m.ProducerNoticeResults })));

// Reused admin components for museum features
import { AdminWorks } from "../modules/admin/pages/AdminWorks";
import { AdminWorkForm } from "../modules/admin/pages/AdminWorkForm";
import { AdminAchievements } from "../modules/admin/pages/AdminAchievements";

type RequireRoleProps = { allowed: Role[]; children: React.ReactElement };

const pr = (Component: React.ComponentType, RequireRole: React.FC<RequireRoleProps>) => (
    <RequireRole allowed={["admin", "producer"]}>
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
            <Route path="/producer/profile" element={pr(ProducerProfile, RequireRole)} />
            <Route path="/producer/settings" element={pr(ProducerSettings, RequireRole)} />
            <Route path="/producer/events" element={pr(ProducerEvents, RequireRole)} />
            <Route path="/producer/events/new" element={pr(ProducerEventForm, RequireRole)} />
            <Route path="/producer/events/:id" element={pr(ProducerEventForm, RequireRole)} />
            <Route path="/producer/works" element={pr(AdminWorks, RequireRole)} />
            <Route path="/producer/works/new" element={pr(AdminWorkForm, RequireRole)} />
            <Route path="/producer/works/:id" element={pr(AdminWorkForm, RequireRole)} />
            <Route path="/producer/gamification" element={pr(AdminAchievements, RequireRole)} />
            <Route path="/producer/services" element={pr(ProducerServices, RequireRole)} />
            <Route path="/producer/tickets" element={pr(ProducerTickets, RequireRole)} />
            <Route path="/producer/audience" element={pr(ProducerAudience, RequireRole)} />
            <Route path="/producer/reports" element={pr(ProducerReports, RequireRole)} />
            <Route path="/producer/*" element={pr(ProducerDashboard, RequireRole)} />
        </>
    );
}
