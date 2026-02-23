import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Input, Button, Textarea, Select } from "../../../components/ui";
import {
  Settings, Building2, MapPin, Clock, Phone, Mail, Globe,
  Volume2, Upload, Headphones, Video, Map as MapIcon, Image as ImageIcon,
  Plus, Edit, Trash2, Palette, Save, Smartphone
} from "lucide-react";
import "./AdminMuseumSettings.css";

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
  capacityPerHour?: number;
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
    capacityPerHour: 50,
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
  const [activeTab, setActiveTab] = useState<"dados" | "multimidia" | "mapa" | "visual" | "preview">("dados");

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

  const tabs = [
    { id: "dados" as const, label: "Dados", icon: <Building2 size={16} /> },
    { id: "multimidia" as const, label: "Multimídia", icon: <Volume2 size={16} /> },
    { id: "mapa" as const, label: "Mapas", icon: <MapIcon size={16} /> },
    { id: "visual" as const, label: "Visual", icon: <Palette size={16} /> },
    { id: "preview" as const, label: "Preview", icon: <ImageIcon size={16} /> },
  ];

  return (
    <div className="visitor-theme-container max-w-5xl mx-auto px-4 pt-8">
      <div className="mb-6">
        <h1 className="visitor-theme-title flex items-center gap-3">
          <Settings size={32} /> Configurações do Museu
        </h1>
        <p className="visitor-theme-subtitle">
          Personalize a identidade visual e dados institucionais com estilo.
        </p>
      </div>

      {/* TAB BAR */}
      <div className="settings-tab-bar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`settings-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
            aria-selected={activeTab === tab.id}
            role="tab"
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div style={{ marginTop: "1.5rem" }}>

        {activeTab === "dados" && (
          <div className="visitor-card">
            <div className="visitor-card-header">
              <Building2 className="text-[#d4af37]" size={24} />
              <h2 className="visitor-card-title">Dados Institucionais</h2>
            </div>
            <div className="space-y-4">
              <div className="visitor-input-group">
                <label>Nome do Museu *</label>
                <input className="visitor-input" value={settings.name} onChange={(e) => setSettings({ ...settings, name: e.target.value })} placeholder="Ex: Museu Histórico" />
              </div>
              <div className="visitor-input-group">
                <label>Missão / Descrição</label>
                <textarea className="visitor-input" rows={3} value={settings.mission} onChange={(e) => setSettings({ ...settings, mission: e.target.value })} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="visitor-input-group">
                  <label>Endereço</label>
                  <input className="visitor-input" value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="visitor-input-group">
                    <label>Horário</label>
                    <input className="visitor-input" value={settings.openingHours} onChange={(e) => setSettings({ ...settings, openingHours: e.target.value })} />
                  </div>
                  <div className="visitor-input-group">
                    <label>Capacidade (Pessoas/Hora)</label>
                    <input type="number" className="visitor-input" value={settings.capacityPerHour || 50} onChange={(e) => setSettings({ ...settings, capacityPerHour: parseInt(e.target.value) || 50 })} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="visitor-input-group">
                    <label>WhatsApp</label>
                    <input className="visitor-input" value={settings.whatsapp} onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })} />
                  </div>
                  <div className="visitor-input-group">
                    <label>Email</label>
                    <input className="visitor-input" value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} />
                  </div>
                  <div className="visitor-input-group">
                    <label>Website</label>
                    <input className="visitor-input" value={settings.website} onChange={(e) => setSettings({ ...settings, website: e.target.value })} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "multimidia" && (
          <div className="visitor-card">
            <div className="visitor-card-header">
              <Volume2 className="text-[#d4af37]" size={24} />
              <h2 className="visitor-card-title">Boas-vindas Multimídia</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[#c9b58c] text-sm font-bold">Áudio de Narração</label>
                <div
                  onClick={() => document.getElementById('welcome-audio-upload')?.click()}
                  className="upload-area"
                  role="button"
                  aria-label="Fazer upload de áudio de boas-vindas"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && document.getElementById('welcome-audio-upload')?.click()}
                >
                  <Upload size={24} className="mx-auto text-[#d4af37] mb-2" />
                  <span className="text-xs text-[#c9b58c]">Enviar Áudio (MP3)</span>
                  <input id="welcome-audio-upload" type="file" accept="audio/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleWelcomeAudioUpload(e.target.files[0])} />
                </div>
                {settings.welcomeAudioUrl && (
                  <div className="floor-plan-item">
                    <Headphones size={18} className="text-[#d4af37]" aria-hidden="true" />
                    <span className="text-sm text-[#EAE0D5] flex-1">Áudio Configurado</span>
                    <audio controls src={settings.welcomeAudioUrl} className="h-6 w-24" aria-label="Player de áudio de boas-vindas" />
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <div className="visitor-input-group">
                  <label>Vídeo de Apresentação (URL)</label>
                  <input className="visitor-input" value={settings.welcomeVideoUrl || ""} onChange={(e) => setSettings({ ...settings, welcomeVideoUrl: e.target.value })} placeholder="https://..." />
                </div>
                <div className="aspect-video bg-black/40 rounded-lg flex items-center justify-center border border-[#463420]">
                  {settings.welcomeVideoUrl ? (
                    <video src={settings.welcomeVideoUrl} controls className="w-full h-full rounded-lg" />
                  ) : (
                    <Video size={32} className="text-[#463420]" />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "mapa" && (
          <div className="visitor-card">
            <div className="visitor-card-header justify-between">
              <div className="flex items-center gap-3">
                <MapIcon className="text-[#d4af37]" size={24} />
                <h2 className="visitor-card-title">Plantas e Localização</h2>
              </div>
              <button onClick={() => setShowFloorPlanModal(true)} className="btn-ghost-gold px-3 py-1 rounded-full text-xs font-bold">
                + Adicionar Andar
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[#c9b58c] text-sm font-bold">Mapa Outdoor</label>
                <div
                  onClick={() => mapInputRef.current?.click()}
                  className="aspect-[4/3] upload-area relative overflow-hidden p-0 flex items-center justify-center"
                  role="button"
                  tabIndex={0}
                  aria-label="Fazer upload do mapa outdoor"
                  onKeyDown={(e) => e.key === 'Enter' && mapInputRef.current?.click()}
                >
                  {settings.mapImageUrl ? (
                    <img src={settings.mapImageUrl} className="w-full h-full object-cover" alt="Mapa outdoor atual" />
                  ) : (
                    <div className="text-center p-4">
                      <ImageIcon size={32} className="mx-auto mb-2 text-[#d4af37]" aria-hidden="true" />
                      <span className="text-xs text-[#c9b58c]">Enviar Mapa Geral</span>
                    </div>
                  )}
                  <input ref={mapInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload("mapImageUrl", e.target.files[0])} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" step="any" className="visitor-input" placeholder="Lat" value={settings.latitude} onChange={(e) => setSettings({ ...settings, latitude: parseFloat(e.target.value) })} />
                  <input type="number" step="any" className="visitor-input" placeholder="Lng" value={settings.longitude} onChange={(e) => setSettings({ ...settings, longitude: parseFloat(e.target.value) })} />
                </div>
              </div>
              <div>
                <label className="text-[#c9b58c] text-sm font-bold mb-3 block">Andares Indoor</label>
                <div className="space-y-2">
                  {floorPlans.map(plan => (
                    <div key={plan.id} className="floor-plan-item">
                      <img src={plan.imageUrl} className="floor-plan-image" />
                      <div className="flex-1">
                        <div className="text-[#d4af37] font-bold">{plan.name}</div>
                        <div className="text-xs opacity-70">Andar {plan.floor}</div>
                      </div>
                      <button onClick={() => handleDeleteFloorPlan(plan.id)} className="text-red-400 p-2"><Trash2 size={16} /></button>
                    </div>
                  ))}
                  {floorPlans.length === 0 && <p className="text-xs opacity-50 text-center py-4">Nenhum andar cadastrado.</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "visual" && (
          <div className="visitor-card">
            <div className="visitor-card-header">
              <Palette className="text-[#d4af37]" size={24} />
              <h2 className="visitor-card-title">Identidade Visual</h2>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="space-y-6">
                  <div className="flex flex-col items-center p-6 bg-[#1a1108] rounded-xl border border-[#463420]">
                    <div
                      onClick={() => logoInputRef.current?.click()}
                      className="w-24 h-24 rounded-full border-2 border-dashed border-[#463420] flex items-center justify-center cursor-pointer overflow-hidden hover:border-[#d4af37] transition-colors bg-black/20"
                      role="button"
                      tabIndex={0}
                      aria-label="Fazer upload da logomarca"
                      onKeyDown={(e) => e.key === 'Enter' && logoInputRef.current?.click()}
                    >
                      {settings.logoUrl ? (
                        <img src={settings.logoUrl} className="w-full h-full object-cover" alt="Logomarca atual" />
                      ) : (
                        <Upload size={24} className="text-[#d4af37]" aria-hidden="true" />
                      )}
                      <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload("logoUrl", e.target.files[0])} />
                    </div>
                    <p className="text-xs text-[#c9b58c] mt-2 font-bold uppercase tracking-wider">Logomarca</p>
                  </div>

                  <div className="visitor-input-group">
                    <label>Cor Primária (Destaques e Botões)</label>
                    <div className="flex gap-3">
                      <input type="color" className="w-14 h-12 bg-transparent border border-[#463420] rounded-lg cursor-pointer p-1" value={settings.primaryColor} onChange={e => setSettings({ ...settings, primaryColor: e.target.value })} />
                      <input className="visitor-input flex-1" value={settings.primaryColor} onChange={e => setSettings({ ...settings, primaryColor: e.target.value })} />
                    </div>
                  </div>

                  <div className="visitor-input-group">
                    <label>Cor Secundária (Bordas e Detalhes)</label>
                    <div className="flex gap-3">
                      <input type="color" className="w-14 h-12 bg-transparent border border-[#463420] rounded-lg cursor-pointer p-1" value={settings.secondaryColor} onChange={e => setSettings({ ...settings, secondaryColor: e.target.value })} />
                      <input className="visitor-input flex-1" value={settings.secondaryColor} onChange={e => setSettings({ ...settings, secondaryColor: e.target.value })} />
                    </div>
                  </div>

                  <div className="p-4 bg-black/20 rounded-xl border border-[#463420] space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[#EAE0D5] text-sm font-bold block">Tema Escuro</span>
                        <span className="text-[10px] text-[#c9b58c]">Recomendado para museus</span>
                      </div>
                      <div
                        onClick={() => setSettings({ ...settings, theme: settings.theme === 'dark' ? 'light' : 'dark' })}
                        className={`w-12 h-6 rounded-full cursor-pointer relative transition-colors ${settings.theme === 'dark' ? 'bg-[#d4af37]' : 'bg-[#463420]'}`}
                        role="switch"
                        aria-checked={settings.theme === 'dark'}
                        aria-label="Alternar tema escuro"
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-[#0f0a05] rounded-full transition-transform ${settings.theme === 'dark' ? 'left-7' : 'left-1'}`} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[#EAE0D5] text-sm font-bold block">Fonte Histórica</span>
                        <span className="text-[10px] text-[#c9b58c]">Estilo Serifado Premium</span>
                      </div>
                      <div
                        onClick={() => setSettings({ ...settings, historicalFont: !settings.historicalFont })}
                        className={`w-12 h-6 rounded-full cursor-pointer relative transition-colors ${settings.historicalFont ? 'bg-[#d4af37]' : 'bg-[#463420]'}`}
                        role="switch"
                        aria-checked={settings.historicalFont}
                        aria-label="Alternar fonte histórica"
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-[#0f0a05] rounded-full transition-transform ${settings.historicalFont ? 'left-7' : 'left-1'}`} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* LIVE PREVIEW COLUMN */}
                <div className="hidden lg:block sticky top-8">
                  <p className="text-[10px] text-[#c9b58c] mb-2 uppercase font-black tracking-widest text-center">Visualização em Tempo Real</p>
                  <div
                    className="rounded-[2.5rem] border-[8px] border-[#2c1e10] p-4 shadow-2xl relative overflow-hidden aspect-[9/16] w-[260px] mx-auto transition-all duration-500"
                    style={{
                      backgroundColor: (settings.theme || 'dark') === 'dark' ? '#121212' : '#ffffff',
                      color: (settings.theme || 'dark') === 'dark' ? '#ffffff' : '#121212',
                      fontFamily: settings.historicalFont ? 'Georgia, serif' : 'sans-serif'
                    }}
                  >
                    <div className="absolute top-0 left-0 right-0 h-24 opacity-30" style={{ background: `linear-gradient(to bottom, ${settings.primaryColor}, transparent)` }}></div>
                    <div className="relative z-10 text-center py-4">
                      <img src={settings.logoUrl || "https://via.placeholder.com/80"} className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-white/10 shadow-md object-cover" />
                      <h4 className="text-sm font-black mb-1 line-clamp-1" style={{ color: settings.primaryColor }}>{settings.name || "Seu Museu"}</h4>
                      <div className="w-full h-[1px] opacity-20 my-3" style={{ backgroundColor: settings.secondaryColor }}></div>
                      <div className="space-y-2 mt-4">
                        <div className="h-8 w-full rounded-lg flex items-center justify-center text-[10px] font-bold" style={{ background: settings.primaryColor, color: '#000' }}>EXPLORAR</div>
                        <div className="h-8 w-full rounded-lg border flex items-center justify-center text-[10px] font-bold" style={{ borderColor: settings.secondaryColor, color: settings.secondaryColor }}>MAPA</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        <div className="aspect-square rounded-lg bg-black/10 border border-white/5"></div>
                        <div className="aspect-square rounded-lg bg-black/10 border border-white/5"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "preview" && (
          <div className="visitor-card">
            <h2 className="visitor-card-title" style={{ marginBottom: "1.5rem" }}>Simulação Completa</h2>
            <div className="flex justify-center py-8">
              <div
                className="rounded-[3rem] border-[12px] border-[#2c1e10] p-6 relative overflow-hidden shadow-2xl transition-all duration-300 w-full max-w-[320px] aspect-[9/19]"
                style={{
                  backgroundColor: (settings.theme || 'dark') === 'dark' ? '#121212' : '#ffffff',
                  color: (settings.theme || 'dark') === 'dark' ? '#ffffff' : '#121212',
                  fontFamily: settings.historicalFont ? 'Georgia, serif' : 'sans-serif'
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-40 opacity-20" style={{ background: `linear-gradient(to bottom, ${settings.primaryColor}, transparent)` }}></div>
                <div className="relative z-10 text-center">
                  <div className="flex justify-between items-center mb-8 px-2">
                    <div className="w-8 h-8 rounded-full bg-black/10"></div>
                    <div className="w-16 h-4 bg-black/20 rounded-full"></div>
                  </div>
                  <img src={settings.logoUrl || "https://via.placeholder.com/100"} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white/10 shadow-lg object-cover" />
                  <h3 className="text-xl font-black mb-2" style={{ color: settings.primaryColor }}>{settings.name || "Seu Museu"}</h3>
                  <p className="text-[10px] opacity-60 mb-8 line-clamp-3 leading-relaxed italic">{settings.mission || "Sua missão aparecerá aqui para os visitantes..."}</p>
                  <div className="space-y-3">
                    <div className="w-full py-4 rounded-2xl font-black text-xs shadow-lg flex items-center justify-center gap-2" style={{ background: settings.primaryColor, color: '#000' }}>
                      <Smartphone size={14} /> EXPLORAR ACERVO
                    </div>
                    <div className="w-full py-4 rounded-2xl font-black text-xs border-2 flex items-center justify-center gap-2" style={{ borderColor: settings.secondaryColor, color: settings.secondaryColor }}>
                      <MapIcon size={14} /> MAPA INTERATIVO
                    </div>
                  </div>
                  <div className="mt-8 grid grid-cols-3 gap-2">
                    <div className="h-1 bg-current opacity-20 rounded"></div>
                    <div className="h-1 bg-current opacity-20 rounded"></div>
                    <div className="h-1 bg-current opacity-20 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ACTION BAR */}
      <div className="admin-wizard-footer">
        <div className="admin-wizard-footer-inner justify-end">
          <div className="flex items-center gap-4">
            <span className="text-xs text-[#c9b58c] font-medium">
              Alterações não salvas
            </span>
            <Button
              onClick={handleSave}
              isLoading={saving}
              className="btn-primary-gold px-8 py-3 rounded-xl"
              leftIcon={<Save size={18} />}
            >
              Salvar Configurações
            </Button>
          </div>
        </div>
      </div>

      {showFloorPlanModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 backdrop-blur-sm" style={{ fontFamily: 'serif' }}>
          <div className="visitor-card w-full max-w-md bg-[#1a1108] m-0">
            <h3 className="visitor-card-title mb-6">{editingFloorPlan ? "Editar" : "Novo"} Andar</h3>
            <div className="space-y-4">
              <input className="visitor-input" placeholder="Nome (Ex: Térreo)" value={newFloorPlan.name} onChange={(e) => setNewFloorPlan({ ...newFloorPlan, name: e.target.value })} />
              <input className="visitor-input" type="number" placeholder="Ordem" value={newFloorPlan.floor} onChange={(e) => setNewFloorPlan({ ...newFloorPlan, floor: parseInt(e.target.value) || 0 })} />
              <div
                onClick={() => floorPlanInputRef.current?.click()}
                className="upload-area"
                role="button"
                tabIndex={0}
                aria-label="Fazer upload da imagem do andar"
                onKeyDown={(e) => e.key === 'Enter' && floorPlanInputRef.current?.click()}
              >
                <span className="text-xs text-[#c9b58c]">{newFloorPlan.imageUrl ? "Trocar Imagem" : "Escolher Imagem"}</span>
                <input ref={floorPlanInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFloorPlanImageUpload(e.target.files[0])} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowFloorPlanModal(false)} className="btn-ghost-gold flex-1 py-3 rounded-lg">Cancelar</button>
              <button onClick={handleSaveFloorPlan} className="btn-primary-gold flex-1 py-3 rounded-lg">Salvar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
