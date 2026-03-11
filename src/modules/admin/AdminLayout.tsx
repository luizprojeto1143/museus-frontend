import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { api } from "../../api/client";
import { useTerminology } from "../../hooks/useTerminology";
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
  // Hierarchy
  type: string;
  parentId: string | null;
}

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout, name: userName, tenantId } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();
  const [isCollapsed, setCollapsed] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [features, setFeatures] = useState<TenantFeatures | null>(null);

  // City Mode hooks
  const isCityMode = useIsCityMode();
  const term = useTerminology();

  useEffect(() => {
    if (tenantId) {
      api.get(`/tenants/${tenantId}`)
        .then(res => setFeatures(res.data))
        .catch(err => console.error("Error loading tenant features", err));
    }
  }, [tenantId]);

  const themeStyles = features ? {
    "--accent-primary": features.primaryColor || (isCityMode ? "#2563eb" : "#d4af37"),
    "--accent-secondary": features.secondaryColor || (isCityMode ? "#0ea5e9" : "#cd7f32"),
  } as React.CSSProperties : {};

  type SidebarLink = { to: string; label: string; icon: string; show: boolean };
  type SidebarGroup = { label: string; links: SidebarLink[] };

  const sidebarGroups: SidebarGroup[] = [
    {
      label: t("admin.sidebar.painel", "Painel"),
      links: [
        { to: "/admin", label: isCityMode ? "Secretaria de Cultura" : t("admin.sidebar.dashboard"), icon: "📊", show: true },
      ]
    },
    {
      label: t("admin.sidebar.conteDo", "Conteúdo"),
      links: [
        { to: "/admin/obras", label: term.works, icon: isCityMode ? "🏛️" : "🖼️", show: features?.featureWorks ?? true },
        { to: "/admin/trilhas", label: term.trails, icon: isCityMode ? "🗺️" : "🧭", show: features?.featureTrails ?? true },
        { to: "/admin/categorias", label: t("admin.sidebar.categories"), icon: "🏷️", show: true },
        { to: "/admin/uploads", label: t("admin.sidebar.uploads", "Arquivos"), icon: "📂", show: true },
      ]
    },
    {
      label: t("admin.sidebar.eventosEspaOs", "Eventos & Espaços"),
      links: [
        { to: "/admin/eventos", label: t("admin.sidebar.events"), icon: "🎭", show: features?.featureEvents ?? true },
        { to: "/admin/verificar-ingressos", label: t("admin.sidebar.verificarIngressos", "Verificar Ingressos"), icon: "🎫", show: features?.featureEvents ?? true },
        { to: "/admin/scanner", label: t("admin.sidebar.scannerPortaria", "Scanner (Portaria)"), icon: "📱", show: features?.featureEvents ?? true },
        { to: "/admin/espacos", label: t("admin.sidebar.gestODeEspaOs", "Gestão de Espaços"), icon: "🏢", show: true },
        { to: "/admin/calendario", label: t("admin.sidebar.agenda", "Agenda"), icon: "📅", show: true },
        { to: "/admin/certificates", label: t("admin.sidebar.certificados", "Certificados"), icon: "🎓", show: features?.featureCertificates ?? true },
      ]
    },
    {
      label: t("admin.sidebar.visitantesEngajamento", "Visitantes & Engajamento"),
      links: [
        { to: "/admin/visitantes", label: isCityMode ? "Cidadãos" : t("admin.sidebar.visitors"), icon: "👥", show: true },
        { to: "/admin/reviews", label: t("admin.sidebar.reviews", "Moderação"), icon: "⭐", show: (features?.featureReviews || features?.featureGuestbook) ?? true },
        { to: "/admin/loja", label: t("admin.sidebar.shop", "Loja"), icon: "🛒", show: features?.featureShop ?? true },
      ]
    },
    {
      label: t("admin.sidebar.gamificaO", "Gamificação"),
      links: [
        { to: "/admin/treasure-hunt", label: t("admin.sidebar.treasureHunt", "Caça ao Tesouro"), icon: "🏴‍☠️", show: features?.featureGamification ?? true },
        { to: "/admin/conquistas", label: t("admin.sidebar.achievements", "Conquistas"), icon: "🏅", show: features?.featureGamification ?? true },
        { to: "/admin/qrcodes", label: t("admin.sidebar.qrcodes"), icon: "📱", show: features?.featureQRCodes ?? true },
        { to: "/admin/cupons", label: t("admin.sidebar.cuponsERecompensas", "Cupons e Recompensas"), icon: "🎟️", show: features?.featureGamification ?? true },
        { to: "/admin/colecao", label: t("admin.sidebar.cardsColecionVeis", "Cards Colecionáveis"), icon: "✨", show: features?.featureGamification ?? true },
        { to: "/admin/battle", label: t("admin.sidebar.batalhaDeMuseus", "Batalha de Museus"), icon: "⚔️", show: features?.featureGamification ?? true },
      ]
    },
    {
      label: isCityMode ? t("admin.sidebar.gestOMunicipal", "Gestão Municipal") : t("admin.sidebar.gestOInstitucional", "Gestão Institucional"),
      links: [
        { to: "/admin/editais", label: t("admin.sidebar.editais", "Editais"), icon: "📋", show: features?.featureEditais ?? false },
        { to: "/admin/projetos", label: t("admin.sidebar.projetosCulturais", "Projetos Culturais"), icon: "🎨", show: features?.featureProjects ?? false },
        { to: "/admin/prestadores", label: t("admin.sidebar.prestadores", "Prestadores"), icon: "👷", show: features?.featureProviders ?? false },
        { to: "/admin/agendamentos/novo", label: t("admin.sidebar.solicitarServiOPresencial", "Solicitar Serviço Presencial"), icon: "🤝", show: true },
        { to: "/admin/acessibilidade-gestao", label: t("admin.sidebar.gestOAcessibilidade", "Gestão Acessibilidade"), icon: "♿", show: features?.featureAccessibilityMgmt ?? false },
        { to: "/admin/relatorios", label: t("admin.sidebar.relatRiosInstitucionais", "Relatórios Institucionais"), icon: "📊", show: features?.featureInstitutionalReports ?? false },
        { to: "/admin/equipamentos", label: t("admin.sidebar.equipamentosCulturais", "Equipamentos Culturais"), icon: "🏛️", show: (features?.type === "CITY" || features?.type === "SECRETARIA") ?? false },
      ]
    },
    {
      label: t("admin.sidebar.ferramentasConfig", "Ferramentas & Config"),
      links: [
        { to: "/admin/ia", label: t("admin.sidebar.ai", "Assistente IA"), icon: "🤖", show: features?.featureChatAI ?? true },
        { to: "/admin/analytics", label: t("admin.sidebar.analytics", "Analytics"), icon: "📈", show: true },
        { to: "/admin/scanner-treinamento", label: t("admin.sidebar.scanner", "Scanner IA"), icon: "👁️", show: features?.featureQRCodes ?? true },
        { to: "/admin/mapa-editor", label: t("admin.sidebar.mapaDePinos", "Mapa de Pinos"), icon: "📍", show: true },
        { to: "/admin/notificacoes", label: t("admin.sidebar.notificaEsPush", "Notificações Push"), icon: "🔔", show: true },
        { to: "/admin/financeiro", label: t("admin.sidebar.dashboardFinanceiro", "Dashboard Financeiro"), icon: "💰", show: true },
        { to: "/admin/configuracoes/servicos", label: t("admin.sidebar.serviOsOferecidos", "Serviços Oferecidos"), icon: "🤝", show: true },
        { to: "/admin/configuracoes", label: t("admin.sidebar.settings"), icon: "⚙️", show: true },
      ]
    },
    {
      label: t("admin.sidebar.analyticsAvanAdo", "Analytics Avançado"),
      links: [
        { to: "/admin/notas-curador", label: t("admin.sidebar.notasDoCurador", "Notas do Curador"), icon: "📝", show: true },
        { to: "/admin/nps", label: t("admin.sidebar.nPS", "NPS"), icon: "💯", show: true },
        { to: "/admin/sentimento", label: t("admin.sidebar.sentimento", "Sentimento"), icon: "😊", show: true },
        { to: "/admin/heatmap", label: t("admin.sidebar.mapaDeCalor", "Mapa de Calor"), icon: "🔥", show: true },
        { to: "/admin/funil", label: t("admin.sidebar.funilDeConversO", "Funil de Conversão"), icon: "📉", show: true },
        { to: "/admin/moderacao", label: t("admin.sidebar.moderaO", "Moderação"), icon: "🛡️", show: true },
      ]
    },
    {
      label: t("admin.sidebar.educaOSocial", "Educação & Social"),
      links: [
        { to: "/admin/educacao", label: t("admin.sidebar.portalProfessores", "Portal Professores"), icon: "🎓", show: true },
        { to: "/admin/ingressos-grupo", label: t("admin.sidebar.ingressosGrupo", "Ingressos Grupo"), icon: "👥", show: true },
        { to: "/admin/modo-crianca", label: t("admin.sidebar.modoCrianA", "Modo Criança"), icon: "👶", show: true },
        { to: "/admin/assinaturas", label: t("admin.sidebar.amigoDoMuseu", "Amigo do Museu"), icon: "💎", show: true },
        { to: "/admin/patrocinios", label: t("admin.sidebar.patrocNios", "Patrocínios"), icon: "🤝", show: true },
      ]
    },
    {
      label: t("admin.sidebar.municipalAvanAdo", "Municipal Avançado"),
      links: [
        { to: "/admin/voluntarios", label: t("admin.sidebar.voluntRios", "Voluntários"), icon: "🙋", show: true },
        { to: "/admin/conservacao", label: t("admin.sidebar.conservaO", "Conservação"), icon: "🔧", show: true },
        { to: "/admin/metas-ppa", label: t("admin.sidebar.metasPPA", "Metas PPA"), icon: "🎯", show: true },
        { to: "/admin/patrimonio", label: t("admin.sidebar.patrimNioImaterial", "Patrimônio Imaterial"), icon: "📜", show: true },
        { to: "/admin/calendario-municipal", label: t("admin.sidebar.calendRioCultural", "Calendário Cultural"), icon: "🗓️", show: true },
        { to: "/admin/tce", label: t("admin.sidebar.exportaOTCE", "Exportação TCE"), icon: "📄", show: true },
        { to: "/admin/vazios", label: t("admin.sidebar.vaziosCulturais", "Vazios Culturais"), icon: "🗺️", show: true },
      ]
    },
    {
      label: t("admin.sidebar.iAMarketing", "IA & Marketing"),
      links: [
        { to: "/admin/ia-descricoes", label: t("admin.sidebar.iADescriEs", "IA Descrições"), icon: "🪄", show: true },
        { to: "/admin/instagram", label: t("admin.sidebar.cardInstagram", "Card Instagram"), icon: "📸", show: true },
        { to: "/admin/traducoes", label: t("admin.sidebar.traduEs", "Traduções"), icon: "🌍", show: true },
      ]
    },
    {
      label: "Roadmap 2026",
      links: [
        { to: "/admin/comunidade", label: "Moderação Comunidade", icon: "💬", show: true },
        { to: "/admin/quiz-builder", label: "Construtor de Quizzes", icon: "❓", show: true },
        { to: "/admin/timelines", label: "Linhas do Tempo", icon: "🕒", show: true },
        { to: "/admin/submissoes", label: "Curadoria de Obras", icon: "📥", show: true },
        { to: "/admin/familia", label: "Memória Familiar", icon: "🌳", show: true },
      ]
    }
  ];

  // Filter groups to only show groups with at least one visible link
  const visibleGroups = sidebarGroups
    .map(g => ({ ...g, links: g.links.filter(l => l.show) }))
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
    <div className={`layout-wrapper ${isCityMode ? 'city-mode' : ''}`} style={themeStyles}>
      {/* AMBIENT BACKGROUND - ADAPTIVE */}
      <div className="ambient-bg">
        <div className={`ambient-orb w-[600px] h-[600px] ${isCityMode ? 'bg-blue-600/10' : 'bg-gold-500/10'} top-[-5%] left-[-5%]`} />
        <div className={`ambient-orb w-[500px] h-[500px] ${isCityMode ? 'bg-indigo-600/10' : 'bg-bronze-500/10'} bottom-[-5%] right-[-5%]`} />
      </div>

      {/* Mobile Overlay */}
      <div
        className={`mobile-overlay ${isSidebarOpen ? "open" : ""}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar - PREMIUM INSTITUTIONAL */}
      <aside className={`layout-sidebar premium-glass ${isSidebarOpen ? "open" : ""} ${isCollapsed ? "collapsed" : ""}`}>
        <button
          className="sidebar-collapse-toggle bg-white/5 border-white/10 hover:bg-white/10 transition-colors"
          onClick={() => setCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expandir" : "Recolher"}
          aria-label={isCollapsed ? "Expandir barra lateral" : "Recolher barra lateral"}
        >
          {isCollapsed ? "»" : "«"}
        </button>
        
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden border border-white/10 shadow-xl ${isCityMode ? 'bg-blue-600 shadow-blue-500/20' : 'bg-gradient-to-br from-gold-500 to-bronze-600 shadow-gold-500/20'}`}>
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
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-4 p-4 rounded-2xl font-bold text-xs transition-all duration-300 group ${
                    location.pathname === link.to 
                    ? `bg-white/10 text-white border border-white/10 shadow-lg` 
                    : "text-slate-500 hover:text-white hover:bg-white/5"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                  title={isCollapsed ? link.label : ""}
                >
                  <span className={`text-lg transition-transform duration-300 group-hover:scale-110 ${location.pathname === link.to ? "" : "opacity-50"}`}>
                    {link.icon}
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
                    {group.links.map(link => (
                      <Link
                        key={link.to}
                        to={link.to}
                        className={`flex items-center gap-4 p-3 rounded-xl font-bold text-[11px] transition-all duration-300 group ${
                          location.pathname === link.to 
                          ? `bg-white/10 text-white border border-white/10` 
                          : "text-slate-500 hover:text-white hover:bg-white/5"
                        }`}
                        onClick={() => setSidebarOpen(false)}
                        title={isCollapsed ? link.label : ""}
                      >
                        <span className={`text-base transition-transform duration-300 group-hover:scale-110 ${location.pathname === link.to ? "" : "opacity-50 grayscale"}`}>
                          {link.icon}
                        </span>
                        {!isCollapsed && <span>{link.label}</span>}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 bg-black/20">
          <div className="mb-4 flex justify-center">
            <LanguageSwitcher style={{ position: "static" }} className="sidebar-lang-switcher" />
          </div>
          <button
            onClick={logout}
            className="w-full h-11 rounded-xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-all duration-300 flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest group"
            aria-label={t("admin.sidebar.logout")}
          >
            <span className="text-base group-hover:rotate-12 transition-transform">🚪</span>
            {!isCollapsed && <span>{t("admin.sidebar.logout")}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen relative overflow-y-auto">
        <header className="h-20 flex items-center px-8 border-b border-white/5 sticky top-0 bg-black/40 backdrop-blur-xl z-40">
          <button className="lg:hidden text-white mr-4 p-2 bg-white/5 rounded-xl border border-white/10" onClick={() => setSidebarOpen(true)}>
             <span className="text-xl">☰</span>
          </button>
          
          <div className="ml-auto flex items-center gap-6">
             <div className="hidden sm:flex flex-col text-right">
                <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Autenticado como</span>
                <span className="text-white font-black text-xs">{userName || "Administrador"}</span>
             </div>
             <div className={`px-4 py-1.5 rounded-full border border-white/10 font-black text-[10px] uppercase tracking-widest ${isCityMode ? 'bg-blue-500/10 text-blue-400' : 'bg-gold-500/10 text-gold-400'}`}>
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
