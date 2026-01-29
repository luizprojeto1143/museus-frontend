import React, { useState, useEffect, useCallback } from "react";
import { api, isDemoMode } from "../../../api/client";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { User, Lock, Mail, Building, ArrowLeft, Save, Shield } from "lucide-react";
import "./MasterShared.css";

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
    return (
      <div className="master-page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ color: '#94a3b8' }}>{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="master-page-container">
      {/* HERO SECTION */}
      <section className="master-hero" style={{ padding: '2rem 1rem', marginBottom: '2rem' }}>
        <div className="master-hero-content">
          <button
            onClick={() => navigate('/master/users')}
            className="master-btn btn-outline"
            style={{ width: 'auto', position: 'absolute', top: '1rem', left: '1rem', marginTop: 0, padding: '0.5rem 1rem' }}
          >
            <ArrowLeft size={16} />
            {t("common.back")}
          </button>

          <span className="master-badge">
            {isEdit ? '✏️ Editar Usuário' : '✨ Novo Usuário'}
          </span>
          <h1 className="master-title">
            {isEdit ? name : t("master.userForm.newTitle")}
          </h1>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="master-card" style={{ maxWidth: 600, margin: '0 auto' }}>

        <div className="master-card-header">
          <div className="master-icon-wrapper master-icon-blue">
            <User size={24} />
          </div>
          <h3>Dados do Usuário</h3>
        </div>

        <div className="master-form">
          <div className="master-input-group">
            <label htmlFor="name">{t("master.userForm.labels.name")}</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', top: '14px', left: '12px', color: '#64748b' }} />
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("master.userForm.placeholders.name")}
                required
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <div className="master-input-group">
            <label htmlFor="email">{t("master.userForm.labels.email")}</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', top: '14px', left: '12px', color: '#64748b' }} />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("master.userForm.placeholders.email")}
                required
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <div className="master-input-group">
            <label htmlFor="password">{t("master.userForm.labels.password")}</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', top: '14px', left: '12px', color: '#64748b' }} />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isEdit ? t("master.userForm.placeholders.passwordEdit") : t("master.userForm.placeholders.password")}
                required={!isEdit}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
            {isEdit && (
              <p style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.25rem" }}>
                {t("master.userForm.helpers.passwordEdit")}
              </p>
            )}
          </div>

          <hr style={{ border: 0, borderTop: '1px solid rgba(255,255,255,0.1)', margin: '1rem 0' }} />

          <div className="master-input-group">
            <label htmlFor="role">{t("master.userForm.labels.role")}</label>
            <div style={{ position: 'relative' }}>
              <Shield size={16} style={{ position: 'absolute', top: '14px', left: '12px', color: '#64748b' }} />
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              >
                <option value="MASTER">{t("master.userForm.roles.master")}</option>
                <option value="ADMIN">{t("master.userForm.roles.admin")}</option>
              </select>
            </div>
          </div>

          {role === "ADMIN" && (
            <div className="master-input-group">
              <label htmlFor="tenantId">{t("master.userForm.labels.tenant")}</label>
              <div style={{ position: 'relative' }}>
                <Building size={16} style={{ position: 'absolute', top: '14px', left: '12px', color: '#64748b' }} />
                <select
                  id="tenantId"
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value)}
                  required
                  style={{ paddingLeft: '2.5rem' }}
                >
                  <option value="">{t("master.userForm.placeholders.selectTenant")}</option>
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: "0.75rem", marginTop: "2rem" }}>
          <button type="submit" className="master-btn btn-primary">
            <Save size={18} />
            {t("common.save")}
          </button>
        </div>
      </form>
    </div>
  );
};
