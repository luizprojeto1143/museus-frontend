import React, { useEffect, useState } from "react";
import { logger } from "@/utils/logger";

import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../../../api/client";
import { useAuth } from "../../../auth/AuthContext";
import { toast } from "react-hot-toast";

type CategoryItem = {
  id: string;
  name: string;
  description?: string;
};

export const AdminCategories: React.FC = () => {
  const { t } = useTranslation();
  const { tenantId } = useAuth();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) return;

    api.get<CategoryItem[]>("/categories", { params: { tenantId } })
      .then(res => {
        setCategories(Array.isArray(res.data) ? res.data : []);
      })
      .catch(err => {
        logger.error("Erro ao buscar categorias", err);
      })
      .finally(() => setLoading(false));
  }, [tenantId]);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/categories/${id}`);
      setCategories(categories.filter(c => c.id !== id));
      setCategoryToDelete(null);
    } catch {
      toast.error(t("common.error"));
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
        <div>
          <h1 className="section-title">🏷 {t("admin.categories.title")}</h1>

        </div>
        <Link to="/admin/categorias/nova" className="inline-flex items-center justify-center gap-2 font-bold uppercase tracking-wider transition-colors cursor-pointer border bg-[var(--bg-surface-hover)] text-[var(--fg-main)] border-[var(--border-default)] text-[13px] px-5 py-2.5 rounded-[var(--radius-md)]">
          {t("admin.categories.new")}
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-10 h-10 border-4 border-amber-900 border-t-amber-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(cat => (
            <div key={cat.id} className="card relative group hover:border-[var(--accent-primary)] transition-all duration-300">
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link to={`/admin/categorias/${cat.id}`} className="p-2 text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 rounded-full">
                  ✎
                </Link>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-[var(--accent-primary)]/10 flex items-center justify-center text-2xl border border-[var(--accent-primary)]/30">
                  🏷️
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#EAE0D5]">{cat.name}</h3>
                  <span className="text-xs uppercase tracking-wider text-[#8b7355] border border-[#8b7355]/30 px-2 py-0.5 rounded-full">
                    {cat.id.substring(0, 8)}...
                  </span>
                </div>
              </div>

              {cat.description && (
                <p className="text-[#8b7355] text-sm mb-4 line-clamp-2 min-h-[2.5em]">
                  {cat.description}
                </p>
              )}

              <div className="flex gap-2 mt-4 pt-4 border-t border-[var(--border-default)]">
                <Link
                  to={`/admin/categorias/${cat.id}`}
                  className="flex-1 text-center py-2 rounded bg-[var(--accent-primary)] text-[#1a1108] font-bold hover:brightness-110 transition-all"
                >
                  {t("common.edit")}
                </Link>
                <button
                  className="px-4 py-2 rounded border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-all"
                  onClick={() => setCategoryToDelete(cat)}
                >
                  {t("common.delete")}
                </button>
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <div className="col-span-full text-center py-12 border border-dashed border-[var(--border-default)] rounded-xl bg-[var(--bg-root)]/50">
              <p className="text-[#8b7355] text-lg">{t("common.noData")}</p>
              <Link to="/admin/categorias/nova" className="text-[var(--accent-primary)] hover:underline mt-2 inline-block">
                Criar primeira categoria
              </Link>
            </div>
          )}
        </div>
      )}

      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6">
          <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-[var(--bg-surface)] p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-3">{t("common.delete")}</h2>
            <p className="text-sm opacity-80 mb-6">{t("common.confirmDelete")}</p>
            <div className="flex justify-end gap-3">
              <button type="button" className="btn btn-secondary" onClick={() => setCategoryToDelete(null)}>
                {t("common.cancel")}
              </button>
              <button type="button" className="btn btn-primary bg-red-600" onClick={() => void handleDelete(categoryToDelete.id)}>
                {t("common.confirm", "Confirmar")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
