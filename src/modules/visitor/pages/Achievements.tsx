
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useGamification } from "../../gamification/context/GamificationContext";

type Achievement = {
  title: string;
  description: string;
};

export default function Achievements() {
  const { t } = useTranslation();
  const { stats } = useGamification();

  return (
    <div>
      <h1 className="section-title">{t("visitor.achievements.title")}</h1>
      <p className="section-subtitle">{t("visitor.achievements.subtitle")}</p>

      <div className="card-grid">
        {stats.achievements.map((a, i) => {
          const isUnlocked = !!a.unlockedAt;
          return (
            <div
              key={i}
              className="card"
              style={{
                padding: "1.5rem",
                opacity: isUnlocked ? 1 : 0.6,
                filter: isUnlocked ? "none" : "grayscale(100%)",
                textAlign: "center",
                border: isUnlocked ? "2px solid var(--primary)" : "2px solid transparent"
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>{a.icon}</div>
              <h3 className="card-title">{a.title}</h3>
              <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.5rem" }}>{a.description}</p>
              {isUnlocked ? (
                <span className="chip" style={{ background: "#dcfce7", color: "#166534" }}>Desbloqueada</span>
              ) : (
                <span className="chip" style={{ background: "#f3f4f6", color: "#6b7280" }}>Bloqueada</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
