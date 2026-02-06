import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { api } from "../../api/client";

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
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [features, setFeatures] = useState<TenantFeatures | null>(null);

  useEffect(() => {
    if (tenantId) {
      api.get(`/tenants/${tenantId}`)
        .then(res => setFeatures(res.data))
        .catch(err => console.error("Error loading tenant features", err));
    }
  }, [tenantId]);

  const allLinks = [
    { to: "/admin", label: t("admin.sidebar.dashboard"), icon: "📊", show: true },
    { to: "/admin/obras", label: t("admin.sidebar.artworks"), icon: "🖼️", show: features?.featureWorks ?? true },
    { to: "/admin/trilhas", label: t("admin.sidebar.trails"), icon: "🧭", show: features?.featureTrails ?? true },
    { to: "/admin/eventos", label: t("admin.sidebar.events"), icon: "🎭", show: features?.featureEvents ?? true },
    { to: "/admin/verificar-ingressos", label: "Verificar Ingressos", icon: "🎫", show: features?.featureEvents ?? true },
    { to: "/admin/certificates", label: "Certificados", icon: "🎓", show: features?.featureCertificates ?? true },
    { to: "/admin/qrcodes", label: t("admin.sidebar.qrcodes"), icon: "📱", show: features?.featureQRCodes ?? true },
    { to: "/admin/categorias", label: t("admin.sidebar.categories"), icon: "🏷️", show: true },
    { to: "/admin/visitantes", label: t("admin.sidebar.visitors"), icon: "👥", show: true },
    { to: "/admin/reviews", label: t("admin.sidebar.reviews", "Moderação"), icon: "⭐", show: (features?.featureReviews || features?.featureGuestbook) ?? true },
    { to: "/admin/treasure-hunt", label: t("admin.sidebar.treasureHunt", "Caça ao Tesouro"), icon: "🏴‍☠️", show: features?.featureGamification ?? true },
    { to: "/admin/conquistas", label: t("admin.sidebar.achievements", "Conquistas"), icon: "🏅", show: features?.featureGamification ?? true },
    { to: "/admin/loja", label: t("admin.sidebar.shop", "Loja"), icon: "🛒", show: features?.featureShop ?? true },
    { to: "/admin/ia", label: t("admin.sidebar.ai", "Assistente IA"), icon: "🤖", show: features?.featureChatAI ?? true },
    { to: "/admin/analytics", label: t("admin.sidebar.analytics", "Analytics"), icon: "📈", show: true },
    { to: "/admin/uploads", label: t("admin.sidebar.uploads", "Arquivos"), icon: "📂", show: true },
    { to: "/admin/usuarios", label: t("admin.sidebar.users", "Usuários"), icon: "👤", show: true },
    { to: "/admin/scanner-treinamento", label: t("admin.sidebar.scanner", "Scanner IA"), icon: "👁️", show: features?.featureQRCodes ?? true },
    { to: "/admin/mapa-editor", label: "Mapa de Pinos", icon: "📍", show: true },
    // Municipal Management
    { to: "/admin/editais", label: "Editais", icon: "📋", show: features?.featureEditais ?? false },
    { to: "/admin/projetos", label: "Projetos Culturais", icon: "🎨", show: features?.featureProjects ?? false },
    { to: "/admin/prestadores", label: "Prestadores", icon: "👷", show: features?.featureProviders ?? false },
    { to: "/admin/acessibilidade-gestao", label: "Gestão Acessibilidade", icon: "♿", show: features?.featureAccessibilityMgmt ?? false },
    { to: "/admin/relatorios", label: "Relatórios Institucionais", icon: "📊", show: features?.featureInstitutionalReports ?? false },
    // Children management (for CITY/SECRETARIA types)
    { to: "/admin/equipamentos", label: "Equipamentos Culturais", icon: "🏛️", show: (features?.type === "CITY" || features?.type === "SECRETARIA") ?? false },
    { to: "/admin/configuracoes", label: t("admin.sidebar.settings"), icon: "⚙️", show: true }
  ];

  const links = allLinks.filter(l => l.show);

  return (
    <div className="layout-wrapper">
      {/* Mobile Overlay */}
      <div
        className={`mobile-overlay ${isSidebarOpen ? "open" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`layout-sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="app-brand">
            <img src="/logo-culturaviva.jpg" alt="Logo" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", marginRight: "0.5rem" }} />
            <div>
              <div className="app-title">{t("dashboard.title")}</div>
              <div className="app-subtitle">{t("admin.museums.title")}</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-content">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-item ${location.pathname === link.to ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span style={{ fontSize: "1.2rem" }}>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "center" }}>
            <LanguageSwitcher style={{ position: "static" }} />
          </div>
          <button
            onClick={logout}
            className="btn btn-secondary"
            style={{ width: "100%", justifyContent: "center", borderColor: "#ef4444", color: "#ef4444" }}
          >
            {t("admin.sidebar.logout")}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="layout-main">
        <header className="layout-header">
          <button className="menu-toggle" onClick={() => setSidebarOpen(true)}>
            ☰
          </button>
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
