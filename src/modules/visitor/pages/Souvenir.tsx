
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
      <button className="btn" onClick={generate} disabled={loading}>
        {loading ? t("visitor.souvenir.generating") : t("visitor.souvenir.generate")}
      </button>

      {text && (
        <div className="card" style={{ marginTop: "1rem", padding: "1rem" }}>
          <p>{text}</p>
        </div>
      )}
    </div>
  );
}
