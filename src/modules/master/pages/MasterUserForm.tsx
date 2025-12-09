import React, { useState } from "react";
import { api, isDemoMode } from "../../../api/client";
import { useParams, useNavigate } from "react-router-dom";

export const MasterUserForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("ADMIN");
  const [tenantId, setTenantId] = useState("");
  const [tenants, setTenants] = useState<Array<{ id: string; name: string }>>([]);

  React.useEffect(() => {
    if (!isDemoMode) {
      api.get("/tenants").then(res => setTenants(res.data)).catch(console.error);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isDemoMode) {
      alert("Simulação de criação de usuário (modo demo).");
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

    if (!isEdit) {
      payload.password = password;
    }

    if (role === "ADMIN") {
      if (!tenantId) {
        alert("Selecione um museu para o usuário ADMIN.");
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
      alert("Erro ao salvar usuário.");
    }
  };

  return (
    <div>
      <h1 className="section-title">
        {isEdit ? "Editar usuário" : "Novo usuário"}
      </h1>
      <p className="section-subtitle">
        Crie usuários MASTER (gestores da plataforma) ou ADMIN (gestores de museus específicos).
      </p>

      <form onSubmit={handleSubmit} className="card" style={{ maxWidth: 640 }}>
        <div className="form-group">
          <label htmlFor="name">Nome completo</label>
          <input
            id="name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: João Silva"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="usuario@email.com"
            required
          />
        </div>

        {!isEdit && (
          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha forte"
              required
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="role">Perfil</label>
          <select
            id="role"
            className="input"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="MASTER">MASTER (Gestor da plataforma)</option>
            <option value="ADMIN">ADMIN (Gestor de museu)</option>
          </select>
        </div>

        {role === "ADMIN" && (
          <div className="form-group">
            <label htmlFor="tenantId">Museu / Tenant</label>
            <select
              id="tenantId"
              className="input"
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              required
            >
              <option value="">Selecione um museu...</option>
              {tenants.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <p style={{ fontSize: "0.8rem", color: "#9ca3af", marginTop: "0.25rem" }}>
              O usuário terá acesso administrativo a este museu.
            </p>
          </div>
        )}

        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
          <button type="submit" className="btn">
            Salvar
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/master/users")}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};
