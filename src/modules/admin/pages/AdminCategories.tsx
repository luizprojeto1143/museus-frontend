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

        </div>
        <Link to="/admin/categorias/nova" className="btn">
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
            <div key={cat.id} className="card relative group hover:border-[#d4af37] transition-all duration-300">
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link to={`/admin/categorias/${cat.id}`} className="p-2 text-[#d4af37] hover:bg-[#d4af37]/10 rounded-full">
                  ✎
                </Link>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#d4af37]/10 flex items-center justify-center text-2xl border border-[#d4af37]/30">
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

              <div className="flex gap-2 mt-4 pt-4 border-t border-[#463420]">
                <Link
                  to={`/admin/categorias/${cat.id}`}
                  className="flex-1 text-center py-2 rounded bg-[#d4af37] text-[#1a1108] font-bold hover:brightness-110 transition-all"
                >
                  {t("common.edit")}
                </Link>
                <button
                  className="px-4 py-2 rounded border border-red-500/30 text-red-500 hover:bg-red-500/10 transition-all"
                  onClick={() => handleDelete(cat.id)}
                >
                  {t("common.delete")}
                </button>
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <div className="col-span-full text-center py-12 border border-dashed border-[#463420] rounded-xl bg-[#0f0a05]/50">
              <p className="text-[#8b7355] text-lg">{t("common.noData")}</p>
              <Link to="/admin/categorias/nova" className="text-[#d4af37] hover:underline mt-2 inline-block">
                Criar primeira categoria
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
