import React from "react";
import { Route, Navigate } from "react-router-dom";
import { VisitorLayout } from "../modules/visitor/VisitorLayout";
import { Role } from "../modules/auth/AuthContext";

// Lazy Loaded AI Components
const VisualScannerPage = React.lazy(() => import("../modules/visitor/pages/VisualScannerPage").then(module => ({ default: module.VisualScannerPage })));
const ScannerHub = React.lazy(() => import("../modules/visitor/pages/ScannerHub").then(module => ({ default: module.ScannerHub })));
const ScannerPage = React.lazy(() => import("../modules/visitor/pages/ScannerPage").then(module => ({ default: module.ScannerPage })));

// Standard imports
import { Home } from "../modules/visitor/pages/Home";
import { WorksList } from "../modules/visitor/pages/WorksList";
import { WorkDetail } from "../modules/visitor/pages/WorkDetail";
import { TrailsList } from "../modules/visitor/pages/TrailsList";
import { TrailDetail } from "../modules/visitor/pages/TrailDetail";
import { MapView } from "../modules/visitor/pages/MapView";
import { EventsList } from "../modules/visitor/pages/EventsList";
import { EventDetail } from "../modules/visitor/pages/EventDetail";
import { Favorites } from "../modules/visitor/pages/Favorites";
import ChatAI from "../modules/visitor/pages/ChatAI";
import Souvenir from "../modules/visitor/pages/Souvenir";
import Passport from "../modules/visitor/pages/Passport";
import Achievements from "../modules/visitor/pages/Achievements";
import { QrVisit } from "../modules/visitor/pages/QrVisit";
import TreasureHunt from "../modules/visitor/pages/TreasureHunt";
import { SmartItineraryWizard } from "../modules/visitor/pages/SmartItineraryWizard";
import { SmartItineraryResult } from "../modules/visitor/pages/SmartItineraryResult";
import { SchedulingPage } from "../modules/visitor/pages/SchedulingPage";
import { GuestbookPage } from "../modules/visitor/pages/GuestbookPage";
import { LeaderboardPage } from "../modules/visitor/pages/LeaderboardPage";
import { VisitorProfile } from "../modules/visitor/pages/VisitorProfile";
import { ShopPage } from "../modules/visitor/pages/ShopPage";
import { ChallengesPage } from "../modules/visitor/pages/ChallengesPage";
import { EventSurveyPage } from "../modules/visitor/pages/EventSurveyPage";

type RequireRoleProps = { allowed: Role[]; children: React.ReactElement };

/** Helper to wrap a visitor page with layout + role guard */
const vr = (Component: React.ComponentType, RequireRole: React.FC<RequireRoleProps>) => (
    <RequireRole allowed={["visitor", "admin", "master"]}>
        <VisitorLayout>
            <Component />
        </VisitorLayout>
    </RequireRole>
);

export function visitorRoutes(RequireRole: React.FC<RequireRoleProps>) {
    return (
        <>
            <Route path="/home" element={vr(Home, RequireRole)} />
            <Route path="/obras" element={vr(WorksList, RequireRole)} />
            <Route path="/obras/:id" element={vr(WorkDetail, RequireRole)} />
            <Route path="/trilhas" element={vr(TrailsList, RequireRole)} />
            <Route path="/trilhas/:id" element={vr(TrailDetail, RequireRole)} />
            <Route path="/mapa" element={vr(MapView, RequireRole)} />
            <Route path="/eventos" element={vr(EventsList, RequireRole)} />
            <Route path="/eventos/:id" element={vr(EventDetail, RequireRole)} />
            <Route path="/eventos/:id/pesquisa" element={vr(EventSurveyPage, RequireRole)} />
            <Route path="/favoritos" element={vr(Favorites, RequireRole)} />
            <Route path="/loja" element={vr(ShopPage, RequireRole)} />
            <Route path="/desafios" element={vr(ChallengesPage, RequireRole)} />
            <Route path="/perfil" element={vr(VisitorProfile, RequireRole)} />
            <Route path="/chat" element={vr(ChatAI, RequireRole)} />
            <Route path="/souvenir" element={vr(Souvenir, RequireRole)} />
            <Route path="/passaporte" element={vr(Passport, RequireRole)} />
            <Route path="/conquistas" element={vr(Achievements, RequireRole)} />
            <Route path="/livro-visitas" element={vr(GuestbookPage, RequireRole)} />
            <Route path="/roteiro-inteligente" element={vr(SmartItineraryWizard, RequireRole)} />
            <Route path="/agendar" element={vr(SchedulingPage, RequireRole)} />
            <Route path="/roteiro-inteligente/resultado" element={vr(SmartItineraryResult, RequireRole)} />
            <Route path="/scanner" element={vr(ScannerHub, RequireRole)} />
            <Route path="/scanner/qr" element={vr(ScannerPage, RequireRole)} />
            <Route path="/scanner/ai" element={
                <RequireRole allowed={["visitor", "admin", "master"]}>
                    <VisualScannerPage />
                </RequireRole>
            } />
            <Route path="/ranking" element={vr(LeaderboardPage, RequireRole)} />
            <Route path="/qr/:code" element={vr(QrVisit, RequireRole)} />
        </>
    );
}
