import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";

interface AchievementForm {
  code: string;
  title: string;
  description: string;
  xpReward: number;
  iconUrl: string;
  condition: string;
  autoTrigger: boolean;
  triggerType: "XP_THRESHOLD" | "VISIT_COUNT" | "TRAIL_COMPLETION" | "CATEGORY_COMPLETION" | "CUSTOM";
  triggerValue: number;
  active: boolean;
}

export const AdminAchievementForm: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { tenantId } = useAuth();
  const isEditing = !!id;

  const iconInputRef = React.useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<AchievementForm>({
    code: "",
    title: "",
    description: "",
    xpReward: 100,
    iconUrl: "",
    condition: "",
    autoTrigger: true,
    triggerType: "XP_THRESHOLD",
    triggerValue: 100,
    active: true
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadAchievement = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/achievements/${id}`);
      setForm(res.data);
    } catch {
      alert(t("admin.achievementForm.alerts.errorLoad"));
      navigate("/admin/conquistas");
    } finally {
      setLoading(false);
    }
  }, [id, navigate, t]);

  useEffect(() => {
    if (isEditing) {
      loadAchievement();
    }
  }, [id, isEditing, loadAchievement]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.code.trim() || !form.title.trim()) {
      alert(t("admin.achievementForm.alerts.required"));
      return;
    }

    setSaving(true);
    try {
      if (isEditing) {
        await api.put(`/achievements/${id}`, { ...form, tenantId });
        alert(t("admin.achievementForm.alerts.successUpdate"));
      } else {
        await api.post("/achievements", { ...form, tenantId });
        alert(t("admin.achievementForm.alerts.successCreate"));
      }
      navigate("/admin/conquistas");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const message = error.response?.data?.message || t("admin.achievementForm.alerts.errorSave");
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/upload/image", formData);
      setForm({ ...form, iconUrl: res.data.url });
    } catch {
      alert(t("admin.achievementForm.alerts.errorUpload"));
    }
  };

  if (loading) {
    return <p>{t("common.loading")}</p>;
  }

  return (
    <div>
      <h1 className="section-title">{isEditing ? t("admin.achievementForm.editTitle") : t("admin.achievementForm.newTitle")}</h1>
      <p className="section-subtitle">
        {isEditing ? t("admin.achievementForm.editSubtitle") : t("admin.achievementForm.newSubtitle")}
      </p>

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h2 className="card-title">{t("admin.achievementForm.sections.basic")}</h2>

          <div className="form-group">
            <label className="form-label">{t("admin.achievementForm.labels.code")} *</label>
            <input
              type="text"
              required
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().replace(/\s/g, '_') })}
              placeholder={t("admin.achievementForm.placeholders.code")}
              disabled={isEditing}
            />
            <p style={{ fontSize: "0.8rem", color: "var(--fg-soft)", marginTop: "0.25rem" }}>
              {isEditing ? t("admin.achievementForm.helpers.codeEdit") : t("admin.achievementForm.helpers.codeNew")}
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">{t("admin.achievementForm.labels.title")} *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder={t("admin.achievementForm.placeholders.title")}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t("admin.achievementForm.labels.description")}</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder={t("admin.achievementForm.placeholders.description")}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t("admin.achievementForm.labels.xp")} *</label>
            <input
              type="number"
              required
              min="0"
              value={form.xpReward}
              onChange={(e) => setForm({ ...form, xpReward: parseInt(e.target.value) })}
            />
          </div>

          {/* Ícone */}
          <div className="form-group">
            <label className="form-label">{t("admin.achievementForm.labels.icon")}</label>
            <div
              style={{
                width: "120px",
                height: "120px",
                margin: "0 auto",
                borderRadius: "50%",
                border: "3px solid var(--accent-gold)",
                background: form.iconUrl
                  ? `url(${form.iconUrl}) center/cover`
                  : "linear-gradient(135deg, var(--accent-gold), var(--accent-bronze))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "3rem",
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(212, 175, 55, 0.4)"
              }}
              onClick={() => iconInputRef.current?.click()}
            >
              {!form.iconUrl && "🏆"}
            </div>
            <input
              ref={iconInputRef}
              id="icon-upload"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />
            <p style={{ textAlign: "center", fontSize: "0.8rem", marginTop: "0.5rem", color: "var(--fg-soft)" }}>
              {t("admin.achievementForm.helpers.clickUpload")}
            </p>
          </div>
        </div>

        {/* Automação */}
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h2 className="card-title">🤖 {t("admin.achievementForm.sections.automation")}</h2>

          <div className="form-group">
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={form.autoTrigger}
                onChange={(e) => setForm({ ...form, autoTrigger: e.target.checked })}
              />
              <span className="form-label" style={{ marginBottom: 0 }}>
                {t("admin.achievementForm.labels.autoTrigger")}
              </span>
            </label>
            <p style={{ fontSize: "0.8rem", color: "var(--fg-soft)", marginTop: "0.25rem" }}>
              {t("admin.achievementForm.helpers.autoTrigger")}
            </p>
          </div>

          {form.autoTrigger && (
            <>
              <div className="form-group">
                <label className="form-label">{t("admin.achievementForm.labels.triggerType")}</label>
                <select
                  value={form.triggerType}
                  onChange={(e) => setForm({ ...form, triggerType: e.target.value as AchievementForm["triggerType"] })}
                >
                  <option value="XP_THRESHOLD">{t("admin.achievementForm.triggers.xp")}</option>
                  <option value="VISIT_COUNT">{t("admin.achievementForm.triggers.visit")}</option>
                  <option value="TRAIL_COMPLETION">{t("admin.achievementForm.triggers.trail")}</option>
                  <option value="CATEGORY_COMPLETION">{t("admin.achievementForm.triggers.category")}</option>
                  <option value="CUSTOM">{t("admin.achievementForm.triggers.custom")}</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">{t("admin.achievementForm.labels.triggerValue")}</label>
                <input
                  type="number"
                  min="1"
                  value={form.triggerValue}
                  onChange={(e) => setForm({ ...form, triggerValue: parseInt(e.target.value) })}
                  placeholder={t("admin.achievementForm.placeholders.triggerValue")}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t("admin.achievementForm.labels.condition")}</label>
                <input
                  type="text"
                  value={form.condition}
                  onChange={(e) => setForm({ ...form, condition: e.target.value })}
                  placeholder={t("admin.achievementForm.placeholders.condition")}
                />
              </div>
            </>
          )}
        </div>

        {/* Status */}
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <div className="form-group">
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              <span className="form-label" style={{ marginBottom: 0 }}>
                {t("admin.achievementForm.labels.active")}
              </span>
            </label>
          </div>
        </div>

        {/* Botões */}
        <div style={{ display: "flex", gap: "1rem" }}>
          <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1 }}>
            {saving ? t("admin.achievementForm.buttons.saving") : isEditing ? `💾 ${t("admin.achievementForm.buttons.saveEdit")}` : `✅ ${t("admin.achievementForm.buttons.saveNew")}`}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/admin/conquistas")}
            style={{ flex: 1 }}
          >
            {t("common.cancel")}
          </button>
        </div>
      </form>
    </div>
  );
};
