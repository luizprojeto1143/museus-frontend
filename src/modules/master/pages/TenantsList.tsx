import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api, isDemoMode } from "../../../api/client";

type TenantItem = {
  id: string;
  name: string;
  slug: string;
  createdAt?: string;
};

export const TenantsList: React.FC = () => {
  const { t } = useTranslation();
  const [apiTenants, setApiTenants] = useState<TenantItem[]>([]);

  const mock: TenantItem[] = [
    { id: "1", name: "Museu A", slug: "museu-a", createdAt: "2025-01-01" },
    { id: "2", name: "Cidade histórica B", slug: "cidade-b", createdAt: "2025-01-15" }
  ];

  const tenants = isDemoMode ? mock : apiTenants;

  useEffect(() => {
    if (isDemoMode) return;

    api
      .get("/tenants")
      .then((res) => {
        setApiTenants(res.data);
      })
      .catch(() => {
        setApiTenants([]);
      });
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm(t("master.tenants.startDeleteConfirm", "Tem certeza? Isso apagará TODO o museu e seus dados permanentemente."))) return;

    try {
      await api.delete(`/tenants/${id}`);
      setApiTenants(prev => prev.filter(x => x.id !== id));
      alert("Museu deletado com sucesso.");
    } catch (err) {
      console.error(err);
      alert("Erro ao deletar.");
    }
  };

  const handleCleanDemo = async () => {
    if (!window.confirm("Isso apagará todos os museus de demonstração (slugs: museu-a, cidade-b, demo, exemplo). Continuar?")) return;

    try {
      await api.delete("/tenants/utils/demo");
      // Reload list
      const res = await api.get("/tenants");
      setApiTenants(res.data);
      alert("Dados de demonstração limpos.");
    } catch (err) {
      console.error(err);
      alert("Erro ao limpar dados.");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div>
          <h1 className="section-title">{t("master.tenants.title")}</h1>
          <p className="section-subtitle">
            {t("master.tenants.subtitle")}
          </p>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button onClick={handleCleanDemo} className="btn" style={{ background: "#ef4444", borderColor: "#ef4444" }}>
            Trash Demo Data
          </button>
          <Link to="/master/tenants/novo" className="btn">
            {t("master.tenants.new")}
          </Link>
        </div>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>{t("master.tenants.table.name")}</th>
            <th>{t("master.tenants.table.slug")}</th>
            <th>{t("master.tenants.table.createdAt")}</th>
            <th style={{ textAlign: "right" }}>{t("master.tenants.table.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {tenants.map(tenant => (
            <tr key={tenant.id}>
              <td>{tenant.name}</td>
              <td><code>{tenant.slug}</code></td>
              <td>{tenant.createdAt}</td>
              <td style={{ textAlign: "right" }}>
                <Link to={`/master/tenants/${tenant.id}`} className="btn btn-secondary" style={{ marginRight: "0.5rem" }}>
                  {t("master.tenants.table.edit")}
                </Link>
                <button
                  onClick={() => handleDelete(tenant.id)}
                  className="btn btn-secondary"
                  style={{ borderColor: "#ef4444", color: "#ef4444" }}
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
