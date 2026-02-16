import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Input, Select, Textarea, Button } from "../../../components/ui";
import { ArrowLeft, Save, Trophy, Star, Target, Zap, Image, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "../../../contexts/ToastContext";

interface AchievementForm {
  code: string;
  title: string;
  description: string;
  xpReward: number;
  iconUrl: string;
  condition: string;
  autoTrigger: boolean;
  triggerType: "XP_THRESHOLD" | "VISIT_COUNT" | "TRAIL_COMPLETION" | "CATEGORY_COMPLETION" | "CUSTOM";
  triggerValue: number;
  active: boolean;
}

const TRIGGER_TYPES = [
  { value: "XP_THRESHOLD", label: "Limite de XP Alcançado" },
  { value: "VISIT_COUNT", label: "Número de Visitas" },
  { value: "TRAIL_COMPLETION", label: "Conclusão de Trilha" },
  { value: "CATEGORY_COMPLETION", label: "Conclusão de Categoria" },
  { value: "CUSTOM", label: "Condição Personalizada" }
];

export const AdminAchievementForm: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { tenantId } = useAuth();
  const { addToast } = useToast();
  const isEditing = !!id;

  const [form, setForm] = useState<AchievementForm>({
    code: "",
    title: "",
    description: "",
    xpReward: 100,
    iconUrl: "",
    condition: "",
    autoTrigger: true,
    triggerType: "XP_THRESHOLD",
    triggerValue: 100,
    active: true
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadAchievement = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/achievements/${id}`);
      setForm(res.data);
    } catch {
      addToast(t("admin.achievementForm.alerts.errorLoad"), "error");
      navigate("/admin/conquistas");
    } finally {
      setLoading(false);
    }
  }, [id, navigate, t, addToast]);

  useEffect(() => {
    if (isEditing) {
      loadAchievement();
    }
  }, [id, isEditing, loadAchievement]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.code.trim() || !form.title.trim()) {
      addToast(t("admin.achievementForm.alerts.required"), "error");
      return;
    }

    setSaving(true);
    try {
      if (isEditing) {
        await api.put(`/achievements/${id}`, { ...form, tenantId });
        addToast(t("admin.achievementForm.alerts.successUpdate"), "success");
      } else {
        await api.post("/achievements", { ...form, tenantId });
        addToast(t("admin.achievementForm.alerts.successCreate"), "success");
      }
      navigate("/admin/conquistas");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const message = error.response?.data?.message || t("admin.achievementForm.alerts.errorSave");
      addToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await api.post("/upload/image", formData);
        setForm({ ...form, iconUrl: res.data.url });
        addToast("Ícone enviado com sucesso!", "success");
      } catch {
        addToast(t("admin.achievementForm.alerts.errorUpload"), "error");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#0a0a0c]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-400 text-sm">Carregando conquista...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-24 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/conquistas")}
          className="w-10 h-10 p-0 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center shrink-0 transition-colors"
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            {isEditing ? t("admin.achievementForm.editTitle") : t("admin.achievementForm.newTitle")}
          </h1>
          <p className="text-zinc-400 text-sm font-medium mt-1">
            Defina as regras e recompensas desta conquista.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Trophy className="text-gold" size={20} /> Informações Básicas
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Código Único"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="EX: VISITANTE_EXPLORADOR"
              required
              className="bg-zinc-900/50 border-white/10 text-white focus:border-gold/50 font-mono uppercase"
            />

            <Input
              label={t("admin.achievementForm.labels.title")}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ex: Explorador Iniciante"
              required
              className="bg-zinc-900/50 border-white/10 text-white focus:border-gold/50"
            />
          </div>

          <Textarea
            label={t("admin.achievementForm.labels.description")}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="bg-zinc-900/50 border-white/10 text-white focus:border-gold/50"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">{t("admin.achievementForm.labels.icon")}</label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-zinc-800 border border-white/10 flex items-center justify-center overflow-hidden relative group">
                  {form.iconUrl ? (
                    <img src={form.iconUrl} alt="Icon" className="w-full h-full object-cover" />
                  ) : (
                    <Image className="text-zinc-600" size={32} />
                  )}
                  <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                    <span className="text-xs text-white font-bold">Alterar</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                  </label>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-zinc-500 mb-2">Recomendado: PNG ou SVG com fundo transparente (512x512px).</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 border-white/10 text-zinc-300 hover:bg-white/5"
                    onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
                  >
                    Carregar Imagem
                  </Button>
                </div>
              </div>
            </div>

            <Input
              label={t("admin.achievementForm.labels.xpReward")}
              type="number"
              value={form.xpReward}
              onChange={(e) => setForm({ ...form, xpReward: parseInt(e.target.value) || 0 })}
              leftIcon={<Star size={16} className="text-gold" />}
              className="bg-zinc-900/50 border-white/10 text-white focus:border-gold/50"
            />
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Target className="text-gold" size={20} /> Regras de Desbloqueio
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Tipo de Gatilho"
              value={form.triggerType}
              onChange={(e) => setForm({ ...form, triggerType: e.target.value as any })}
              className="bg-zinc-900/50 border-white/10 text-white focus:border-gold/50"
            >
              {TRIGGER_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </Select>

            <Input
              label="Valor Alvo"
              type="number"
              value={form.triggerValue}
              onChange={(e) => setForm({ ...form, triggerValue: parseInt(e.target.value) || 0 })}
              className="bg-zinc-900/50 border-white/10 text-white focus:border-gold/50"
              placeholder="Ex: 5 (visitas), 1000 (XP)"
            />
          </div>

          <div className="p-4 bg-zinc-900/50 rounded-xl border border-white/5 flex flex-col md:flex-row gap-6">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`
                        w-5 h-5 rounded border flex items-center justify-center transition-colors
                        ${form.autoTrigger ? 'bg-gold border-gold' : 'border-zinc-600 group-hover:border-zinc-500'}
                    `}>
                {form.autoTrigger && <Zap size={14} className="text-black" />}
              </div>
              <input
                type="checkbox"
                checked={form.autoTrigger}
                onChange={(e) => setForm({ ...form, autoTrigger: e.target.checked })}
                className="hidden"
              />
              <span className="font-medium text-zinc-200 group-hover:text-white transition-colors">
                Desbloqueio Automático
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`
                        w-5 h-5 rounded border flex items-center justify-center transition-colors
                        ${form.active ? 'bg-gold border-gold' : 'border-zinc-600 group-hover:border-zinc-500'}
                    `}>
                {form.active && <CheckCircle size={14} className="text-black" />}
              </div>
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="hidden"
              />
              <span className="font-medium text-zinc-200 group-hover:text-white transition-colors">
                Conquista Ativa
              </span>
            </label>
          </div>
        </div>

        {/* ACTION BAR */}
        <div className="fixed bottom-6 left-0 right-0 z-50 pointer-events-none px-4">
          <div className="max-w-4xl mx-auto bg-zinc-900/90 border border-white/10 p-2 pr-3 pl-4 rounded-2xl flex items-center justify-between shadow-2xl backdrop-blur-xl pointer-events-auto">
            <Button
              variant="ghost"
              type="button"
              onClick={() => navigate("/admin/conquistas")}
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
