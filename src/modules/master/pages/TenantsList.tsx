import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api, isDemoMode } from "../../../api/client";
import { PlusCircle, Trash2, Edit, Building2 } from "lucide-react";
import { Button } from "../../../components/ui";
import { useToast } from "../../../contexts/ToastContext";
import "./MasterShared.css";

type TenantItem = {
  id: string;
  name: string;
  slug: string;
  createdAt?: string;
};

export const TenantsList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addToast } = useToast();
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
        const data = Array.isArray(res.data) ? res.data : [];
        setApiTenants(data);
      })
      .catch((err) => {
        console.error("Erro ao carregar museus:", err);
        addToast(t("common.errorLoad"), "error");
        setApiTenants([]);
      });
  }, [t, addToast]);

  const handleDelete = async (id: string) => {
    if (!window.confirm(t("master.tenants.startDeleteConfirm", "Tem certeza? Isso apagará TODO o museu e seus dados permanentemente."))) return;

    try {
      await api.delete(`/tenants/${id}`);
      setApiTenants(prev => prev.filter(x => x.id !== id));
      addToast("Museu deletado com sucesso.", "success");
    } catch (err) {
      console.error(err);
      addToast("Erro ao deletar.", "error");
    }
  };

  const handleCleanDemo = async () => {
    if (!window.confirm("Isso apagará todos os museus de demonstração (slugs: museu-a, cidade-b, demo, exemplo). Continuar?")) return;

    try {
      await api.delete("/tenants/utils/demo");
      const res = await api.get("/tenants");
      const data = Array.isArray(res.data) ? res.data : [];
      setApiTenants(data);
      addToast("Dados de demonstração limpos.", "success");
    } catch (err) {
      console.error(err);
      addToast("Erro ao limpar dados.", "error");
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
            Crie novas instituições, gerencie assinaturas e controle o acesso de cada conta.
          </p>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "2rem", flexWrap: 'wrap' }}>
            <Button
              onClick={() => navigate("/master/tenants/novo")}
              leftIcon={<PlusCircle size={18} />}
              className="w-auto px-8"
            >
              {t("master.tenants.new")}
            </Button>

            <Button
              variant="outline"
              onClick={handleCleanDemo}
              leftIcon={<Trash2 size={18} />}
              className="w-auto px-8 border-red-500/50 text-red-500 hover:bg-red-500/10"
            >
              Limpar Demos
            </Button>
          </div>
        </div>
      </section>

      <div className="master-card">
        <div className="master-card-header">
          <div className="master-icon-wrapper master-icon-blue">
            <Building2 size={24} />
          </div>
          <h3>Instituições Cadastradas ({tenants.length})</h3>
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
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/master/tenants/${tenant.id}`)}
                        title="Editar"
                        className="w-10 h-10 p-0"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(tenant.id)}
                        title="Excluir"
                        className="w-10 h-10 p-0 border-red-500/50 text-red-500 hover:bg-red-500/10"
                      >
                        <Trash2 size={16} />
                      </Button>
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
