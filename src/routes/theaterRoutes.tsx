import React from "react";
import { Route } from "react-router-dom";
import { AdminLayout } from "../modules/admin/AdminLayout";
import { Role } from "../modules/auth/AuthContext";

const TheaterDashboard = React.lazy(() => import("../modules/theater/pages/TheaterDashboard").then(m => ({ default: m.TheaterDashboard })));
const TheaterBoxOffice = React.lazy(() => import("../modules/theater/pages/TheaterBoxOffice").then(m => ({ default: m.TheaterBoxOffice })));
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
                    <AdminLayout>
                        <TheaterDashboard />
                    </AdminLayout>
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
            path="/admin/assentos"
            element={
                <RequireRole allowed={["theater", "admin"]}>
                    <AdminLayout>
                        <TheaterSeatEditor />
                    </AdminLayout>
                </RequireRole>
            }
        />
        <Route
            path="/admin/sessoes"
            element={
                <RequireRole allowed={["theater", "admin"]}>
                    <AdminLayout>
                        <TheaterBoxOffice />
                    </AdminLayout>
                </RequireRole>
            }
        />
        <Route
            path="/admin/playbill"
            element={
                <RequireRole allowed={["theater", "admin"]}>
                    <AdminLayout>
                        <TheaterPlaybill />
                    </AdminLayout>
                </RequireRole>
            }
        />
        <Route
            path="/admin/elenco"
            element={
                <RequireRole allowed={["theater", "admin"]}>
                    <AdminLayout>
                        <TheaterCast />
                    </AdminLayout>
                </RequireRole>
            }
        />
        <Route
            path="/admin/cue-master"
            element={
                <RequireRole allowed={["theater", "admin"]}>
                    <AdminLayout>
                        <TheaterCueMaster />
                    </AdminLayout>
                </RequireRole>
            }
        />
        <Route
            path="/admin/theater-club"
            element={
                <RequireRole allowed={["theater", "admin"]}>
                    <AdminLayout>
                        <TheaterSubscriptions />
                    </AdminLayout>
                </RequireRole>
            }
        />
    </>
);
