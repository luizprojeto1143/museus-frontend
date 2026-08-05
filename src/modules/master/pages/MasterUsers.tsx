import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { Edit, ShieldCheck, PlusCircle, Search, ShieldAlert, Mail, Trash2, Crown, Globe, Calendar, Fingerprint, CheckCircle, XCircle } from "lucide-react";
import { 
    Button, 
    Card, 
    Badge, 
    AnimateIn
} from "@/components/ui";
import { toast } from "react-hot-toast";
import { isAxiosError } from "axios";

type UserItem = {
    id: string;
    name: string;
    email: string;
    role: string;
    active?: boolean;
    createdAt?: string;
    termsAcceptedAt?: string;
    termsAcceptedIp?: string;
    tenant?: {
        name: string;
    } | null;
};

interface ApiErrorResponse {
    error?: string;
    message?: string;
}

function getApiErrorMessage(err: unknown, fallback: string) {
    if (isAxiosError<ApiErrorResponse>(err)) {
        return err.response?.data?.message || err.response?.data?.error || fallback;
    }
    return fallback;
}

export const MasterUsers: React.FC = () => {
    const { t: _t } = useTranslation();
    const navigate = useNavigate();
    const [users, setUsers] = useState<UserItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [userToDelete, setUserToDelete] = useState<UserItem | null>(null);

    const loadUsers = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get<UserItem[]>("/users");
            setUsers(Array.isArray(res.data) ? res.data : []);
        } catch (err: unknown) {
            toast.error(getApiErrorMessage(err, "Erro ao sincronizar identidades globais."));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/users/${id}`);
            toast.success("Agente removido com sucesso.");
            setUsers(prev => prev.filter(u => u.id !== id));
            setUserToDelete(null);
        } catch (err: unknown) {
            toast.error(getApiErrorMessage(err, "Erro ao deletar usuario."));
        }
    };
    const filteredUsers = useMemo(() => {
        return users.filter(u => 
            (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
            (u.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.tenant?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);

    const getRoleBadge = (role: string) => {
        switch(role) {
            case "MASTER":
                return <Badge className="bg-red-500/10 text-red-400 border border-red-500/25 px-2.5 py-1 text-[10px] font-black uppercase flex items-center gap-1.5"><Crown size={12} /> Master</Badge>;
            case "ADMIN":
                return <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 px-2.5 py-1 text-[10px] font-black uppercase flex items-center gap-1.5"><ShieldCheck size={12} /> Admin</Badge>;
            case "COLLABORATOR":
                return <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/25 px-2.5 py-1 text-[10px] font-black uppercase">Colaborador</Badge>;
            case "PRODUCER":
                return <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/25 px-2.5 py-1 text-[10px] font-black uppercase">Produtor</Badge>;
            default:
                return <Badge className="bg-slate-500/10 text-slate-400 border border-slate-500/25 px-2.5 py-1 text-[10px] font-black uppercase">{role}</Badge>;
        }
    };

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
                        Supervisão centralizada de autoridades, níveis de acesso e auditoria de termos legais em toda a malha federada.
                    </p>
                </div>
                
                <div className="flex items-center gap-6">
                    <Button 
                        onClick={() => navigate("/master/users/novo")}
                        className="h-20 px-12 rounded-[32px] bg-indigo-600 text-white font-black uppercase text-xs tracking-[0.3em] hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-600/30 active:scale-95 flex items-center gap-4 group">
                        <PlusCircle size={16} /> Novo Usuário
                    </Button>
                    <Badge variant="glass" className="bg-indigo-500/10 text-indigo-400 border-none px-12 py-6 text-[12px] font-black uppercase tracking-[0.4em] italic rounded-[24px] flex items-center gap-4 shadow-2xl border border-indigo-500/20">
                        <ShieldAlert size={24} /> Audit Status: Sovereign Secure
                    </Badge>
                </div>
            </div>

            {/* Filter and Search HUD */}
            <Card className="bg-slate-950/60 border border-slate-900 p-6 rounded-[24px] flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                        type="text"
                        placeholder="Buscar por nome, email ou organização..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-12 bg-slate-900/40 border border-slate-800 rounded-xl pl-12 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                </div>
                <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                    Mostrando <span className="text-white font-bold">{filteredUsers.length}</span> de <span className="text-white font-bold">{users.length}</span> identidades
                </div>
            </Card>

            {/* Users Grid/Table */}
            <Card className="bg-slate-950/40 border border-slate-900 rounded-[32px] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="border-b border-slate-900 text-slate-500 uppercase tracking-widest text-[9px] font-black">
                                <th className="p-6">Agente</th>
                                <th className="p-6">Organização / Tenant</th>
                                <th className="p-6">Acesso / Role</th>
                                <th className="p-6">Termo de Consentimento</th>
                                <th className="p-6">Criação</th>
                                <th className="p-6 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-900/10 transition-colors text-slate-300 text-sm">
                                        <td className="p-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-white text-base">{user.name}</span>
                                                <span className="text-slate-500 text-xs flex items-center gap-1.5 mt-0.5"><Mail size={12} /> {user.email}</span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            {user.tenant ? (
                                                <span className="flex items-center gap-1.5 text-indigo-400 font-semibold"><Globe size={14} /> {user.tenant.name}</span>
                                            ) : (
                                                <span className="text-slate-500 text-xs italic tracking-wider uppercase">Plataforma Master</span>
                                            )}
                                        </td>
                                        <td className="p-6">
                                            {getRoleBadge(user.role)}
                                        </td>
                                        <td className="p-6">
                                            {user.termsAcceptedAt ? (
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                                                        <CheckCircle size={14} /> Aceito
                                                    </span>
                                                    <span className="text-slate-500 text-[10px] flex items-center gap-1"><Fingerprint size={10} /> {user.termsAcceptedIp || "N/A"}</span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-600 text-xs font-semibold flex items-center gap-1.5">
                                                    <XCircle size={14} /> Pendente
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-6 text-slate-500 text-xs">
                                            <span className="flex items-center gap-1"><Calendar size={12} /> {user.createdAt ? new Date(user.createdAt).toLocaleDateString("pt-BR") : "N/A"}</span>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center justify-center gap-2">
                                                <Button 
                                                    variant="ghost"
                                                    onClick={() => navigate(`/master/users/${user.id}`)}
                                                    className="w-10 h-10 p-0 rounded-xl hover:bg-indigo-500/10 text-indigo-400 hover:text-indigo-300 flex items-center justify-center transition-colors"
                                                >
                                                    <Edit size={16} />
                                                </Button>
                                                <Button 
                                                    variant="ghost"
                                                    onClick={() => setUserToDelete(user)}
                                                    className="w-10 h-10 p-0 rounded-xl hover:bg-red-500/10 text-red-400 hover:text-red-300 flex items-center justify-center transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-slate-500 text-sm font-semibold italic">
                                        Nenhum agente localizado com os parâmetros de busca fornecidos.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {userToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
                    <Card className="w-full max-w-md rounded-[28px] border border-red-500/20 bg-slate-950 p-8 shadow-2xl">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
                                    <Trash2 size={22} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black uppercase italic tracking-tight text-white">Excluir agente</h3>
                                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Acao irreversivel</p>
                                </div>
                            </div>
                            <p className="text-sm leading-relaxed text-slate-400">
                                Deseja excluir permanentemente o agente <span className="font-black text-white">{userToDelete.name}</span> e remover todos os acessos?
                            </p>
                            <div className="flex justify-end gap-3">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setUserToDelete(null)}
                                    className="rounded-2xl px-6"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => handleDelete(userToDelete.id)}
                                    className="rounded-2xl bg-red-600 px-6 text-white hover:bg-red-500"
                                >
                                    Excluir
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </AnimateIn>
    );
};

