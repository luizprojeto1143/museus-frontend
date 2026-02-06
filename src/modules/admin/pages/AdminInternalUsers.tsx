import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";

interface InternalUser {
  id: string;
  name: string;
  email: string;
  role: "MASTER" | "ADMIN";
  tenantId: string | null;
  createdAt: string;
  lastLogin: string | null;
  active: boolean;
}

export const AdminInternalUsers: React.FC = () => {
  const { tenantId, role: currentUserRole } = useAuth();
  const [users, setUsers] = useState<InternalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const isMaster = currentUserRole === "master";



  const loadUsers = React.useCallback(async () => {
    try {
      const endpoint = isMaster ? "/users" : `/users?tenantId=${tenantId}`;
      const res = await api.get(endpoint);
      const usersData = res.data as InternalUser[];
      // Show MASTER and ADMIN users (internal users only)
      setUsers(usersData);
    } catch {
      console.error("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  }, [tenantId, isMaster]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      await api.patch(`/users/${userId}`, { active: !currentStatus });
      loadUsers();
    } catch {
      alert("Erro ao atualizar usuário");
    }
  };

  const handleResetPassword = async (userId: string) => {
    const newPassword = prompt("Digite a nova senha:");
    if (!newPassword || newPassword.length < 6) {
      alert("Senha deve ter pelo menos 6 caracteres");
      return;
    }

    try {
      await api.post(`/users/${userId}/reset-password`, { newPassword });
      alert("Senha redefinida com sucesso!");
    } catch {
      alert("Erro ao redefinir senha");
    }
  };

  const handleDelete = async (userId: string, userRole: string) => {
    if (userRole === "MASTER" && !isMaster) {
      alert("Apenas MASTER pode remover outros MASTER");
      return;
    }

    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;

    try {
      await api.delete(`/users/${userId}`);
      loadUsers();
    } catch {
      alert("Erro ao excluir usuário");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 className="section-title">👤 Usuários Internos</h1>
          <p className="section-subtitle">
            Gerencie administradores e permissões do sistema
          </p>
        </div>
        <Link to="/admin/usuarios/novo" className="btn btn-primary">
          + Novo Usuário
        </Link>
      </div>

      {/* Stats */}
      <div className="card-grid" style={{ marginBottom: "2rem" }}>
        <div className="stat-card">
          <div className="stat-value">{users.length}</div>
          <div className="stat-label">Total de Usuários</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{users.filter(u => u.role === "MASTER").length}</div>
          <div className="stat-label">Masters</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{users.filter(u => u.role === "ADMIN").length}</div>
          <div className="stat-label">Admins</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{users.filter(u => u.active).length}</div>
          <div className="stat-label">Ativos</div>
        </div>
      </div>

      {loading && <p>Carregando usuários...</p>}

      {!loading && users.length === 0 && (
        <div className="card">
          <p>Nenhum usuário cadastrado ainda.</p>
        </div>
      )}

      {!loading && users.length > 0 && (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Último Login</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td style={{ fontWeight: 600 }}>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        background: user.role === "MASTER"
                          ? "rgba(139, 92, 246, 0.1)"
                          : "rgba(59, 130, 246, 0.1)",
                        color: user.role === "MASTER" ? "#8b5cf6" : "#3b82f6",
                        borderColor: user.role === "MASTER" ? "#8b5cf6" : "#3b82f6"
                      }}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span
                      className="chip"
                      style={{
                        background: user.active ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                        color: user.active ? "#22c55e" : "#ef4444",
                        borderColor: user.active ? "#22c55e" : "#ef4444"
                      }}
                    >
                      {user.active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td style={{ fontSize: "0.85rem" }}>
                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleDateString()
                      : "Nunca"}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        onClick={() => handleToggleActive(user.id, user.active)}
                        className="btn btn-secondary"
                        style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                      >
                        {user.active ? "Desativar" : "Ativar"}
                      </button>
                      <button
                        onClick={() => handleResetPassword(user.id)}
                        className="btn btn-secondary"
                        style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                      >
                        Reset Senha
                      </button>
                      {(isMaster || user.role !== "MASTER") && (
                        <button
                          onClick={() => handleDelete(user.id, user.role)}
                          className="btn"
                          style={{
                            padding: "0.4rem 0.8rem",
                            fontSize: "0.8rem",
                            background: "rgba(239, 68, 68, 0.1)",
                            color: "#ef4444",
                            border: "1px solid #ef4444"
                          }}
                        >
                          Excluir
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Permissões */}
      <div className="card" style={{ marginTop: "2rem" }}>
        <h2 className="card-title">🔐 Matriz de Permissões</h2>
        <table className="table" style={{ marginTop: "1rem" }}>
          <thead>
            <tr>
              <th>Função</th>
              <th>MASTER</th>
              <th>ADMIN</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Gerenciar Obras/Trilhas/Eventos</td>
              <td style={{ color: "#22c55e" }}>✓</td>
              <td style={{ color: "#22c55e" }}>✓</td>
            </tr>
            <tr>
              <td>Ver Visitantes e Analytics</td>
              <td style={{ color: "#22c55e" }}>✓</td>
              <td style={{ color: "#22c55e" }}>✓</td>
            </tr>
            <tr>
              <td>Configurar IA e Tema</td>
              <td style={{ color: "#22c55e" }}>✓</td>
              <td style={{ color: "#22c55e" }}>✓</td>
            </tr>
            <tr>
              <td>Gerenciar Usuários Internos</td>
              <td style={{ color: "#22c55e" }}>✓</td>
              <td style={{ color: "#f59e0b" }}>Parcial</td>
            </tr>
            <tr>
              <td>Criar/Excluir Tenants</td>
              <td style={{ color: "#22c55e" }}>✓</td>
              <td style={{ color: "#ef4444" }}>✗</td>
            </tr>
            <tr>
              <td>Reset Total do Museu</td>
              <td style={{ color: "#22c55e" }}>✓</td>
              <td style={{ color: "#ef4444" }}>✗</td>
            </tr>
            <tr>
              <td>Backup e Logs do Sistema</td>
              <td style={{ color: "#22c55e" }}>✓</td>
              <td style={{ color: "#ef4444" }}>✗</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
