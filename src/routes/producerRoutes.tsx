import React from "react";
import { Route } from "react-router-dom";
import { ProducerLayout } from "../modules/producer/ProducerLayout";
import { Role } from "../modules/auth/AuthContext";

// Producer pages
import { ProducerDashboard } from "../modules/producer/ProducerDashboard";
import { ProducerEvents } from "../modules/producer/ProducerEvents";
import { ProducerProjects } from "../modules/producer/ProducerProjects";
import { ProducerEventForm } from "../modules/producer/ProducerEventForm";
import { ProducerProjectForm } from "../modules/producer/ProducerProjectForm";
import { ProducerServices } from "../modules/producer/ProducerServices";
import { ProducerTickets } from "../modules/producer/ProducerTickets";
import { ProducerInbox } from "../modules/producer/ProducerInbox";
import { ProducerAudience } from "../modules/producer/ProducerAudience";
import { ProducerReports } from "../modules/producer/ProducerReports";
import { ProducerNotices } from "../modules/producer/ProducerNotices";
import { ProducerProfile } from "../modules/producer/ProducerProfile";
import { ProducerSettings } from "../modules/producer/ProducerSettings";

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
