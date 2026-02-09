import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "../../../contexts/ToastContext";
import { Input, Select, Textarea, Button } from "../../../components/ui";
import { ArrowLeft, Save } from "lucide-react";

export const AdminCategoryForm: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { tenantId } = useAuth();
  const { addToast } = useToast();
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
        .catch(err => {
          console.error(err);
          addToast("Erro ao carregar categoria", "error");
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tenantId) {
      addToast(t("common.error"), "error");
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
      addToast(isEdit ? "Categoria atualizada com sucesso!" : "Categoria criada com sucesso!", "success");
      navigate("/admin/categorias");
    } catch (err) {
      console.error(err);
      addToast(t("common.error"), "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-center p-8">{t("common.loading")}</p>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button
          onClick={() => navigate("/admin/categorias")}
          variant="ghost"
          className="p-2 hover:bg-white/10 rounded"
        >
          <ArrowLeft size={24} />
        </Button>
        <div>
          <h1 className="section-title">
            {isEdit ? t("admin.categoryForm.editTitle") : t("admin.categoryForm.newTitle")}
          </h1>
          <p className="section-subtitle">
            {t("admin.categoryForm.subtitle")}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card">
        <Input
          label={t("admin.categoryForm.labels.name") || "Nome"}
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("admin.categoryForm.placeholders.name") || "Nome da categoria"}
          required
        />

        <Select
          label={t("admin.categoryForm.labels.type") || "Tipo"}
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="WORK">{t("admin.categoryForm.types.WORK")}</option>
          <option value="TRAIL">{t("admin.categoryForm.types.TRAIL")}</option>
          <option value="EVENT">{t("admin.categoryForm.types.EVENT")}</option>
          <option value="GENERAL">{t("admin.categoryForm.types.GENERAL")}</option>
        </Select>

        <Textarea
          label={t("admin.categoryForm.labels.description") || "Descrição"}
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("admin.categoryForm.placeholders.description") || "Descrição da categoria"}
          rows={3}
        />

        <div className="flex justify-end gap-4 mt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/admin/categorias")}
            disabled={saving}
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            disabled={saving}
            isLoading={saving}
            leftIcon={<Save size={18} />}
          >
            {saving ? t("common.loading") : t("common.save")}
          </Button>
        </div>
      </form>
    </div>
  );
};

