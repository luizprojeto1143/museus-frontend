import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { 
    Users, 
    Edit, 
    ShieldCheck, 
    Database, 
    PlusCircle, 
    Search, 
    Terminal, 
    Fingerprint, 
    ShieldAlert, 
    MapPin, 
    Mail, 
    UserPlus,
    Activity,
    Lock,
    SearchCheck,
    Cpu,
    Zap,
    Shield,
    Globe,
    FileText,
    Key,
    UserCheck,
    UserX,
    Filter,
    RefreshCw,
    ExternalLink,
    Crown,
} from "lucide-react";
import { 
    Button, 
    Card, 
    Badge, 
    AnimateIn,
    AnimatedCounter
} from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

type UserItem = {
    id: string;
    name: string;
    email: string;
    role: string;
    active?: boolean;
    termsAcceptedAt?: string;
    termsAcceptedIp?: string;
    tenant?: {
        name: string;
    };
};

export const MasterUsers: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [users, setUsers] = useState<UserItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const loadUsers = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get("/users");
            setUsers(res.data || []);
        } catch (error) {
            toast.error("Erro ao sincronizar identidades globais.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const filteredUsers = useMemo(() => {
        return users.filter(u => 
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.tenant?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);

    if (loading && users.length === 0) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(99,102,241,0.4)]" />
            <p className="text-slate-500 font-black animate-pulse uppercase tracking-[0.3em] text-[10px] italic">Auditando Identidades Globais...</p>
        </div>
    );

    return (
        <AnimateIn className="space-y-12 pb-32">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Badge className="bg-indigo-600/10 text-indigo-400 border-none px-4 py-1.5 text-[8px] font-black uppercase tracking-[0.4em] italic">
                            IAM Protocol & Sovereign Agent Directory
                        </Badge>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter italic leading-none">
                        Gestão de <span className="text-indigo-600">Agentes</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-xl max-w-3xl leading-relaxed">
                        Supervisão centralizada de autoridades, níveis de acesso e auditoria forense de termos legais em toda a malha federada.
                    </p>
                </div>
                
                <div className="flex items-center gap-6">
                    <Button 
                        onClick={() => navigate("/master/users/novo")}
                        className="h-20 px-12 rounded-[32px] bg-indigo-600 text-white font-black uppercase text-xs tracking-[0.3em] hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-600/30 active:scale-95 flex items-center gap-4 group"
                    <Badge variant="glass" className="bg-indigo-500/10 text-indigo-400 border-none px-12 py-6 text-[12px] font-black uppercase tracking-[0.4em] italic rounded-[24px] flex items-center gap-4 shadow-2xl border border-indigo-500/20">
                        <ShieldAlert size={24} /> Audit Status: Sovereign Secure
                    </Badge>
                </div>
                <div className="absolute top-[-50%] right-[-10%] w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-[200px] pointer-events-none" />
                <div className="absolute left-[-5%] bottom-[-10%] w-[300px] h-[300px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        </AnimateIn>
    );
};
