import React, { useState, useEffect } from "react";
import { logger } from "@/utils/logger";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "../../../components/LanguageSwitcher";
import { api } from "../../../api/client";
import { useTerminology } from "../../../hooks/useTerminology";
import {
  type LucideIcon,
  LayoutDashboard,
  Image,
  Map as MapIcon,
  Tag,
  FolderOpen,
  Theater,
  Ticket,
  Smartphone,
  Building2,
  Calendar,
  Users,
  Settings,
  Menu,
  ChevronLeft,
  ChevronRight,
  LogOut
} from "lucide-react";
import { isGoLiveAdminPath } from "@/config/golive";

interface TenantBrand {
  name?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

const IconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Image,
  MapIcon,
  Tag,
  FolderOpen,
  Theater,
  Ticket,
  Smartphone,
  Building2,
  Calendar,
  Users,
  Settings,
};

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout, name: userName, tenantId, role, hasPermission } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();
  const [isCollapsed, setCollapsed] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [brand, setBrand] = useState<TenantBrand | null>(null);
  const term = useTerminology();
  const isAdminManager = role === "equipment_admin" || role === "master";

  useEffect(() => {
    if (tenantId && role !== "master") {
      api.get(`/tenants/${tenantId}/settings`)
        .then(res => setBrand(res.data))
        .catch(err => logger.error("Error loading tenant features", err));
    }
  }, [tenantId, role]);

  const links = [
    { to: "/admin", label: t("admin.sidebar.dashboard"), icon: "LayoutDashboard", show: true },
    { to: "/admin/obras", label: term.works, icon: "Image", show: hasPermission("manage_works") },
    { to: "/admin/trilhas", label: term.trails, icon: "MapIcon", show: hasPermission("manage_trails") },
    { to: "/admin/categorias", label: t("admin.sidebar.categories"), icon: "Tag", show: hasPermission("manage_works") },
    { to: "/admin/uploads", label: t("admin.sidebar.uploads", "Arquivos"), icon: "FolderOpen", show: hasPermission("manage_works") },
    { to: "/admin/eventos", label: t("admin.sidebar.events"), icon: "Theater", show: hasPermission("manage_events") },
    { to: "/admin/verificar-ingressos", label: t("admin.sidebar.verificarIngressos", "Verificar Ingressos"), icon: "Ticket", show: hasPermission("manage_scanner") },
    { to: "/admin/scanner", label: t("admin.sidebar.scannerPortaria", "Scanner (Portaria)"), icon: "Smartphone", show: hasPermission("manage_scanner") },
    { to: "/admin/espacos", label: t("admin.sidebar.gestODeEspaOs", "Gestão de Espaços"), icon: "Building2", show: hasPermission("manage_events") },
    { to: "/admin/calendario", label: t("admin.sidebar.agenda", "Agenda"), icon: "Calendar", show: hasPermission("manage_events") },
    { to: "/admin/visitantes", label: t("admin.sidebar.visitors"), icon: "Users", show: hasPermission("view_analytics") },
    { to: "/admin/usuarios", label: t("admin.sidebar.team", "Equipe"), icon: "Users", show: isAdminManager },
    { to: "/admin/configuracoes", label: t("admin.sidebar.settings"), icon: "Settings", show: isAdminManager },
  ].filter((l) => l.show && isGoLiveAdminPath(l.to));

  return (
    <div className="layout-wrapper">
      <div className="ambient-bg fixed inset-0 pointer-events-none">
        <div className="ambient-orb w-[600px] h-[600px] bg-gold-400/5 top-[-10%] left-[-10%] blur-[120px]" />
      </div>
      <div className={`mobile-overlay ${isSidebarOpen ? "open" : ""}`} onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      <aside className={`layout-sidebar bg-black/60 backdrop-blur-3xl border-r border-white/5 ${isSidebarOpen ? "open" : ""} ${isCollapsed ? "collapsed" : ""}`}>
        <button className="sidebar-collapse-toggle" onClick={() => setCollapsed(!isCollapsed)} title={isCollapsed ? "Expandir" : "Recolher"} aria-label={isCollapsed ? "Expandir barra lateral" : "Recolher barra lateral"}>
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-gold-500 to-bronze-600">
              <img src={brand?.logoUrl || "/logo-culturaviva.jpg"} alt="" className="w-full h-full object-cover" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-white font-black tracking-tight text-sm truncate uppercase">{brand?.name || t("admin.sidebar.management", "Gestão")}</span>
                <span className="text-gold-400 font-bold text-[9px] uppercase tracking-widest mt-0.5">Portal Administrativo</span>
              </div>
            )}
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar mt-2">
          {links.map((link) => {
            const Icon = IconMap[link.icon] || LayoutDashboard;
            const active = location.pathname === link.to || (link.to !== "/admin" && location.pathname.startsWith(link.to + "/"));
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-4 p-3 rounded-xl font-bold text-[11px] transition-all ${active ? "bg-gold-400/10 text-gold-400 border border-gold-400/20" : "text-gray-500 hover:text-white hover:bg-white/5"}`}
                onClick={() => setSidebarOpen(false)}
                title={isCollapsed ? link.label : ""}
              >
                <Icon size={18} />
                {!isCollapsed && <span>{link.label}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/5 bg-black/20 flex flex-col items-center">
          {!isCollapsed && <div className="mb-4"><LanguageSwitcher style={{ position: "static" }} className="sidebar-lang-switcher" /></div>}
          <button onClick={logout} className="w-full h-11 rounded-xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/20 hover:text-red-400 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3" aria-label={t("admin.sidebar.logout")}>
            <LogOut size={16} />
            {!isCollapsed && <span>{t("admin.sidebar.logout")}</span>}
          </button>
        </div>
      </aside>
      <main className="flex-1 min-h-screen relative overflow-y-auto">
        <header className="h-20 flex items-center px-8 border-b border-white/5 sticky top-0 bg-black/40 backdrop-blur-xl z-40">
          <button className="lg:hidden text-white mr-4 p-2 bg-white/5 rounded-xl border border-white/10" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="ml-auto flex items-center gap-6">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{t("admin.header.authenticated_as", "Autenticado como")}</span>
              <span className="text-white font-black text-xs">{userName || t("admin.header.administrator", "Administrador")}</span>
            </div>
          </div>
        </header>
        <div className="p-8 lg:p-12 max-w-[1600px] mx-auto">{children}</div>
      </main>
    </div>
  );
};
