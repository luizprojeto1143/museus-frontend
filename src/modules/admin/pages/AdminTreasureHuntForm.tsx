import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface Clue {
    id: string;
    riddle: string;
    targetWorkId: string;
    xpReward: number;
    isActive: boolean;
}

export const AdminTreasureHuntForm: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const [formData, setFormData] = useState<Clue>({
        id: "",
        riddle: "",
        targetWorkId: "",
        xpReward: 50,
        isActive: true
    });

    useEffect(() => {
        if (id) {
            const clues = JSON.parse(localStorage.getItem("treasure_clues") || "[]");
            const found = clues.find((c: Clue) => c.id === id);
            if (found) {
                // We can't avoid setState here easily without refactoring, but we can check if it's different
                setFormData(prev => (prev.id === found.id ? prev : found));
            }
        }
    }, [id]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const clues = JSON.parse(localStorage.getItem("treasure_clues") || "[]");

        if (id) {
            const index = clues.findIndex((c: Clue) => c.id === id);
            clues[index] = formData;
        } else {
            const newClue = { ...formData, id: Date.now().toString() };
            clues.push(newClue);
        }

        localStorage.setItem("treasure_clues", JSON.stringify(clues));
        navigate("/admin/treasure-hunt");
    };

    return (
        <div className="admin-page">
            <header className="admin-header">
                <h1 className="admin-title">
                    {id ? t("admin.treasure.editClue", "Editar Pista") : t("admin.treasure.newClue", "Nova Pista")}
                </h1>
            </header>

            <div className="card" style={{ maxWidth: "600px" }}>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

                    <div className="form-group">
                        <label className="form-label">{t("admin.treasure.riddle", "Charada")}</label>
                        <textarea
                            className="form-input"
                            rows={3}
                            required
                            value={formData.riddle}
                            onChange={(e) => setFormData({ ...formData, riddle: e.target.value })}
                            placeholder="Ex: Procure a obra onde..."
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">{t("admin.treasure.target", "ID da Obra Alvo")}</label>
                        <input
                            type="text"
                            className="form-input"
                            required
                            value={formData.targetWorkId}
                            onChange={(e) => setFormData({ ...formData, targetWorkId: e.target.value })}
                            placeholder="Ex: 1"
                        />
                        <small style={{ color: "#6b7280" }}>O ID da obra que o visitante deve encontrar.</small>
                    </div>

                    <div className="form-group">
                        <label className="form-label">{t("admin.treasure.xp", "Recompensa (XP)")}</label>
                        <input
                            type="number"
                            className="form-input"
                            required
                            min={10}
                            value={formData.xpReward}
                            onChange={(e) => setFormData({ ...formData, xpReward: Number(e.target.value) })}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <input
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                style={{ marginRight: "0.5rem" }}
                            />
                            {t("common.active", "Ativo")}
                        </label>
                    </div>

                    <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                        <button type="button" className="btn btn-secondary" onClick={() => navigate("/admin/treasure-hunt")}>
                            {t("common.cancel", "Cancelar")}
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {t("common.save", "Salvar")}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};
