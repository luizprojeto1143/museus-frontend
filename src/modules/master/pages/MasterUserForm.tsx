import React, { useState, useEffect, useCallback } from "react";
import { logger } from "@/utils/logger";

import { api, isDemoMode } from "../../../api/client";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
    User, 
    Lock, 
    Mail, 
    Building, 
    ArrowLeft, 
    Save, 
    Shield,
    ShieldCheck,
    Globe,
    Layers,
    ArrowUpRight,
    Search,
    X,
    Database,
    Cpu,
    Sparkles,
    Fingerprint,
    ShieldAlert,
    KeyRound,
    UserPlus2,
    Edit3,
    Terminal,
    UserCheck,
    BadgeCheck,
    LockKeyhole,
    Activity,
    Signal,
    Workflow,
    Zap,
    MapPin,
    AlertTriangle,
    ShieldQuestion
} from "lucide-react";
import { 
    Button, 
    Input, 
    Select, 
    Card, 
    Badge, 
    AnimateIn,
    AnimatedCounter
} from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

export const MasterUserForm: React.FC = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const isEdit = Boolean(id);
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [role, setRole] = useState("ADMIN");
    const [tenantId, setTenantId] = useState("");
    const [tenants, setTenants] = useState<Array<{ id: string; name: string }>>([]);
    const [loading, setLoading] = useState(false);

    const fetchTenants = useCallback(async () => {
        if (!isDemoMode) {
            try {
                const res = await api.get("/tenants");
                setTenants(res.data || []);
            } catch (err: unknown) {
                logger.error(err);
            }
        }
    }, []);

    const loadUser = useCallback(async () => {
        if (isEdit && id && !isDemoMode) {
            setLoading(true);
            try {
                const res = await api.get(`/users/${id}`);
                const u = res.data;
                setEmail(u.email);
                setName(u.name);
                setRole(u.role);
                setTenantId(u.tenantId || "");
            } catch {
                toast.error("Falha ao carregar credenciais de autoridade.");
                navigate("/master/users");
            } finally {
                setLoading(false);
            }
        }
    }, [isEdit, id, navigate]);

    useEffect(() => {
        fetchTenants();
    }, [fetchTenants]);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isDemoMode) {
            toast.error("MODO DEMO: Operação de credenciamento bloqueada.");
            navigate("/master/users");
            return;
        }

        if (role === "ADMIN" && !tenantId) {
            toast.error("Selecione um node institucional de destino.");
            return;
        }

        interface UserPayload {
            email: string;
            name: string;
            role: string;
            tenantId: string | null;
            password?: string;
        }

        const payload: UserPayload = {
            email,
            name,
            role,
            tenantId: role === "ADMIN" ? tenantId : null
        };

        if (!isEdit || password) {
            payload.password = password;
        }

        try {
            if (id) {
                await api.put(`/users/${id}`, payload);
                toast.success("Credenciais de autoridade atualizadas com sucesso.");
            } else {
                await api.post("/users", payload);
                toast.success("Nova autoridade integrada à malha MSV.");
            }
            navigate("/master/users");
        } catch (error: unknown) {
            toast.error("Falha no protocolo de salvamento de autoridade.");
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(99,102,241,0.4)]" />
            <p className="text-slate-500 font-black animate-pulse uppercase tracking-[0.3em] text-[10px] italic">Sincronizando Registro de Autoridades...</p>
        </div>
    );

    return (
        <AnimateIn className="space-y-12 pb-32">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Badge className="bg-indigo-600/10 text-indigo-400 border-none px-4 py-1.5 text-[8px] font-black uppercase tracking-[0.4em] italic">
                            Authority Clearance & Sovereign Identity Matrix
                        </Badge>
                    </div>
                    <div className="flex items-center gap-8">
                        <button 
                            onClick={() => navigate('/master/users')}
                            className="w-16 h-16 rounded-[22px] bg-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center border-2 border-white/5 shadow-2xl active:scale-95 group/back"
                        >
                            <ArrowLeft size={28} className="group-hover/back:-translate-x-1 transition-transform" />
                        </button>
                        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter italic leading-none">
                            {isEdit ? 'Editar' : 'Nova'} <span className="text-indigo-600">Autoridade</span>
                        </h1>
                    </div>
                    <p className="text-slate-500 font-medium text-xl max-w-3xl leading-relaxed">
                        Definição de privilégios, destino operacional e credenciamento de agentes para governança de infraestrutura global.
                    </p>
                </div>
                
                <div className="flex flex-col items-end gap-6">
                    <Badge variant="glass" className="bg-indigo-500/10 text-indigo-400 border-none px-10 py-5 text-[11px] font-black uppercase tracking-[0.4em] italic rounded-[22px] flex items-center gap-4 shadow-xl border border-indigo-500/20">
                        <UserCheck size={20} className="text-indigo-400" /> Identity: {isEdit ? 'Provisioned' : 'Pending'}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Main Provisioning Chamber */}
                <Card className="lg:col-span-7 p-14 bg-[#0b1120]/60 border-2 border-indigo-500/10 rounded-[64px] shadow-[0_40px_80px_rgba(0,0,0,0.8)] relative overflow-hidden border-t-white/10 backdrop-blur-xl">
                    <div className="flex items-center gap-6 mb-16 relative z-10">
                        <div className="w-18 h-18 rounded-[28px] bg-indigo-600/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 shadow-xl group-hover:scale-110 transition-all duration-500">
                            {isEdit ? <Edit3 size={36} /> : <UserPlus2 size={36} />}
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-white tracking-tighter italic uppercase leading-none">Dados de Credenciamento</h3>
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] italic mt-2">Personal Identity & Access Credentials</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-6 italic leading-none">Nome da Autoridade</label>
                                <div className="relative group">
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Ex: Alexander Pierce"
                                        required
                                        className="h-16 bg-white/5 border-2 border-white/10 rounded-2xl px-8 text-white font-black italic tracking-tight uppercase focus:border-indigo-500/50 transition-all"
                                    />
                                    <User size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-indigo-500/30 group-hover:text-indigo-500 transition-colors" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-6 italic leading-none">E-mail de Operação</label>
                                <div className="relative group">
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="alexander@msv.gov"
                                        required
                                        className="h-16 bg-white/5 border-2 border-white/10 rounded-2xl px-8 text-white font-black italic tracking-tight lowercase focus:border-indigo-500/50 transition-all"
                                    />
                                    <Mail size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-indigo-500/30 group-hover:text-indigo-500 transition-colors" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-6 italic leading-none">Segurança de Acesso (Access Key)</label>
                            <div className="relative group">
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={isEdit ? "MANTER_ATUAL_SE_VAZIO" : "Mínimo 8 caracteres"}
                                    required={!isEdit}
                                    className="h-16 bg-white/5 border-2 border-white/10 rounded-2xl px-8 text-white font-black italic tracking-widest focus:border-indigo-500/50 transition-all"
                                />
                                <LockKeyhole size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-indigo-500/30 group-hover:text-indigo-500 transition-colors" />
                            </div>
                            {isEdit && (
                                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest italic ml-6 mt-2">A alteração de chave exigirá nova validação de token RSA.</p>
                            )}
                        </div>

                        <div className="h-px bg-white/5 my-12 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent animate-shimmer" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-6 italic leading-none">Nível de Autoridade (Clearance)</label>
                                <div className="relative group/sel">
                                    <Select
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="h-16 bg-white/5 border-2 border-white/10 rounded-2xl px-8 text-white font-black uppercase tracking-widest italic appearance-none cursor-pointer hover:border-indigo-500/30 transition-all"
                                    >
                                        <option value="MASTER" className="bg-slate-950">Agente Master (Global Governance)</option>
                                        <option value="ADMIN" className="bg-slate-950">Administrador de Node (Regional)</option>
                                    </Select>
                                    <Shield size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-indigo-500/30 group-hover/sel:text-indigo-500 transition-colors pointer-events-none" />
                                </div>
                            </div>

                            {role === "ADMIN" && (
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-6 italic leading-none">Node Institucional de Destino</label>
                                    <div className="relative group/sel">
                                        <Select
                                            value={tenantId}
                                            onChange={(e) => setTenantId(e.target.value)}
                                            required
                                            className="h-16 bg-white/5 border-2 border-white/10 rounded-2xl px-8 text-white font-black italic appearance-none cursor-pointer hover:border-indigo-500/30 transition-all uppercase"
                                        >
                                            <option value="" className="bg-slate-950 italic">SELECIONE_NODE_ALVO</option>
                                            {tenants.map(item => (
                                                <option key={item.id} value={item.id} className="bg-slate-950">{item.name}</option>
                                            ))}
                                        </Select>
                                        <Building size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-indigo-500/30 group-hover/sel:text-indigo-500 transition-colors pointer-events-none" />
                                    </div>
                                </div>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-20 rounded-[28px] bg-indigo-600 text-white font-black uppercase tracking-[0.3em] text-xs hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-4 group/save mt-10"
                        >
                            <Save size={24} className="group-hover/save:scale-110 transition-transform" /> {isEdit ? 'Atualizar Protocolo' : 'Credenciar Nova Autoridade'}
                        </Button>
                    </form>

                    <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-indigo-600/10 transition-all duration-1000" />
                </Card>

                {/* Clearance Intelligence Section */}
                <div className="lg:col-span-5 space-y-10">
                    <Card className="p-12 bg-[#0b1120]/60 border-2 border-white/5 rounded-[56px] space-y-12 shadow-2xl border-t-white/10 backdrop-blur-xl">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-[24px] bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20 shadow-xl">
                                <Fingerprint size={32} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white tracking-tighter italic uppercase leading-none">Matriz de Privilégios</h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mt-2 italic">Análise de Clearance do Perfil Selecionado</p>
                            </div>
                        </div>
                        
                        <div className="space-y-8">
                            <motion.div 
                                animate={{ opacity: role === 'MASTER' ? 1 : 0.3, scale: role === 'MASTER' ? 1 : 0.98 }}
                                className={`p-10 rounded-[40px] border-2 transition-all duration-500 relative overflow-hidden ${role === 'MASTER' ? 'bg-indigo-600/10 border-indigo-500/30 shadow-2xl' : 'bg-white/5 border-white/5 shadow-inner grayscale'}`}
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center border transition-all ${role === 'MASTER' ? 'bg-indigo-600 text-white shadow-lg border-indigo-400' : 'bg-slate-800 text-slate-500 border-white/5'}`}>
                                            <Globe size={28} />
                                        </div>
                                        <div className="flex flex-col">
                                            <h4 className="text-white font-black text-lg uppercase tracking-tight italic leading-none">Agente Master</h4>
                                            <span className="text-[8px] font-black text-indigo-400/50 uppercase tracking-widest mt-1">Status: Global Governance</span>
                                        </div>
                                    </div>
                                    {role === 'MASTER' && <Badge className="bg-indigo-600 text-white border-none text-[8px] font-black uppercase tracking-widest px-4 py-1.5 rounded-lg animate-pulse">Active_Clearance</Badge>}
                                </div>
                                <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic relative z-10">
                                    Acesso irrestrito a todos os nodes de infraestrutura federada, logs de auditoria técnica de nível 0, faturamento global e provisionamento de novos museus.
                                </p>
                            </motion.div>

                            <motion.div 
                                animate={{ opacity: role === 'ADMIN' ? 1 : 0.3, scale: role === 'ADMIN' ? 1 : 0.98 }}
                                className={`p-10 rounded-[40px] border-2 transition-all duration-500 relative overflow-hidden ${role === 'ADMIN' ? 'bg-amber-500/10 border-amber-500/30 shadow-2xl' : 'bg-white/5 border-white/5 shadow-inner grayscale'}`}
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center border transition-all ${role === 'ADMIN' ? 'bg-amber-500 text-white shadow-lg border-amber-400' : 'bg-slate-800 text-slate-500 border-white/5'}`}>
                                            <ShieldCheck size={28} />
                                        </div>
                                        <div className="flex flex-col">
                                            <h4 className="text-white font-black text-lg uppercase tracking-tight italic leading-none">Admin Regional</h4>
                                            <span className="text-[8px] font-black text-amber-400/50 uppercase tracking-widest mt-1">Status: Node Specific</span>
                                        </div>
                                    </div>
                                    {role === 'ADMIN' && <Badge className="bg-amber-500 text-white border-none text-[8px] font-black uppercase tracking-widest px-4 py-1.5 rounded-lg animate-pulse">Active_Clearance</Badge>}
                                </div>
                                <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic relative z-10">
                                    Governança limitada exclusivamente ao node institucional designado. Gestão de acervo local, visitantes regionais e relatórios de performance municipal.
                                </p>
                            </motion.div>
                        </div>

                        <div className="p-8 bg-rose-500/5 border-2 border-rose-500/10 rounded-[32px] flex items-center gap-6 group/alert hover:bg-rose-500/10 transition-all duration-500">
                            <div className="w-14 h-14 rounded-2xl bg-rose-600/10 flex items-center justify-center text-rose-500 shadow-lg border border-rose-500/20">
                                <ShieldAlert size={28} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[11px] font-black text-rose-500 uppercase tracking-[0.2em] italic">Segurança Institucional</span>
                                <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest italic leading-relaxed mt-1">
                                    A alteração de autoridade Master deve ser executada apenas sob protocolos de auditoria rigorosos e supervisão de faturamento.
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-12 bg-[#0b1120]/60 border-2 border-indigo-500/10 rounded-[56px] relative overflow-hidden group shadow-2xl border-t-white/10">
                        <div className="flex items-center gap-8 relative z-10">
                            <div className="w-18 h-18 bg-indigo-600/10 rounded-[28px] flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform duration-700 border border-indigo-500/20 shadow-xl">
                                <Terminal size={36} />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-white font-black text-xl italic tracking-tight uppercase leading-none italic">Auditoria de Credenciamento</h4>
                                <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic mt-1">Cada interação deste agente será rastreada e vinculada permanentemente ao log de auditoria global do Master Hub.</p>
                            </div>
                        </div>
                        <div className="absolute top-[-50%] right-[-10%] w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />
                    </Card>
                </div>
            </div>

            {/* Governance Tech Footer */}
            <div className="bg-[#0f172a]/80 p-14 rounded-[64px] border-2 border-indigo-500/10 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden group shadow-2xl border-t-white/10">
                <div className="flex items-center gap-10 relative z-10">
                    <div className="w-24 h-24 bg-indigo-600/10 rounded-[32px] flex items-center justify-center text-indigo-500 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 border border-indigo-500/20 shadow-2xl relative overflow-hidden">
                        <Workflow size={48} />
                        <div className="absolute inset-0 bg-gradient-to-t from-indigo-600/10 to-transparent" />
                    </div>
                    <div className="space-y-3">
                        <h4 className="text-white font-black text-3xl italic tracking-tighter uppercase italic leading-none">Protocolo de Governança de Agentes</h4>
                        <p className="text-sm text-slate-500 font-medium max-w-2xl leading-relaxed italic mt-2">
                            O provisionamento de credenciais é a base da segurança federada MSV. A integridade operacional depende do alinhamento preciso entre responsabilidade regional e autoridade Master.
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-6 relative z-10">
                    <Badge variant="glass" className="bg-indigo-500/10 text-indigo-400 border-none px-12 py-6 text-[12px] font-black uppercase tracking-[0.4em] italic rounded-[24px] flex items-center gap-4 shadow-2xl border border-indigo-500/20">
                        <BadgeCheck size={24} /> Clearance: Sovereign Secure
                    </Badge>
                </div>
                <div className="absolute top-[-50%] right-[-10%] w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-[200px] pointer-events-none" />
                <div className="absolute left-[-5%] bottom-[-10%] w-[300px] h-[300px] bg-amber-600/5 rounded-full blur-[120px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        </AnimateIn>
    );
};
