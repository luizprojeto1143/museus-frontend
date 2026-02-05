import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api, isDemoMode } from "../../../api/client";
import { Users, UserPlus, Edit, ShieldCheck, Database } from "lucide-react";
import "./MasterShared.css";

type UserItem = {
  id: string;
  name: string;
  email: string;
  role: string;
  termsAcceptedAt?: string;
  termsAcceptedIp?: string;
  tenant?: {
    name: string;
  };
};

export const MasterUsers: React.FC = () => {
  const { t } = useTranslation();
  const [apiUsers, setApiUsers] = useState<UserItem[]>([]);

  const mock: UserItem[] = [
    { id: "1", name: "Admin Museu A", email: "admin@museua.com", role: "ADMIN", tenant: { name: "Museu A" }, termsAcceptedAt: "2024-01-01", termsAcceptedIp: "127.0.0.1" },
    { id: "2", name: "Master da plataforma", email: "master@plataforma.com", role: "MASTER" }
  ];

  // ... (useEffect remains the same)

  return (
    <div className="master-page-container">
      {/* ... (Hero section remains the same) */}

      <div className="master-card">
        {/* ... (Header remains the same) */}

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
                    {/* ... actions */}
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
<Link to={`/master/users/${u.id}`} title="Editar">
  <button className="master-btn btn-outline" style={{ width: 'auto', display: 'inline-flex', padding: '0.5rem', height: 'auto', marginTop: 0 }}>
    <Edit size={16} />
  </button>
</Link>
                  </td >
                </tr >
              ))}
            </tbody >
          </table >
        </div >
      </div >
    </div >
  );
};
