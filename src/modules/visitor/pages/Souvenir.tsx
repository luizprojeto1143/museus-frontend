import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Sparkles, Share2 } from "lucide-react";
import "./Souvenir.css";

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
    <div className="souvenir-container">
      <header className="souvenir-header">
        <h1 className="souvenir-title">{t("visitor.souvenir.title")}</h1>
        <p className="souvenir-subtitle">{t("visitor.souvenir.subtitle")}</p>
      </header>

      <div className="souvenir-generate-card">
        <p className="souvenir-description">
          {t("visitor.souvenir.description", "Gere um souvenir digital único baseado na sua visita de hoje!")}
        </p>

        <button className="souvenir-generate-btn" onClick={generate} disabled={loading}>
          {loading ? (
            <>
              <span className="souvenir-spinner"></span>
              {t("visitor.souvenir.generating", "Gerando...")}
            </>
          ) : (
            <>
              <Sparkles size={20} />
              {t("visitor.souvenir.generate", "Gerar Souvenir")}
            </>
          )}
        </button>
      </div>

      {text && (
        <div className="souvenir-result-card">
          <h3 className="souvenir-result-title">
            📜 {t("visitor.souvenir.resultTitle", "Seu Souvenir")}
          </h3>
          <p className="souvenir-result-text">{text}</p>

          <button className="souvenir-share-btn">
            <Share2 size={16} />
            {t("common.share", "Compartilhar")}
          </button>
        </div>
      )}
    </div>
  );
}
