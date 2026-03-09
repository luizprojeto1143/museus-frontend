import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { api } from "../../api/client";
import { useTerminology } from "../../hooks/useTerminology";
import { useIsCityMode } from "../auth/TenantContext";

interface TenantFeatures {
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
  const { logout, name, tenantId } = useAuth();
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
    <div className={`layout-wrapper ${isCityMode ? 'city-mode' : ''}`}>
      {/* Mobile Overlay */}
      <div
        className={`mobile-overlay ${isSidebarOpen ? "open" : ""}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside className={`layout-sidebar ${isSidebarOpen ? "open" : ""} ${isCollapsed ? "collapsed" : ""}`}>
        <button
          className="sidebar-collapse-toggle"
          onClick={() => setCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expandir" : "Recolher"}
          aria-label={isCollapsed ? "Expandir barra lateral" : "Recolher barra lateral"}
        >
          {isCollapsed ? "»" : "«"}
        </button>
        <div className="sidebar-header">
          <div className="app-brand">
            <img src="/logo-culturaviva.jpg" alt="Logo" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", marginRight: "0.5rem" }} />
            <div>
              <div className="app-title">{isCityMode ? "Secretaria de Cultura" : t("dashboard.title")}</div>
              <div className="app-subtitle">{isCityMode ? "Gestão Municipal" : t("admin.museums.title")}</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-content">
          {visibleGroups.map((group) => {
            const open = isGroupOpen(group);
            // Single-item groups (like "Painel") render without collapsible header
            if (group.links.length === 1 && group.label === "Painel") {
              const link = group.links[0];
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`nav-item ${location.pathname === link.to ? "active" : ""}`}
                  onClick={() => setSidebarOpen(false)}
                  title={isCollapsed ? link.label : ""}
                >
                  <span style={{ fontSize: "1.2rem" }}>{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              );
            }
            return (
              <div key={group.label} className="sidebar-group">
                <button
                  className={`sidebar-group-header ${open ? "open" : ""}`}
                  onClick={() => toggleGroup(group.label)}
                  aria-expanded={open}
                >
                  <span>{group.label}</span>
                  <span className="sidebar-group-chevron">{open ? "▾" : "▸"}</span>
                </button>
                {open && (
                  <div className="sidebar-group-items">
                    {group.links.map(link => (
                      <Link
                        key={link.to}
                        to={link.to}
                        className={`nav-item ${location.pathname === link.to ? "active" : ""}`}
                        onClick={() => setSidebarOpen(false)}
                        title={isCollapsed ? link.label : ""}
                      >
                        <span style={{ fontSize: "1.2rem" }}>{link.icon}</span>
                        <span>{link.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "center" }}>
            <LanguageSwitcher style={{ position: "static" }} className="sidebar-lang-switcher" />
          </div>
          <button
            onClick={logout}
            className="btn btn-secondary"
            style={{ width: "100%", justifyContent: "center", borderColor: "#ef4444", color: "#ef4444" }}
            aria-label={t("admin.sidebar.logout")}
          >
            <span style={{ fontSize: "1.2rem" }}>🚪</span>
            <span>{t("admin.sidebar.logout")}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="layout-main">
        <header className="layout-header">
          <button className="menu-toggle" onClick={() =>{t("admin.layout.setsidebaropentrueArialabelabr", "setSidebarOpen(true)} aria-label={t("admin.layout.abrirMenuDeNavegao", "Abrir menu de navegação")}>
            ☰")}</button>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "1rem" }}>
            <span className="welcome-text" style={{ fontSize: "0.9rem", color: "var(--fg-muted)" }}>
              {t("welcome.returning", { name: name || "Admin" })}
            </span>
            <span className="badge">ADMIN</span>
          </div>
        </header>

        <div className="layout-content">
          <div className="layout-content-inner">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
