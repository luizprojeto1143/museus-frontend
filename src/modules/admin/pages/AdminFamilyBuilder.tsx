import React, { useState, useEffect, useCallback } from "react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Loader2, UserPlus, Trash2, Save, Users, Calendar, Music } from "lucide-react";
import { Button, Input, Select, Textarea } from "../../../components/ui";
import { toast } from "react-hot-toast";

export const AdminFamilyBuilder: React.FC = () => {
    const { tenantId } = useAuth();
    const [spaces, setSpaces] = useState<any[]>([]);
    const [profiles, setProfiles] = useState<any[]>([]);
    const [selectedProfileId, setSelectedProfileId] = useState("");
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // New profile form
    const [showProfileForm, setShowProfileForm] = useState(false);
    const [newProfile, setNewProfile] = useState({
        familyName: "",
        description: "",
        coverImageUrl: "",
        audioUrl: "",
        spaceId: ""
    });

    // New event form
    const [newEvent, setNewEvent] = useState({
        year: new Date().getFullYear(),
        title: "",
        description: "",
        type: "OTHER"
    });

    const loadData = useCallback(async () => {
        try {
            const [s, p] = await Promise.all([
                api.get("/spaces", { params: { tenantId } }),
                api.get("/roadmap-family/profiles", { params: { tenantId } }) // Needs adjusting if route needs spaceId
            ]);
            setSpaces(s.data);
            setProfiles(p.data);
            if (p.data.length > 0) setSelectedProfileId(p.data[0].id);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [tenantId]);

    useEffect(() => {
        if (tenantId) loadData();
    }, [tenantId, loadData]);

    const handleCreateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // Add backend route if missing or use generic
            await api.post("/roadmap-family/profiles", newProfile);
            toast.success("Perfil familiar criado!");
            setShowProfileForm(false);
            loadData();
        } catch (err) {
            toast.error("Erro ao criar perfil");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProfileId) return;
        setIsSaving(true);
        try {
            await api.post(`/roadmap-family/profiles/${selectedProfileId}/events`, newEvent);
            toast.success("Evento adicionado!");
            setNewEvent({ year: new Date().getFullYear(), title: "", description: "", type: "OTHER" });
            loadData();
        } catch (err) {
            toast.error("Erro ao adicionar evento");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;

    const selectedProfile = profiles.find(p => p.id === selectedProfileId);

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black flex items-center gap-2">
                        <Users className="text-[var(--accent-primary)]" />
                        Gestão de Memória Familiar
                    </h1>
                    <p className="opacity-60 text-sm">Registre a genealogia e histórias de famílias para patrimônios históricos</p>
                </div>
                <Button onClick={() => setShowProfileForm(true)} leftIcon={<UserPlus size={18} />} className="btn-primary-gradient">
                    Novo Perfil Familiar
                </Button>
            </header>

            <div className="grid grid-cols-4 gap-8">
                <aside className="col-span-1 space-y-4">
                    <h3 className="text-xs font-black opacity-40 uppercase tracking-widest">Famílias</h3>
                    <div className="flex flex-col gap-2">
                        {profiles.map(p => (
                            <button
                                key={p.id}
                                onClick={() => setSelectedProfileId(p.id)}
                                className={`text-left p-4 rounded-xl border transition-all ${selectedProfileId === p.id
                                    ? "bg-[var(--accent-primary)]/10 border-[var(--accent-primary)] text-[var(--accent-primary)]"
                                    : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
                                    }`}
                            >
                                <h4 className="font-bold">{p.familyName}</h4>
                                <span className="text-[10px] opacity-60">{p.events?.length || 0} eventos registrados</span>
                            </button>
                        ))}
                    </div>
                </aside>

                <main className="col-span-3">
                    {selectedProfile ? (
                        <div className="space-y-8">
                            <div className="card p-8 border-zinc-800 bg-zinc-900 relative">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-3xl font-black">Família {selectedProfile.familyName}</h2>
                                        <p className="opacity-60 mt-2">{selectedProfile.description}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm">Editar Perfil</Button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <form onSubmit={handleAddEvent} className="card p-6 border-zinc-800 bg-zinc-900 space-y-4">
                                    <h4 className="font-bold border-b border-zinc-800 pb-2 mb-4">Adicionar Acontecimento</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="Ano"
                                            type="number"
                                            value={newEvent.year}
                                            onChange={e => setNewEvent({ ...newEvent, year: parseInt(e.target.value) })}
                                        />
                                        <Select
                                            label="Tipo"
                                            value={newEvent.type}
                                            onChange={e => setNewEvent({ ...newEvent, type: e.target.value })}
                                        >
                                            <option value="BIRTH">Nascimento</option>
                                            <option value="DEATH">Falecimento</option>
                                            <option value="MARRIAGE">Casamento</option>
                                            <option value="ACHIEVEMENT">Conquista</option>
                                            <option value="OTHER">Outro</option>
                                        </Select>
                                    </div>
                                    <Input
                                        label="Título"
                                        placeholder="Ex: Chegada ao Brasil"
                                        value={newEvent.title}
                                        onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                                    />
                                    <Textarea
                                        label="Descrição"
                                        value={newEvent.description}
                                        onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                                        rows={3}
                                    />
                                    <Button type="submit" isLoading={isSaving} className="w-full btn-primary-gradient">Salvar Evento</Button>
                                </form>

                                <div className="space-y-4">
                                    <h4 className="text-xs font-black opacity-40 uppercase tracking-widest flex items-center gap-2">
                                        <Calendar size={14} /> Histórico Registrado
                                    </h4>
                                    <div className="space-y-2">
                                        {selectedProfile.events?.map((e: any) => (
                                            <div key={e.id} className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl flex justify-between items-center group">
                                                <div>
                                                    <span className="text-[10px] font-bold text-[var(--accent-primary)]">{e.year}</span>
                                                    <h5 className="font-bold text-sm">{e.title}</h5>
                                                </div>
                                                <button className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-500 transition-all">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-zinc-900/50 rounded-2xl border-2 border-dashed border-zinc-800">
                            <Users size={48} className="mx-auto mb-4 opacity-10" />
                            <p className="opacity-30">Selecione uma família ao lado para gerenciar.</p>
                        </div>
                    )}
                </main>
            </div>

            {showProfileForm && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="card p-8 w-full max-w-lg bg-zinc-900 border-zinc-800">
                        <h2 className="text-2xl font-black mb-6">Novo Perfil Familiar</h2>
                        <form onSubmit={handleCreateProfile} className="space-y-4">
                            <Input
                                label="Nome da Família"
                                placeholder="Ex: Silva Santos"
                                value={newProfile.familyName}
                                onChange={e => setNewProfile({ ...newProfile, familyName: e.target.value })}
                                required
                            />
                            <Textarea
                                label="Resumo da História"
                                value={newProfile.description}
                                onChange={e => setNewProfile({ ...newProfile, description: e.target.value })}
                                rows={3}
                            />
                            <Select
                                label="Espaço Associado (Cemitério/Setor)"
                                value={newProfile.spaceId}
                                onChange={e => setNewProfile({ ...newProfile, spaceId: e.target.value })}
                            >
                                <option value="">Selecione um espaço...</option>
                                {spaces.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </Select>
                            <Input
                                label="URL da Foto de Capa"
                                value={newProfile.coverImageUrl}
                                onChange={e => setNewProfile({ ...newProfile, coverImageUrl: e.target.value })}
                            />
                            <div className="flex gap-4 mt-8">
                                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowProfileForm(false)}>Cancelar</Button>
                                <Button type="submit" isLoading={isSaving} className="flex-1 btn-primary-gradient">Criar Perfil</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
