import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api, isDemoMode } from "../../../api/client";

export const TenantForm: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [plan, setPlan] = useState("START");
  const [maxWorks, setMaxWorks] = useState(50);

  const loadTenant = async () => {
    try {
      const res = await api.get(`/tenants/${id}`);
      const data = res.data;
      setName(data.name);
      setSlug(data.slug);
      setPlan(data.plan || "START");
      setMaxWorks(data.maxWorks || 50);
    } catch {
      console.error("Failed to load tenant");
      alert(t("common.errorLoad"));
      navigate("/master/tenants");
    }
  };

  React.useEffect(() => {
    if (isEdit && id) {
      loadTenant();
    }
  }, [isEdit, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isDemoMode) {
      alert(t("master.tenantForm.demoAlert"));
      navigate("/master/tenants");
      return;
    }

    interface TenantPayload {
      name: string;
      slug: string;
      adminEmail?: string;
      adminName?: string;
      adminPassword?: string;
      plan?: string;
      maxWorks?: number;
    }

    const payload: TenantPayload = {
      name,
      slug,
      plan,
      maxWorks
    };

    if (!isEdit) {
      payload.adminEmail = adminEmail;
      payload.adminName = adminName;
      payload.adminPassword = adminPassword;
      payload.plan = plan;
    }

    try {
      if (id) {
        await api.put(`/tenants/${id}`, payload);
      } else {
        await api.post("/tenants", payload);
      }
      navigate("/master/tenants");
    } catch (error) {
      console.error("Erro ao salvar tenant", error);
      alert(t("master.tenantForm.errorSave"));
    }
  };

  return (
    <div>
      <h1 className="section-title">
        {isEdit ? t("master.tenantForm.editTitle") : t("master.tenantForm.newTitle")}
      </h1>
      <p className="section-subtitle">
        {t("master.tenantForm.subtitle")}
      </p>

      <form onSubmit={handleSubmit} className="card" style={{ maxWidth: 720 }}>
        <div className="form-group">
          <label htmlFor="name">{t("master.tenantForm.labels.name")}</label>
          <input
            id="name"
            className="input"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={t("master.tenantForm.placeholders.name")}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="plan">{t("master.tenantForm.labels.plan")}</label>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <select
              id="plan"
              className="input"
              value={plan}
              onChange={e => {
                setPlan(e.target.value);
                // Auto-set limits
                if (e.target.value === "START") setMaxWorks(50);
                if (e.target.value === "PRO") setMaxWorks(200);
                if (e.target.value === "ENTERPRISE") setMaxWorks(500);
              }}
              style={{ flex: 1 }}
            >
              <option value="START">{t("master.tenantForm.plans.start")}</option>
              <option value="PRO">{t("master.tenantForm.plans.pro")}</option>
              <option value="ENTERPRISE">{t("master.tenantForm.plans.enterprise")}</option>
              <option value="CUSTOM">{t("master.tenantForm.plans.custom")}</option>
            </select>
            {plan === "CUSTOM" && (
              <input
                className="input"
                placeholder={t("master.tenantForm.placeholders.customPlan")}
                onChange={e => setPlan(e.target.value)}
                style={{ flex: 1 }}
              />
            )}
          </div>
          <p style={{ fontSize: "0.8rem", color: "#9ca3af", marginTop: "0.25rem" }}>
            {t("master.tenantForm.helpers.plan")}
          </p>
          <input
            className="input"
            value={plan}
            onChange={e => setPlan(e.target.value)}
            placeholder={t("master.tenantForm.labels.customPlan")}
            style={{ marginTop: "0.5rem" }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="maxWorks">{t("master.tenantForm.labels.maxWorks")}</label>
          <input
            id="maxWorks"
            type="number"
            className="input"
            value={maxWorks}
            onChange={e => setMaxWorks(parseInt(e.target.value))}
          />
          <p style={{ fontSize: "0.8rem", color: "#9ca3af", marginTop: "0.25rem" }}>
            {t("master.tenantForm.helpers.maxWorks")}
          </p>
        </div>

        <div className="form-group">
          <label htmlFor="slug">{t("master.tenantForm.labels.slug")}</label>
          <input
            id="slug"
            className="input"
            value={slug}
            onChange={e => setSlug(e.target.value)}
            placeholder={t("master.tenantForm.placeholders.slug")}
            required
          />
          <p style={{ fontSize: "0.8rem", color: "#9ca3af", marginTop: "0.25rem" }}>
            {t("master.tenantForm.helpers.slug")}
          </p>
        </div>

        {!isEdit && (
          <>
            <h2 style={{ fontSize: "1.1rem", marginTop: "1.5rem", marginBottom: "1rem" }}>
              {t("master.tenantForm.labels.adminSection")}
            </h2>

            <div className="form-group">
              <label htmlFor="adminName">{t("master.tenantForm.labels.adminName")}</label>
              <input
                id="adminName"
                className="input"
                value={adminName}
                onChange={e => setAdminName(e.target.value)}
                placeholder={t("master.tenantForm.placeholders.adminName")}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="adminEmail">{t("master.tenantForm.labels.adminEmail")}</label>
              <input
                id="adminEmail"
                type="email"
                className="input"
                value={adminEmail}
                onChange={e => setAdminEmail(e.target.value)}
                placeholder={t("master.tenantForm.placeholders.adminEmail")}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="adminPassword">{t("master.tenantForm.labels.adminPassword")}</label>
              <input
                id="adminPassword"
                type="password"
                className="input"
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                placeholder={t("master.tenantForm.placeholders.adminPassword")}
                required
              />
            </div>
          </>
        )}

        <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem" }}>
          <button type="submit" className="btn">
            {t("common.save")}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/master/tenants")}
          >
            {t("common.cancel")}
          </button>
        </div>
      </form>
    </div>
  );
};
