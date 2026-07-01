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

// Totem
import { TotemLayout } from "../modules/totem/TotemLayout";
import { TotemDashboard } from "../modules/totem/pages/TotemDashboard";
import { TotemValidator } from "../modules/totem/pages/TotemValidator";
import { TotemEvents } from "../modules/totem/pages/TotemEvents";
import { TotemEventDetails } from "../modules/totem/pages/TotemEventDetails";
import { TotemSearch } from "../modules/totem/pages/TotemSearch";

type RequireRoleProps = { allowed: Role[]; children: React.ReactElement };
type RequireProviderProps = { children: React.ReactElement };

export function providerRoutes(RequireRole: React.FC<RequireRoleProps>) {
    const pvr = (Component: React.ComponentType) => (
        <RequireRole allowed={["provider"]}>
            <ProviderLayout>
                <Component />
            </ProviderLayout>
        </RequireRole>
    );

    return (
        <>
            <Route path="/provider" element={pvr(ProviderDashboard)} />
            <Route path="/provider/chamados" element={pvr(ProviderDashboard)} />
            <Route path="/provider/orcamentos" element={pvr(ProviderDashboard)} />
            <Route path="/provider/execucoes" element={pvr(ProviderDashboard)} />
            <Route path="/provider/servicos" element={pvr(ProviderServices)} />
            <Route path="/provider/carteira" element={pvr(ProviderDashboard)} />
            <Route path="/provider/notas-fiscais" element={pvr(ProviderInvoices)} />
            <Route path="/provider/mensagens" element={pvr(ProviderInbox)} />
            <Route path="/provider/perfil" element={pvr(ProviderProfile)} />
            <Route path="/provider/configuracoes" element={pvr(ProviderSettings)} />
            <Route path="/provider/*" element={pvr(ProviderDashboard)} />
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
