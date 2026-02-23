import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { api } from "../../api/client";
import {
    LayoutDashboard,
    MessageSquare,
    User,
    Settings,
    LogOut,
    Menu,
    ExternalLink,
    Briefcase,
    Star
} from "lucide-react";

export const ProviderLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { t } = useTranslation();
    const { logout, name } = useAuth();
    const location = useLocation();
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const links = [
        { to: "/provider", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
        { to: "/provider/inbox", label: "Minhas Mensagens", icon: <MessageSquare size={20} /> },
        { to: "/provider/profile", label: "Perfil do Prestador", icon: <User size={20} /> },
        { to: "/provider/services", label: "Meus Serviços", icon: <Briefcase size={20} /> },
        { to: "/provider/settings", label: "Configurações", icon: <Settings size={20} /> },
    ];

    return (
        <div className="flex min-h-screen bg-[#0f0a1a] text-[#EAE0D5] w-full font-sans">
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 z-[900] transition-opacity duration-300 backdrop-blur-[2px] ${isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}`}
                onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 left-0 bottom-0 w-[280px] bg-[#1a0f2c] border-r border-[#3b2164] 
                    flex flex-col z-[1000] transition-transform duration-300 shadow-[2px_0_15px_rgba(0,0,0,0.5)]
                    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
                `}
            >
                <div className="p-6 md:p-8 border-b border-[#3b2164] min-h-[120px] flex items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#9f7aea] text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-[0_0_15px_rgba(159,122,234,0.4)] shrink-0">
                            PR
                        </div>
                        <div>
                            <div className="text-[1.1rem] text-[#9f7aea] font-bold leading-tight uppercase tracking-widest">
                                Prestador
                            </div>
                            <div className="text-xs text-[#b794f4] italic mt-1">
                                {name}
                            </div>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
                    <div className="px-4 mb-2 text-xs uppercase opacity-50 tracking-widest text-[#b794f4]">
                        Painel de Controle
                    </div>
                    {links.map(link => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`
                                flex items-center px-4 py-3 text-[#b794f4] rounded-xl transition-all text-[0.95rem] group
                                hover:bg-[#9f7aea]/10 hover:text-white
                                ${location.pathname === link.to ? "bg-[#9f7aea]/20 text-white border-r-4 border-[#9f7aea]" : ""}
                            `}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span className="mr-3 group-hover:scale-110 transition-transform">{link.icon}</span>
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-[#3b2164] bg-black/20">
                    <button
                        onClick={logout}
                        className="flex items-center justify-center w-full px-4 py-3 text-[#EAE0D5] border border-[#3b2164] rounded-xl hover:border-[#9f7aea] hover:text-[#9f7aea] transition-colors gap-2 font-bold text-sm"
                    >
                        <LogOut size={16} /> Sair do Portal
                    </button>
                    <div className="mt-4 flex justify-center">
                        <Link to="/home" className="text-xs text-[#b794f4] hover:text-white flex items-center gap-1">
                            <ExternalLink size={12} /> Ir para Visão do Visitante
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-[280px] min-h-screen flex flex-col w-full transition-all duration-300">
                <header className="h-16 px-4 md:px-8 flex items-center justify-between bg-black/20 backdrop-blur-md border-b border-[#3b2164]">
                    <button className="md:hidden text-[#9f7aea]" onClick={() => setSidebarOpen(true)}>
                        <Menu size={24} />
                    </button>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center gap-2 text-xs font-bold text-[#b794f4]">
                            <Star size={14} className="text-yellow-400" />
                            <span>Avaliação: 4.9</span>
                        </div>
                        <span className="bg-[#9f7aea]/20 text-[#9f7aea] px-4 py-1.5 rounded-full text-[0.7rem] uppercase font-black tracking-widest border border-[#9f7aea]/30">
                            Prestador de Acessibilidade
                        </span>
                    </div>
                </header>

                <div className="flex-1 p-4 md:p-10 w-full max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {children}
                </div>
            </main>
        </div>
    );
};
