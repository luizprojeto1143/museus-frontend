import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api, isDemoMode } from "../../../api/client";

type UserItem = {
  id: string;
  name: string;
  email: string;
  role: string;
  tenant?: {
    name: string;
  };
};

export const MasterUsers: React.FC = () => {
  const { t } = useTranslation();
  const [apiUsers, setApiUsers] = useState<UserItem[]>([]);

  const mock: UserItem[] = [
    { id: "1", name: "Admin Museu A", email: "admin@museua.com", role: "ADMIN", tenant: { name: "Museu A" } },
    { id: "2", name: "Master da plataforma", email: "master@plataforma.com", role: "MASTER" }
  ];

  const users = isDemoMode ? mock : apiUsers;

  useEffect(() => {
    if (isDemoMode) return;

    api
      .get("/users")
      .then((res) => {
        setApiUsers(res.data);
      })
      .catch(() => {
        // Fallback to empty or handle error
        setApiUsers([]);
      });
  }, []);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
        <div>
          <h1 className="section-title">{t("master.users.title")}</h1>
          <p className="section-subtitle">
            {t("master.users.subtitle")}
          </p>
        </div>
        <Link to="/master/users/novo" className="btn">
          {t("master.users.new")}
        </Link>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>{t("master.users.table.name")}</th>
            <th>{t("master.users.table.email")}</th>
            <th>{t("master.users.table.role")}</th>
            <th>{t("master.users.table.tenant")}</th>
            <th style={{ textAlign: "right" }}>{t("master.users.table.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>
                <span className="chip">{u.role}</span>
              </td>
              <td>{u.tenant?.name || "-"}</td>
              <td style={{ textAlign: "right" }}>
                <Link to={`/master/users/${u.id}`} className="btn btn-secondary">
                  {t("master.users.table.edit")}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
