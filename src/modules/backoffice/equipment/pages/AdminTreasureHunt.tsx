import React, { useState, useEffect } from "react";
import { logger } from "@/utils/logger";

import { useTranslation } from "react-i18next";
import { api } from "../../../../api/client";
import { useAuth } from "../../../auth/AuthContext";
import { Button, Input, Textarea, Select } from "../../../../components/ui";
import { toast } from "react-hot-toast";
import { isAxiosError } from "axios";
import { z } from "zod";

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

interface PaginatedResponse<T> {
    data?: T[];
}

interface ClueFormData {
    riddle: string;
    answer: string;
    workId: string;
    order: number;
}

interface ApiErrorResponse {
    error?: string;
    message?: string;
}

const clueSchema = z.object({
    riddle: z.string().trim().min(3, "Informe uma charada com pelo menos 3 caracteres."),
    answer: z.string().trim().min(2, "Informe a resposta esperada."),
    workId: z.string().trim().optional(),
    order: z.number().int("A ordem precisa ser inteira.").min(0, "A ordem não pode ser negativa.")
});

function asList<T>(payload: T[] | PaginatedResponse<T>): T[] {
    return Array.isArray(payload) ? payload : Array.isArray(payload.data) ? payload.data : [];
}

function getApiErrorMessage(error: unknown, fallback: string) {
    if (isAxiosError<ApiErrorResponse>(error)) {
        return error.response?.data?.message || error.response?.data?.error || fallback;
    }
    return fallback;
}

export const AdminTreasureHunt: React.FC = () => {
    const { t } = useTranslation();
    const { tenantId } = useAuth(); // Hook adicionado
    const [clues, setClues] = useState<Clue[]>([]);
    const [works, setWorks] = useState<Work[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingClue, setEditingClue] = useState<Clue | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Clue | null>(null);

    // Form state
    const [formData, setFormData] = useState<ClueFormData>({
        riddle: "",
        answer: "",
        workId: "",
        order: 0
    });

    useEffect(() => {
        if (tenantId) {
            loadData();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tenantId]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [cluesRes, worksRes] = await Promise.all([
                api.get<Clue[] | PaginatedResponse<Clue>>("/clues", { params: { tenantId } }),
                api.get<Work[] | PaginatedResponse<Work>>("/works", { params: { tenantId, limit: 100 } })
            ]);
            setClues(asList(cluesRes.data));
            setWorks(asList(worksRes.data));
        } catch (error) {
            logger.error("Erro ao carregar dados", error);
            toast.error(getApiErrorMessage(error, "Erro ao carregar pistas."));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;

        try {
            await api.delete(`/clues/${deleteTarget.id}`);
            setDeleteTarget(null);
            toast.success("Pista excluída.");
            loadData();
        } catch (error) {
            toast.error(getApiErrorMessage(error, t("admin.errors.delete")));
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
        const validation = clueSchema.safeParse(formData);
        if (!validation.success) {
            toast.error(validation.error.issues[0]?.message || "Revise os dados da pista.");
            return;
        }

        try {
            const payload = {
                ...validation.data,
                workId: validation.data.workId || null
            };
            if (editingClue) {
                await api.put(`/clues/${editingClue.id}`, payload);
            } else {
                await api.post("/clues", { ...payload, tenantId });
            }
            setShowForm(false);
            setEditingClue(null);
            setFormData({ riddle: "", answer: "", workId: "", order: 0 });
            toast.success(editingClue ? "Pista atualizada." : "Pista criada.");
            loadData();
        } catch (error) {
            toast.error(getApiErrorMessage(error, t("admin.errors.save")));
        }
    };

    return (
        <div className="admin-page">
            <header className="admin-header">
                <div>
                    <h1 className="admin-title">{t("admin.treasure.title", "Caca ao Tesouro")}</h1>
                    <p className="admin-subtitle">
                        {t("admin.treasure.subtitle", "Crie charadas manuais para os visitantes encontrarem.")}
                    </p>
                </div>
                <Button
                    onClick={() => {
                        setEditingClue(null);
                        setFormData({ riddle: "", answer: "", workId: "", order: clues.length + 1 });
                        setShowForm(true);
                    }}
                >
                    + {t("admin.treasure.add", "Nova Pista")}
                </Button>
            </header>

            {/* Lista de Pistas */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--shadow-surface)] rounded-[var(--radius-lg)] p-6 transition-colors">
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
                                        <button className="btn-icon" onClick={() => setDeleteTarget(clue)} style={{ color: "#ff6b6b" }}>🗑️</button>
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
                    zIndex: 1000, backdropFilter: "blur(4px)"
                }}>
                    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--shadow-surface)] rounded-[var(--radius-lg)] p-6 transition-colors" style={{ width: "95%", maxWidth: "600px", padding: "2.5rem", background: "rgba(20,12,8,0.95)", border: "1px solid var(--accent-gold)" }}>
                        <h2 style={{ color: "var(--accent-gold)", marginBottom: "1.5rem", fontSize: "1.5rem" }}>
                            {editingClue ? "Editar Pista" : "Nova Pista"}
                        </h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <Textarea
                                label="Charada / Pergunta *"
                                required
                                value={formData.riddle}
                                onChange={e => setFormData({ ...formData, riddle: e.target.value })}
                                rows={3}
                                placeholder="Ex: Sou alto e verde..."
                            />

                            <Input
                                label="Resposta Esperada *"
                                required
                                type="text"
                                value={formData.answer}
                                onChange={e => setFormData({ ...formData, answer: e.target.value })}
                                placeholder="Ex: Palmeira"
                            />

                            <Select
                                label={t("admin.treasurehunt.obraRelacionadaOndeEstAPistaOuASoluo", `Obra Relacionada (Onde está a pista ou a solução)`)}
                                value={formData.workId}
                                onChange={e => setFormData({ ...formData, workId: e.target.value })}
                            >
                                <option value="">-- Nenhuma (Pista solta) --</option>
                                {works.map(w => (
                                    <option key={w.id} value={w.id}>{w.title}</option>
                                ))}
                            </Select>

                            <Input
                                label={t("admin.treasurehunt.ordemNaSequncia", `Ordem na sequência`)}
                                type="number"
                                value={formData.order}
                                onChange={e => setFormData({ ...formData, order: e.target.value === "" ? 0 : Number(e.target.value) })}
                            />

                            <div style={{ display: "flex", gap: "1rem", marginTop: "2rem", justifyContent: "flex-end" }}>
                                <Button type="button" variant="ghost" className="text-gray-400" onClick={() => setShowForm(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" className="btn-primary">
                                    Salvar
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deleteTarget && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center",
                    zIndex: 1100, backdropFilter: "blur(4px)", padding: "1rem"
                }}>
                    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--shadow-surface)] rounded-[var(--radius-lg)] p-6 transition-colors" style={{ width: "95%", maxWidth: "440px", background: "rgba(20,12,8,0.98)", border: "1px solid rgba(255,107,107,0.35)" }}>
                        <h2 style={{ color: "#ff6b6b", marginBottom: "0.75rem", fontSize: "1.25rem", fontWeight: 800 }}>
                            Excluir pista
                        </h2>
                        <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem", lineHeight: 1.6 }}>
                            A pista "{deleteTarget.riddle}" será removida da caça ao tesouro.
                        </p>
                        <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                            <Button type="button" variant="ghost" className="text-gray-400" onClick={() => setDeleteTarget(null)}>
                                Cancelar
                            </Button>
                            <Button type="button" className="btn-primary" onClick={handleDelete}>
                                Excluir
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
