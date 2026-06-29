import React from "react";
import { Route, Navigate } from "react-router-dom";
import { VisitorLayout } from "../modules/visitor/VisitorLayout";
import { Role } from "../modules/auth/AuthContext";

const CulturalAgenda = React.lazy(() => import("../modules/visitor/pages/CulturalAgenda").then(m => ({ default: m.CulturalAgenda })));
const MyTickets = React.lazy(() => import("../modules/visitor/pages/MyTickets").then(m => ({ default: m.MyTickets })));

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
const SmartItineraryWizard = React.lazy(() => import("../modules/visitor/pages/SmartItineraryWizard").then(m => ({ default: m.SmartItineraryWizard })));
const SmartItineraryResult = React.lazy(() => import("../modules/visitor/pages/SmartItineraryResult").then(m => ({ default: m.SmartItineraryResult })));
const SchedulingPage = React.lazy(() => import("../modules/visitor/pages/SchedulingPage").then(m => ({ default: m.SchedulingPage })));
const GuestbookPage = React.lazy(() => import("../modules/visitor/pages/GuestbookPage").then(m => ({ default: m.GuestbookPage })));
const LeaderboardPage = React.lazy(() => import("../modules/visitor/pages/LeaderboardPage").then(m => ({ default: m.LeaderboardPage })));
const VisitorProfile = React.lazy(() => import("../modules/visitor/pages/VisitorProfile").then(m => ({ default: m.VisitorProfile })));
const ShopPage = React.lazy(() => import("../modules/visitor/pages/ShopPage").then(m => ({ default: m.ShopPage })));
const ChallengesPage = React.lazy(() => import("../modules/visitor/pages/ChallengesPage").then(m => ({ default: m.ChallengesPage })));
const EventSurveyPage = React.lazy(() => import("../modules/visitor/pages/EventSurveyPage").then(m => ({ default: m.EventSurveyPage })));
const WorkTimeline = React.lazy(() => import("../modules/visitor/pages/WorkTimeline").then(m => ({ default: m.WorkTimeline })));
const WorkComparator = React.lazy(() => import("../modules/visitor/pages/WorkComparator").then(m => ({ default: m.WorkComparator })));
const VisitorMembership = React.lazy(() => import("../modules/visitor/pages/VisitorMembership").then(m => ({ default: m.VisitorMembership })));
const VisitorCollectibles = React.lazy(() => import("../modules/visitor/pages/VisitorCollectibles").then(m => ({ default: m.VisitorCollectibles })));
const TicketTransfer = React.lazy(() => import("../modules/visitor/pages/TicketTransfer").then(m => ({ default: m.TicketTransfer })));
const GroupCheckout = React.lazy(() => import("../modules/visitor/pages/GroupCheckout").then(m => ({ default: m.GroupCheckout })));
const VisitorRPG = React.lazy(() => import("../modules/visitor/pages/VisitorRPG").then(m => ({ default: m.VisitorRPG })));
const SocialCheckinPage = React.lazy(() => import("../modules/visitor/pages/SocialCheckinPage").then(m => ({ default: m.SocialCheckinPage })));
const TeacherPortal = React.lazy(() => import("../modules/visitor/pages/TeacherPortal").then(m => ({ default: m.TeacherPortal })));
const CommunityFeed = React.lazy(() => import("../modules/visitor/pages/CommunityFeed").then(m => ({ default: m.CommunityFeed })));
const ArchitecturalTimeline = React.lazy(() => import("../modules/visitor/pages/ArchitecturalTimeline").then(m => ({ default: m.ArchitecturalTimeline })));
const RouteMap = React.lazy(() => import("../modules/visitor/pages/RouteMap").then(m => ({ default: m.RouteMap })));
const FamilyTimeline = React.lazy(() => import("../modules/visitor/pages/FamilyTimeline").then(m => ({ default: m.FamilyTimeline })));
const CertificateList = React.lazy(() => import("../modules/visitor/pages/CertificateList").then(m => ({ default: m.CertificateList })));
const VisitorWardrobe = React.lazy(() => import("../modules/visitor/pages/VisitorWardrobe").then(m => ({ default: m.VisitorWardrobe })));
const SkinMarketplace = React.lazy(() => import("../modules/visitor/pages/SkinMarketplace").then(m => ({ default: m.SkinMarketplace })));
const BadgeRequestPage = React.lazy(() => import("../modules/visitor/pages/BadgeRequestPage").then(m => ({ default: m.BadgeRequestPage })));
const BadgeTracking = React.lazy(() => import("../modules/visitor/pages/BadgeTracking").then(m => ({ default: m.BadgeTracking })));
const VestigeCapture = React.lazy(() => import("../modules/visitor/pages/VestigeCapture").then(m => ({ default: m.VestigeCapture })));
const CityHub = React.lazy(() => import("../modules/visitor/pages/CityHub").then(m => ({ default: m.CityHub })));
const CityDashboard = React.lazy(() => import("../modules/visitor/pages/CityDashboard").then(m => ({ default: m.CityDashboard })));
const VisitorHub = React.lazy(() => import("../modules/visitor/pages/VisitorHub").then(m => ({ default: m.VisitorHub })));
const CitySearch = React.lazy(() => import("../modules/visitor/pages/CitySearch").then(m => ({ default: m.CitySearch })));
const MuseumHub = React.lazy(() => import("../modules/visitor/pages/MuseumHub").then(m => ({ default: m.MuseumHub })));

// Roteiro Cultural (Turismo Inteligente)
const RoteiroHome = React.lazy(() => import("../modules/roteiro/RoteiroHome").then(m => ({ default: m.RoteiroHome })));
const InteractiveMap = React.lazy(() => import("../modules/roteiro/InteractiveMap").then(m => ({ default: m.InteractiveMap })));
const SmartRouteGenerator = React.lazy(() => import("../modules/roteiro/SmartRouteGenerator").then(m => ({ default: m.SmartRouteGenerator })));
const CulturalPassport = React.lazy(() => import("../modules/roteiro/CulturalPassport").then(m => ({ default: m.CulturalPassport })));
const ProviderDetail = React.lazy(() => import("../modules/roteiro/ProviderDetail").then(m => ({ default: m.ProviderDetail })));

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
            {/* Roteiro Cultural */}
            <Route path="/roteiro" element={vr(RoteiroHome, RequireRole)} />
            <Route path="/roteiro/map" element={vr(InteractiveMap, RequireRole)} />
            <Route path="/roteiro/ai-generator" element={vr(SmartRouteGenerator, RequireRole)} />
            <Route path="/roteiro/passaporte" element={vr(CulturalPassport, RequireRole)} />
            <Route path="/roteiro/parceiro/:providerId" element={vr(ProviderDetail, RequireRole)} />

            {/* Hub do Museu/Equipamento (Rotas aninhadas) */}
            <Route path="/cidades/:citySlug/equipamentos/:equipmentSlug">
                <Route index element={vr(MuseumHub, RequireRole)} />
                <Route path="obras" element={vr(WorksList, RequireRole)} />
                <Route path="obras/:id" element={vr(WorkDetail, RequireRole)} />
                <Route path="trilhas" element={vr(TrailsList, RequireRole)} />
                <Route path="trilhas/:id" element={vr(TrailDetail, RequireRole)} />
                <Route path="mapa" element={vr(MapView, RequireRole)} />
                <Route path="agenda" element={vr(CulturalAgenda, RequireRole)} />
                <Route path="eventos" element={vr(EventsList, RequireRole)} />
                <Route path="eventos/:id" element={vr(EventDetail, RequireRole)} />
                <Route path="eventos/:id/pesquisa" element={vr(EventSurveyPage, RequireRole)} />
                <Route path="loja" element={vr(ShopPage, RequireRole)} />
                <Route path="desafios" element={vr(ChallengesPage, RequireRole)} />
                <Route path="souvenir" element={vr(Souvenir, RequireRole)} />
                <Route path="passaporte" element={vr(Passport, RequireRole)} />
                <Route path="conquistas" element={vr(Achievements, RequireRole)} />
                <Route path="livro-visitas" element={vr(GuestbookPage, RequireRole)} />
                <Route path="agendar" element={vr(SchedulingPage, RequireRole)} />
                <Route path="scanner" element={vr(ScannerHub, RequireRole)} />
                <Route path="scanner/qr" element={vr(ScannerPage, RequireRole)} />
                <Route path="scanner/ai" element={vr(VisualScannerPage, RequireRole)} />
                <Route path="ranking" element={vr(LeaderboardPage, RequireRole)} />
                <Route path="obras/timeline" element={vr(WorkTimeline, RequireRole)} />
                <Route path="obras/comparar" element={vr(WorkComparator, RequireRole)} />
            </Route>

            {/* Hub do Visitante — tela raiz após login */}
            <Route path="/hub" element={vr(VisitorHub, RequireRole)} />
            {/* Compatibilidade reversa */}
            <Route path="/hub-cidades" element={<Navigate to="/hub" replace />} />
            <Route path="/home" element={<Navigate to="/hub" replace />} />
            <Route path="/select-museum" element={<Navigate to="/cidades" replace />} />

            {/* Busca de cidades */}
            <Route path="/cidades" element={vr(CitySearch, RequireRole)} />
            
            {/* Hub da Cidade e suas rotas contextuais */}
            <Route path="/cidades/:citySlug">
                <Route index element={vr(CityDashboard, RequireRole)} />
                <Route path="mapa" element={vr(MapView, RequireRole)} />
                <Route path="agenda" element={vr(CulturalAgenda, RequireRole)} />
                <Route path="roteiros" element={vr(TrailsList, RequireRole)} />
                <Route path="ranking" element={vr(LeaderboardPage, RequireRole)} />
                <Route path="passaporte" element={vr(Passport, RequireRole)} />
                {/* A rota de equipamentos seria a listagem, mas por hora podemos apontar para o hub ou criar uma */}
            </Route>

            {/* Rotas Globais do Visitante */}
            <Route path="/scanner" element={vr(ScannerHub, RequireRole)} />
            <Route path="/scanner/qr" element={vr(ScannerPage, RequireRole)} />
            <Route path="/scanner/ai" element={vr(VisualScannerPage, RequireRole)} />
            <Route path="/qr/:code" element={vr(QrVisit, RequireRole)} />

            
            <Route path="/meus-ingressos" element={vr(MyTickets, RequireRole)} />
            <Route path="/favoritos" element={vr(Favorites, RequireRole)} />
            <Route path="/perfil" element={vr(VisitorProfile, RequireRole)} />
            <Route path="/chat" element={vr(ChatAI, RequireRole)} />
            <Route path="/roteiro-inteligente" element={vr(SmartItineraryWizard, RequireRole)} />
            <Route path="/roteiro-inteligente/resultado" element={vr(SmartItineraryResult, RequireRole)} />
            <Route path="/assinatura" element={vr(VisitorMembership, RequireRole)} />
            <Route path="/colecao" element={vr(VisitorCollectibles, RequireRole)} />
            <Route path="/transferir-ingresso" element={vr(TicketTransfer, RequireRole)} />
            <Route path="/grupo" element={vr(GroupCheckout, RequireRole)} />
            <Route path="/rpg" element={vr(VisitorRPG, RequireRole)} />
            <Route path="/checkin" element={vr(SocialCheckinPage, RequireRole)} />
            <Route path="/professor" element={vr(TeacherPortal, RequireRole)} />
            <Route path="/comunidade" element={vr(CommunityFeed, RequireRole)} />
            <Route path="/linha-do-tempo/:spaceId" element={vr(ArchitecturalTimeline, RequireRole)} />
            <Route path="/rota/:routeId" element={vr(RouteMap, RequireRole)} />
            <Route path="/familia/:profileId" element={vr(FamilyTimeline, RequireRole)} />
            <Route path="/meus-certificados" element={vr(CertificateList, RequireRole)} />
            <Route path="/guarda-roupa" element={vr(VisitorWardrobe, RequireRole)} />
            <Route path="/wardrobe" element={<Navigate to="/guarda-roupa" replace />} />
            <Route path="/marketplace" element={vr(SkinMarketplace, RequireRole)} />
            <Route path="/vestigios/capturar/:workId" element={vr(VestigeCapture, RequireRole)} />
        </>
    );
}
