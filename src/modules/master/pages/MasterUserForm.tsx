import React, { useState, useEffect, useCallback } from "react";
import { api, isDemoMode } from "../../../api/client";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { User, Lock, Mail, Building, ArrowLeft, Save, Shield } from "lucide-react";
import { Button, Input, Select } from "../../../components/ui";
import { useToast } from "../../../contexts/ToastContext";
import "./MasterShared.css";

export const MasterUserForm: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { addToast } = useToast();

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
        addToast(t("common.errorLoad"), "error");
        navigate("/master/users");
      } finally {
        setLoading(false);
      }
    }
  }, [isEdit, id, navigate, t, addToast]);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isDemoMode) {
      addToast(t("master.userForm.demoAlert"), "info");
      navigate("/master/users");
      return;
    }

    if (role === "ADMIN" && !tenantId) {
      addToast(t("master.userForm.alerts.selectTenant"), "info");
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
      role,
      tenantId: role === "ADMIN" ? tenantId : null
    };

    if (!isEdit || password) {
      payload.password = password;
    }

    try {
      if (id) {
        await api.put(`/users/${id}`, payload);
        addToast("Usuário atualizado com sucesso!", "success");
      } else {
        await api.post("/users", payload);
        addToast("Usuário criado com sucesso!", "success");
      }
      navigate("/master/users");
    } catch (error) {
      console.error("Erro ao salvar usuário", error);
      addToast(t("master.userForm.alerts.errorSave"), "error");
    }
  };

  if (loading) {
    return (
      <div className="master-page-container flex justify-center items-center">
        <p className="text-slate-400">{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="master-page-container">
      {/* HERO SECTION */}
      <section className="master-hero" style={{ padding: '2rem 1rem', marginBottom: '2rem', position: 'relative' }}>
        <div className="master-hero-content">
          <Button
            variant="outline"
            onClick={() => navigate('/master/users')}
            className="absolute top-4 left-4 w-auto h-auto py-2 px-4 text-xs"
            leftIcon={<ArrowLeft size={16} />}
          >
            {t("common.back")}
          </Button>

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

        <div className="master-form space-y-4">
          <Input
            label={t("master.userForm.labels.name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("master.userForm.placeholders.name")}
            required
            leftIcon={<User size={16} />}
          />

          <Input
            label={t("master.userForm.labels.email")}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("master.userForm.placeholders.email")}
            required
            leftIcon={<Mail size={16} />}
          />

          <Input
            label={t("master.userForm.labels.password")}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isEdit ? t("master.userForm.placeholders.passwordEdit") : t("master.userForm.placeholders.password")}
            required={!isEdit}
            leftIcon={<Lock size={16} />}
            helperText={isEdit ? t("master.userForm.helpers.passwordEdit") : undefined}
          />

          <hr className="border-white/10 my-4" />

          <Select
            label={t("master.userForm.labels.role")}
            value={role}
            onChange={(e) => setRole(e.target.value)}
            leftIcon={<Shield size={16} />}
          >
            <option value="MASTER">{t("master.userForm.roles.master")}</option>
            <option value="ADMIN">{t("master.userForm.roles.admin")}</option>
          </Select>

          {role === "ADMIN" && (
            <Select
              label={t("master.userForm.labels.tenant")}
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              required
              leftIcon={<Building size={16} />}
            >
              <option value="">{t("master.userForm.placeholders.selectTenant")}</option>
              {tenants.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </Select>
          )}
        </div>

        <div className="mt-8">
          <Button
            type="submit"
            className="w-full"
            leftIcon={<Save size={18} />}
          >
            {t("common.save")}
          </Button>
        </div>
      </form>
    </div>
  );
};
