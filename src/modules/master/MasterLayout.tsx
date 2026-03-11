import { useTranslation } from "react-i18next";
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export const MasterLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const location = useLocation();
  const [isCollapsed, setCollapsed] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const links = [
    { to: "/master", label: t("master.sidebar.dashboard", "Dashboard"), icon: "📊" },
    { to: "/master/messages", label: t("master.sidebar.caixaDeEntrada", "Caixa de Entrada"), icon: "📨" }, // NEW
    { to: "/master/tenants", label: t("master.sidebar.museusTenants", "Museus / Tenants"), icon: "🏛️" },
    { to: "/master/users", label: t("master.sidebar.usuRios", "Usuários"), icon: "👥" },
    { to: "/master/providers", label: t("master.sidebar.prestadores", "Prestadores"), icon: "🛠️" }, // NEW
    { to: "/master/servicos-presenciais", label: t("master.sidebar.serviOsPresenciais", "Serviços Presenciais"), icon: "🤝" },
    { to: "/master/seeder", label: t("master.sidebar.trafficGen", "Traffic Gen"), icon: "🚦" }, // Assuming 'Users' was a placeholder and 'path' was meant for 'to'
    { to: "/master/achievements", label: t("master.sidebar.conquistas", "Conquistas"), icon: "🏆" },
    { to: "/master/audit-logs", label: t("master.sidebar.logsDeAuditoria", "Logs de Auditoria"), icon: "📋" },
    { to: "/master/accessibility-requests", label: t("master.sidebar.acessibilidade", "Acessibilidade"), icon: "♿" },
    { to: "/master/system-health", label: t("master.sidebar.saDeDoSistema", "Saúde do Sistema"), icon: "🖥️" }
  ];

  return (
    <div className="layout-wrapper">
      {/* AMBIENT BACKGROUND */}
      <div className="ambient-bg">
        <div className="ambient-orb w-[600px] h-[600px] bg-blue-500/10 top-[-10%] left-[-10%]" />
        <div className="ambient-orb w-[500px] h-[500px] bg-purple-500/10 bottom-[-10%] right-[-10%]" />
      </div>

      {/* Mobile Overlay */}
      <div
        className={`mobile-overlay ${isSidebarOpen ? "open" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar - PREMIUM REDESIGN */}
      <aside className={`layout-sidebar premium-glass ${isSidebarOpen ? "open" : ""} ${isCollapsed ? "collapsed" : ""}`}>
        <button
          className="sidebar-collapse-toggle bg-white/5 border-white/10 hover:bg-white/10 transition-colors"
          onClick={() => setCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expandir" : "Recolher"}
        >
          {isCollapsed ? "»" : "«"}
        </button>

        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-black text-white shadow-xl shadow-blue-500/20">
                MT
             </div>
             {!isCollapsed && (
               <div className="flex flex-col">
                  <span className="text-white font-black tracking-tight text-lg leading-none">MASTER</span>
                  <span className="text-blue-400 font-bold text-[10px] uppercase tracking-widest mt-1">Global Hub</span>
               </div>
             )}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1 mt-4">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-4 p-4 rounded-2xl font-bold text-sm transition-all duration-300 group ${
                location.pathname === link.to 
                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/5" 
                : "text-slate-500 hover:text-white hover:bg-white/5"
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className={`text-xl transition-transform duration-300 group-hover:scale-125 ${location.pathname === link.to ? "" : "opacity-50"}`}>
                {link.icon}
              </span>
              {!isCollapsed && <span>{link.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 bg-black/20">
          <button
            onClick={logout}
            className="w-full h-12 rounded-2xl bg-white/5 border border-white/5 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all duration-300 flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest group"
          >
            <span className="text-lg group-hover:rotate-12 transition-transform">🚪</span>
            {!isCollapsed && <span>{t("master.layout.logout", "Sair")}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen relative overflow-y-auto">
        <header className="h-20 flex items-center px-8 border-b border-white/5 sticky top-0 bg-black/40 backdrop-blur-xl z-40">
          <button className="lg:hidden text-white mr-4 p-2" onClick={() => setSidebarOpen(true)}>
             <span className="text-2xl">☰</span>
          </button>
          
          <div className="ml-auto flex items-center gap-6">
             <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-full">
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none">Master Hub</span>
             </div>
             <div className="w-10 h-10 rounded-full border border-white/10 bg-slate-900 flex items-center justify-center overflow-hidden">
                <div className="w-full h-full bg-gradient-to-tr from-slate-800 to-slate-700" title="Profile" />
             </div>
          </div>
        </header>

        <div className="p-8 lg:p-12 max-w-7xl mx-auto">
             {children}
        </div>
      </main>
    </div>
  );
};
