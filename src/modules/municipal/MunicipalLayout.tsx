import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
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
    TrendingUp
} from "lucide-react";

export const MunicipalLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { t } = useTranslation();
    const { logout, name } = useAuth();
    const location = useLocation();
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const links = [
        { to: "/municipal", label: "Dashboard Executivo", icon: <LayoutDashboard size={20} /> },
        { to: "/municipal/equipments", label: "Equipamentos Culturais", icon: <Building2 size={20} /> },
        { to: "/municipal/projects", label: "Gestão de Projetos", icon: <FileText size={20} /> },
        { to: "/municipal/reports", label: "Relatórios de Impacto", icon: <BarChart3 size={20} /> },
        { to: "/municipal/compliance", label: "Conformidade Legal", icon: <ShieldCheck size={20} /> },
        { to: "/municipal/ppa", label: "Metas PPA", icon: <TrendingUp size={20} /> },
        { to: "/municipal/settings", label: "Configurações da Cidade", icon: <Settings size={20} /> },
    ];

    return (
        <div className="municipal-theme flex min-h-screen bg-[var(--bg-page)] text-[var(--fg-main)] w-full font-sans">
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 bg-[var(--bg-overlay)] z-[900] transition-opacity duration-300 backdrop-blur-sm ${isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}`}
                onClick={() => setSidebarOpen(false)}
                aria-label="Fechar menu"
                aria-hidden={!isSidebarOpen}
            />

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 left-0 bottom-0 w-[280px] bg-[var(--bg-sidebar)] text-slate-300
                    flex flex-col z-[1000] transition-transform duration-300 shadow-2xl
                    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
                `}
            >
                <div className="p-8 border-b border-slate-800 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[var(--accent-primary)] text-[var(--fg-inverse)] rounded-lg flex items-center justify-center font-black text-xl shadow-lg shadow-blue-500/20">
                            M
                        </div>
                        <div>
                            <div className="text-white font-bold text-sm tracking-tight uppercase">{t("municipal.municipallayout.mduloMunicipal", `Módulo Municipal`)}</div>
                            <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{t("municipal.municipallayout.gestoPblica", `Gestão Pública`)}</div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
                    <div className="px-4 mb-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Menu Principal</div>
                    {links.map(link => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`
                                flex items-center px-4 py-3 rounded-xl transition-all group relative
                                ${location.pathname === link.to
                                    ? "bg-[var(--accent-primary)] text-[var(--fg-inverse)] shadow-lg shadow-blue-600/20"
                                    : "hover:bg-slate-800 hover:text-white"}
                            `}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span className="mr-3">{link.icon}</span>
                            <span className="font-semibold text-sm">{link.label}</span>
                            {location.pathname === link.to && (
                                <ChevronRight size={14} className="ml-auto opacity-50" />
                            )}
                        </Link>
                    ))}
                </div>

                <div className="p-6 border-t border-slate-800 bg-slate-900/50">
                    <div className="flex items-center gap-3 mb-6 px-2">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300 border border-slate-600">
                            {name?.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-white truncate">{name}</div>
                            <div className="text-[9px] text-slate-500 uppercase font-black">{t("municipal.municipallayout.secretrioa", `Secretário(a)`)}</div>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="flex items-center justify-center w-full px-4 py-3 text-sm text-slate-400 border border-slate-700 rounded-xl hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/5 transition-all gap-2 font-bold"
                        aria-label={t("municipal.municipallayout.encerrarSesso", `Encerrar sessão`)}
                    >
                        <LogOut size={16} /> Encerrar Sessão
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-[280px] min-h-screen flex flex-col w-full">
                <header className="h-20 px-4 md:px-10 flex items-center justify-between bg-[var(--bg-surface)] border-b border-[var(--border-default)] sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden text-[var(--fg-secondary)] p-2 hover:bg-[var(--bg-surface-hover)] rounded-lg" onClick={() => setSidebarOpen(true)} aria-label={t("municipal.municipallayout.abrirMenuDeNavegao", `Abrir menu de navegação`)}>
                            <Menu size={24} />
                        </button>
                        <div className="hidden lg:flex items-center gap-3 bg-[var(--bg-surface-hover)] px-4 py-2 rounded-xl w-80">
                            <Search size={18} className="text-[var(--fg-tertiary)]" />
                            <input
                                type="text"
                                placeholder="Buscar processos, leis ou unidades..."
                                className="bg-transparent border-none text-sm focus:outline-none w-full placeholder:text-[var(--fg-tertiary)]"
                                aria-label="Buscar processos, leis ou unidades"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-[10px] font-black text-[var(--fg-tertiary)] uppercase tracking-widest">Status do Sistema</span>
                            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                Em conformidade (LBI)
                            </span>
                        </div>
                    </div>
                </header>

                <div className="flex-1 p-4 md:p-10 w-full max-w-7xl mx-auto">
                    {children}
                </div>

                <footer className="p-8 text-center text-[10px] text-[var(--fg-tertiary)] uppercase tracking-[0.2em] font-medium">{t("municipal.municipallayout.2024PlataformaCulturaVivaGestoDeImpactoM", `
                    © 2024 Plataforma Cultura Viva • Gestão de Impacto Municipal
                `)}</footer>
            </main>
        </div>
    );
};
