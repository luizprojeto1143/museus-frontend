import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "../../../contexts/ToastContext";
import { Input, Select, Textarea, Button } from "../../../components/ui";
import { ArrowLeft, Save, Tag, FileText, Layers } from "lucide-react";
import { useTerminology } from "../../../hooks/useTerminology";

const CATEGORY_TYPES = [
  { value: "WORK", label: "Obras" },
  { value: "EVENT", label: "Eventos" },
  { value: "SPACE", label: "Espaços" },
  { value: "POST", label: "Posts/Notícias" },
  { value: "PRODUCT", label: "Produtos" }
];

export const AdminCategoryForm: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { tenantId } = useAuth();
  const { addToast } = useToast();
  const term = useTerminology();
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#0a0a0c]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-400 text-sm">Carregando categoria...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-24 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          onClick={() => navigate("/admin/categorias")}
          variant="ghost"
          className="w-10 h-10 p-0 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center shrink-0 transition-colors"
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            {isEdit ? t("admin.categoryForm.editTitle") : t("admin.categoryForm.newTitle")}
          </h1>
          <p className="text-zinc-400 text-sm font-medium mt-1">
            Gerencie as categorias para organizar seu conteúdo.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Tag className="text-gold" size={20} /> Informações
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input
                label={t("admin.categoryForm.labels.name") || "Nome"}
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("admin.categoryForm.placeholders.name") || "Nome da categoria"}
                required
                className="bg-zinc-900/50 border-white/10 text-white focus:border-gold/50"
              />
            </div>

            <Select
              label="Tipo de Conteúdo"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="bg-zinc-900/50 border-white/10 text-white focus:border-gold/50"
            >
              {CATEGORY_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </Select>
          </div>

          <Textarea
            label={t("admin.categoryForm.labels.description") || "Descrição"}
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Descreva o propósito desta categoria..."
            className="bg-zinc-900/50 border-white/10 text-white focus:border-gold/50"
          />
        </div>

        {/* ACTION BAR */}
        <div className="fixed bottom-6 left-0 right-0 z-50 pointer-events-none px-4">
          <div className="max-w-4xl mx-auto bg-zinc-900/90 border border-white/10 p-2 pr-3 pl-4 rounded-2xl flex items-center justify-between shadow-2xl backdrop-blur-xl pointer-events-auto">
            <Button
              variant="ghost"
              type="button"
              onClick={() => navigate("/admin/categorias")}
              className="text-zinc-400 hover:text-white px-4 h-12 hover:bg-white/5"
              disabled={saving}
            >
              {t("common.cancel")}
            </Button>
            <div className="flex items-center gap-3">
              <Button
                type="submit"
                disabled={saving}
                className="px-8 h-12 rounded-xl font-bold text-base shadow-lg shadow-gold/20 bg-gold hover:bg-gold/90 text-black border-none"
                leftIcon={saving ? undefined : <Save size={18} />}
              >
                {saving ? 'Salvando...' : t("common.save")}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
