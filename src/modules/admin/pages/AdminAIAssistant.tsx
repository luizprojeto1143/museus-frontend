import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";

interface ChatPersona {
  systemPrompt: string;
  tone: string;
  style: string;
  historicalContext: string;
  references: string[];
  temperature: number;
  maxTokens: number;
}

export const AdminAIAssistant: React.FC = () => {
  const { t } = useTranslation();
  const { tenantId } = useAuth();
  const [persona, setPersona] = useState<ChatPersona>({
    systemPrompt: "",
    tone: "formal-educativo",
    style: "histórico-cultural",
    historicalContext: "",
    references: [],
    temperature: 0.7,
    maxTokens: 500
  });
  const [testMessage, setTestMessage] = useState("");
  const [testResponse, setTestResponse] = useState("");
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadPersona = React.useCallback(async () => {
    try {
      const res = await api.get(`/persona/${tenantId}`);
      if (res.data) {
        setPersona(res.data);
      }
    } catch {
      // ignore error
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    loadPersona();
  }, [loadPersona]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post(`/persona/${tenantId}`, { ...persona });
      alert(t("admin.aiAssistant.alerts.success"));
    } catch {
      alert(t("admin.aiAssistant.alerts.errorSave"));
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!testMessage.trim()) {
      alert(t("admin.aiAssistant.alerts.emptyTest"));
      return;
    }

    setTesting(true);
    setTestResponse("");

    try {
      const res = await api.post(`/ai/test`, {
        tenantId,
        message: testMessage,
        persona
      });
      setTestResponse(res.data.response);
    } catch {
      setTestResponse(t("admin.aiAssistant.alerts.errorTest"));
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return <p>{t("common.loading")}</p>;
  }

  return (
    <div>
      <h1 className="section-title">🤖 {t("admin.aiAssistant.title")}</h1>
      <p className="section-subtitle">
        {t("admin.aiAssistant.subtitle")}
      </p>

      {/* System Prompt */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <h2 className="card-title">💬 {t("admin.aiAssistant.sections.prompt")}</h2>
        <p className="card-subtitle">
          {t("admin.aiAssistant.sections.promptSubtitle")}
        </p>

        <div className="form-group">
          <label className="form-label">{t("admin.aiAssistant.labels.systemPrompt")}</label>
          <textarea
            value={persona.systemPrompt}
            onChange={(e) => setPersona({ ...persona, systemPrompt: e.target.value })}
            placeholder={t("admin.aiAssistant.placeholders.systemPrompt")}
            rows={8}
            style={{ fontFamily: "monospace", fontSize: "0.85rem" }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
          <div className="form-group">
            <label className="form-label">{t("admin.aiAssistant.labels.tone")}</label>
            <select
              value={persona.tone}
              onChange={(e) => setPersona({ ...persona, tone: e.target.value })}
            >
              <option value="formal-educativo">{t("admin.aiAssistant.options.tone.formal")}</option>
              <option value="amigavel-acessivel">{t("admin.aiAssistant.options.tone.friendly")}</option>
              <option value="entusiasta-apaixonado">{t("admin.aiAssistant.options.tone.enthusiastic")}</option>
              <option value="academico-rigoroso">{t("admin.aiAssistant.options.tone.academic")}</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">{t("admin.aiAssistant.labels.style")}</label>
            <select
              value={persona.style}
              onChange={(e) => setPersona({ ...persona, style: e.target.value })}
            >
              <option value="historico-cultural">{t("admin.aiAssistant.options.style.historical")}</option>
              <option value="contemporaneo-dinamico">{t("admin.aiAssistant.options.style.contemporary")}</option>
              <option value="poetico-artistico">{t("admin.aiAssistant.options.style.poetic")}</option>
              <option value="didatico-simples">{t("admin.aiAssistant.options.style.didactic")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contexto Histórico */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <h2 className="card-title">📚 {t("admin.aiAssistant.sections.context")}</h2>
        <div className="form-group">
          <label className="form-label">{t("admin.aiAssistant.labels.context")}</label>
          <textarea
            value={persona.historicalContext}
            onChange={(e) => setPersona({ ...persona, historicalContext: e.target.value })}
            placeholder={t("admin.aiAssistant.placeholders.context")}
            rows={6}
          />
        </div>
      </div>

      {/* Referências */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <h2 className="card-title">🔗 {t("admin.aiAssistant.sections.references")}</h2>
        <p className="card-subtitle">
          {t("admin.aiAssistant.sections.referencesSubtitle")}
        </p>
        <div className="form-group">
          <label className="form-label">{t("admin.aiAssistant.labels.references")}</label>
          <textarea
            value={persona.references.join("\n")}
            onChange={(e) => setPersona({ ...persona, references: e.target.value.split("\n").filter(r => r.trim()) })}
            placeholder={t("admin.aiAssistant.placeholders.references")}
            rows={5}
          />
        </div>
      </div>

      {/* Parâmetros Avançados */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <h2 className="card-title">⚙️ {t("admin.aiAssistant.sections.advanced")}</h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
          <div className="form-group">
            <label className="form-label">
              {t("admin.aiAssistant.labels.temperature")}: {persona.temperature}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={persona.temperature}
              onChange={(e) => setPersona({ ...persona, temperature: parseFloat(e.target.value) })}
            />
            <p style={{ fontSize: "0.75rem", color: "var(--fg-soft)", marginTop: "0.25rem" }}>
              {t("admin.aiAssistant.helpers.temperature")}
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">{t("admin.aiAssistant.labels.maxTokens")}</label>
            <input
              type="number"
              min="100"
              max="2000"
              step="50"
              value={persona.maxTokens}
              onChange={(e) => setPersona({ ...persona, maxTokens: parseInt(e.target.value) })}
            />
            <p style={{ fontSize: "0.75rem", color: "var(--fg-soft)", marginTop: "0.25rem" }}>
              {t("admin.aiAssistant.helpers.maxTokens")}
            </p>
          </div>
        </div>
      </div>

      {/* Teste */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <h2 className="card-title">🧪 {t("admin.aiAssistant.sections.test")}</h2>
        <p className="card-subtitle">
          {t("admin.aiAssistant.sections.testSubtitle")}
        </p>

        <div className="form-group">
          <label className="form-label">{t("admin.aiAssistant.labels.testMessage")}</label>
          <textarea
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder={t("admin.aiAssistant.placeholders.testMessage")}
            rows={3}
          />
        </div>

        <button
          onClick={handleTest}
          disabled={testing}
          className="btn btn-secondary"
          style={{ marginBottom: "1rem" }}
        >
          {testing ? t("admin.aiAssistant.buttons.testing") : `🧪 ${t("admin.aiAssistant.buttons.test")}`}
        </button>

        {testResponse && (
          <div
            style={{
              padding: "1rem",
              background: "rgba(212, 175, 55, 0.1)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-subtle)",
              marginTop: "1rem"
            }}
          >
            <div style={{ fontSize: "0.8rem", color: "var(--fg-soft)", marginBottom: "0.5rem" }}>
              {t("admin.aiAssistant.response")}
            </div>
            <div style={{ whiteSpace: "pre-wrap" }}>{testResponse}</div>
          </div>
        )}
      </div>

      {/* Botão Salvar */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="btn btn-primary"
        style={{ width: "100%", padding: "1rem", fontSize: "1rem" }}
      >
        {saving ? t("admin.aiAssistant.buttons.saving") : `💾 ${t("admin.aiAssistant.buttons.save")}`}
      </button>

      {/* Aviso */}
      <div
        style={{
          marginTop: "1.5rem",
          padding: "1rem",
          background: "rgba(59, 130, 246, 0.1)",
          borderRadius: "var(--radius-md)",
          border: "1px solid rgba(59, 130, 246, 0.3)",
          fontSize: "0.85rem"
        }}
      >
        💡 <strong>{t("admin.aiAssistant.helpers.tip")}</strong>
      </div>
    </div>
  );
};
