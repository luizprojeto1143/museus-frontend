import React from "react";
import { Route } from "react-router-dom";
import { TheaterLayout } from "../modules/theater/layouts/TheaterLayout";
import { Role } from "../modules/auth/AuthContext";

const TheaterDashboard = React.lazy(() => import("../modules/theater/pages/TheaterDashboard").then(m => ({ default: m.TheaterDashboard })));
const AdminBoxOffice = React.lazy(() => import("../modules/backoffice/equipment/pages/AdminBoxOffice").then(m => ({ default: m.AdminBoxOffice })));
const TheaterSeatEditor = React.lazy(() => import("../modules/theater/pages/TheaterSeatEditor").then(m => ({ default: m.TheaterSeatEditor })));
const TheaterPlaybill = React.lazy(() => import("../modules/theater/pages/TheaterPlaybill").then(m => ({ default: m.TheaterPlaybill })));
const TheaterCast = React.lazy(() => import("../modules/theater/pages/TheaterCast").then(m => ({ default: m.TheaterCast })));
const TheaterCueMaster = React.lazy(() => import("../modules/theater/pages/TheaterCueMaster").then(m => ({ default: m.TheaterCueMaster })));
const TheaterMobileBoxOffice = React.lazy(() => import("../modules/theater/pages/TheaterMobileBoxOffice").then(m => ({ default: m.TheaterMobileBoxOffice })));
const TheaterSubscriptions = React.lazy(() => import("../modules/theater/pages/TheaterSubscriptions").then(m => ({ default: m.TheaterSubscriptions })));

const THEATER_ALLOWED_ROLES = ["theater", "theater_admin", "admin", "equipment_admin", "master", "municipal_admin", "producer"];

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
                    <TheaterLayout>
                        <TheaterCast />
                    </TheaterLayout>
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
    </>
);
