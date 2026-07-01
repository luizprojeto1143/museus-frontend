import { useTranslation } from "react-i18next";
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { 
    LayoutDashboard, 
    MessageSquare, 
    Building2, 
    Users, 
    CreditCard, 
    Wrench, 
    Handshake, 
    Cpu, 
    Shirt, 
    Layers, 
    UserCheck, 
    Database, 
    Trophy, 
    FileSearch, 
    AlertTriangle, 
    Accessibility, 
    Activity,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Bell,
    Globe,
    Crown,
    Percent
} from "lucide-react";
import { 
    Button, 
    AnimateIn, 
    Badge 
} from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";

export const MasterLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { t } = useTranslation();
    const { logout } = useAuth();
    const location = useLocation();
    const [isCollapsed, setCollapsed] = useState(false);
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const links = [
        { to: "/master", label: t("master.sidebar.dashboard", "Dashboard"), icon: <LayoutDashboard size={20} /> },
        { to: "/master/messages", label: t("master.sidebar.communications", "Comunicações"), icon: <MessageSquare size={20} /> },
        { to: "/master/tenants", label: t("master.sidebar.city_network", "Rede de Cidades"), icon: <Building2 size={20} /> },
        { to: "/master/users", label: t("master.sidebar.admins", "Administradores"), icon: <Users size={20} /> },
        { to: "/master/plans", label: t("master.sidebar.subscriptions", "Assinaturas"), icon: <CreditCard size={20} /> },
        { to: "/master/providers", label: t("master.sidebar.ecosystem", "Ecosistema"), icon: <Wrench size={20} /> },
        { to: "/master/servicos-presenciais", label: t("master.sidebar.operations", "Operações"), icon: <Handshake size={20} /> },
        { to: "/master/ai-costs", label: t("master.sidebar.ai_costs", "Custos IA"), icon: <Cpu size={20} /> },
        { to: "/master/skins", label: t("master.sidebar.marketplace", "Marketplace"), icon: <Shirt size={20} /> },
        { to: "/master/cards", label: t("master.sidebar.grimoire", "Grimório"), icon: <Layers size={20} /> },
        { to: "/master/badges", label: t("master.sidebar.identities", "Identidades"), icon: <UserCheck size={20} /> },
        { to: "/master/seeder", label: t("master.sidebar.simulator", "Simulador"), icon: <Database size={20} /> },
        { to: "/master/achievements", label: t("master.sidebar.gamification", "Gamificação"), icon: <Trophy size={20} /> },
        { to: "/master/audit-logs", label: t("master.sidebar.audit", "Auditoria"), icon: <FileSearch size={20} /> },
        { to: "/master/error-monitor", label: t("master.sidebar.monitor", "Monitor"), icon: <AlertTriangle size={20} /> },
        { to: "/master/accessibility-requests", label: t("master.sidebar.lbi_center", "LBI Center"), icon: <Accessibility size={20} /> },
        { to: "/master/system-health", label: t("master.sidebar.core_health", "Core Health"), icon: <Activity size={20} /> },
        { to: "/master/monitoramento", label: t("master.sidebar.observability", "Observabilidade"), icon: <Activity size={20} /> },
        { to: "/master/financeiro", label: t("master.sidebar.financial", "Financeiro"), icon: <CreditCard size={20} /> },
        { to: "/master/financeiro/taxas", label: t("master.sidebar.fees", "Central de Taxas"), icon: <Percent size={20} /> }
    ];

    return (
        <div className="flex h-screen bg-[#020617] text-slate-400 overflow-hidden font-sans">
            {/* Ambient Lighting */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside 
                className={`fixed lg:relative z-50 h-full flex flex-col bg-black/40 backdrop-blur-3xl border-r border-white/5 transition-all duration-500 ease-in-out ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                } ${isCollapsed ? 'w-24' : 'w-72'}`}
            >
                {/* Collapse Toggle (Desktop) */}
                <button
                    onClick={() => setCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-24 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-600/40 hover:scale-110 transition-transform hidden lg:flex"
                >
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>

                {/* Logo Section */}
                <div className="p-8 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shrink-0 shadow-2xl shadow-blue-600/20">
                        <Crown className="text-white" size={24} />
                    </div>
                    {!isCollapsed && (
                        <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex flex-col"
                        >
                            <span className="text-white font-black tracking-tighter text-xl leading-none italic uppercase">Master</span>
                            <span className="text-blue-500 font-bold text-[8px] uppercase tracking-[0.3em] mt-1">City Hub</span>
                        </motion.div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar space-y-1">
                    {links.map((link) => {
                        const isActive = location.pathname === link.to;
                        return (
                            <Link
                                key={link.to}
                                to={link.to}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group relative ${
                                    isActive 
                                    ? 'bg-blue-600/10 text-white border border-blue-500/20 shadow-lg shadow-blue-500/5' 
                                    : 'hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <div className={`shrink-0 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-blue-500' : 'text-slate-600'}`}>
                                    {link.icon}
                                </div>
                                {!isCollapsed && (
                                    <span className={`text-xs font-black uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                                        {link.label}
                                    </span>
                                )}
                                {isActive && (
                                    <motion.div 
                                        layoutId="sidebar-active"
                                        className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full"
                                    />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer / User Section */}
                <div className="p-4 border-t border-white/5 bg-black/20">
                    <button
                        onClick={logout}
                        className="w-full h-12 rounded-2xl bg-white/5 border border-white/5 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/20 transition-all duration-300 flex items-center justify-center gap-3 font-black text-[9px] uppercase tracking-[0.2em] group"
                    >
                        <LogOut size={16} className="group-hover:rotate-12 transition-transform" />
                        {!isCollapsed && <span>{t("master.sidebar.logout", "Encerrar Sessão")}</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col relative overflow-hidden">
                {/* Top Header */}
                <header className="h-24 flex items-center justify-between px-8 bg-black/20 backdrop-blur-xl border-b border-white/5 z-40">
                    <div className="flex items-center gap-4 lg:hidden">
                        <button 
                            onClick={() => setSidebarOpen(true)}
                            className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white"
                        >
                            <Layers size={24} />
                        </button>
                        <span className="text-white font-black uppercase tracking-widest text-xs italic">Master</span>
                    </div>

                    <div className="hidden lg:flex items-center gap-6">
                        <Badge variant="glass" className="bg-blue-600/10 text-blue-400 border-none px-4 py-2 text-[9px] font-black uppercase tracking-[0.2em]">
                           <Globe size={14} className="mr-2" /> {t("master.header.global_governance", "Global Governance Node")}
                        </Badge>
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="relative p-2 text-slate-500 hover:text-white transition-colors">
                            <Bell size={20} />
                            <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#020617]" />
                        </button>
                        <div className="h-8 w-[1px] bg-white/5 mx-2" />
                        <div className="flex items-center gap-4 group cursor-pointer">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-black text-white uppercase tracking-widest">Master Admin</p>
                                <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Root Authority</p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-950 border border-white/10 flex items-center justify-center overflow-hidden group-hover:border-blue-500/50 transition-all shadow-xl">
                                <div className="w-full h-full bg-[url('https://api.dicebear.com/7.x/bottts/svg?seed=master')] bg-cover opacity-80" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Viewport */}
                <main className="flex-1 overflow-y-auto p-8 lg:p-16 custom-scrollbar">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
            `}</style>
        </div>
    );
};
