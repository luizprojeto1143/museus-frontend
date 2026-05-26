import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { api } from "../../api/client";
import { useTerminology } from "../../hooks/useTerminology";
import { 
  LayoutDashboard, 
  Image, 
  Map as MapIcon, 
  Tag, 
  FolderOpen, 
  Theater, 
  QrCode, 
  Ticket, 
  Smartphone, 
  Building2, 
  Calendar, 
  GraduationCap, 
  Users, 
  Star, 
  ShoppingCart, 
  Compass, 
  Trophy, 
  Sword, 
  ClipboardList, 
  Palette, 
  HardHat, 
  Handshake, 
  Accessibility, 
  BarChart, 
  Armchair, 
  Users2, 
  BookOpen, 
  Zap, 
  Diamond, 
  Bot, 
  Eye, 
  MapPin, 
  Bell, 
  CircleDollarSign, 
  Settings, 
  FileText, 
  MessageSquare, 
  CheckCircle2, 
  Smile, 
  Flame, 
  Filter, 
  ShieldCheck, 
  Baby, 
  Wrench, 
  Target, 
  Scroll, 
  CalendarDays, 
  FileSearch, 
  Wand2, 
  Camera, 
  Globe, 
  History, 
  Inbox, 
  TreePine,
  Menu,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X
} from "lucide-react";
import { useIsCityMode } from "../auth/TenantContext";

interface TenantFeatures {
  name: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  featureWorks: boolean;
  featureTrails: boolean;
  featureEvents: boolean;
  featureGamification: boolean;
  featureQRCodes: boolean;
  featureChatAI: boolean;
  featureShop: boolean;
  featureCertificates: boolean;
  featureReviews: boolean;
  featureGuestbook: boolean;
  featureAccessibility: boolean;
  // Municipal Features
  featureEditais: boolean;
  featureProjects: boolean;
  featureAccessibilityMgmt: boolean;
  featureProviders: boolean;
  featureInstitutionalReports: boolean;
  // Menu Groups
  featureGroupContent: boolean;
  featureGroupEvents: boolean;
  featureGroupEngagement: boolean;
  featureGroupGamification: boolean;
  featureGroupInstitutional: boolean;
  featureGroupTools: boolean;
  featureGroupAnalytics: boolean;
  featureGroupSocial: boolean;
  featureGroupPreservation: boolean;
  featureGroupAI: boolean;
  featureGroupRoadmap: boolean;
  // Hierarchy
  type: string;
  parentId: string | null;
}

interface SidebarLink {
  to: string;
  label: string;
  icon: string;
  show: boolean;
}

interface SidebarGroup {
  label: string;
  links: SidebarLink[];
  showGroup: boolean;
}

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout, name: userName, tenantId, role, hasPermission } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();
  const [isCollapsed, setCollapsed] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [features, setFeatures] = useState<TenantFeatures | null>(null);

  // City Mode hooks
  const isCityMode = useIsCityMode();
  const term = useTerminology();

  useEffect(() => {
    if (tenantId && role !== 'master') {
      api.get(`/tenants/${tenantId}/settings`)
        .then(res => setFeatures(res.data))
        .catch(err => console.error("Error loading tenant features", err));
    }
  }, [tenantId, role]);

  const themeStyles = features ? {
    "--accent-primary": role === 'theater' ? "#dc2626" : (features.primaryColor || (isCityMode ? "var(--accent-primary)" : "var(--accent-primary)")),
    "--accent-secondary": role === 'theater' ? "#7f1d1d" : (features.secondaryColor || (isCityMode ? "#0ea5e9" : "var(--accent-secondary)")),
  } as React.CSSProperties : (role === 'theater' ? {
    "--accent-primary": "#dc2626",
    "--accent-secondary": "#7f1d1d",
  } : {});

  const sidebarGroups: SidebarGroup[] = [
    {
      label: t("admin.sidebar.painel", "Painel"),
      links: [
        { to: role === 'theater' ? "/theater" : "/admin", label: role === 'theater' ? "Dashboard Palco" : (isCityMode ? "Secretaria de Cultura" : t("admin.sidebar.dashboard")), icon: "LayoutDashboard", show: true },
      ],
      showGroup: true
    },
    {
      label: t("admin.sidebar.conteDo", "Conteúdo"),
      links: [
        { to: "/admin/obras", label: term.works, icon: "Image", show: (features?.featureWorks ?? true) && hasPermission("manage_works") },
        { to: "/admin/trilhas", label: term.trails, icon: "MapIcon", show: (features?.featureTrails ?? true) && hasPermission("manage_trails") },
        { to: "/admin/categorias", label: t("admin.sidebar.categories"), icon: "Tag", show: hasPermission("manage_works") },
        { to: "/admin/uploads", label: t("admin.sidebar.uploads", "Arquivos"), icon: "FolderOpen", show: hasPermission("manage_works") },
      ],
      showGroup: (features?.featureGroupContent ?? true) && role !== 'theater'
    },
    {
      label: t("admin.sidebar.eventosEspaOs", "Eventos & Espaços"),
      links: [
        { to: "/admin/eventos", label: t("admin.sidebar.events"), icon: "Theater", show: (features?.featureEvents ?? true) && hasPermission("manage_events") },
        { to: "/admin/verificar-ingressos", label: t("admin.sidebar.verificarIngressos", "Verificar Ingressos"), icon: "Ticket", show: (features?.featureEvents ?? true) && hasPermission("manage_scanner") },
        { to: "/admin/scanner", label: t("admin.sidebar.scannerPortaria", "Scanner (Portaria)"), icon: "Smartphone", show: (features?.featureEvents ?? true) && hasPermission("manage_scanner") },
        { to: "/admin/espacos", label: t("admin.sidebar.gestODeEspaOs", "Gestão de Espaços"), icon: "Building2", show: hasPermission("manage_events") },
        { to: "/admin/calendario", label: t("admin.sidebar.agenda", "Agenda"), icon: "Calendar", show: hasPermission("manage_events") },
        { to: "/admin/sessoes", label: "Bilheteria (PDV)", icon: "Ticket", show: hasPermission("manage_events") },
        { to: "/admin/certificates", label: t("admin.sidebar.certificados", "Certificados"), icon: "GraduationCap", show: (features?.featureCertificates ?? true) && hasPermission("manage_events") },
      ],
      showGroup: (features?.featureGroupEvents ?? true) && role !== 'theater'
    },
    {
      label: t("admin.sidebar.visitantesEngajamento", "Visitantes & Engajamento"),
      links: [
        { to: "/admin/visitantes", label: isCityMode ? "Cidadãos" : t("admin.sidebar.visitors"), icon: "Users", show: hasPermission("view_analytics") },
        { to: "/admin/reviews", label: t("admin.sidebar.reviews", "Moderação"), icon: "Star", show: ((features?.featureReviews || features?.featureGuestbook) ?? true) && hasPermission("manage_guestbook") },
        { to: "/admin/loja", label: t("admin.sidebar.shop", "Loja"), icon: "ShoppingCart", show: (features?.featureShop ?? true) && hasPermission("manage_shop") },
      ],
      showGroup: (features?.featureGroupEngagement ?? true) && role !== 'theater'
    },
    {
      label: t("admin.sidebar.gamificaO", "Gamificação"),
      links: [
        { to: "/admin/treasure-hunt", label: t("admin.sidebar.treasureHunt", "Caça ao Tesouro"), icon: "Compass", show: (features?.featureGamification ?? true) && hasPermission("manage_gamification") },
        { to: "/admin/conquistas", label: t("admin.sidebar.achievements", "Conquistas"), icon: "Trophy", show: (features?.featureGamification ?? true) && hasPermission("manage_gamification") },
        { to: "/admin/qrcodes", label: t("admin.sidebar.qrcodes"), icon: "QrCode", show: (features?.featureQRCodes ?? true) && hasPermission("manage_gamification") },
        { to: "/admin/cupons", label: t("admin.sidebar.cuponsERecompensas", "Cupons e Recompensas"), icon: "Ticket", show: (features?.featureGamification ?? true) && hasPermission("manage_gamification") },
        { to: "/admin/colecao", label: t("admin.sidebar.cardsColecionVeis", "Cards Colecionáveis"), icon: "Diamond", show: (features?.featureGamification ?? true) && hasPermission("manage_gamification") },
        { to: "/admin/battle", label: t("admin.sidebar.batalhaDeMuseus", "Batalha de Museus"), icon: "Sword", show: (features?.featureGamification ?? true) && hasPermission("manage_gamification") },
      ],
      showGroup: (features?.featureGroupGamification ?? true) && role !== 'theater'
    },
    {
      label: isCityMode ? t("admin.sidebar.gestOMunicipal", "Gestão Municipal") : t("admin.sidebar.gestOInstitucional", "Gestão Institucional"),
      links: [
        { to: "/admin/editais", label: t("admin.sidebar.editais", "Editais"), icon: "ClipboardList", show: (features?.featureEditais ?? false) && hasPermission("manage_institutional") },
        { to: "/admin/projetos", label: t("admin.sidebar.projetosCulturais", "Projetos Culturais"), icon: "Palette", show: (features?.featureProjects ?? false) && hasPermission("manage_institutional") },
        { to: "/admin/prestadores", label: t("admin.sidebar.prestadores", "Prestadores"), icon: "HardHat", show: (features?.featureProviders ?? false) && hasPermission("manage_institutional") },
        { to: "/admin/agendamentos/novo", label: t("admin.sidebar.solicitarServiOPresencial", "Solicitar Serviço Presencial"), icon: "Handshake", show: true },
        { to: "/admin/acessibilidade-gestao", label: t("admin.sidebar.gestOAcessibilidade", "Gestão Acessibilidade"), icon: "Accessibility", show: (features?.featureAccessibilityMgmt ?? false) && hasPermission("manage_institutional") },
        { to: "/admin/relatorios", label: t("admin.sidebar.relatRiosInstitucionais", "Relatórios Institucionais"), icon: "BarChart", show: (features?.featureInstitutionalReports ?? false) && hasPermission("manage_institutional") },
        { to: "/admin/equipamentos", label: t("admin.sidebar.equipamentosCulturais", "Equipamentos Culturais"), icon: "Building2", show: ((features?.type === "CITY" || features?.type === "SECRETARIA") ?? false) && hasPermission("manage_institutional") },
      ],
      showGroup: (features?.featureGroupInstitutional ?? true) && role !== 'theater'
    },
    {
      label: "Operações de Teatro",
      links: [
        { to: "/theater", label: "Dashboard Palco", icon: "Theater", show: hasPermission("manage_operations") },
        { to: "/theater/mobile", label: "Venda Rápida (Mobile)", icon: "Smartphone", show: hasPermission("manage_operations") },
        { to: "/admin/assentos", label: "Mapa de Assentos", icon: "Armchair", show: hasPermission("manage_operations") },
        { to: "/admin/elenco", label: "Elenco & Backstage", icon: "Users2", show: hasPermission("manage_operations") },
        { to: "/admin/playbill", label: "Programa Digital", icon: "BookOpen", show: hasPermission("manage_operations") },
        { to: "/admin/cue-master", label: "Console Backstage", icon: "Zap", show: hasPermission("manage_operations") },
        { to: "/admin/theater-club", label: "Clube de Membros", icon: "Diamond", show: hasPermission("manage_operations") },
      ],
      showGroup: (features?.type === "THEATER" || role === "theater") && hasPermission("manage_operations")
    },
    {
      label: t("admin.sidebar.ferramentasConfig", "Ferramentas & Config"),
      links: [
        { to: "/admin/ia", label: t("admin.sidebar.ai", "Assistente IA"), icon: "Bot", show: (features?.featureChatAI ?? true) && hasPermission("manage_chat_ai") },
        { to: "/admin/analytics", label: t("admin.sidebar.analytics", "Analytics"), icon: "BarChart", show: hasPermission("view_analytics") },
        { to: "/admin/scanner-treinamento", label: t("admin.sidebar.scanner", "Scanner IA"), icon: "Eye", show: (features?.featureQRCodes ?? true) && hasPermission("manage_chat_ai") },
        { to: "/admin/mapa-editor", label: t("admin.sidebar.mapaDePinos", "Mapa de Pinos"), icon: "MapPin", show: hasPermission("manage_works") },
        { to: "/admin/notificacoes", label: t("admin.sidebar.notificaEsPush", "Notificações Push"), icon: "Bell", show: hasPermission("manage_events") },
        { to: "/admin/financeiro", label: t("admin.sidebar.dashboardFinanceiro", "Dashboard Financeiro"), icon: "CircleDollarSign", show: hasPermission("view_analytics") },
        { to: "/admin/configuracoes/servicos", label: t("admin.sidebar.serviOsOferecidos", "Serviços Oferecidos"), icon: "Handshake", show: role === 'admin' || role === 'master' },
        { to: "/admin/configuracoes", label: t("admin.sidebar.settings"), icon: "Settings", show: role === 'admin' || role === 'master' },
        { to: "/admin/patrocinio", label: "Patrocínio", icon: "CircleDollarSign", show: role === 'admin' || role === 'master' },
        { to: "/admin/usuarios", label: "Equipe", icon: "Users", show: role === 'admin' || role === 'master' },
      ],
      showGroup: (features?.featureGroupTools ?? true) && (role === 'admin' || hasPermission("view_analytics") || hasPermission("manage_works") || hasPermission("manage_events") || hasPermission("manage_chat_ai"))
    },
    {
      label: t("admin.sidebar.analyticsAvanAdo", "Analytics Avançado"),
      links: [
        { to: "/admin/notas-curador", label: t("admin.sidebar.notasDoCurador", "Notas do Curador"), icon: "FileText", show: hasPermission("view_analytics") },
        { to: "/admin/nps", label: t("admin.sidebar.nPS", "NPS"), icon: "Target", show: hasPermission("view_analytics") },
        { to: "/admin/sentimento", label: t("admin.sidebar.sentimento", "Sentimento"), icon: "Smile", show: hasPermission("view_analytics") },
        { to: "/admin/heatmap", label: t("admin.sidebar.mapaDeCalor", "Mapa de Calor"), icon: "Flame", show: hasPermission("view_analytics") },
        { to: "/admin/funil", label: t("admin.sidebar.funilDeConversO", "Funil de Conversão"), icon: "Filter", show: hasPermission("view_analytics") },
        { to: "/admin/moderacao", label: t("admin.sidebar.moderaO", "Moderação"), icon: "ShieldCheck", show: hasPermission("manage_guestbook") },
      ],
      showGroup: (features?.featureGroupAnalytics ?? true) && role !== 'theater'
    },
    {
      label: t("admin.sidebar.educaOSocial", "Educação & Social"),
      links: [
        { to: "/admin/educacao", label: t("admin.sidebar.portalProfessores", "Portal Professores"), icon: "GraduationCap", show: hasPermission("manage_institutional") },
        { to: "/admin/ingressos-grupo", label: t("admin.sidebar.ingressosGrupo", "Ingressos Grupo"), icon: "Users", show: hasPermission("manage_events") },
        { to: "/admin/modo-crianca", label: t("admin.sidebar.modoCrianA", "Modo Criança"), icon: "Baby", show: hasPermission("manage_works") },
        { to: "/admin/assinaturas", label: t("admin.sidebar.amigoDoMuseu", "Amigo do Museu"), icon: "Diamond", show: hasPermission("manage_shop") },
      ],
      showGroup: (features?.featureGroupSocial ?? true) && role !== 'theater'
    },
    {
      label: t("admin.sidebar.municipalAvanAdo", "Gestão e Preservação"),
      links: [
        { to: "/admin/voluntarios", label: t("admin.sidebar.voluntRios", "Voluntários"), icon: "Users", show: hasPermission("manage_institutional") },
        { to: "/admin/conservacao", label: t("admin.sidebar.conservaO", "Conservação"), icon: "Wrench", show: hasPermission("manage_works") },
        { to: "/admin/metas-ppa", label: t("admin.sidebar.metasPPA", "Indicadores de Gestão"), icon: "Target", show: hasPermission("view_analytics") },
        { to: "/admin/patrimonio", label: t("admin.sidebar.patrimNioImaterial", "Patrimônio Imaterial"), icon: "Scroll", show: hasPermission("manage_works") },
        { to: "/admin/calendario-municipal", label: t("admin.sidebar.calendRioCultural", "Calendário Cultural"), icon: "CalendarDays", show: hasPermission("manage_events") },
        { to: "/admin/tce", label: t("admin.sidebar.exportaOTCE", "Relatórios Externos"), icon: "FileSearch", show: hasPermission("view_analytics") },
        { to: "/admin/vazios", label: t("admin.sidebar.vaziosCulturais", "Impacto Territorial"), icon: "MapIcon", show: hasPermission("view_analytics") },
      ],
      showGroup: (features?.featureGroupPreservation ?? true) && role !== 'theater'
    },
    {
      label: t("admin.sidebar.iAMarketing", "IA & Marketing"),
      links: [
        { to: "/admin/ia-descricoes", label: t("admin.sidebar.iADescriEs", "IA Descrições"), icon: "Wand2", show: hasPermission("manage_marketing") },
        { to: "/admin/instagram", label: t("admin.sidebar.cardInstagram", "Card Instagram"), icon: "Camera", show: hasPermission("manage_marketing") },
        { to: "/admin/traducoes", label: t("admin.sidebar.traduEs", "Traduções"), icon: "Globe", show: hasPermission("manage_marketing") },
      ],
      showGroup: (features?.featureGroupAI ?? true) && role !== 'theater'
    },
    {
      label: "Roadmap 2026",
      links: [
        { to: "/admin/comunidade", label: "Moderação Comunidade", icon: "MessageSquare", show: hasPermission("manage_roadmap") },
        { to: "/admin/quiz-builder", label: "Construtor de Quizzes", icon: "CheckCircle2", show: hasPermission("manage_roadmap") },
        { to: "/admin/timelines", label: "Linhas do Tempo", icon: "History", show: hasPermission("manage_roadmap") },
        { to: "/admin/submissoes", label: "Curadoria de Obras", icon: "Inbox", show: hasPermission("manage_roadmap") },
        { to: "/admin/familia", label: "Memória Familiar", icon: "TreePine", show: hasPermission("manage_roadmap") },
      ],
      showGroup: (features?.featureGroupRoadmap ?? true) && role !== 'theater'
    }
  ];

  // Filter groups based on Master Admin flags and child links
  const visibleGroups = sidebarGroups
    .filter(g => g.showGroup !== false) // Check if the entire group is disabled
    .map(g => ({ ...g, links: (g.links as SidebarLink[]).filter((l: SidebarLink) => l.show) }))
    .filter(g => g.links.length > 0);

  // Track which groups are expanded (auto-expand if child route active)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (label: string) => {
    setExpandedGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const isGroupOpen = (group: SidebarGroup) => {
    // Auto-expand if any child is active, otherwise check manual state
    const hasActiveChild = group.links.some(l => location.pathname === l.to);
    if (hasActiveChild) return true;
    return expandedGroups[group.label] ?? false;
  };

  return (
    <div className={`layout-wrapper ${isCityMode ? 'city-mode' : ''}`} style={themeStyles as React.CSSProperties}>
      {/* AMBIENT BACKGROUND - ADAPTIVE */}
      <div className="ambient-bg fixed inset-0 pointer-events-none">
        <div className={`ambient-orb w-[600px] h-[600px] bg-gold-400/5 top-[-10%] left-[-10%] blur-[120px]`} />
        <div className={`ambient-orb w-[500px] h-[500px] bg-accent-secondary/5 bottom-[-10%] right-[-10%] blur-[120px]`} />
      </div>

      {/* Mobile Overlay */}
      <div
        className={`mobile-overlay ${isSidebarOpen ? "open" : ""}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar - PREMIUM INSTITUTIONAL */}
      <aside className={`layout-sidebar bg-black/60 backdrop-blur-3xl border-r border-white/5 ${isSidebarOpen ? "open" : ""} ${isCollapsed ? "collapsed" : ""}`}>
        <button
          className="sidebar-collapse-toggle"
          onClick={() => setCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expandir" : "Recolher"}
          aria-label={isCollapsed ? "Expandir barra lateral" : "Recolher barra lateral"}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
        
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden border border-white/10 shadow-xl ${isCityMode ? 'bg-[var(--accent-primary)] shadow-blue-500/20' : 'bg-gradient-to-br from-gold-500 to-bronze-600 shadow-gold-500/20'}`}>
                <img 
                  src={features?.logoUrl || "/logo-culturaviva.jpg"} 
                  alt="" 
                  className="w-full h-full object-cover"
                />
             </div>
             {!isCollapsed && (
               <div className="flex flex-col min-w-0">
                  <span className="text-white font-black tracking-tight text-sm truncate uppercase">
                    {features?.name || (isCityMode ? "Secretaria" : "Gestão")}
                  </span>
                  <span className={`${isCityMode ? 'text-blue-400' : 'text-gold-400'} font-bold text-[9px] uppercase tracking-widest mt-0.5 truncate`}>
                    {isCityMode ? "Portal Municipal" : "Portal Administrativo"}
                  </span>
               </div>
             )}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar mt-2">
          {visibleGroups.map((group) => {
            const open = isGroupOpen(group);
            
            if (group.links.length === 1 && group.label === "Painel") {
              const link = group.links[0];
              const Icon = link.icon === "LayoutDashboard" ? LayoutDashboard : LayoutDashboard; // Fallback
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-4 p-4 rounded-2xl font-bold text-xs transition-all duration-300 group ${
                    location.pathname === link.to 
                    ? `bg-gold-400/10 text-gold-400 border border-gold-400/20 shadow-[0_0_20px_rgba(212,175,55,0.1)]` 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                  title={isCollapsed ? link.label : ""}
                >
                  <span className={`transition-transform duration-300 group-hover:scale-110 ${location.pathname === link.to ? "" : "opacity-50"}`}>
                    <Icon size={20} />
                  </span>
                  {!isCollapsed && <span className="uppercase tracking-widest">{link.label}</span>}
                </Link>
              );
            }

            return (
              <div key={group.label} className="space-y-1">
                {!isCollapsed && (
                  <button
                    className={`w-full flex items-center justify-between px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${open ? 'text-white' : 'text-slate-600 hover:text-slate-400'}`}
                    onClick={() => toggleGroup(group.label)}
                    aria-expanded={open}
                  >
                    <span>{group.label}</span>
                    <span className={`text-[8px] transition-transform duration-300 ${open ? 'rotate-180' : ''}`}>▼</span>
                  </button>
                )}
                
                {(open || isCollapsed) && (
                  <div className="space-y-1">
                    {group.links.map((link: SidebarLink) => {
                       // Map string icons to components
                       const IconMap: Record<string, any> = {
                         LayoutDashboard, Image, MapIcon, Tag, FolderOpen, Theater, QrCode, Ticket, Smartphone, Building2, Calendar, GraduationCap, Users, Star, ShoppingCart, Compass, Trophy, Sword, ClipboardList, Palette, HardHat, Handshake, Accessibility, BarChart, Armchair, Users2, BookOpen, Zap, Diamond, Bot, Eye, MapPin, Bell, CircleDollarSign, Settings, FileText, MessageSquare, CheckCircle2, Smile, Flame, Filter, ShieldCheck, Baby, Wrench, Target, Scroll, CalendarDays, FileSearch, Wand2, Camera, Globe, History, Inbox, TreePine
                       };
                       const Icon = IconMap[link.icon] || LayoutDashboard;

                       return (
                        <Link
                          key={link.to}
                          to={link.to}
                          className={`flex items-center gap-4 p-3 rounded-xl font-bold text-[11px] transition-all duration-300 group ${
                            location.pathname === link.to 
                            ? `bg-gold-400/10 text-gold-400 border border-gold-400/20` 
                            : "text-gray-500 hover:text-white hover:bg-white/5"
                          }`}
                          onClick={() => setSidebarOpen(false)}
                          title={isCollapsed ? link.label : ""}
                        >
                          <span className={`transition-transform duration-300 group-hover:scale-110 ${location.pathname === link.to ? "" : "opacity-50 grayscale"}`}>
                            <Icon size={18} />
                          </span>
                          {!isCollapsed && <span>{link.label}</span>}
                        </Link>
                       );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 bg-black/20 flex flex-col items-center">
          {!isCollapsed && (
            <div className="mb-4 flex justify-center w-full">
              <LanguageSwitcher style={{ position: "static" }} className="sidebar-lang-switcher" />
            </div>
          )}
          <button
            onClick={logout}
            className="w-full h-11 rounded-xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-all duration-300 flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest group"
            aria-label={t("admin.sidebar.logout")}
          >
            <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
            {!isCollapsed && <span>{t("admin.sidebar.logout")}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen relative overflow-y-auto">
        <header className="h-20 flex items-center px-8 border-b border-white/5 sticky top-0 bg-black/40 backdrop-blur-xl z-40">
          <button className="lg:hidden text-white mr-4 p-2 bg-white/5 rounded-xl border border-white/10" onClick={() => setSidebarOpen(true)}>
             <Menu size={24} />
          </button>
          
          <div className="ml-auto flex items-center gap-6">
             <div className="hidden sm:flex flex-col text-right">
                <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Autenticado como</span>
                <span className="text-white font-black text-xs">{userName || "Administrador"}</span>
             </div>
             <div className={`px-4 py-1.5 rounded-full border border-white/10 font-black text-[10px] uppercase tracking-widest ${isCityMode ? 'bg-[var(--accent-primary)]/10 text-blue-400' : 'bg-gold-500/10 text-gold-400'}`}>
                {isCityMode ? "Gestão Municipal" : "Gestor Cultural"}
             </div>
          </div>
        </header>

        <div className="p-8 lg:p-12 max-w-[1600px] mx-auto">
             {children}
        </div>
      </main>
    </div>
  );
};
