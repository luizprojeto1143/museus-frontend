import React from "react";
import { Route } from "react-router-dom";
import { Role } from "../modules/auth/AuthContext";

// Provider
import { ProviderLayout } from "../modules/provider/ProviderLayout";
import { ProviderDashboard } from "../modules/provider/ProviderDashboard";
import { ProviderInbox } from "../modules/provider/ProviderInbox";
import { ProviderProfile } from "../modules/provider/ProviderProfile";
import { ProviderServices } from "../modules/provider/ProviderServices";
import { ProviderSettings } from "../modules/provider/ProviderSettings";

// Municipal
import { MunicipalLayout } from "../modules/municipal/MunicipalLayout";
import { MunicipalDashboard } from "../modules/municipal/MunicipalDashboard";
import { MunicipalReports } from "../modules/municipal/MunicipalReports";
import {
    MunicipalEquipments,
    MunicipalProjects,
    MunicipalCompliance,
    MunicipalSettings
} from "../modules/municipal/MunicipalPlaceholders";

// Totem
import { TotemLayout } from "../modules/totem/TotemLayout";
import { TotemDashboard } from "../modules/totem/pages/TotemDashboard";
import { TotemValidator } from "../modules/totem/pages/TotemValidator";
import { TotemEvents } from "../modules/totem/pages/TotemEvents";
import { TotemEventDetails } from "../modules/totem/pages/TotemEventDetails";
import { TotemSearch } from "../modules/totem/pages/TotemSearch";

type RequireRoleProps = { allowed: Role[]; children: React.ReactElement };
type RequireProviderProps = { children: React.ReactElement };

export function providerRoutes(RequireProvider: React.FC<RequireProviderProps>) {
    const pvr = (Component: React.ComponentType) => (
        <RequireProvider>
            <ProviderLayout>
                <Component />
            </ProviderLayout>
        </RequireProvider>
    );

    return (
        <>
            <Route path="/provider" element={pvr(ProviderDashboard)} />
            <Route path="/provider/inbox" element={pvr(ProviderInbox)} />
            <Route path="/provider/profile" element={pvr(ProviderProfile)} />
            <Route path="/provider/services" element={pvr(ProviderServices)} />
            <Route path="/provider/settings" element={pvr(ProviderSettings)} />
        </>
    );
}

export function municipalRoutes(RequireRole: React.FC<RequireRoleProps>) {
    const mun = (Component: React.ComponentType) => (
        <RequireRole allowed={["admin", "master"]}>
            <MunicipalLayout>
                <Component />
            </MunicipalLayout>
        </RequireRole>
    );

    return (
        <>
            <Route path="/municipal" element={mun(MunicipalDashboard)} />
            <Route path="/municipal/equipments" element={mun(MunicipalEquipments)} />
            <Route path="/municipal/projects" element={mun(MunicipalProjects)} />
            <Route path="/municipal/reports" element={mun(MunicipalReports)} />
            <Route path="/municipal/compliance" element={mun(MunicipalCompliance)} />
            <Route path="/municipal/settings" element={mun(MunicipalSettings)} />
        </>
    );
}

export function totemRoutes(RequireRole: React.FC<RequireRoleProps>) {
    return (
        <Route
            path="/totem"
            element={
                <RequireRole allowed={["admin", "master"]}>
                    <TotemLayout />
                </RequireRole>
            }
        >
            <Route index element={<TotemDashboard />} />
            <Route path="validar" element={<TotemValidator />} />
            <Route path="eventos" element={<TotemEvents />} />
            <Route path="eventos/:id" element={<TotemEventDetails />} />
            <Route path="busca" element={<TotemSearch />} />
        </Route>
    );
}
