import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { Users, Edit, ShieldCheck, Database, Trash2 } from "lucide-react";
import "./MasterShared.css";

type UserItem = {
  id: string;
  name: string;
  email: string;
  role: string;
  active?: boolean;
  termsAcceptedAt?: string;
  termsAcceptedIp?: string;
  tenant?: {
    name: string;
  };
};

export const MasterUsers: React.FC = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (error) {
      console.error("Failed to load users", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="master-page-container">
      {/* HERO SECTION */}
      <section className="master-hero" style={{ padding: '2rem 1rem', marginBottom: '2rem' }}>
        <div className="master-hero-content">
          <span className="master-badge">
            <Users size={14} style={{ marginRight: '0.5rem' }} />
            Gestão Global
          </span>
          <h1 className="master-title">
            {t("master.users.title", "Usuários do Sistema")}
          </h1>
        </div>
      </section>

      <div className="master-card">
        <div className="master-card-header">
          <div className="master-icon-wrapper master-icon-purple">
            <Users size={24} />
          </div>
          <div>
            <h3>Todos os Usuários</h3>
            <p>Lista geral de todos os usuários cadastrados na plataforma</p>
          </div>
        </div>

        <div className="master-table-container">
          <table className="master-table">
            <thead>
              <tr>
                <th>{t("master.users.table.name")}</th>
                <th>{t("master.users.table.email")}</th>
                <th>{t("master.users.table.role")}</th>
                <th>{t("master.users.table.tenant")}</th>
                <th>Aceite Termos</th>
                <th>IP</th>
                <th style={{ textAlign: "right" }}>{t("master.users.table.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{u.name}</div>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '99px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: u.role === 'MASTER' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                      color: u.role === 'MASTER' ? '#a78bfa' : '#60a5fa',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      {u.role === 'MASTER' ? <ShieldCheck size={12} /> : <Database size={12} />}
                      {u.role}
                    </span>
                  </td>
                  <td>
                    {u.tenant ? (
                      <span style={{ color: '#94a3b8' }}>{u.tenant.name}</span>
                    ) : (
                      <span style={{ opacity: 0.5 }}>-</span>
                    )}
                  </td>
                  <td>
                    {u.termsAcceptedAt ? new Date(u.termsAcceptedAt).toLocaleDateString() : <span style={{ opacity: 0.3 }}>-</span>}
                  </td>
                  <td>
                    {u.termsAcceptedIp ? <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{u.termsAcceptedIp}</span> : <span style={{ opacity: 0.3 }}>-</span>}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                      <Link to={`/master/users/${u.id}`} title="Editar">
                        <button className="master-btn btn-outline" style={{ width: 'auto', display: 'inline-flex', padding: '0.5rem', height: 'auto', marginTop: 0 }}>
                          <Edit size={16} />
                        </button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
