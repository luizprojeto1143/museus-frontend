import React, { useEffect, useState, useCallback } from "react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Loader2, Plus, MessageSquare, Pin, Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { toast } from "react-hot-toast";
import "./AdminShared.css";


interface CuratorNote {
    id: string;
    content: string;
    author: string | null;
    pinned: boolean;
    workId: string;
    work?: { id: string; title: string; imageUrl: string | null; room: string | null };
    createdAt: string;
}

export const AdminCuratorNotes: React.FC = () => {
    const { tenantId } = useAuth();
    const [notes, setNotes] = useState<CuratorNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingNote, setEditingNote] = useState<CuratorNote | null>(null);
    const [works, setWorks] = useState<any[]>([]);

    // Form state
    const [content, setContent] = useState("");
    const [author, setAuthor] = useState("");
    const [workId, setWorkId] = useState("");
    const [pinned, setPinned] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const [notesRes, worksRes] = await Promise.all([
                api.get(`/curator-notes/all?tenantId=${tenantId}`),
                api.get(`/works?tenantId=${tenantId}`)
            ]);
            setNotes(Array.isArray(notesRes.data) ? notesRes.data : (notesRes.data.data || []));
            setWorks(Array.isArray(worksRes.data) ? worksRes.data : (worksRes.data.data || []));
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar notas");
        } finally {
            setLoading(false);
        }
    }, [tenantId]);

    useEffect(() => {
        if (tenantId) fetchData();
    }, [tenantId, fetchData]);

    const resetForm = () => {
        setContent("");
        setAuthor("");
        setWorkId("");
        setPinned(false);
        setEditingNote(null);
        setShowForm(false);
    };

    const onEdit = (note: CuratorNote) => {
        setEditingNote(note);
        setContent(note.content);
        setAuthor(note.author || "");
        setWorkId(note.workId);
        setPinned(note.pinned);
        setShowForm(true);
    };

    const onSave = async () => {
        if (!content || !workId) {
            toast.error("Preencha o conteúdo e selecione uma obra");
            return;
        }
        try {
            if (editingNote) {
                await api.put(`/curator-notes/${editingNote.id}`, { content, author, pinned });
            } else {
                await api.post("/curator-notes", { content, author, pinned, workId });
            }
            toast.success(editingNote ? "Nota atualizada!" : "Nota criada!");
            resetForm();
            fetchData();
        } catch (error) {
            toast.error("Erro ao salvar nota");
        }
    };

    const onDelete = async (id: string) => {
        if (!confirm("Excluir esta nota?")) return;
        try {
            await api.delete(`/curator-notes/${id}`);
            toast.success("Nota excluída");
            fetchData();
        } catch (error) {
            toast.error("Erro ao excluir");
        }
    };

    if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: "5rem 0" }}><Loader2 className="animate-spin" style={{ color: "#d4af37" }} /></div>;

    return (
        <div style={{ display: "grid", gap: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1 className="section-title" style={{ margin: 0 }}>Notas do Curador</h1>
                    <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.25rem" }}>Comentários contextuais sobre obras do acervo</p>
                </div>
                <Button onClick={() => { resetForm(); setShowForm(true); }} leftIcon={<Plus size={16} />}>
                    Nova Nota
                </Button>
            </div>

            {showForm && (
                <div className="card" style={{ display: "grid", gap: "1rem" }}>
                    <h2 className="card-title" style={{ margin: 0 }}>{editingNote ? "Editar Nota" : "Nova Nota do Curador"}</h2>
                    <div>
                        <label style={{ display: "block", color: "#d4af37", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Obra</label>
                        <select
                            value={workId}
                            onChange={e => setWorkId(e.target.value)}
                            disabled={!!editingNote}
                            style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "white", fontSize: "0.85rem", outline: "none" }}
                        >
                            <option value="">Selecione uma obra...</option>
                            {works.map((w: any) => (
                                <option key={w.id} value={w.id}>{w.title} {w.room ? `(${w.room})` : ''}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: "block", color: "#d4af37", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Nota do Curador</label>
                        <textarea
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            rows={4}
                            placeholder="Ex: Esta obra retrata o cotidiano da mineração em Minas Gerais no século XVIII..."
                            style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "white", fontSize: "0.85rem", outline: "none", resize: "none" }}
                        />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div>
                            <label style={{ display: "block", color: "#d4af37", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Curador (opcional)</label>
                            <input
                                type="text"
                                value={author}
                                onChange={e => setAuthor(e.target.value)}
                                placeholder="Nome do curador"
                                style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "white", fontSize: "0.85rem", outline: "none" }}
                            />
                        </div>
                        <div className="flex items-end gap-3">
                            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-300">
                                <input type="checkbox" checked={pinned} onChange={e => setPinned(e.target.checked)} className="accent-amber-500" />
                                <Pin size={14} /> Fixar no topo
                            </label>
                        </div>
                    </div>
                    <div className="flex gap-2 justify-end pt-2">
                        <Button variant="outline" onClick={resetForm}>Cancelar</Button>
                        <Button onClick={onSave}>{editingNote ? "Salvar" : "Criar Nota"}</Button>
                    </div>
                </div>
            )}

            {notes.length === 0 && !showForm ? (
                <div className="card" style={{ textAlign: "center", padding: "5rem 2rem", border: "2px dashed rgba(212,175,55,0.15)" }}>
                    <MessageSquare size={48} style={{ margin: "0 auto 1rem", color: "#64748b", opacity: 0.3 }} />
                    <h3 className="text-lg font-bold text-white mb-1">Nenhuma nota cadastrada</h3>
                    <p style={{ color: "#64748b" }}>Adicione notas de curador às obras do acervo para enriquecer a experiência do visitante.</p>
                </div>
            ) : (
                <div style={{ display: "grid", gap: "0.75rem" }}>
                    {notes.map(note => (
                        <div key={note.id} className="card" style={{ padding: "1.25rem", borderColor: note.pinned ? 'border-amber-500/30' : 'border-white/5' }}>
                            <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                                {note.work?.imageUrl ? (
                                    <img src={note.work.imageUrl} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                                ) : (
                                    <div className="w-14 h-14 rounded-xl bg-zinc-900/40 border border-gold/20/5 flex items-center justify-center shrink-0">
                                        <ImageIcon size={20} style={{ color: "#475569" }} />
                                    </div>
                                )}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                                        <span style={{ color: "white", fontWeight: 700, fontSize: "0.9rem" }}>{note.work?.title}</span>
                                        {note.work?.room && <span className="badge">{note.work.room}</span>}
                                        {note.pinned && <Pin size={12} className="text-amber-500" />}
                                    </div>
                                    <p className="text-gray-300 text-sm mb-2">{note.content}</p>
                                    <div className="flex items-center gap-3 text-xs text-zinc-400">
                                        {note.author && <span>— {note.author}</span>}
                                        <span>{new Date(note.createdAt).toLocaleDateString("pt-BR")}</span>
                                    </div>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                    <button onClick={() => onEdit(note)} className="p-2 hover:bg-zinc-900/40 border border-gold/20/5 rounded-lg transition-colors text-zinc-400 hover:text-white">
                                        <Pencil size={14} />
                                    </button>
                                    <button onClick={() => onDelete(note.id)} className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-zinc-400 hover:text-red-400">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
