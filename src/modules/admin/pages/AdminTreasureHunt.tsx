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

    return (
        <div className="admin-page">
            <header className="admin-header">
                <h1 className="admin-title">🏴‍☠️ {t("admin.treasure.title", "Caça ao Tesouro")}</h1>
            </header>

            <div className="card">
                <div style={{ textAlign: "center", padding: "2rem" }}>
                    <p style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>
                        🤖 <strong>{t("admin.treasure.automatedTitle", "Modo Automático Ativo")}</strong>
                    </p>
                    <p style={{ color: "var(--text-secondary)" }}>
                        {t("admin.treasure.automatedDescription", "O sistema de Caça ao Tesouro está configurado para gerar pistas automaticamente com base nas obras cadastradas e publicadas no acervo. Não é necessária configuração manual de pistas neste momento.")}
                    </p>
                </div>
            </div>
        </div>
    );
};
