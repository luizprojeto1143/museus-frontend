import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../../api/client";
import {
    LayoutDashboard,
    MessageSquare,
    User,
    Settings,
    LogOut,
    Menu,
    ExternalLink,
    Briefcase,
    Star,
    ChevronRight,
    Zap,
    ShieldCheck,
    X,
    FileText
} from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";

export const ProviderLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { t } = useTranslation();
    const { logout, name } = useAuth();
    const location = useLocation();
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const links = [
        { to: "/provider", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
        { to: "/provider/chamados", label: "Chamados / Contratações", icon: <Briefcase size={18} /> },
        { to: "/provider/orcamentos", label: "Orçamentos", icon: <FileText size={18} /> },
        { to: "/provider/execucoes", label: "Execuções", icon: <Star size={18} /> },
        { to: "/provider/servicos", label: "Serviços", icon: <Settings size={18} /> },
        { to: "/provider/carteira", label: "Carteira / Financeiro", icon: <LayoutDashboard size={18} /> },
        { to: "/provider/notas-fiscais", label: "Notas Fiscais", icon: <FileText size={18} /> },
        { to: "/provider/mensagens", label: "Mensagens", icon: <MessageSquare size={18} /> },
        { to: "/provider/perfil", label: "Perfil Público", icon: <User size={18} /> },
        { to: "/provider/configuracoes", label: "Configurações", icon: <Settings size={18} /> },
    ];

    return (
        <div className="flex min-h-screen bg-[#05050a] text-slate-200 w-full font-sans selection:bg-indigo-500/30">
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
                    fixed top-0 left-0 bottom-0 w-[280px] bg-[#0a0a1a] border-r border-white/5 
                    flex flex-col z-[1000] transition-all duration-500 ease-in-out
                    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
                `}
            >
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-[0_0_30px_rgba(79,70,229,0.3)] shrink-0 border border-indigo-400/20">
                            PR
                        </div>
                        <div className="min-w-0">
                            <div className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.2em] leading-none mb-1">
                                Prestador
                            </div>
                            <div className="text-sm text-white font-bold truncate">
                                {name || "Usuário"}
                            </div>
                        </div>
                    </div>
                    <button className="md:hidden text-slate-500" onClick={() => setSidebarOpen(false)}>
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 p-6 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
                    <div className="px-4 mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                        Navegação Principal
                    </div>
                    {links.map(link => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`
                                flex items-center px-5 py-4 rounded-2xl transition-all duration-300 group relative
                                ${location.pathname === link.to 
                                    ? "bg-indigo-600/10 text-white font-bold" 
                                    : "text-slate-500 hover:bg-white/5 hover:text-slate-200"}
                            `}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span className={`mr-4 transition-transform duration-300 ${location.pathname === link.to ? "text-indigo-400 scale-110" : "group-hover:scale-110"}`}>
                                {link.icon}
                            </span>
                            <span className="text-sm tracking-tight">{link.label}</span>
                            
                            {location.pathname === link.to && (
                                <motion.div 
                                    layoutId="activeTab"
                                    className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-full"
                                />
                            )}
                            
                            <ChevronRight size={14} className={`ml-auto opacity-0 group-hover:opacity-100 transition-all ${location.pathname === link.to ? 'opacity-100' : ''}`} />
                        </Link>
                    ))}
                </nav>

                <div className="p-6 border-t border-white/5 space-y-4">
                    <button
                        onClick={logout}
                        className="flex items-center justify-center w-full px-5 py-4 text-slate-400 bg-white/5 border border-white/5 rounded-2xl hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all duration-300 gap-3 font-black text-[10px] uppercase tracking-widest"
                    >
                        <LogOut size={16} /> Sair da Conta
                    </button>
                    
                    <Link to="/hub" className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-indigo-400 transition-colors">
                        <ExternalLink size={12} /> Visão do Visitante
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-[280px] min-h-screen flex flex-col w-full transition-all duration-300">
                <header className="h-20 px-6 md:px-12 flex items-center justify-between bg-[#05050a]/80 backdrop-blur-2xl border-b border-white/5 sticky top-0 z-[800]">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden w-10 h-10 flex items-center justify-center text-indigo-400 bg-indigo-400/10 rounded-xl" onClick={() => setSidebarOpen(true)}>
                            <Menu size={20} />
                        </button>
                        <div className="hidden md:flex items-center gap-4">
                            <Badge variant="glass" className="h-8 px-3 rounded-lg border-indigo-500/20 text-indigo-400 text-[9px] font-black uppercase tracking-widest">
                                <Zap size={12} className="mr-1.5" />
                                Modo Prestador
                            </Badge>
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                <Star size={12} className="text-gold-400 fill-gold-400" />
                                <span>Ranking: 4.9</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                         <div className="flex flex-col items-end">
                             <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none mb-1">Status</span>
                             <span className="flex items-center gap-1.5 text-[10px] font-black text-green-400 uppercase">
                                 <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                 Online
                             </span>
                         </div>
                         <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                             <User size={20} className="text-slate-400" />
                         </div>
                    </div>
                </header>

                <div className="flex-1 p-6 md:p-12 w-full max-w-[1600px] mx-auto overflow-x-hidden">
                    {children}
                </div>
            </main>
        </div>
    );
};
