import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../../api/client";
import { useAuth } from "../../../auth/AuthContext";
import { XCircle } from "lucide-react";

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
  const { tenantId, hasPermission } = useAuth();
  const [persona, setPersona] = useState<ChatPersona>({
    systemPrompt: "",
    tone: "formal-educativo",
    style: "histórico-cultural",
    historicalContext: "",
    references: [],
    temperature: 0.7,
    maxTokens: 500
  });

  if (!hasPermission("manage_chat_ai")) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <XCircle size={40} className="text-red-500 opacity-50" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Treinamento Restrito</h2>
        <p className="text-zinc-500 max-w-sm">Apenas usuários com a flag <strong>manage_chat_ai</strong> podem configurar a base de conhecimento da IA.</p>
      </div>
    );
  }
  const [testMessage, setTestMessage] = useState("");
  const [testResponse, setTestResponse] = useState("");
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadPersona = React.useCallback(async () => {
    try {
      const res = await api.get(`/persona/${tenantId}`);
      if (res.data) {
        // Merge with defaults to avoid undefined fields
        setPersona(prev => ({
          ...prev,
          ...res.data,
          references: res.data.references || [], // Ensure array
        }));
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


      {/* Instruções da IA */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--shadow-surface)] rounded-[var(--radius-lg)] p-6 transition-colors" style={{ marginBottom: "2rem" }}>
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
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--shadow-surface)] rounded-[var(--radius-lg)] p-6 transition-colors" style={{ marginBottom: "2rem" }}>
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
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--shadow-surface)] rounded-[var(--radius-lg)] p-6 transition-colors" style={{ marginBottom: "2rem" }}>
        <h2 className="card-title">🔗 {t("admin.aiAssistant.sections.references")}</h2>
        <p className="card-subtitle">
          {t("admin.aiAssistant.sections.referencesSubtitle")}
        </p>
        <div className="form-group">
          <label className="form-label">{t("admin.aiAssistant.labels.references")}</label>
          <textarea
            value={persona.references?.join("\n") || ""}
            onChange={(e) => setPersona({ ...persona, references: e.target.value.split("\n").filter(r => r.trim()) })}
            placeholder={t("admin.aiAssistant.placeholders.references")}
            rows={5}
          />
        </div>
      </div>

      {/* Parâmetros Avançados */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--shadow-surface)] rounded-[var(--radius-lg)] p-6 transition-colors" style={{ marginBottom: "2rem" }}>
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
              onChange={(e) => setPersona({ ...persona, temperature: e.target.value === "" ? 0.7 : parseFloat(e.target.value) })}
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
              onChange={(e) => setPersona({ ...persona, maxTokens: e.target.value === "" ? 500 : parseInt(e.target.value) })}
            />
            <p style={{ fontSize: "0.75rem", color: "var(--fg-soft)", marginTop: "0.25rem" }}>
              {t("admin.aiAssistant.helpers.maxTokens")}
            </p>
          </div>
        </div>
      </div>

      {/* Teste */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-[var(--shadow-surface)] rounded-[var(--radius-lg)] p-6 transition-colors" style={{ marginBottom: "2rem" }}>
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
          className="inline-flex items-center justify-center gap-2 font-bold uppercase tracking-wider transition-colors cursor-pointer border bg-[var(--glass-bg-light)] text-[var(--fg-main)] border-[var(--border-default)] backdrop-blur-sm text-[13px] px-5 py-2.5 rounded-[var(--radius-md)]"
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
        className="inline-flex items-center justify-center gap-2 font-bold uppercase tracking-wider transition-colors cursor-pointer border bg-[var(--accent-primary)] text-[var(--fg-inverse)] border-transparent shadow-[var(--shadow-glow)] text-[13px] px-5 py-2.5 rounded-[var(--radius-md)]"
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
