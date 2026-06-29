import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../../api/client";
import { useAuth } from "../../../auth/AuthContext";
import { 
  Settings, 
  Building2, 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  Globe,
  Volume2, 
  Upload, 
  Headphones, 
  Video, 
  Map as MapIcon, 
  Image as ImageIcon,
  Plus, 
  Edit, 
  Trash2, 
  Palette, 
  Save, 
  Smartphone, 
  CreditCard, 
  HelpCircle,
  ArrowUpRight, 
  ShieldCheck, 
  CheckCircle,
  Eye,
  Camera,
  Layout,
  Music,
  Share2,
  Route,
  XCircle
} from "lucide-react";
import { 
  Card, 
  Button, 
  Input, 
  Badge, 
  AnimateIn,
  AnimatedCounter 
} from "@/components/ui";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface FloorPlan {
  id: string;
  name: string;
  floor: number;
  imageUrl: string;
  order: number;
}

interface MuseumSettings {
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
  mapImageUrl: string;
  latitude: number | null;
  longitude: number | null;
  primaryColor: string;
  secondaryColor: string;
  theme: "light" | "dark";
  historicalFont: boolean;
  welcomeAudioUrl?: string;
  welcomeVideoUrl?: string;
  frameUrl?: string;
  bannerUrl?: string;
  capacityPerHour?: number;
  stripeConnectId?: string;
  asaasWalletId?: string;
  isPublicInstitution?: boolean;
}

export const AdminMuseumSettings: React.FC = () => {
  const { t } = useTranslation();
  const { tenantId } = useAuth();

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const frameInputRef = useRef<HTMLInputElement>(null);
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
    secondaryColor: "#463420",
    theme: "dark",
    historicalFont: true,
    welcomeAudioUrl: "",
    welcomeVideoUrl: "",
    frameUrl: "",
    bannerUrl: "",
    stripeConnectId: "",
    asaasWalletId: "",
    isPublicInstitution: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [floorPlans, setFloorPlans] = useState<FloorPlan[]>([]);
  const [showFloorPlanModal, setShowFloorPlanModal] = useState(false);
  const [editingFloorPlan, setEditingFloorPlan] = useState<FloorPlan | null>(null);
  const [newFloorPlan, setNewFloorPlan] = useState({ name: "", floor: 0, imageUrl: "" });
  const [activeTab, setActiveTab] = useState<string>("dados");

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
      if (res.data) setSettings(res.data);
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
      toast.success("Configurações salvas com sucesso!");
    } catch {
      toast.error("Erro ao salvar configurações.");
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (field: keyof MuseumSettings, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const loadingToast = toast.loading("Enviando imagem...");
    try {
      const res = await api.post("/upload/image", formData);
      setSettings(prev => ({ ...prev, [field]: res.data.url }));
      toast.success("Imagem enviada!", { id: loadingToast });
    } catch {
      toast.error("Erro no upload.", { id: loadingToast });
    }
  };

  const handleWelcomeAudioUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const loadingToast = toast.loading("Enviando áudio...");
    try {
      const res = await api.post("/upload/audio", formData);
      setSettings(prev => ({ ...prev, welcomeAudioUrl: res.data.url }));
      toast.success("Áudio enviado!", { id: loadingToast });
    } catch {
      toast.error("Erro no upload do áudio.", { id: loadingToast });
    }
  };

  const handleFloorPlanImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const loadingToast = toast.loading("Enviando planta...");
    try {
      const res = await api.post("/upload/image", formData);
      setNewFloorPlan(prev => ({ ...prev, imageUrl: res.data.url }));
      toast.success("Planta enviada!", { id: loadingToast });
    } catch {
      toast.error("Erro no upload.", { id: loadingToast });
    }
  };

  const handleSaveFloorPlan = async () => {
    if (!newFloorPlan.name || !newFloorPlan.imageUrl) {
      toast.error("Nome e imagem são obrigatórios");
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
      toast.success("Andar salvo!");
    } catch (err) {
      toast.error("Erro ao salvar andar");
    }
  };

  const handleDeleteFloorPlan = async (id: string) => {
    if (!confirm("Deseja excluir esta planta?")) return;
    try {
      await api.delete(`/floor-plans/${id}`);
      loadFloorPlans();
      toast.success("Planta excluída");
    } catch (err) {
      toast.error("Erro ao excluir planta");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-gold-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-[10px]">Carregando Configurações...</p>
      </div>
    );
  }

  const tabs = [
    { id: "dados", label: "Geral", icon: <Building2 size={18} /> },
    { id: "multimidia", label: "Multimídia", icon: <Volume2 size={18} /> },
    { id: "mapas", label: "Mapas", icon: <MapIcon size={18} /> },
    { id: "identidade", label: "Visual", icon: <Palette size={18} /> },
    ...(!settings.isPublicInstitution ? [{ id: "financeiro", label: "Financeiro", icon: <CreditCard size={18} /> }] : []),
  ];

  return (
    <AnimateIn className="space-y-8 pb-32 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
             <Settings className="text-gold-400" size={32} />
             Configurações Institucionais
          </h1>
          <p className="text-slate-400 font-medium">Personalize a identidade e os dados centrais do seu museu.</p>
        </div>

        <Button 
          onClick={handleSave} 
          isLoading={saving}
          className="h-14 px-10 rounded-2xl bg-gold-400 text-slate-950 font-black uppercase tracking-widest shadow-xl shadow-gold-400/20"
          leftIcon={<Save size={20} />}
        >
          Salvar Alterações
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation & Forms */}
        <div className="lg:col-span-8 space-y-8">
           {/* Tab Bar */}
           <div className="flex bg-white/5 p-1.5 rounded-3xl border border-white/5 backdrop-blur-xl overflow-x-auto no-scrollbar">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-gold-400 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
           </div>

           <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "dados" && (
                  <Card className="p-8 bg-white/[0.02] border-white/5 rounded-[40px] space-y-8">
                     <div className="flex items-center gap-4 text-white">
                        <div className="w-12 h-12 rounded-2xl bg-gold-400/10 flex items-center justify-center text-gold-400">
                           <Building2 size={24} />
                        </div>
                        <div>
                           <h2 className="text-xl font-bold">Informações do Museu</h2>
                           <p className="text-xs text-slate-500">Dados públicos exibidos para os visitantes.</p>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-4">Nome Oficial</label>
                           <input 
                              className="w-full h-14 px-6 bg-white/5 border border-white/5 rounded-2xl text-white outline-none focus:border-gold-400/50 transition-all"
                              value={settings.name}
                              onChange={e => setSettings({...settings, name: e.target.value})}
                              placeholder="Ex: Museu Nacional de Arte"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-4">Email de Contato</label>
                           <input 
                              className="w-full h-14 px-6 bg-white/5 border border-white/5 rounded-2xl text-white outline-none focus:border-gold-400/50 transition-all"
                              value={settings.email}
                              onChange={e => setSettings({...settings, email: e.target.value})}
                              placeholder="contato@museu.org"
                           />
                        </div>
                        <div className="col-span-full space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-4">Missão & Descrição</label>
                           <textarea 
                              className="w-full p-6 bg-white/5 border border-white/5 rounded-[32px] text-white outline-none focus:border-gold-400/50 transition-all min-h-[120px]"
                              value={settings.mission}
                              onChange={e => setSettings({...settings, mission: e.target.value})}
                              placeholder="Fale um pouco sobre a história e propósito do museu..."
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-4">Endereço Físico</label>
                           <input 
                              className="w-full h-14 px-6 bg-white/5 border border-white/5 rounded-2xl text-white outline-none focus:border-gold-400/50 transition-all"
                              value={settings.address}
                              onChange={e => setSettings({...settings, address: e.target.value})}
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-4">Horário de Funcionamento</label>
                           <input 
                              className="w-full h-14 px-6 bg-white/5 border border-white/5 rounded-2xl text-white outline-none focus:border-gold-400/50 transition-all"
                              value={settings.openingHours}
                              onChange={e => setSettings({...settings, openingHours: e.target.value})}
                           />
                        </div>
                     </div>
                  </Card>
                )}

                {activeTab === "identidade" && (
                  <div className="space-y-8">
                     <Card className="p-8 bg-white/[0.02] border-white/5 rounded-[40px] space-y-8">
                        <div className="flex items-center gap-4 text-white">
                           <div className="w-12 h-12 rounded-2xl bg-gold-400/10 flex items-center justify-center text-gold-400">
                              <Palette size={24} />
                           </div>
                           <div>
                              <h2 className="text-xl font-bold">Branding & Cores</h2>
                              <p className="text-xs text-slate-500">Defina o DNA visual do seu portal.</p>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           <div className="space-y-4">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-4">Logomarca Principal</label>
                              <div 
                                onClick={() => logoInputRef.current?.click()}
                                className="aspect-square rounded-[32px] bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center cursor-pointer group hover:border-gold-400/50 transition-all overflow-hidden"
                              >
                                 {settings.logoUrl ? (
                                    <img src={settings.logoUrl} className="w-full h-full object-contain p-8" />
                                 ) : (
                                    <Upload size={32} className="text-slate-700 group-hover:text-gold-400 transition-colors" />
                                 )}
                                 <input ref={logoInputRef} type="file" className="hidden" onChange={e => e.target.files?.[0] && handleFileUpload("logoUrl", e.target.files[0])} />
                              </div>
                           </div>

                           <div className="md:col-span-2 space-y-6">
                              <div className="grid grid-cols-2 gap-4">
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-4">Cor Primária</label>
                                    <div className="flex items-center gap-3">
                                       <input type="color" value={settings.primaryColor} onChange={e => setSettings({...settings, primaryColor: e.target.value})} className="w-14 h-14 rounded-2xl bg-transparent border border-white/10 p-1 cursor-pointer" />
                                       <input className="flex-1 h-14 px-6 bg-white/5 border border-white/5 rounded-2xl text-white outline-none" value={settings.primaryColor} onChange={e => setSettings({...settings, primaryColor: e.target.value})} />
                                    </div>
                                 </div>
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-4">Cor Secundária</label>
                                    <div className="flex items-center gap-3">
                                       <input type="color" value={settings.secondaryColor} onChange={e => setSettings({...settings, secondaryColor: e.target.value})} className="w-14 h-14 rounded-2xl bg-transparent border border-white/10 p-1 cursor-pointer" />
                                       <input className="flex-1 h-14 px-6 bg-white/5 border border-white/5 rounded-2xl text-white outline-none" value={settings.secondaryColor} onChange={e => setSettings({...settings, secondaryColor: e.target.value})} />
                                    </div>
                                 </div>
                              </div>

                              <div className="p-6 bg-black/40 rounded-[32px] border border-white/5 space-y-4">
                                 <div className="flex items-center justify-between">
                                    <div>
                                       <p className="text-sm font-bold text-white">Fonte Histórica</p>
                                       <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Ativar tipografia serifada premium</p>
                                    </div>
                                    <button 
                                       onClick={() => setSettings({...settings, historicalFont: !settings.historicalFont})}
                                       className={`w-12 h-6 rounded-full relative transition-all ${settings.historicalFont ? 'bg-gold-400' : 'bg-slate-800'}`}
                                    >
                                       <div className={`absolute top-1 w-4 h-4 bg-slate-950 rounded-full transition-all ${settings.historicalFont ? 'left-7' : 'left-1'}`} />
                                    </button>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </Card>

                     <Card className="p-8 bg-white/[0.02] border-white/5 rounded-[40px] space-y-8">
                        <div className="flex items-center gap-4 text-white">
                           <div className="w-12 h-12 rounded-2xl bg-gold-400/10 flex items-center justify-center text-gold-400">
                              <ImageIcon size={24} />
                           </div>
                           <div>
                              <h2 className="text-xl font-bold">Imagens de Ambientação</h2>
                              <p className="text-xs text-slate-500">Fundos e molduras do portal do visitante.</p>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-4">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-4">Fundo do Portal</label>
                              <div 
                                onClick={() => bannerInputRef.current?.click()}
                                className="h-40 rounded-[32px] bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center cursor-pointer group hover:border-gold-400/50 transition-all overflow-hidden"
                              >
                                 {settings.bannerUrl ? (
                                    <img src={settings.bannerUrl} className="w-full h-full object-cover" />
                                 ) : (
                                    <div className="text-center space-y-2">
                                       <Camera size={24} className="mx-auto text-slate-700 group-hover:text-gold-400 transition-colors" />
                                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 block">Enviar Background</span>
                                    </div>
                                 )}
                                 <input ref={bannerInputRef} type="file" className="hidden" onChange={e => e.target.files?.[0] && handleFileUpload("bannerUrl", e.target.files[0])} />
                              </div>
                           </div>
                           <div className="space-y-4">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-4">Moldura Decorativa</label>
                              <div 
                                onClick={() => frameInputRef.current?.click()}
                                className="h-40 rounded-[32px] bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center cursor-pointer group hover:border-gold-400/50 transition-all overflow-hidden"
                              >
                                 {settings.frameUrl ? (
                                    <img src={settings.frameUrl} className="w-full h-full object-contain p-4" />
                                 ) : (
                                    <div className="text-center space-y-2">
                                       <Layout size={24} className="mx-auto text-slate-700 group-hover:text-gold-400 transition-colors" />
                                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 block">Enviar Moldura</span>
                                    </div>
                                 )}
                                 <input ref={frameInputRef} type="file" className="hidden" onChange={e => e.target.files?.[0] && handleFileUpload("frameUrl", e.target.files[0])} />
                              </div>
                           </div>
                        </div>
                     </Card>
                  </div>
                )}

                {activeTab === "multimidia" && (
                  <Card className="p-8 bg-white/[0.02] border-white/5 rounded-[40px] space-y-8">
                     <div className="flex items-center gap-4 text-white">
                        <div className="w-12 h-12 rounded-2xl bg-gold-400/10 flex items-center justify-center text-gold-400">
                           <Music size={24} />
                        </div>
                        <div>
                           <h2 className="text-xl font-bold">Experiência Imersiva</h2>
                           <p className="text-xs text-slate-500">Narração e vídeos de boas-vindas.</p>
                        </div>
                     </div>

                     <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="space-y-4">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-4">Áudio de Introdução</label>
                              <div className="p-6 bg-black/40 rounded-[32px] border border-white/5 space-y-6">
                                 {settings.welcomeAudioUrl ? (
                                    <div className="space-y-4">
                                       <div className="flex items-center gap-3 text-gold-400">
                                          <Headphones size={20} />
                                          <span className="text-xs font-bold truncate">Áudio configurado</span>
                                       </div>
                                       <audio controls src={settings.welcomeAudioUrl} className="w-full h-10 opacity-60" />
                                       <Button variant="glass" className="w-full h-12 rounded-xl text-red-400 border-red-400/10" onClick={() => setSettings({...settings, welcomeAudioUrl: ""})}>
                                          Remover Áudio
                                       </Button>
                                    </div>
                                 ) : (
                                    <div 
                                       onClick={() => document.getElementById('audio-upload')?.click()}
                                       className="py-12 border-2 border-dashed border-white/5 rounded-[24px] flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-gold-400/30 transition-all"
                                    >
                                       <Upload size={32} className="text-slate-800" />
                                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Enviar Áudio (MP3)</span>
                                       <input id="audio-upload" type="file" className="hidden" accept="audio/*" onChange={e => e.target.files?.[0] && handleWelcomeAudioUpload(e.target.files[0])} />
                                    </div>
                                 )}
                              </div>
                           </div>

                           <div className="space-y-4">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-4">Vídeo de Boas-Vindas (URL)</label>
                              <input 
                                 className="w-full h-14 px-6 bg-white/5 border border-white/5 rounded-2xl text-white outline-none focus:border-gold-400/50 transition-all mb-4"
                                 value={settings.welcomeVideoUrl}
                                 onChange={e => setSettings({...settings, welcomeVideoUrl: e.target.value})}
                                 placeholder="URL do vídeo (ex: Youtube, Vimeo, Mp4...)"
                              />
                              <div className="aspect-video bg-black/40 rounded-[32px] border border-white/5 flex items-center justify-center overflow-hidden">
                                 {settings.welcomeVideoUrl ? (
                                    <video src={settings.welcomeVideoUrl} controls className="w-full h-full object-cover" />
                                 ) : (
                                    <Video size={32} className="text-slate-800" />
                                 )}
                              </div>
                           </div>
                        </div>
                     </div>
                  </Card>
                )}

                {activeTab === "mapas" && (
                  <Card className="p-8 bg-white/[0.02] border-white/5 rounded-[40px] space-y-8">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-white">
                           <div className="w-12 h-12 rounded-2xl bg-gold-400/10 flex items-center justify-center text-gold-400">
                              <MapIcon size={24} />
                           </div>
                           <div>
                              <h2 className="text-xl font-bold">Plantas e Orientação</h2>
                              <p className="text-xs text-slate-500">Navegação indoor e localização geográfica.</p>
                           </div>
                        </div>
                        <Button variant="glass" className="rounded-xl h-10 px-4" onClick={() => setShowFloorPlanModal(true)}>
                           <Plus size={16} className="mr-2" /> Novo Andar
                        </Button>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-4">Localização (Coordenadas)</label>
                           <div className="grid grid-cols-2 gap-4">
                              <input type="number" step="any" placeholder="Latitude" value={settings.latitude ?? ""} onChange={e => setSettings({...settings, latitude: parseFloat(e.target.value)})} className="h-14 px-6 bg-white/5 border border-white/5 rounded-2xl text-white outline-none" />
                              <input type="number" step="any" placeholder="Longitude" value={settings.longitude ?? ""} onChange={e => setSettings({...settings, longitude: parseFloat(e.target.value)})} className="h-14 px-6 bg-white/5 border border-white/5 rounded-2xl text-white outline-none" />
                           </div>
                           <div className="h-40 rounded-[32px] bg-slate-900 overflow-hidden relative border border-white/5">
                              <div className="absolute inset-0 flex items-center justify-center text-slate-800">
                                 <MapPin size={32} />
                              </div>
                           </div>
                        </div>

                        <div className="space-y-4">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-4">Andares Registrados</label>
                           <div className="space-y-3">
                              {floorPlans.map(plan => (
                                 <div key={plan.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-4 group">
                                    <div className="w-12 h-12 rounded-xl bg-slate-800 overflow-hidden border border-white/10">
                                       <img src={plan.imageUrl} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                       <h5 className="text-sm font-bold text-white">{plan.name}</h5>
                                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Nível {plan.floor}</span>
                                    </div>
                                    <button onClick={() => handleDeleteFloorPlan(plan.id)} className="p-2 text-slate-700 hover:text-red-500 transition-colors">
                                       <Trash2 size={16} />
                                    </button>
                                 </div>
                              ))}
                              {floorPlans.length === 0 && (
                                 <p className="text-center py-8 text-slate-600 text-xs italic">Nenhuma planta cadastrada.</p>
                              )}
                           </div>
                        </div>
                     </div>
                  </Card>
                )}

                {activeTab === "financeiro" && !settings.isPublicInstitution && (
                  <Card className="p-8 bg-white/[0.02] border-white/5 rounded-[40px] space-y-8">
                     <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-gold-400/10 flex items-center justify-center text-gold-400">
                           <CreditCard size={24} />
                        </div>
                        <div>
                           <h2 className="text-xl font-bold">Gateway de Pagamentos</h2>
                           <p className="text-xs text-slate-500">Gerencie ingressos e doações diretamente.</p>
                        </div>
                     </div>

                     <div className="p-8 bg-gradient-to-br from-gold-400/10 to-transparent rounded-[32px] border border-gold-400/20 space-y-6">
                        <div className="flex items-start gap-4">
                           <ShieldCheck className="text-gold-400 mt-1" size={24} />
                           <div>
                              <h4 className="text-white font-bold">Stripe Connect — Instituição Privada</h4>
                              <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                                 Sua instituição é privada e pode receber pagamentos diretamente. Conecte sua conta bancária para receber os valores de ingressos, doações e loja.
                              </p>
                           </div>
                        </div>

                        <div className="flex flex-col items-center justify-center py-10 bg-black/20 rounded-[24px] border border-white/5">
                           {settings.stripeConnectId ? (
                              <div className="text-center space-y-4">
                                 <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mx-auto mb-2">
                                    <CheckCircle size={32} />
                                 </div>
                                 <h5 className="text-lg font-black text-white italic">ID: {settings.stripeConnectId}</h5>
                                 <Badge className="bg-green-500/10 text-green-400 border-green-500/20">OPERACIONAL</Badge>
                                 <div className="pt-4">
                                    <Button variant="glass" className="rounded-xl border-white/5">Acessar Dashboard Stripe</Button>
                                 </div>
                              </div>
                           ) : (
                              <div className="text-center space-y-4 max-w-xs">
                                 <CreditCard className="text-slate-700 mx-auto" size={48} />
                                 <p className="text-sm text-slate-400">Conecte sua conta bancária para começar a receber pagamentos online.</p>
                                 <Button 
                                    className="w-full bg-gold-400 text-slate-950 font-black rounded-xl h-12"
                                    onClick={async () => {
                                      try {
                                        const { data } = await api.get('/stripe/onboarding-link?type=MUSEUM');
                                        if (data && data.url) window.location.href = data.url;
                                      } catch (err) {
                                        toast.error("Erro ao gerar link do Stripe");
                                      }
                                    }}
                                 >
                                    CONECTAR AGORA
                                 </Button>
                              </div>
                           )}
                        </div>
                     </div>
                  </Card>
                )}

              </motion.div>
           </AnimatePresence>
        </div>

        {/* Live Preview Column */}
        <div className="lg:col-span-4 sticky top-8">
           <div className="text-center mb-6">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gold-400">Live Preview</span>
              <p className="text-xs text-slate-500 mt-1">Simulação em tempo real do portal do visitante.</p>
           </div>

           <div 
              className="relative mx-auto w-[280px] h-[580px] bg-slate-950 rounded-[50px] border-[12px] border-slate-900 shadow-[0_0_100px_rgba(212,175,55,0.1)] overflow-hidden transition-all duration-500"
              style={{
                fontFamily: settings.historicalFont ? 'Georgia, serif' : 'inherit'
              }}
           >
              {/* Device UI */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-3xl z-50"></div>
              
              {/* Content Preview */}
              <div className="h-full overflow-hidden flex flex-col">
                 <div className="h-40 relative overflow-hidden bg-slate-900 flex-shrink-0">
                    {settings.bannerUrl ? (
                       <img src={settings.bannerUrl} className="w-full h-full object-cover opacity-60" />
                    ) : (
                       <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-950" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-slate-950" />
                    
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                       <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-3 overflow-hidden flex items-center justify-center shadow-2xl">
                          {settings.logoUrl ? (
                             <img src={settings.logoUrl} className="w-full h-full object-contain p-2" />
                          ) : (
                             <Building2 className="text-white/40" size={24} />
                          )}
                       </div>
                       <h3 className="text-white font-black text-sm tracking-tight leading-none" style={{ color: settings.primaryColor }}>{settings.name || "Seu Museu"}</h3>
                    </div>
                 </div>

                 <div className="flex-1 p-6 space-y-4 bg-slate-950">
                    <div className="h-32 rounded-3xl bg-white/[0.03] border border-white/5 flex flex-col items-center justify-center p-4 text-center space-y-2">
                       <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">Nossa Missão</p>
                       <p className="text-[10px] text-slate-400 line-clamp-3 leading-relaxed italic">"{settings.mission || "Sua descrição institucional aparecerá aqui..."}"</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                       <div className="h-24 rounded-3xl bg-white/[0.03] border border-white/5 flex flex-col items-center justify-center p-3 text-center space-y-1">
                          <ImageIcon className="text-slate-800" size={16} />
                          <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Obras</span>
                       </div>
                       <div className="h-24 rounded-3xl bg-white/[0.03] border border-white/5 flex flex-col items-center justify-center p-3 text-center space-y-1">
                          <Route className="text-slate-800" size={16} />
                          <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Trilhas</span>
                       </div>
                    </div>

                    <div className="space-y-2 pt-2">
                       <div className="h-11 rounded-2xl flex items-center justify-center text-[10px] font-black uppercase tracking-widest shadow-lg shadow-gold-400/10" style={{ backgroundColor: settings.primaryColor, color: '#000' }}>
                          <Smartphone size={12} className="mr-2" /> Explorar Acervo
                       </div>
                       <div className="h-11 rounded-2xl border flex items-center justify-center text-[10px] font-black uppercase tracking-widest" style={{ borderColor: settings.secondaryColor, color: settings.secondaryColor }}>
                          Mapa Interativo
                       </div>
                    </div>
                 </div>
              </div>

              {/* Reflection Overlays */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/[0.03] via-transparent to-transparent"></div>
              <div className="absolute top-10 right-4 w-[2px] h-20 bg-white/[0.05] rounded-full blur-[1px]"></div>
           </div>

           <div className="mt-8 p-6 bg-gold-400/5 rounded-[32px] border border-gold-400/10 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gold-400/20 flex items-center justify-center text-gold-400 shrink-0">
                 <HelpCircle size={20} />
              </div>
              <div>
                 <p className="text-xs font-bold text-white mb-1">Dica de Design</p>
                 <p className="text-[10px] text-slate-500 leading-relaxed">
                    Use imagens de fundo com baixo contraste para garantir a legibilidade do texto e destaque para a sua logomarca.
                 </p>
              </div>
           </div>
        </div>
      </div>

      {/* Floor Plan Modal */}
      <AnimatePresence>
         {showFloorPlanModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
               <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/80 backdrop-blur-md"
                  onClick={() => setShowFloorPlanModal(false)}
               />
               <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="relative w-full max-w-lg bg-slate-950 border border-white/5 rounded-[40px] p-8 shadow-2xl overflow-hidden"
               >
                  <div className="flex items-center justify-between mb-8">
                     <h3 className="text-2xl font-black text-white tracking-tight">{editingFloorPlan ? "Editar" : "Novo"} Andar</h3>
                     <button onClick={() => setShowFloorPlanModal(false)} className="p-2 text-slate-500 hover:text-white"><XCircle size={24} /></button>
                  </div>

                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-4">Nome do Andar</label>
                        <input className="w-full h-14 px-6 bg-white/5 border border-white/5 rounded-2xl text-white outline-none" value={newFloorPlan.name} onChange={e => setNewFloorPlan({...newFloorPlan, name: e.target.value})} placeholder="Ex: Térreo, 1º Andar..." />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-4">Nível/Ordem</label>
                        <input type="number" className="w-full h-14 px-6 bg-white/5 border border-white/5 rounded-2xl text-white outline-none" value={newFloorPlan.floor} onChange={e => setNewFloorPlan({...newFloorPlan, floor: parseInt(e.target.value) || 0})} />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-4">Planta do Andar</label>
                        <div 
                           onClick={() => floorPlanInputRef.current?.click()}
                           className="aspect-video rounded-[32px] bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center cursor-pointer group hover:border-gold-400/50 transition-all overflow-hidden"
                        >
                           {newFloorPlan.imageUrl ? (
                              <img src={newFloorPlan.imageUrl} className="w-full h-full object-cover" />
                           ) : (
                              <div className="text-center space-y-2">
                                 <Upload size={32} className="mx-auto text-slate-800 group-hover:text-gold-400" />
                                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Enviar Imagem da Planta</span>
                              </div>
                           )}
                           <input ref={floorPlanInputRef} type="file" className="hidden" onChange={e => e.target.files?.[0] && handleFloorPlanImageUpload(e.target.files[0])} />
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-10">
                     <Button variant="glass" className="h-14 rounded-2xl" onClick={() => setShowFloorPlanModal(false)}>Cancelar</Button>
                     <Button className="h-14 rounded-2xl bg-gold-400 text-slate-950 font-black" onClick={handleSaveFloorPlan}>Salvar Andar</Button>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </AnimateIn>
  );
};
