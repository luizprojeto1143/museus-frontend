import React from "react";
import { Route } from "react-router-dom";
import { Role } from "../modules/auth/AuthContext";

// Provider
import { ProviderLayout } from "../modules/backoffice/provider/ProviderLayout";
import { ProviderDashboard } from "../modules/backoffice/provider/ProviderDashboard";
import { ProviderInbox } from "../modules/backoffice/provider/ProviderInbox";
import { ProviderProfile } from "../modules/backoffice/provider/ProviderProfile";
import { ProviderServices } from "../modules/backoffice/provider/ProviderServices";
import { ProviderSettings } from "../modules/backoffice/provider/ProviderSettings";
import { ProviderInvoices } from "../modules/backoffice/provider/ProviderInvoices";

// Municipal
import { MunicipalLayout } from "../modules/backoffice/municipal/MunicipalLayout";
import { MunicipalDashboard } from "../modules/backoffice/municipal/MunicipalDashboard";
import { MunicipalReports } from "../modules/backoffice/municipal/MunicipalReports";
import { MunicipalEquipments } from "../modules/backoffice/municipal/MunicipalEquipments";
import { MunicipalSettings } from "../modules/backoffice/municipal/MunicipalSettings";
import { MunicipalNoticeProjects } from "../modules/backoffice/municipal/MunicipalNoticeProjects";
import { MunicipalAccessibilityGaps } from "../modules/backoffice/municipal/MunicipalAccessibilityGaps";
import { MunicipalPPA } from "../modules/backoffice/municipal/MunicipalPPA";

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
            <Route path="/provider/invoices" element={pvr(ProviderInvoices)} />
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
            <Route path="/municipal/projects" element={mun(MunicipalNoticeProjects)} />
            <Route path="/municipal/reports" element={mun(MunicipalReports)} />
            <Route path="/municipal/compliance" element={mun(MunicipalAccessibilityGaps)} />
            <Route path="/municipal/ppa" element={mun(MunicipalPPA)} />
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
