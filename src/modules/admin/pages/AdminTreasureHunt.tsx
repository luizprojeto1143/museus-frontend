import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface Clue {
    id: string;
    riddle: string;
    targetWorkId: string;
    xpReward: number;
    isActive: boolean;
}

export const AdminTreasureHunt: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [clues, setClues] = useState<Clue[]>(() => {
        const stored = localStorage.getItem("treasure_clues");
        if (stored) {
            return JSON.parse(stored);
        }
        // Mock initial data
        const initial: Clue[] = [
            { id: "1", riddle: "Procure a obra onde o céu gira em espirais.", targetWorkId: "1", xpReward: 50, isActive: true },
            { id: "2", riddle: "Ela sorri, mas ninguém sabe o porquê.", targetWorkId: "2", xpReward: 100, isActive: true }
        ];
        localStorage.setItem("treasure_clues", JSON.stringify(initial));
        return initial;
    });

    const handleDelete = (id: string) => {
        if (confirm(t("common.confirmDelete", "Tem certeza?"))) {
            const updated = clues.filter(c => c.id !== id);
            setClues(updated);
            localStorage.setItem("treasure_clues", JSON.stringify(updated));
        }
    };

    return (
        <div className="admin-page">
            <header className="admin-header">
                <h1 className="admin-title">🏴‍☠️ {t("admin.treasure.title", "Caça ao Tesouro")}</h1>
                <button className="btn btn-primary" onClick={() => navigate("/admin/treasure-hunt/new")}>
                    + {t("admin.treasure.newClue", "Nova Pista")}
                </button>
            </header>

            <div className="card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>{t("admin.treasure.riddle", "Charada")}</th>
                            <th>{t("admin.treasure.target", "Obra Alvo (ID)")}</th>
                            <th>XP</th>
                            <th>Status</th>
                            <th>{t("common.actions", "Ações")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clues.map((clue) => (
                            <tr key={clue.id}>
                                <td>{clue.riddle}</td>
                                <td>{clue.targetWorkId}</td>
                                <td>{clue.xpReward}</td>
                                <td>
                                    <span className={`badge ${clue.isActive ? "badge-success" : "badge-warning"}`}>
                                        {clue.isActive ? "Ativo" : "Inativo"}
                                    </span>
                                </td>
                                <td>
                                    <button
                                        className="btn-icon"
                                        onClick={() => navigate(`/admin/treasure-hunt/${clue.id}`)}
                                        title={t("common.edit", "Editar")}
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        className="btn-icon danger"
                                        onClick={() => handleDelete(clue.id)}
                                        title={t("common.delete", "Excluir")}
                                    >
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
