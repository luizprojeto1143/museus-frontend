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

export const theaterRoutes = (RequireRole: React.FC<{ allowed: Role[]; children: React.ReactElement }>) => (
    <>
        <Route
            path="/theater"
            element={
                <RequireRole allowed={["theater", "admin"]}>
                    <TheaterLayout>
                        <TheaterDashboard />
                    </TheaterLayout>
                </RequireRole>
            }
        />
        <Route
            path="/theater/mobile"
            element={
                <RequireRole allowed={["theater", "admin"]}>
                    <TheaterMobileBoxOffice />
                </RequireRole>
            }
        />
        <Route
            path="/theater/assentos"
            element={
                <RequireRole allowed={["theater", "admin"]}>
                    <TheaterLayout>
                        <TheaterSeatEditor />
                    </TheaterLayout>
                </RequireRole>
            }
        />
        <Route
            path="/theater/sessoes"
            element={
                <RequireRole allowed={["theater", "admin"]}>
                    <TheaterLayout>
                        <AdminBoxOffice />
                    </TheaterLayout>
                </RequireRole>
            }
        />
        <Route
            path="/theater/sessoes/:id/cue-master"
            element={
                <RequireRole allowed={["theater", "admin"]}>
                    <TheaterLayout>
                        <TheaterCueMaster />
                    </TheaterLayout>
                </RequireRole>
            }
        />
        <Route
            path="/theater/playbill"
            element={
                <RequireRole allowed={["theater", "admin"]}>
                    <TheaterLayout>
                        <TheaterPlaybill />
                    </TheaterLayout>
                </RequireRole>
            }
        />
        <Route
            path="/theater/elenco"
            element={
                <RequireRole allowed={["theater", "admin"]}>
                    <TheaterLayout>
                        <TheaterCast />
                    </TheaterLayout>
                </RequireRole>
            }
        />
        <Route
            path="/theater/theater-club"
            element={
                <RequireRole allowed={["theater", "admin"]}>
                    <TheaterLayout>
                        <TheaterSubscriptions />
                    </TheaterLayout>
                </RequireRole>
            }
        />
    </>
);
