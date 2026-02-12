import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Input, Button, Textarea, Select } from "../../../components/ui";
import {
import {
    Settings, Building2, MapPin, Clock, Phone, Mail, Globe,
    Volume2, Upload, Headphones, Video, Map as MapIcon, Image as ImageIcon,
    Plus, Edit, Trash2, Palette, Save
  } from "lucide-react";
import "./AdminShared.css";

// Interface definitions kept same...
interface FloorPlan {
  id: string;
  name: string;
  floor: number;
  imageUrl: string;
  order: number;
}
interface MuseumSettings {
  // 2.1 Dados do Museu
  name: string;
  mission: string;
  address: string;
  openingHours: string;
  whatsapp: string;
  email: string;
  website: string;
  logoUrl: string;
  coverImageUrl: string;
  appIconUrl: string;

  // 2.3 Mapa
  mapImageUrl: string;
  latitude: number;
  longitude: number;

  // 2.2 Cores e Tema
  primaryColor: string;
  secondaryColor: string;
  theme: "light" | "dark";
  historicalFont: boolean;

  // Welcome Media
  welcomeAudioUrl?: string;
  welcomeVideoUrl?: string;
}

export const AdminMuseumSettings: React.FC = () => {
  const { t } = useTranslation();
  const { tenantId } = useAuth();

  // Refs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const mapInputRef = useRef<HTMLInputElement>(null);
  const floorPlanInputRef = useRef<HTMLInputElement>(null);

  const [settings, setSettings] = useState<MuseumSettings>({
    name: "",
    mission: "",
    address: "",
    openingHours: "",
    whatsapp: "",
    email: "",
    website: "",
    logoUrl: "",
    coverImageUrl: "",
    appIconUrl: "",
    mapImageUrl: "",
    latitude: -20.385574,
    longitude: -43.503578,
    primaryColor: "#d4af37",
    secondaryColor: "#cd7f32",
    theme: "dark",
    historicalFont: true,
    welcomeAudioUrl: "",
    welcomeVideoUrl: "",
  });

  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [floorPlans, setFloorPlans] = useState<FloorPlan[]>([]);
  const [showFloorPlanModal, setShowFloorPlanModal] = useState(false);
  const [editingFloorPlan, setEditingFloorPlan] = useState<FloorPlan | null>(null);
  const [newFloorPlan, setNewFloorPlan] = useState({ name: "", floor: 0, imageUrl: "" });

  const loadFloorPlans = React.useCallback(async () => {
    if (!tenantId) return;
    try {
      const res = await api.get("/floor-plans", { params: { tenantId } });
      setFloorPlans(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Erro ao carregar plantas", err);
    }
  }, [tenantId]);

  const loadSettings = React.useCallback(async () => {
    try {
      const res = await api.get(`/tenants/${tenantId}/settings`);
      setSettings(res.data);
    } catch {
      console.error("Erro ao carregar configurações");
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    loadSettings();
    loadFloorPlans();
  }, [loadSettings, loadFloorPlans]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/tenants/${tenantId}/settings`, settings);
      alert(t("admin.museumSettings.success"));
    } catch {
      alert(t("admin.museumSettings.error"));
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (field: keyof MuseumSettings, file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/upload/image", formData);
      setSettings({ ...settings, [field]: res.data.url });
    } catch {
      alert(t("common.error"));
    }
  };

  const handleWelcomeAudioUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await api.post("/upload/audio", formData);
      setSettings(prev => ({ ...prev, welcomeAudioUrl: res.data.url }));
      alert("Áudio enviado com sucesso!");
    } catch {
      alert(t("common.error"));
    }
  };

  // Floor Plan CRUD
  const handleFloorPlanImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await api.post("/upload/image", formData);
      setNewFloorPlan({ ...newFloorPlan, imageUrl: res.data.url });
    } catch {
      alert(t("common.error"));
    }
  };

  const handleSaveFloorPlan = async () => {
    if (!newFloorPlan.name || !newFloorPlan.imageUrl) {
      alert("Nome e imagem são obrigatórios");
      return;
    }
    try {
      if (editingFloorPlan) {
        await api.put(`/floor-plans/${editingFloorPlan.id}`, newFloorPlan);
      } else {
        await api.post("/floor-plans", { ...newFloorPlan, tenantId });
      }
      setShowFloorPlanModal(false);
      setEditingFloorPlan(null);
      setNewFloorPlan({ name: "", floor: 0, imageUrl: "" });
      loadFloorPlans();
    } catch (err) {
      alert("Erro ao salvar planta");
      console.error(err);
    }
  };

  const handleDeleteFloorPlan = async (id: string) => {
    if (!confirm("Deseja excluir esta planta?")) return;
    try {
      await api.delete(`/floor-plans/${id}`);
      loadFloorPlans();
    } catch (err) {
      alert("Erro ao excluir planta");
      console.error(err);
    }
  };

  const openEditFloorPlan = (plan: FloorPlan) => {
    setEditingFloorPlan(plan);
    setNewFloorPlan({ name: plan.name, floor: plan.floor, imageUrl: plan.imageUrl });
    setShowFloorPlanModal(true);
  };

  if (loading) {
    return <p>{t("common.loading")}</p>;
  }

  return (
    <div className="admin-form-container">
      <div className="admin-wizard-header">
        <Settings size={32} className="text-gold" />
        <div>
          <h1 className="admin-wizard-title">
            Configurações do Museu
          </h1>
          <p className="admin-wizard-subtitle">
            Personalize a identidade visual, informações institucionais e recursos multimídia.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLUNA ESQUERDA - DADOS E MIDIA */}
        <div className="lg:col-span-2 space-y-8">

          {/* DADOS INSTITUCIONAIS */}
          <div className="admin-section">
            <h2 className="admin-section-title">
              <Building2 className="text-blue-400" size={20} /> Dados Institucionais
            </h2>

            <div className="space-y-5">
              <Input
                label={t("admin.museumSettings.labels.name") + " *"}
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                placeholder="Ex: Museu Histórico"
              />

              <Textarea
                label={t("admin.museumSettings.labels.mission")}
                value={settings.mission}
                onChange={(e) => setSettings({ ...settings, mission: e.target.value })}
                rows={3}
              />

              <div className="admin-grid-2">
                <Input
                  label={t("admin.museumSettings.labels.address")}
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  leftIcon={<MapPin size={16} />}
                />
                <Input
                  label={t("admin.museumSettings.labels.openingHours")}
                  value={settings.openingHours}
                  onChange={(e) => setSettings({ ...settings, openingHours: e.target.value })}
                  leftIcon={<Clock size={16} />}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <Input
                  label={t("admin.museumSettings.labels.whatsapp")}
                  value={settings.whatsapp}
                  onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                  leftIcon={<Phone size={16} />}
                />
                <Input
                  label={t("admin.museumSettings.labels.email")}
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  leftIcon={<Mail size={16} />}
                />
                <Input
                  label={t("admin.museumSettings.labels.website")}
                  value={settings.website}
                  onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                  leftIcon={<Globe size={16} />}
                />
              </div>
            </div>
          </div>

          {/* MULTIMIDIA E BOAS VINDAS */}
          <div className="admin-section">
            <h2 className="admin-section-title">
              <Volume2 className="text-pink-400" size={20} /> Boas-vindas Multimídia
            </h2>
            <p className="text-sm text-slate-400 mb-6">Conteúdo reproduzido automaticamente na tela inicial do app.</p>

            <div className="admin-grid-2">
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-300">Áudio de Narração</label>
                <div
                  onClick={() => document.getElementById('welcome-audio-upload')?.click()}
                  className="border-2 border-dashed border-white/10 rounded-xl p-4 hover:bg-white/5 transition-colors cursor-pointer text-center"
                >
                  <Upload size={24} className="mx-auto text-slate-500 mb-2" />
                  <span className="text-xs text-slate-400">Clique para enviar áudio (MP3)</span>
                  <input
                    id="welcome-audio-upload"
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleWelcomeAudioUpload(e.target.files[0])}
                  />
                </div>
                {settings.welcomeAudioUrl && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <Headphones size={14} className="text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-emerald-400 truncate">Áudio configurado</p>
                      <audio controls src={settings.welcomeAudioUrl} className="h-6 w-full mt-1" />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Input
                  label="Vídeo de Apresentação (URL)"
                  value={settings.welcomeVideoUrl || ""}
                  onChange={(e) => setSettings({ ...settings, welcomeVideoUrl: e.target.value })}
                  placeholder="https://..."
                  leftIcon={<Video size={16} />}
                />
                <div className="aspect-video bg-black/40 rounded-lg flex items-center justify-center border border-white/5">
                  {settings.welcomeVideoUrl ? (
                    <video src={settings.welcomeVideoUrl} controls className="w-full h-full rounded-lg" />
                  ) : (
                    <div className="text-center text-slate-600">
                      <Video size={32} className="mx-auto mb-2 opacity-50" />
                      <span className="text-xs">Preview do vídeo</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* MAPAS E PLANTAS */}
          <div className="admin-section">
            <div className="flex items-center justify-between mb-6">
              <h2 className="admin-section-title">
                <MapIcon size={20} className="text-emerald-400" /> Plantas e Localização
              </h2>
              <Button variant="ghost" className="text-xs h-8" onClick={() => setShowFloorPlanModal(true)}>
                <Plus size={14} className="mr-1" /> Adicionar Andar
              </Button>
            </div>

            <div className="admin-grid-2">
              {/* PLANTA GERAL (LEGADO/OUTDOOR) */}
              <div className="space-y-4">
                <label className="text-sm font-bold text-slate-300">Mapa Outdoor / Capa do Mapa</label>
                <div
                  onClick={() => mapInputRef.current?.click()}
                  className="aspect-[4/3] rounded-xl border-2 border-dashed border-white/10 hover:border-white/20 hover:bg-white/5 transition-all cursor-pointer relative overflow-hidden group"
                >
                  {settings.mapImageUrl ? (
                    <img src={settings.mapImageUrl} className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                      <ImageIcon size={32} className="mb-2" />
                      <span className="text-xs">Enviar Mapa Geral</span>
                    </div>
                  )}
                  <input ref={mapInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload("mapImageUrl", e.target.files[0])} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Latitude"
                    type="number"
                    step="any"
                    value={settings.latitude}
                    onChange={(e) => setSettings({ ...settings, latitude: parseFloat(e.target.value) })}
                    className="h-9"
                  />
                  <Input
                    label="Longitude"
                    type="number"
                    step="any"
                    value={settings.longitude}
                    onChange={(e) => setSettings({ ...settings, longitude: parseFloat(e.target.value) })}
                    className="h-9"
                  />
                </div>
              </div>

              {/* LISTA DE ANDARES */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-300">Plantas dos Andares (Indoor)</label>
                <div className="bg-black/20 rounded-xl p-2 max-h-[300px] overflow-y-auto space-y-2">
                  {floorPlans.length === 0 && (
                    <div className="text-center py-8 text-slate-500 text-sm">
                      Nenhuma planta cadastrada.
                    </div>
                  )}
                  {floorPlans.map(plan => (
                    <div key={plan.id} className="bg-white/5 p-3 rounded-lg flex items-center gap-3 border border-white/5">
                      <div className="w-12 h-12 bg-black rounded overflow-hidden shrink-0">
                        <img src={plan.imageUrl} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-white truncate">{plan.name}</div>
                        <div className="text-xs text-slate-400">Andar: {plan.floor}</div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => openEditFloorPlan(plan)} className="p-1.5 hover:bg-white/10 rounded text-blue-400">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDeleteFloorPlan(plan.id)} className="p-1.5 hover:bg-white/10 rounded text-red-400">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* COLUNA DIREITA - VISUAL */}
        <div className="space-y-8">

          {/* IDENTIDADE VISUAL */}
          <div className="admin-section">
            <h2 className="admin-section-title">
              <Palette className="text-purple-400" size={20} /> Identidade Visual
            </h2>

            <div className="space-y-6">
              {/* LOGO */}
              <div className="text-center">
                <div
                  onClick={() => logoInputRef.current?.click()}
                  className="w-32 h-32 mx-auto rounded-full border-2 border-dashed border-white/20 hover:border-white/40 cursor-pointer overflow-hidden flex items-center justify-center bg-black/40 group relative"
                >
                  {settings.logoUrl ? (
                    <img src={settings.logoUrl} className="w-full h-full object-contain" />
                  ) : (
                    <Upload size={24} className="text-slate-500 group-hover:text-white" />
                  )}
                  <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload("logoUrl", e.target.files[0])} />
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs font-bold uppercase">Trocar Logo</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-2">Logomarca Principal</p>
              </div>

              {/* CORES */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Cor Primária</label>
                  <div className="flex gap-2">
                    <div className="w-10 h-10 rounded-lg border border-white/10 overflow-hidden shrink-0 relative">
                      <input type="color" value={settings.primaryColor} onChange={e => setSettings({ ...settings, primaryColor: e.target.value })} className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer" />
                    </div>
                    <Input value={settings.primaryColor} onChange={e => setSettings({ ...settings, primaryColor: e.target.value })} className="h-10 font-mono text-center" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Cor Secundária</label>
                  <div className="flex gap-2">
                    <div className="w-10 h-10 rounded-lg border border-white/10 overflow-hidden shrink-0 relative">
                      <input type="color" value={settings.secondaryColor} onChange={e => setSettings({ ...settings, secondaryColor: e.target.value })} className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer" />
                    </div>
                    <Input value={settings.secondaryColor} onChange={e => setSettings({ ...settings, secondaryColor: e.target.value })} className="h-10 font-mono text-center" />
                  </div>
                </div>
              </div>

              {/* TEMA E FONTE */}
              <div className="p-4 bg-black/20 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Tema Escuro</span>
                  <div
                    onClick={() => setSettings({ ...settings, theme: settings.theme === 'dark' ? 'light' : 'dark' })}
                    className={`w-12 h-6 rounded-full cursor-pointer relative transition-colors ${settings.theme === 'dark' ? 'bg-blue-600' : 'bg-slate-700'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.theme === 'dark' ? 'left-7' : 'left-1'}`} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Fonte Histórica (Serif)</span>
                  <div
                    onClick={() => setSettings({ ...settings, historicalFont: !settings.historicalFont })}
                    className={`w-12 h-6 rounded-full cursor-pointer relative transition-colors ${settings.historicalFont ? 'bg-gold' : 'bg-slate-700'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.historicalFont ? 'left-7' : 'left-1'}`} />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* PREVIEW CARD */}
          <div
            className="rounded-3xl p-6 relative overflow-hidden shadow-2xl transition-all duration-300"
            style={{
              backgroundColor: settings.theme === 'dark' ? '#121212' : '#ffffff',
              color: settings.theme === 'dark' ? '#ffffff' : '#121212',
              fontFamily: settings.historicalFont ? 'Georgia, serif' : 'sans-serif'
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-32 opacity-20" style={{ background: `linear-gradient(to bottom, ${settings.primaryColor}, transparent)` }}></div>

            <div className="relative z-10 text-center">
              <img src={settings.logoUrl || "https://via.placeholder.com/100"} className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-white/10 shadow-lg object-cover" />

              <h3 className="text-xl font-bold mb-2" style={{ color: settings.primaryColor }}>{settings.name || "Nome do Museu"}</h3>
              <p className="text-xs opacity-70 mb-6 line-clamp-3">{settings.mission || "Missão e descrição..."}</p>

              <button
                className="w-full py-3 rounded-xl font-bold text-sm shadow-lg mb-4"
                style={{ background: settings.primaryColor, color: settings.theme === 'dark' ? '#000' : '#fff' }}
              >
                Ingressos
              </button>

              <div className="flex justify-center gap-4 text-xs opacity-60">
                <span className="flex items-center gap-1"><Clock size={12} /> Aberto agora</span>
                <span className="flex items-center gap-1"><MapPin size={12} /> Navegar</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ACTION BAR */}
      <div className="admin-wizard-footer">
        <div className="admin-wizard-footer-inner justify-end">
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500 font-medium">
              Alterações não salvas
            </span>
            <Button
              onClick={handleSave}
              isLoading={saving}
              className="btn-primary"
              leftIcon={<Save size={18} />}
            >
              Salvar Configurações
            </Button>
          </div>
        </div>
      </div>

      {/* Modal para adicionar/editar planta */}
      {showFloorPlanModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6">
              {editingFloorPlan ? "Editar Andar" : "Novo Andar"}
            </h3>

            <div className="space-y-4">
              <Input
                label="Nome do Andar"
                value={newFloorPlan.name}
                onChange={(e) => setNewFloorPlan({ ...newFloorPlan, name: e.target.value })}
                placeholder="Ex: Térreo"
              />
              <Input
                label="Número (Ordem)"
                type="number"
                value={newFloorPlan.floor}
                onChange={(e) => setNewFloorPlan({ ...newFloorPlan, floor: parseInt(e.target.value) || 0 })}
              />
              <div
                onClick={() => floorPlanInputRef.current?.click()}
                className="aspect-video rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors"
              >
                {newFloorPlan.imageUrl ? (
                  <img src={newFloorPlan.imageUrl} className="w-full h-full object-contain" />
                ) : (
                  <div className="text-center text-slate-500">
                    <Upload size={24} className="mx-auto mb-2" />
                    <span className="text-sm">Imagem da Planta</span>
                  </div>
                )}
                <input ref={floorPlanInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFloorPlanImageUpload(e.target.files[0])} />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <Button variant="ghost" onClick={() => setShowFloorPlanModal(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleSaveFloorPlan} className="flex-1">
                Salvar
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
