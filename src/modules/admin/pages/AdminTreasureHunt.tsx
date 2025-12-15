import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";

interface Clue {
    id: string;
    riddle: string;
    answer: string;
    order: number;
    active: boolean;
    work?: {
        id: string;
        title: string;
    };
    workId?: string | null;
}

interface Work {
    id: string;
    title: string;
}

export const AdminTreasureHunt: React.FC = () => {
    const { t } = useTranslation();
    const [clues, setClues] = useState<Clue[]>([]);
    const [works, setWorks] = useState<Work[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingClue, setEditingClue] = useState<Clue | null>(null);

    // Form state
    const [formData, setFormData] = useState<{
        riddle: string;
        answer: string;
        workId: string;
        order: number;
    }>({
        riddle: "",
        answer: "",
        workId: "",
        order: 0
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [cluesRes, worksRes] = await Promise.all([
                api.get("/clues"),
                api.get("/works")
            ]);
            setClues(cluesRes.data);
            setWorks(worksRes.data);
        } catch (error) {
            console.error("Erro ao carregar dados", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t("common.confirmDelete"))) return;
        try {
            await api.delete(`/clues/${id}`);
            loadData();
        } catch (error) {
            alert(t("admin.errors.delete"));
        }
    };

    const handleEdit = (clue: Clue) => {
        setEditingClue(clue);
        setFormData({
            riddle: clue.riddle,
            answer: clue.answer,
            workId: clue.workId || "",
            order: clue.order
        });
        setShowForm(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingClue) {
                await api.put(`/clues/${editingClue.id}`, formData);
            } else {
                await api.post("/clues", formData);
            }
            setShowForm(false);
            setEditingClue(null);
            setFormData({ riddle: "", answer: "", workId: "", order: 0 });
            loadData();
        } catch (error) {
            alert(t("admin.errors.save"));
        }
    };

    return (
        <div className="admin-page">
            <header className="admin-header">
                <div>
                    <h1 className="admin-title">🏴‍☠️ {t("admin.treasure.title", "Caça ao Tesouro")}</h1>
                    <p className="admin-subtitle">
                        {t("admin.treasure.subtitle", "Crie charadas manuais para os visitantes encontrarem.")}
                    </p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        setEditingClue(null);
                        setFormData({ riddle: "", answer: "", workId: "", order: clues.length + 1 });
                        setShowForm(true);
                    }}
                >
                    + {t("admin.treasure.add", "Nova Pista")}
                </button>
            </header>

            {/* Lista de Pistas */}
            <div className="card">
                {loading ? (
                    <p>{t("common.loading")}</p>
                ) : clues.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "2rem" }}>
                        <p style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>
                            🤖 <strong>{t("admin.treasure.automatedTitle", "Modo Automático Ativo")}</strong>
                        </p>
                        <p style={{ color: "var(--text-secondary)" }}>
                            {t("admin.treasure.automatedDescription", "O sistema gera pistas automáticas se você não criar nenhuma manual. Adicione sua primeira pista acima para personalizar!")}
                        </p>
                    </div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Charada</th>
                                <th>Resposta</th>
                                <th>Obra (Local)</th>
                                <th>{t("common.actions")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clues.map((clue) => (
                                <tr key={clue.id}>
                                    <td>{clue.order}</td>
                                    <td style={{ maxWidth: "300px" }}>{clue.riddle}</td>
                                    <td>{clue.answer}</td>
                                    <td>{clue.work?.title || "-"}</td>
                                    <td>
                                        <button className="btn-icon" onClick={() => handleEdit(clue)}>✏️</button>
                                        <button className="btn-icon" onClick={() => handleDelete(clue.id)} style={{ color: "#ff6b6b" }}>🗑️</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal / Overlay de Edição */}
            {showForm && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center",
                    zIndex: 1000
                }}>
                    <div className="card" style={{ width: "90%", maxWidth: "500px", padding: "2rem" }}>
                        <h2>{editingClue ? "Editar Pista" : "Nova Pista"}</h2>
                        <form onSubmit={handleSave}>
                            <div className="form-group">
                                <label>Charada / Pergunta *</label>
                                <textarea
                                    required
                                    className="input"
                                    value={formData.riddle}
                                    onChange={e => setFormData({ ...formData, riddle: e.target.value })}
                                    rows={3}
                                    placeholder="Ex: Sou alto e verde..."
                                />
                            </div>

                            <div className="form-group">
                                <label>Resposta Esperada *</label>
                                <input
                                    required
                                    type="text"
                                    className="input"
                                    value={formData.answer}
                                    onChange={e => setFormData({ ...formData, answer: e.target.value })}
                                    placeholder="Ex: Palmeira"
                                />
                            </div>

                            <div className="form-group">
                                <label>Obra Relacionada (Onde está a pista ou a solução)</label>
                                <select
                                    className="input"
                                    value={formData.workId}
                                    onChange={e => setFormData({ ...formData, workId: e.target.value })}
                                >
                                    <option value="">-- Nenhuma (Pista solta) --</option>
                                    {works.map(w => (
                                        <option key={w.id} value={w.id}>{w.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Ordem na sequência</label>
                                <input
                                    type="number"
                                    className="input"
                                    value={formData.order}
                                    onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                />
                            </div>

                            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary">Salvar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
