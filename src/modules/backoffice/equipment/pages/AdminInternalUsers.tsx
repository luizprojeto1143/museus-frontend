import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../../../api/client";
import { useAuth } from "../../../auth/AuthContext";
import { Shield, UserPlus, ShieldCheck, UserX, Key, Settings } from "lucide-react";
import toast from "react-hot-toast";

interface InternalUser {
  id: string;
  name: string;
  email: string;
  role: "MASTER" | "ADMIN" | "COLLABORATOR" | "PRODUCER";
  tenantId: string | null;
  createdAt: string;
  lastLogin: string | null;
  active: boolean;
  permissions?: Record<string, boolean>;
}

export const AdminInternalUsers: React.FC = () => {
  const { t } = useTranslation();
  const { tenantId, role: currentUserRole } = useAuth();
  const [users, setUsers] = useState<InternalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const isMaster = currentUserRole === "master";

  const loadUsers = React.useCallback(async () => {
    try {
      const endpoint = isMaster ? "/users" : `/users?tenantId=${tenantId}`;
      const res = await api.get(endpoint);
      const usersData = res.data as InternalUser[];
      setUsers(usersData);
    } catch {
      toast.error("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  }, [tenantId, isMaster]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      await api.put(`/users/${userId}`, { active: !currentStatus });
      toast.success(currentStatus ? "Usuário desativado" : "Usuário ativado");
      loadUsers();
    } catch {
      toast.error("Erro ao atualizar usuário");
    }
  };

  const handleResetPassword = async (userId: string) => {
    const newPassword = prompt("Digite a nova senha (mínimo 6 caracteres):");
    if (!newPassword || newPassword.length < 6) {
      if (newPassword) toast.error("Senha muito curta");
      return;
    }

    try {
      await api.put(`/users/${userId}`, { password: newPassword });
      toast.success("Senha redefinida com sucesso!");
    } catch {
      toast.error("Erro ao redefinir senha");
    }
  };

  const handleDelete = async (userId: string, userRole: string) => {
    if (userRole === "MASTER" && !isMaster) {
      toast.error("Apenas MASTER pode remover outros MASTER");
      return;
    }

    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;

    try {
      await api.delete(`/users/${userId}`);
      toast.success("Usuário excluído");
      loadUsers();
    } catch {
      toast.error("Erro ao excluir usuário");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="section-title flex items-center gap-3">
             <Shield className="text-gold" /> Equipe do Museu
          </h1>
          <p className="text-muted text-sm">Gerencie acessos e permissões dos funcionários e administradores.</p>
        </div>
        <Link to="/admin/usuarios/novo" className="btn btn-primary">
          <UserPlus size={18} /> Novo Integrante
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="stat-card">
          <span className="stat-value">{users.length}</span>
          <span className="stat-label">Total de Usuários</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{users.filter(u => u.role === "COLLABORATOR" || u.role === "PRODUCER").length}</span>
          <span className="stat-label">Equipe Operacional</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{users.filter(u => u.role === "ADMIN").length}</span>
          <span className="stat-label">Administradores</span>
        </div>
        <div className="stat-card">
          <span className="stat-value text-green-500">{users.filter(u => u.active).length}</span>
          <span className="stat-label">Ativos</span>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 opacity-50">Carregando usuários...</div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nome / Email</th>
                <th>Cargo</th>
                <th>Permissões (Flags)</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="flex flex-col">
                      <span className="font-bold text-white">{user.name}</span>
                      <span className="text-[10px] text-muted">{user.email}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                      user.role === 'MASTER' ? 'bg-purple-500/20 text-purple-400' :
                      user.role === 'ADMIN' ? 'bg-blue-500/20 text-blue-400' :
                      user.role === 'PRODUCER' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1 max-w-[250px]">
                      {(user.role === "COLLABORATOR" || user.role === "PRODUCER") && user.permissions ? (
                        Object.entries(user.permissions)
                          .filter(([_, val]) => val)
                          .map(([key]) => (
                            <span key={key} className="text-[9px] bg-white/5 text-muted px-2 py-0.5 rounded">
                              {key.replace("manage_", "").replace("view_", "")}
                            </span>
                          ))
                      ) : (
                        <span className="text-[10px] text-gold/60">
                          {user.role === "ADMIN" || user.role === "MASTER" ? "Acesso Total" : "Sem Permissões"}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className={`flex items-center gap-2 text-[10px] ${user.active ? 'text-green-500' : 'text-red-500'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${user.active ? 'bg-green-500' : 'bg-red-500'}`} />
                      {user.active ? "Ativo" : "Inativo"}
                    </div>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <Link to={`/admin/usuarios/${user.id}`} className="p-2 hover:bg-white/5 rounded-lg text-gold transition-colors" title="Editar">
                        <Settings size={16} />
                      </Link>
                      <button onClick={() => handleResetPassword(user.id)} className="p-2 hover:bg-white/5 rounded-lg text-muted transition-colors" title="Reset Senha">
                        <Key size={16} />
                      </button>
                      <button 
                        onClick={() => handleToggleActive(user.id, user.active)} 
                        className={`p-2 hover:bg-white/5 rounded-lg transition-colors ${user.active ? 'text-red-400' : 'text-green-400'}`}
                        title={user.active ? "Desativar" : "Ativar"}
                      >
                        {user.active ? <UserX size={16} /> : <ShieldCheck size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
