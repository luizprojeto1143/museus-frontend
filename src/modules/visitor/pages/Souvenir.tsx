
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";

export default function Souvenir() {
  const { t } = useTranslation();
  const { tenantId, email } = useAuth();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const res = await api.post("/ai/souvenir", { tenantId, email });
      setText(res.data.text);
    } catch {
      setText(t("visitor.souvenir.error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="section-title">{t("visitor.souvenir.title")}</h1>
      <p className="section-subtitle">{t("visitor.souvenir.subtitle")}</p>
      <div className="card" style={{ padding: "1.5rem", textAlign: "center" }}>
        <p style={{ marginBottom: "1.5rem", color: "#6b7280" }}>
          {t("visitor.souvenir.description", "Gere um souvenir digital único baseado na sua visita de hoje!")}
        </p>

        <button className="btn btn-primary" onClick={generate} disabled={loading} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          {loading ? (
            <>
              <span className="spinner" style={{ width: "16px", height: "16px", border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }}></span>
              {t("visitor.souvenir.generating", "Gerando...")}
            </>
          ) : (
            <>
              ✨ {t("visitor.souvenir.generate", "Gerar Souvenir")}
            </>
          )}
        </button>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>

      {text && (
        <div className="card" style={{ marginTop: "1rem", padding: "1.5rem", background: "linear-gradient(to bottom right, #fffbeb, #fef3c7)", border: "1px solid #fcd34d" }}>
          <h3 style={{ marginTop: 0, color: "#92400e", marginBottom: "1rem" }}>📜 {t("visitor.souvenir.resultTitle", "Seu Souvenir")}</h3>
          <p style={{ whiteSpace: "pre-wrap", lineHeight: "1.6", color: "#78350f" }}>{text}</p>
        </div>
      )}
    </div>
  );
}
