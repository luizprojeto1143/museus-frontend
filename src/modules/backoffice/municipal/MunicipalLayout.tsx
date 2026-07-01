import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import {
    LayoutDashboard,
    Building2,
    FileText,
    BarChart3,
    ShieldCheck,
    Settings,
    LogOut,
    Menu,
    ExternalLink,
    ChevronRight,
    Search,
    TrendingUp,
    Zap,
    X,
    Bell,
    Globe,
    Map,
    Landmark
} from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";

export const MunicipalLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { t } = useTranslation();
    const { logout, name } = useAuth();
    const location = useLocation();
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const links = [
        { to: "/municipal", label: t("municipal.layout.link_dashboard", "Dashboard Executivo"), icon: <LayoutDashboard size={18} /> },
        { to: "/municipal/vazios-culturais", label: t("municipal.layout.link_gaps", "Vazios Culturais"), icon: <Map size={18} /> },
        { to: "/municipal/patrimonio", label: t("municipal.layout.link_heritage", "Patrimônio Cultural"), icon: <Landmark size={18} /> },
        { to: "/municipal/equipments", label: t("municipal.layout.link_equipments", "Equipamentos Culturais"), icon: <Building2 size={18} /> },
        { to: "/municipal/projects", label: t("municipal.layout.link_projects", "Gestão de Projetos"), icon: <FileText size={18} /> },
        { to: "/municipal/reports", label: t("municipal.layout.link_reports", "Relatórios de Impacto"), icon: <BarChart3 size={18} /> },
        { to: "/municipal/ppa", label: t("municipal.layout.link_ppa", "Metas PPA"), icon: <TrendingUp size={18} /> },
        { to: "/municipal/settings", label: t("municipal.layout.link_settings", "Configurações da Cidade"), icon: <Settings size={18} /> },
    ];

    return (
        <div className="flex min-h-screen bg-[#020617] text-slate-200 w-full font-sans selection:bg-emerald-500/30">
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 z-[900] backdrop-blur-md md:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 left-0 bottom-0 w-[280px] bg-[#0f172a] border-r border-white/5 
                    flex flex-col z-[1000] transition-all duration-500 ease-in-out
                    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
                `}
            >
                <div className="p-8 border-b border-white/5 flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-[0_0_30px_rgba(16,185,129,0.2)] shrink-0 border border-emerald-400/20">
                            M
                        </div>
                        <div className="min-w-0">
                            <div className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.2em] leading-none mb-1">
                                {t("municipal.layout.secretariat", "Secretaria")}
                            </div>
                            <div className="text-sm text-white font-bold truncate">
                                {t("municipal.layout.municipal_portal", "Portal Municipal")}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">{t("municipal.layout.active_jurisdiction", "Jurisdição Ativa")}</span>
                    </div>
                </div>

                <nav className="flex-1 p-6 flex flex-col gap-1.5 overflow-y-auto custom-scrollbar">
                    <div className="px-4 mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                        {t("municipal.layout.government_management", "Gestão Governamental")}
                    </div>
                    {links.map(link => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`
                                flex items-center px-5 py-4 rounded-2xl transition-all duration-300 group relative
                                ${location.pathname === link.to 
                                    ? "bg-emerald-600/10 text-white font-bold" 
                                    : "text-slate-500 hover:bg-white/5 hover:text-slate-200"}
                            `}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span className={`mr-4 transition-transform duration-300 ${location.pathname === link.to ? "text-emerald-400 scale-110" : "group-hover:scale-110"}`}>
                                {link.icon}
                            </span>
                            <span className="text-sm tracking-tight">{link.label}</span>
                            
                            {location.pathname === link.to && (
                                <motion.div 
                                    layoutId="activeTabSec"
                                    className="absolute left-0 w-1 h-6 bg-emerald-500 rounded-full"
                                />
                            )}
                            
                            <ChevronRight size={14} className={`ml-auto opacity-0 group-hover:opacity-100 transition-all ${location.pathname === link.to ? 'opacity-100' : ''}`} />
                        </Link>
                    ))}
                </nav>

                <div className="p-6 border-t border-white/5 space-y-4">
                    <div className="flex items-center gap-3 px-4 py-2">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-[10px] font-black text-slate-400">
                            {name?.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold text-white truncate">{name}</p>
                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-600">{t("municipal.layout.secretary_role", "Secretário(a)")}</p>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="flex items-center justify-center w-full px-5 py-4 text-slate-400 bg-white/5 border border-white/5 rounded-2xl hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all duration-300 gap-3 font-black text-[10px] uppercase tracking-widest"
                    >
                        <LogOut size={16} /> {t("municipal.layout.logout", "Encerrar Sessão")}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-[280px] min-h-screen flex flex-col w-full transition-all duration-300">
                <header className="h-20 px-6 md:px-12 flex items-center justify-between bg-[#020617]/80 backdrop-blur-2xl border-b border-white/5 sticky top-0 z-[800]">
                    <div className="flex items-center gap-6">
                        <button className="md:hidden w-10 h-10 flex items-center justify-center text-emerald-400 bg-emerald-400/10 rounded-xl" onClick={() => setSidebarOpen(true)}>
                            <Menu size={20} />
                        </button>
                        
                        <div className="hidden lg:flex items-center gap-4 bg-white/5 px-6 py-2.5 rounded-2xl border border-white/5 w-96 group focus-within:border-emerald-500/30 transition-all">
                            <Search size={18} className="text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                            <input
                                type="text"
                                placeholder={t("municipal.layout.search_placeholder", "Buscar processos ou leis...")}
                                className="bg-transparent border-none text-sm text-white focus:outline-none w-full placeholder:text-slate-600 font-medium"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                         <div className="hidden sm:flex flex-col items-end">
                             <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none mb-1">{t("municipal.layout.management_status", "Status de Gestão")}</span>
                             <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                                 <Globe size={12} />
                                 {t("municipal.layout.compliance_lbi", "Em conformidade (LBI)")}
                             </span>
                         </div>
                         <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center relative hover:bg-white/10 transition-colors cursor-pointer group">
                             <Bell size={20} className="text-slate-400 group-hover:text-emerald-400 transition-colors" />
                             <div className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-[#020617]" />
                         </div>
                    </div>
                </header>

                <div className="flex-1 p-6 md:p-12 w-full max-w-[1600px] mx-auto overflow-x-hidden">
                    {children}
                </div>

                <footer className="p-12 text-center">
                    <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em]">
                        {t("municipal.layout.footer", "© 2024 Plataforma Cultura Viva • Monitoramento de Impacto Municipal")}
                    </p>
                </footer>
            </main>
        </div>
    );
};
