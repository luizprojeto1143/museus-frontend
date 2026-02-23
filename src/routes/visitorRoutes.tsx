import React from "react";
import { Route, Navigate } from "react-router-dom";
import { VisitorLayout } from "../modules/visitor/VisitorLayout";
import { Role } from "../modules/auth/AuthContext";

// Lazy Loaded AI Components
const VisualScannerPage = React.lazy(() => import("../modules/visitor/pages/VisualScannerPage").then(module => ({ default: module.VisualScannerPage })));
const ScannerHub = React.lazy(() => import("../modules/visitor/pages/ScannerHub").then(module => ({ default: module.ScannerHub })));
const ScannerPage = React.lazy(() => import("../modules/visitor/pages/ScannerPage").then(module => ({ default: module.ScannerPage })));

// Standard imports (converted to lazy)
const Home = React.lazy(() => import("../modules/visitor/pages/Home").then(m => ({ default: m.Home })));
const WorksList = React.lazy(() => import("../modules/visitor/pages/WorksList").then(m => ({ default: m.WorksList })));
const WorkDetail = React.lazy(() => import("../modules/visitor/pages/WorkDetail").then(m => ({ default: m.WorkDetail })));
const TrailsList = React.lazy(() => import("../modules/visitor/pages/TrailsList").then(m => ({ default: m.TrailsList })));
const TrailDetail = React.lazy(() => import("../modules/visitor/pages/TrailDetail").then(m => ({ default: m.TrailDetail })));
const MapView = React.lazy(() => import("../modules/visitor/pages/MapView").then(m => ({ default: m.MapView })));
const EventsList = React.lazy(() => import("../modules/visitor/pages/EventsList").then(m => ({ default: m.EventsList })));
const EventDetail = React.lazy(() => import("../modules/visitor/pages/EventDetail").then(m => ({ default: m.EventDetail })));
const Favorites = React.lazy(() => import("../modules/visitor/pages/Favorites").then(m => ({ default: m.Favorites })));
const ChatAI = React.lazy(() => import("../modules/visitor/pages/ChatAI"));
const Souvenir = React.lazy(() => import("../modules/visitor/pages/Souvenir"));
const Passport = React.lazy(() => import("../modules/visitor/pages/Passport"));
const Achievements = React.lazy(() => import("../modules/visitor/pages/Achievements"));
const QrVisit = React.lazy(() => import("../modules/visitor/pages/QrVisit").then(m => ({ default: m.QrVisit })));
const TreasureHunt = React.lazy(() => import("../modules/visitor/pages/TreasureHunt"));
const SmartItineraryWizard = React.lazy(() => import("../modules/visitor/pages/SmartItineraryWizard").then(m => ({ default: m.SmartItineraryWizard })));
const SmartItineraryResult = React.lazy(() => import("../modules/visitor/pages/SmartItineraryResult").then(m => ({ default: m.SmartItineraryResult })));
const SchedulingPage = React.lazy(() => import("../modules/visitor/pages/SchedulingPage").then(m => ({ default: m.SchedulingPage })));
const GuestbookPage = React.lazy(() => import("../modules/visitor/pages/GuestbookPage").then(m => ({ default: m.GuestbookPage })));
const LeaderboardPage = React.lazy(() => import("../modules/visitor/pages/LeaderboardPage").then(m => ({ default: m.LeaderboardPage })));
const VisitorProfile = React.lazy(() => import("../modules/visitor/pages/VisitorProfile").then(m => ({ default: m.VisitorProfile })));
const ShopPage = React.lazy(() => import("../modules/visitor/pages/ShopPage").then(m => ({ default: m.ShopPage })));
const ChallengesPage = React.lazy(() => import("../modules/visitor/pages/ChallengesPage").then(m => ({ default: m.ChallengesPage })));
const EventSurveyPage = React.lazy(() => import("../modules/visitor/pages/EventSurveyPage").then(m => ({ default: m.EventSurveyPage })));

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
