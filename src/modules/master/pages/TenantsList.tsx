import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api, isDemoMode } from "../../../api/client";
import { PlusCircle, Trash2, Edit, Building2 } from "lucide-react";
import "./MasterShared.css";

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
        // Ensure res.data is an array before setting state
        const data = Array.isArray(res.data) ? res.data : [];
        setApiTenants(data);
      })
      .catch((err) => {
        console.error("Erro ao carregar museus:", err);
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
      const data = Array.isArray(res.data) ? res.data : [];
      setApiTenants(data);
      alert("Dados de demonstração limpos.");
    } catch (err) {
      console.error(err);
      alert("Erro ao limpar dados.");
    }
  };

  return (
    <div className="master-page-container">
      {/* HERO SECTION */}
      <section className="master-hero">
        <div className="master-hero-content">
          <span className="master-badge">
            🏢 Museus & Cidades
          </span>
          <h1 className="master-title">
            Gerenciar Clientes
          </h1>
          <p className="master-subtitle">
            Crie novos tenants, gerencie assinaturas e controle o acesso de cada instituição.
          </p>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "2rem" }}>
            <Link to="/master/tenants/novo">
              <button className="master-btn btn-primary" style={{ width: 'auto', padding: '0.75rem 2rem' }}>
                <PlusCircle size={18} />
                {t("master.tenants.new")}
              </button>
            </Link>

            <button
              onClick={handleCleanDemo}
              className="master-btn btn-danger"
              style={{ width: 'auto', padding: '0.75rem 2rem', marginTop: '1rem' }}
            >
              <Trash2 size={18} />
              Limpar Demos
            </button>
          </div>
        </div>
      </section>

      <div className="master-card">
        <div className="master-card-header">
          <div className="master-icon-wrapper master-icon-blue">
            <Building2 size={24} />
          </div>
          <h3>Lista de Museus ({tenants.length})</h3>
        </div>

        <div className="master-table-container">
          <table className="master-table">
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
                  <td>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{tenant.name}</div>
                  </td>
                  <td>
                    <span style={{ padding: '0.25rem 0.5rem', background: '#334155', borderRadius: '4px', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                      {tenant.slug}
                    </span>
                  </td>
                  <td>{tenant.createdAt}</td>
                  <td style={{ textAlign: "right", display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                    <Link to={`/master/tenants/${tenant.id}`} title="Editar">
                      <button className="master-btn btn-outline" style={{ width: '40px', height: '40px', padding: 0, marginTop: 0 }}>
                        <Edit size={16} />
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(tenant.id)}
                      className="master-btn btn-danger"
                      style={{ width: '40px', height: '40px', padding: 0, marginTop: 0 }}
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
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
