import React, { useState, useEffect, useCallback } from "react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Loader2, Plus, Trash2, Save, Clock, MapPin, Image as ImageIcon } from "lucide-react";
import { Button, Input, Select, Textarea } from "../../../components/ui";
import { toast } from "react-hot-toast";

export const AdminTimelineBuilder: React.FC = () => {
    const { tenantId } = useAuth();
    const [spaces, setSpaces] = useState<any[]>([]);
    const [selectedSpaceId, setSelectedSpaceId] = useState("");
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // New event form
    const [newEvent, setNewEvent] = useState({
        year: new Date().getFullYear(),
        title: "",
        description: "",
        imageUrl: ""
    });

    const loadData = useCallback(async () => {
        try {
            const res = await api.get("/spaces", { params: { tenantId } });
            setSpaces(res.data);
            if (res.data.length > 0) setSelectedSpaceId(res.data[0].id);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar espaços");
        } finally {
            setLoading(false);
        }
    }, [tenantId]);

    const loadEvents = useCallback(async () => {
        if (!selectedSpaceId) return;
        try {
            const res = await api.get(`/roadmap-extra/events?spaceId=${selectedSpaceId}`);
            setEvents(res.data);
        } catch (error) {
            console.error(error);
        }
    }, [selectedSpaceId]);

    useEffect(() => {
        if (tenantId) loadData();
    }, [tenantId, loadData]);

    useEffect(() => {
        loadEvents();
    }, [selectedSpaceId, loadEvents]);

    const handleAddEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEvent.title || !selectedSpaceId) return;

        setIsSaving(true);
        try {
            await api.post("/roadmap-extra/events", {
                ...newEvent,
                spaceId: selectedSpaceId
            });
            toast.success("Evento adicionado!");
            setNewEvent({ year: new Date().getFullYear(), title: "", description: "", imageUrl: "" });
            loadEvents();
        } catch (err) {
            toast.error("Erro ao salvar");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-2xl font-black flex items-center gap-2">
                    <Clock className="text-[var(--accent-primary)]" />
                    Construtor de Linha do Tempo
                </h1>
                <p className="opacity-60">Conte a história da evolução arquitetônica dos seus espaços</p>
            </header>

            <div className="grid grid-cols-3 gap-8">
                <aside className="space-y-6">
                    <div className="card p-6 border-zinc-800 bg-zinc-900">
                        <Select
                            label="Selecionar Espaço"
                            value={selectedSpaceId}
                            onChange={(e) => setSelectedSpaceId(e.target.value)}
                        >
                            {spaces.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </Select>
                    </div>

                    <form onSubmit={handleAddEvent} className="card p-6 border-zinc-800 bg-zinc-900 space-y-4">
                        <h4 className="font-bold border-b border-zinc-800 pb-2 mb-4">Novo Evento Histórico</h4>

                        <Input
                            label="Ano"
                            type="number"
                            value={newEvent.year}
                            onChange={(e) => setNewEvent({ ...newEvent, year: parseInt(e.target.value) })}
                            required
                        />

                        <Input
                            label="Título do Acontecimento"
                            placeholder="Ex: Inauguração do prédio principal"
                            value={newEvent.title}
                            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                            required
                        />

                        <Textarea
                            label="Descrição histórica"
                            placeholder="Detalhes sobre o que mudou ou aconteceu..."
                            value={newEvent.description}
                            onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                            rows={3}
                        />

                        <Input
                            label="URL da Imagem (Opcional)"
                            placeholder="https://..."
                            value={newEvent.imageUrl}
                            onChange={(e) => setNewEvent({ ...newEvent, imageUrl: e.target.value })}
                        />

                        <Button
                            type="submit"
                            isLoading={isSaving}
                            className="w-full btn-primary-gradient"
                        >
                            Adicionar à Linha do Tempo
                        </Button>
                    </form>
                </aside>

                <main className="col-span-2 space-y-4">
                    <h3 className="font-bold text-lg opacity-40 uppercase tracking-widest text-xs">Eventos Registrados</h3>

                    {events.length === 0 ? (
                        <div className="text-center py-20 bg-zinc-900/50 rounded-2xl border-2 border-dashed border-zinc-800">
                            <Clock size={48} className="mx-auto mb-4 opacity-10" />
                            <p className="opacity-30">Nenhum evento registrado para este espaço.</p>
                        </div>
                    ) : (
                        <div className="space-y-4 relative before:absolute before:left-6 before:top-0 before:bottom-0 before:w-0.5 before:bg-zinc-800">
                            {events.map((event) => (
                                <div key={event.id} className="relative pl-12">
                                    <div className="absolute left-4 top-4 w-4 h-4 rounded-full bg-[var(--accent-primary)] shadow-[0_0_10px_var(--accent-primary)]" />
                                    <div className="card p-5 border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 transition-colors group">
                                        <div className="flex justify-between">
                                            <div className="flex gap-4">
                                                {event.imageUrl && (
                                                    <img src={event.imageUrl} alt="" className="w-24 h-24 rounded-lg object-cover border border-zinc-800" />
                                                )}
                                                <div>
                                                    <span className="text-xs font-black text-[var(--accent-primary)] mb-1 block">{event.year}</span>
                                                    <h4 className="font-bold text-lg">{event.title}</h4>
                                                    <p className="text-zinc-400 text-sm mt-1">{event.description}</p>
                                                </div>
                                            </div>
                                            <button className="text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};
