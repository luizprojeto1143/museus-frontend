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
const ProducerDocuments = React.lazy(() => import("../modules/producer/ProducerDocuments").then(m => ({ default: m.ProducerDocuments })));
const ProducerProviders = React.lazy(() => import("../modules/producer/ProducerProviders").then(m => ({ default: m.ProducerProviders })));
const ProducerFinance = React.lazy(() => import("../modules/producer/pages/ProducerFinance").then(m => ({ default: m.ProducerFinance })));

// Theater pages
const TheaterDashboard = React.lazy(() => import("../modules/theater/pages/TheaterDashboard").then(m => ({ default: m.TheaterDashboard })));
const TheaterCast = React.lazy(() => import("../modules/theater/pages/TheaterCast").then(m => ({ default: m.TheaterCast })));
const TheaterCueMaster = React.lazy(() => import("../modules/theater/pages/TheaterCueMaster").then(m => ({ default: m.TheaterCueMaster })));
const TheaterSeatEditor = React.lazy(() => import("../modules/theater/pages/TheaterSeatEditor").then(m => ({ default: m.TheaterSeatEditor })));
const TheaterPlaybill = React.lazy(() => import("../modules/theater/pages/TheaterPlaybill").then(m => ({ default: m.TheaterPlaybill })));
const TheaterSubscriptions = React.lazy(() => import("../modules/theater/pages/TheaterSubscriptions").then(m => ({ default: m.TheaterSubscriptions })));
const AdminBoxOffice = React.lazy(() => import("../modules/admin/pages/AdminBoxOffice").then(m => ({ default: m.AdminBoxOffice })));

// Reused admin components for museum features (converted to lazy)
const AdminWorks = React.lazy(() => import("../modules/admin/pages/AdminWorks").then(m => ({ default: m.AdminWorks })));
const AdminWorkForm = React.lazy(() => import("../modules/admin/pages/AdminWorkForm").then(m => ({ default: m.AdminWorkForm })));
const AdminAchievements = React.lazy(() => import("../modules/admin/pages/AdminAchievements").then(m => ({ default: m.AdminAchievements })));
const AdminCalendar = React.lazy(() => import("../modules/admin/pages/AdminCalendar").then(m => ({ default: m.AdminCalendar })));

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

            {/* Theater Module */}
            <Route path="/producer/theater" element={pr(TheaterDashboard, RequireRole)} />
            <Route path="/producer/theater/cast" element={pr(TheaterCast, RequireRole)} />
            <Route path="/producer/theater/cue/:id" element={pr(TheaterCueMaster, RequireRole)} />
            <Route path="/producer/theater/seats" element={pr(TheaterSeatEditor, RequireRole)} />
            <Route path="/producer/theater/playbill" element={pr(TheaterPlaybill, RequireRole)} />
            <Route path="/producer/theater/subscriptions" element={pr(TheaterSubscriptions, RequireRole)} />
            <Route path="/producer/box-office" element={pr(AdminBoxOffice, RequireRole)} />

            <Route path="/producer/*" element={pr(ProducerDashboard, RequireRole)} />
        </>
    );
}
