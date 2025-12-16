import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { useParams, useNavigate } from "react-router-dom";

export const AdminCategoryForm: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { tenantId } = useAuth();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("WORK");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      setLoading(true);
      api.get(`/categories/${id}`)
        .then(res => {
          setName(res.data.name);
          setDescription(res.data.description || "");
          setType(res.data.type || "WORK");
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tenantId) {
      alert(t("common.error"));
      return;
    }

    setSaving(true);
    const payload = { name, description, type, tenantId };

    try {
      if (isEdit && id) {
        await api.put(`/categories/${id}`, payload);
      } else {
        await api.post("/categories", payload);
      }
      navigate("/admin/categorias");
    } catch (err) {
      console.error(err);
      alert(t("common.error"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>{t("common.loading")}</p>;

  return (
    <div>
      <h1 className="section-title">
        {isEdit ? t("admin.categoryForm.editTitle") : t("admin.categoryForm.newTitle")}
      </h1>
      <p className="section-subtitle">
        {t("admin.categoryForm.subtitle")}
      </p>

      <form onSubmit={handleSubmit} className="card" style={{ maxWidth: 600 }}>
        <div className="form-group">
          <label htmlFor="name">{t("admin.categoryForm.labels.name")}</label>
          <input
            id="name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("admin.categoryForm.placeholders.name")}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="type">{t("admin.categoryForm.labels.type")}</label>
          <select
            id="type"
            className="input"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="WORK">{t("admin.categoryForm.types.WORK")}</option>
            <option value="TRAIL">{t("admin.categoryForm.types.TRAIL")}</option>
            <option value="EVENT">{t("admin.categoryForm.types.EVENT")}</option>
            <option value="GENERAL">{t("admin.categoryForm.types.GENERAL")}</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description">{t("admin.categoryForm.labels.description")}</label>
          <textarea
            id="description"
            className="input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("admin.categoryForm.placeholders.description")}
            rows={3}
          />
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1 }}>
            {saving ? t("common.loading") : t("common.save")}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/admin/categorias")}
            style={{ flex: 1 }}
          >
            {t("common.cancel")}
          </button>
        </div>
      </form>
    </div>
  );
};
