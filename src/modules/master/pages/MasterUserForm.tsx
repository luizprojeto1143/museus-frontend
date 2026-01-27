import React, { useState, useEffect, useCallback } from "react";
import { api, isDemoMode } from "../../../api/client";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const MasterUserForm: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("ADMIN");
  const [tenantId, setTenantId] = useState("");
  const [tenants, setTenants] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);

  const fetchTenants = useCallback(async () => {
    if (!isDemoMode) {
      try {
        const res = await api.get("/tenants");
        setTenants(res.data);
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  const loadUser = useCallback(async () => {
    if (isEdit && id && !isDemoMode) {
      setLoading(true);
      try {
        const res = await api.get(`/users/${id}`);
        const u = res.data;
        setEmail(u.email);
        setName(u.name);
        setRole(u.role);
        setTenantId(u.tenantId || "");
      } catch {
        alert(t("common.errorLoad"));
        navigate("/master/users");
      } finally {
        setLoading(false);
      }
    }
  }, [isEdit, id, navigate, t]);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isDemoMode) {
      alert(t("master.userForm.demoAlert"));
      navigate("/master/users");
      return;
    }

    interface UserPayload {
      email: string;
      name: string;
      role: string;
      password?: string;
      tenantId?: string | null;
    }

    const payload: UserPayload = {
      email,
      name,
      role
    };

    if (!isEdit || password) {
      payload.password = password;
    }

    if (role === "ADMIN") {
      if (!tenantId) {
        alert(t("master.userForm.alerts.selectTenant"));
        return;
      }
      payload.tenantId = tenantId;
    } else {
      payload.tenantId = null;
    }

    try {
      if (id) {
        await api.put(`/users/${id}`, payload);
      } else {
        await api.post("/users", payload);
      }
      navigate("/master/users");
    } catch (error) {
      console.error("Erro ao salvar usuário", error);
      alert(t("master.userForm.alerts.errorSave"));
    }
  };

  if (loading) {
    return <p>{t("common.loading")}</p>;
  }

  return (
    <div>
      <h1 className="section-title">
        {isEdit ? t("master.userForm.editTitle") : t("master.userForm.newTitle")}
      </h1>
      <p className="section-subtitle">
        {t("master.userForm.subtitle")}
      </p>

      <form onSubmit={handleSubmit} className="card" style={{ maxWidth: 640 }}>
        <div className="form-group">
          <label htmlFor="name">{t("master.userForm.labels.name")}</label>
          <input
            id="name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("master.userForm.placeholders.name")}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">{t("master.userForm.labels.email")}</label>
          <input
            id="email"
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("master.userForm.placeholders.email")}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">{t("master.userForm.labels.password")}</label>
          <input
            id="password"
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isEdit ? t("master.userForm.placeholders.passwordEdit") : t("master.userForm.placeholders.password")}
            required={!isEdit}
          />
          {isEdit && (
            <p style={{ fontSize: "0.8rem", color: "#9ca3af", marginTop: "0.25rem" }}>
              {t("master.userForm.helpers.passwordEdit")}
            </p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="role">{t("master.userForm.labels.role")}</label>
          <select
            id="role"
            className="input"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="MASTER">{t("master.userForm.roles.master")}</option>
            <option value="ADMIN">{t("master.userForm.roles.admin")}</option>
          </select>
        </div>

        {role === "ADMIN" && (
          <div className="form-group">
            <label htmlFor="tenantId">{t("master.userForm.labels.tenant")}</label>
            <select
              id="tenantId"
              className="input"
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              required
            >
              <option value="">{t("master.userForm.placeholders.selectTenant")}</option>
              {tenants.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <p style={{ fontSize: "0.8rem", color: "#9ca3af", marginTop: "0.25rem" }}>
              {t("master.userForm.helpers.tenant")}
            </p>
          </div>
        )}

        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
          <button type="submit" className="btn">
            {t("common.save")}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/master/users")}
          >
            {t("common.cancel")}
          </button>
        </div>
      </form>
    </div>
  );
};
