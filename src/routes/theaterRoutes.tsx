import React from "react";
import { Route } from "react-router-dom";
import { Role } from "../modules/auth/AuthContext";

// Lazy-loaded Theater Module Components
const TheaterDashboard = React.lazy(() => import("../modules/theater/pages/TheaterDashboard").then(m => ({ default: m.TheaterDashboard })));
const TheaterSeatEditor = React.lazy(() => import("../modules/theater/pages/TheaterSeatEditor").then(m => ({ default: m.TheaterSeatEditor })));
const TheaterMobileBoxOffice = React.lazy(() => import("../modules/theater/pages/TheaterMobileBoxOffice").then(m => ({ default: m.TheaterMobileBoxOffice })));
const TheaterPlaybill = React.lazy(() => import("../modules/theater/pages/TheaterPlaybill").then(m => ({ default: m.TheaterPlaybill })));
const TheaterCueMaster = React.lazy(() => import("../modules/theater/pages/TheaterCueMaster").then(m => ({ default: m.TheaterCueMaster })));
const TheaterSubscriptions = React.lazy(() => import("../modules/theater/pages/TheaterSubscriptions").then(m => ({ default: m.TheaterSubscriptions })));
const TheaterCast = React.lazy(() => import("../modules/theater/pages/TheaterCast").then(m => ({ default: m.TheaterCast })));
const TheaterTeamManagement = React.lazy(() => import("../modules/theater/pages/TheaterTeamManagement").then(m => ({ default: m.TheaterTeamManagement })));
const TheaterKiosk = React.lazy(() => import("../modules/theater/pages/TheaterKiosk").then(m => ({ default: m.TheaterKiosk })));

// Existing Shared Components used in Theater
const AdminBoxOffice = React.lazy(() => import("../modules/backoffice/equipment/pages/AdminBoxOffice").then(m => ({ default: m.AdminBoxOffice })));
const AdminTicketVerifier = React.lazy(() => import("../modules/backoffice/equipment/pages/AdminTicketVerifier").then(m => ({ default: m.AdminTicketVerifier })));
const AdminExportReports = React.lazy(() => import("../modules/backoffice/equipment/pages/AdminExportReports").then(m => ({ default: m.AdminExportReports })));
const TheaterLayout = React.lazy(() => import("../modules/theater/layouts/TheaterLayout").then(m => ({ default: m.TheaterLayout })));

const THEATER_ALLOWED_ROLES = ["theater", "theater_admin", "admin", "equipment_admin", "master", "municipal_admin", "producer", "visitor", "public"];

export const theaterRoutes = (RequireRole: React.FC<{ allowed: (Role | string)[]; children: React.ReactElement }>) => (
    <>
        {/* Main Theater Dashboard */}
        <Route
            path="/theater"
            element={
                <RequireRole allowed={THEATER_ALLOWED_ROLES}>
                    <TheaterLayout>
                        <TheaterDashboard />
                    </TheaterLayout>
                </RequireRole>
            }
        />
        <Route
            path="/teatro"
            element={
                <RequireRole allowed={THEATER_ALLOWED_ROLES}>
                    <TheaterLayout>
                        <TheaterDashboard />
                    </TheaterLayout>
                </RequireRole>
            }
        />

        {/* Mobile Box Office */}
        <Route
            path="/theater/mobile"
            element={
                <RequireRole allowed={THEATER_ALLOWED_ROLES}>
                    <TheaterMobileBoxOffice />
                </RequireRole>
            }
        />
        <Route
            path="/teatro/mobile"
            element={
                <RequireRole allowed={THEATER_ALLOWED_ROLES}>
                    <TheaterMobileBoxOffice />
                </RequireRole>
            }
        />

        {/* Portaria / Validador QR Code */}
        <Route
            path="/theater/portaria"
            element={
                <RequireRole allowed={THEATER_ALLOWED_ROLES}>
                    <TheaterLayout>
                        <AdminTicketVerifier />
                    </TheaterLayout>
                </RequireRole>
            }
        />
        <Route
            path="/teatro/portaria"
            element={
                <RequireRole allowed={THEATER_ALLOWED_ROLES}>
                    <TheaterLayout>
                        <AdminTicketVerifier />
                    </TheaterLayout>
                </RequireRole>
            }
        />

        {/* Seat Editor / Plateia */}
        <Route
            path="/theater/assentos"
            element={
                <RequireRole allowed={THEATER_ALLOWED_ROLES}>
                    <TheaterLayout>
                        <TheaterSeatEditor />
                    </TheaterLayout>
                </RequireRole>
            }
        />
        <Route
            path="/teatro/assentos"
            element={
                <RequireRole allowed={THEATER_ALLOWED_ROLES}>
                    <TheaterLayout>
                        <TheaterSeatEditor />
                    </TheaterLayout>
                </RequireRole>
            }
        />

        {/* Sessions & Box Office */}
        <Route
            path="/theater/sessoes"
            element={
                <RequireRole allowed={THEATER_ALLOWED_ROLES}>
                    <TheaterLayout>
                        <AdminBoxOffice />
                    </TheaterLayout>
                </RequireRole>
            }
        />
        <Route
            path="/teatro/sessoes"
            element={
                <RequireRole allowed={THEATER_ALLOWED_ROLES}>
                    <TheaterLayout>
                        <AdminBoxOffice />
                    </TheaterLayout>
                </RequireRole>
            }
        />

        {/* Cue Master / Caderno de Cena */}
        <Route
            path="/theater/sessoes/:id/cue-master"
            element={
                <RequireRole allowed={THEATER_ALLOWED_ROLES}>
                    <TheaterLayout>
                        <TheaterCueMaster />
                    </TheaterLayout>
                </RequireRole>
            }
        />
        <Route
            path="/teatro/sessoes/:id/cue-master"
            element={
                <RequireRole allowed={THEATER_ALLOWED_ROLES}>
                    <TheaterLayout>
                        <TheaterCueMaster />
                    </TheaterLayout>
                </RequireRole>
            }
        />

        {/* Playbill / Programação */}
        <Route
            path="/theater/playbill"
            element={
                <RequireRole allowed={THEATER_ALLOWED_ROLES}>
                    <TheaterLayout>
                        <TheaterPlaybill />
                    </TheaterLayout>
                </RequireRole>
            }
        />
        <Route
            path="/teatro/playbill"
            element={
                <RequireRole allowed={THEATER_ALLOWED_ROLES}>
                    <TheaterLayout>
                        <TheaterPlaybill />
                    </TheaterLayout>
                </RequireRole>
            }
        />

        {/* Cast & Technical Staff */}
        <Route
            path="/theater/elenco"
            element={
                <RequireRole allowed={THEATER_ALLOWED_ROLES}>
                    <TheaterLayout>
                        <TheaterCast />
                    </TheaterLayout>
                </RequireRole>
            }
        />
        <Route
            path="/teatro/elenco"
            element={
                <RequireRole allowed={THEATER_ALLOWED_ROLES}>
                    <TheaterCast />
                </RequireRole>
            }
        />

        {/* Theater Subscriptions / Clube de Teatro */}
        <Route
            path="/theater/theater-club"
            element={
                <RequireRole allowed={THEATER_ALLOWED_ROLES}>
                    <TheaterLayout>
                        <TheaterSubscriptions />
                    </TheaterLayout>
                </RequireRole>
            }
        />
        <Route
            path="/teatro/clube"
            element={
                <RequireRole allowed={THEATER_ALLOWED_ROLES}>
                    <TheaterLayout>
                        <TheaterSubscriptions />
                    </TheaterLayout>
                </RequireRole>
            }
        />

        {/* Team & Granular Permissions */}
        <Route
            path="/theater/equipe"
            element={
                <RequireRole allowed={THEATER_ALLOWED_ROLES}>
                    <TheaterLayout>
                        <TheaterTeamManagement />
                    </TheaterLayout>
                </RequireRole>
            }
        />
        <Route
            path="/teatro/equipe"
            element={
                <RequireRole allowed={THEATER_ALLOWED_ROLES}>
                    <TheaterLayout>
                        <TheaterTeamManagement />
                    </TheaterLayout>
                </RequireRole>
            }
        />

        {/* Totem Kiosk Fullscreen */}
        <Route path="/theater/totem" element={<TheaterKiosk />} />
        <Route path="/teatro/totem" element={<TheaterKiosk />} />
        <Route path="/theater/kiosk" element={<TheaterKiosk />} />

        {/* Relatórios Exportáveis PDF & Excel */}
        <Route
            path="/theater/relatorios"
            element={
                <RequireRole allowed={THEATER_ALLOWED_ROLES}>
                    <TheaterLayout>
                        <AdminExportReports />
                    </TheaterLayout>
                </RequireRole>
            }
        />
        <Route
            path="/teatro/relatorios"
            element={
                <RequireRole allowed={THEATER_ALLOWED_ROLES}>
                    <TheaterLayout>
                        <AdminExportReports />
                    </TheaterLayout>
                </RequireRole>
            }
        />
    </>
);
