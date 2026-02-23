import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { api } from "../../api/client";
import {
    LayoutDashboard,
    Calendar,
    Ticket,
    Users,
    Briefcase,
    Image,
    Trophy,
    Settings,
    LogOut,
    Menu,
    FileText,
    ExternalLink,
    MessageSquare // NEW
} from "lucide-react";
// Removed import "./ProducerLayout.css";

export const ProducerLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { t } = useTranslation();
    const { logout, name, tenantId } = useAuth();
    const location = useLocation();
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [features, setFeatures] = useState<any>({
        featureProjects: true,
        featureTickets: false,
        featureServices: true,
        featureReports: true,
        featureEditaisSubmission: true
    });

    React.useEffect(() => {
        if (tenantId) {
            api.get(`/tenants/${tenantId}`).then(res => {
                setFeatures(res.data);
            }).catch(err => console.warn("Could not load producer features", err));
        }
    }, [tenantId]);

    const links = [
        { to: "/producer", label: t("producer.layout.menu.overview"), icon: <LayoutDashboard size={20} />, show: true },
        { to: "/producer/projects", label: "Meus Projetos", icon: <FileText size={20} />, show: features.featureProjects },
        { to: "/producer/events", label: "Meus Eventos", icon: <Calendar size={20} />, show: true },
        { to: "/producer/editais", label: "Editais Disponíveis", icon: <Briefcase size={20} />, show: features.featureEditaisSubmission },

        // Museum Features provided to Producer (Guarded by Flags)
        { to: "/producer/works", label: "Acervo", icon: <Image size={20} />, show: features.featureWorks },
        { to: "/producer/gamification", label: "Gamificação", icon: <Trophy size={20} />, show: features.featureGamification },

        { to: "/producer/tickets", label: t("producer.layout.menu.tickets"), icon: <Ticket size={20} />, show: features.featureTickets },
        { to: "/producer/audience", label: t("producer.layout.menu.audience"), icon: <Users size={20} />, show: features.featureTickets }, // Audience usually tied to tickets/events
        { to: "/producer/services", label: t("producer.layout.menu.services"), icon: <Briefcase size={20} />, show: features.featureServices },
        { to: "/producer/reports", label: t("producer.layout.menu.reports"), icon: <FileText size={20} />, show: true },
        { to: "/producer/profile", label: "Meu Perfil", icon: <Users size={20} />, show: true },
        { to: "/producer/inbox", label: "Inbox & Mensagens", icon: <MessageSquare size={20} />, show: true },
        { to: "/producer/settings", label: "Configurações", icon: <Settings size={20} />, show: true },
    ].filter(l => l.show);

    return (
        <div className="flex min-h-screen bg-[#1a1108] text-[#EAE0D5] font-serif w-full">
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 z-[900] transition-opacity duration-300 backdrop-blur-[2px] ${isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"}`}
                onClick={() => setSidebarOpen(false)}
                aria-hidden={!isSidebarOpen}
                aria-label="Fechar menu lateral"
            />

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 left-0 bottom-0 w-[280px] bg-[#2c1e10] border-r border-[#463420] 
                    flex flex-col z-[1000] transition-transform duration-300 shadow-[2px_0_10px_rgba(0,0,0,0.3)]
                    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
                `}
            >
                <div className="p-6 md:p-8 border-b border-[#463420] min-h-[120px] flex items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#D4AF37] text-[#1a1108] rounded-full flex items-center justify-center font-bold text-lg shadow-[0_0_10px_rgba(212,175,55,0.3)] shrink-0">
                            PC
                        </div>
                        <div>
                            <div className="font-serif text-[1.1rem] text-[#D4AF37] leading-tight uppercase tracking-widest">
                                {t("producer.layout.title")}
                            </div>
                            <div className="text-xs text-[#B0A090] italic mt-1">
                                {name}
                            </div>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
                    <div className="px-4 mb-2 text-xs uppercase opacity-50 tracking-widest text-[#B0A090]">
                        {t("producer.layout.menu.management")}
                    </div>
                    {links.map(link => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`
                                flex items-center px-4 py-3 text-[#B0A090] rounded-lg transition-all text-[0.95rem] font-serif group
                                hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]
                                ${location.pathname === link.to ? "bg-[#D4AF37]/10 text-[#D4AF37] border-l-4 border-[#D4AF37]" : ""}
                            `}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span className="mr-3 group-hover:scale-110 transition-transform">{link.icon}</span>
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-[#463420] bg-black/10">
                    <button
                        onClick={logout}
                        className="flex items-center justify-center w-full px-4 py-2 text-[#EAE0D5] border border-[#463420] rounded hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors gap-2 font-serif text-sm"
                        aria-label={t("producer.layout.logout")}
                    >
                        <LogOut size={16} /> {t("producer.layout.logout")}
                    </button>
                    <div className="mt-4 flex justify-center">
                        <Link to="/visitor" className="text-xs text-[#B0A090] hover:text-[#D4AF37] flex items-center gap-1">
                            <ExternalLink size={12} /> Ir para Visão do Visitante
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-[280px] min-h-screen flex flex-col w-full transition-all duration-300">
                <header className="h-16 px-4 md:px-8 flex items-center justify-between md:justify-end bg-transparent md:bg-transparent border-b md:border-none border-[#463420]">
                    <button
                        className="md:hidden text-[#D4AF37]"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Abrir menu lateral"
                        aria-expanded={isSidebarOpen}
                    >
                        <Menu size={24} />
                    </button>
                    <div className="flex items-center gap-4">
                        <span className="border border-[#D4AF37] text-[#D4AF37] px-3 py-1 rounded-full text-[0.7rem] uppercase font-bold tracking-widest">
                            Agente Cultural
                        </span>
                    </div>
                </header>

                <div className="flex-1 p-4 md:p-8 w-full max-w-[1400px]">
                    {children}
                </div>
            </main>
        </div>
    );
};
