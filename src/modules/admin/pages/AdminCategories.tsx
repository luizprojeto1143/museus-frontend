import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";

type CategoryItem = {
  id: string;
  name: string;
  description?: string;
};

export const AdminCategories: React.FC = () => {
  const { t } = useTranslation();
  const { tenantId } = useAuth();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) return;

    api.get("/categories", { params: { tenantId } })
      .then(res => {
        setCategories(res.data);
      })
      .catch(err => {
        console.error("Erro ao buscar categorias", err);
      })
      .finally(() => setLoading(false));
  }, [tenantId]);

  const handleDelete = async (id: string) => {
    if (!confirm(t("common.confirmDelete"))) return;



    try {
      await api.delete(`/categories/${id}`);
      setCategories(categories.filter(c => c.id !== id));
    } catch {
      alert(t("common.error"));
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
        <div>
          <h1 className="section-title">🏷 {t("admin.categories.title")}</h1>
          <p className="section-subtitle">
            {t("admin.categories.subtitle")}
          </p>
        </div>
        <Link to="/admin/categorias/nova" className="btn">
          {t("admin.categories.new")}
        </Link>
      </div>

      {loading ? (
        <p>{t("common.loading")}</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>{t("admin.categories.table.name")}</th>
              <th>{t("admin.categories.table.description")}</th>
              <th style={{ textAlign: "right" }}>{t("admin.categories.table.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <tr key={cat.id}>
                <td style={{ fontWeight: 500 }}>{cat.name}</td>
                <td style={{ color: "var(--text-secondary)" }}>{cat.description}</td>
                <td style={{ textAlign: "right" }}>
                  <Link to={`/admin/categorias/${cat.id}`} className="btn btn-secondary" style={{ marginRight: "0.5rem" }}>
                    {t("common.edit")}
                  </Link>
                  <button
                    className="btn btn-secondary"
                    style={{ color: "#ef4444", borderColor: "#ef4444" }}
                    onClick={() => handleDelete(cat.id)}
                  >
                    {t("common.delete")}
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={3} style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>
                  {t("common.noData")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};
