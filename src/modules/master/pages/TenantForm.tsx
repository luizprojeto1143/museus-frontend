import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api, isDemoMode } from "../../../api/client";
import {
  Building2, 
  Save, 
  ArrowLeft, 
  Package, 
  Map, 
  Settings,
  Landmark, 
  Music, 
  Tent, 
  CheckCircle2,
  Users, 
  Mail, 
  Lock, 
  Globe, 
  FileText, 
  ChevronRight, 
  CheckCircle,
  Zap,
  ShieldCheck,
  Layers,
  ArrowRight,
  Database,
  Cpu,
  Sparkles,
  BarChart3,
  Dna,
  Layout,
  Terminal,
  Activity,
  Briefcase,
  Ticket,
  Bot,
  HeartHandshake,
  Sticker,
  Puzzle,
  Microscope,
  Award,
    Calendar,
} from "lucide-react";
import { 
    Button, 
    Input, 
    Select, 
    Textarea, 
    Card, 
    Badge, 
    AnimateIn,
    AnimatedCounter
} from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

const STEPS = [
  { id: 0, title: "Identificação", icon: Landmark, description: "DNA e Dados Básicos" },
  { id: 1, title: "Funcionalidades", icon: Settings, description: "Arquitetura de Módulos" },
  { id: 2, title: "Plano & Governança", icon: ShieldCheck, description: "Assinatura e Acesso" },
  { id: 3, title: "Revisão", icon: CheckCircle, description: "Manifesto de Node" }
];

interface TenantOption {
  id: string;
  name: string;
  type?: string;
  isCityMode?: boolean;
}

interface PlanOption {
  id: string;
  name: string;
}

interface TenantFeatures {
  featureWorks: boolean;
  featureTrails: boolean;
  featureEvents: boolean;
  featureGamification: boolean;
  featureQRCodes: boolean;
  featureChatAI: boolean;
  featureShop: boolean;
  featureDonations: boolean;
  featureCertificates: boolean;
  featureReviews: boolean;
  featureGuestbook: boolean;
  featureAccessibility: boolean;
  featureEditais: boolean;
  featureMinigames: boolean;
  featureProviders: boolean;
  featureTickets: boolean;
  featureProjects: boolean;
  featureAccessibilityMgmt: boolean;
  featureInstitutionalReports: boolean;
  featureEditaisSubmission: boolean;
  featureGroupContent: boolean;
  featureGroupEvents: boolean;
  featureGroupEngagement: boolean;
  featureGroupGamification: boolean;
  featureGroupInstitutional: boolean;
  featureGroupTools: boolean;
  featureGroupAnalytics: boolean;
  featureGroupSocial: boolean;
  featureGroupPreservation: boolean;
  featureGroupAI: boolean;
  featureGroupRoadmap: boolean;
}

interface TenantPayload extends TenantFeatures {
  name: string;
  slug: string;
  type: string;
  parentId: string | null;
  isCityMode: boolean;
  plan: string;
  maxWorks: number;
  termsOfUse: string;
  privacyPolicy: string;
  isPublicInstitution: boolean;
  adminEmail?: string;
  adminName?: string;
  adminPassword?: string;
}

export const TenantForm: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  // Wizard State
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [termsOfUse, setTermsOfUse] = useState("");
  const [privacyPolicy, setPrivacyPolicy] = useState("");

  const [tenantType, setTenantType] = useState<"MUSEUM" | "PRODUCER" | "CITY" | "CULTURAL_SPACE" | "SECRETARIA">("MUSEUM");
  const [parentId, setParentId] = useState<string | null>(null);
  const [cities, setCities] = useState<TenantOption[]>([]);
  const [availablePlans, setAvailablePlans] = useState<PlanOption[]>([]);

  const [adminEmail, setAdminEmail] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [plan, setPlan] = useState("START");
  const [maxWorks, setMaxWorks] = useState(50);

  // Feature Flags
  const [featureWorks, setFeatureWorks] = useState(true);
  const [featureTrails, setFeatureTrails] = useState(true);
  const [featureEvents, setFeatureEvents] = useState(true);
  const [featureGamification, setFeatureGamification] = useState(true);
  const [featureQRCodes, setFeatureQRCodes] = useState(true);
  const [featureChatAI, setFeatureChatAI] = useState(false);
  const [featureShop, setFeatureShop] = useState(false);
  const [featureDonations, setFeatureDonations] = useState(false);
  const [featureCertificates, setFeatureCertificates] = useState(true);
  const [featureReviews, setFeatureReviews] = useState(true);
  const [featureGuestbook, setFeatureGuestbook] = useState(true);
  const [featureAccessibility, setFeatureAccessibility] = useState(true);
  const [featureEditais, setFeatureEditais] = useState(false);
  const [featureMinigames, setFeatureMinigames] = useState(false);
  const [featureProviders, setFeatureProviders] = useState(false);
  const [featureTickets, setFeatureTickets] = useState(false);
  const [featureProjects, setFeatureProjects] = useState(false);
  const [featureAccessibilityMgmt, setFeatureAccessibilityMgmt] = useState(false);
  const [featureInstitutionalReports, setFeatureInstitutionalReports] = useState(false);
  const [featureEditaisSubmission, setFeatureEditaisSubmission] = useState(false);
  const [isPublicInstitution, setIsPublicInstitution] = useState(false);

  // Group Level Flags
  const [featureGroupContent, setFeatureGroupContent] = useState(true);
  const [featureGroupEvents, setFeatureGroupEvents] = useState(true);
  const [featureGroupEngagement, setFeatureGroupEngagement] = useState(true);
  const [featureGroupGamification, setFeatureGroupGamification] = useState(true);
  const [featureGroupInstitutional, setFeatureGroupInstitutional] = useState(true);
  const [featureGroupTools, setFeatureGroupTools] = useState(true);
  const [featureGroupAnalytics, setFeatureGroupAnalytics] = useState(true);
  const [featureGroupSocial, setFeatureGroupSocial] = useState(true);
  const [featureGroupPreservation, setFeatureGroupPreservation] = useState(true);
  const [featureGroupAI, setFeatureGroupAI] = useState(true);
  const [featureGroupRoadmap, setFeatureGroupRoadmap] = useState(true);

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadTenant = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/tenants/${id}`);
      const data = res.data;
      setName(data.name || "");
      setSlug(data.slug || "");
      setTenantType(data.type || "MUSEUM");
      setParentId(data.parentId || null);
      setPlan(data.plan || "START");
      setMaxWorks(data.maxWorks || 50);

      // Feature Flags
      setFeatureWorks(data.featureWorks ?? true);
      setFeatureTrails(data.featureTrails ?? true);
      setFeatureEvents(data.featureEvents ?? true);
      setFeatureGamification(data.featureGamification ?? true);
      setFeatureQRCodes(data.featureQRCodes ?? true);
      setFeatureChatAI(data.featureChatAI ?? false);
      setFeatureShop(data.featureShop ?? false);
      setFeatureDonations(data.featureDonations ?? false);
      setFeatureCertificates(data.featureCertificates ?? true);
      setFeatureReviews(data.featureReviews ?? true);
      setFeatureGuestbook(data.featureGuestbook ?? true);
      setFeatureAccessibility(data.featureAccessibility ?? true);
      setFeatureEditais(data.featureEditais ?? false);
      setFeatureMinigames(data.featureMinigames ?? false);
      setFeatureProviders(data.featureProviders ?? false);
      setFeatureTickets(data.featureTickets ?? false);
      setFeatureProjects(data.featureProjects ?? false);
      setFeatureAccessibilityMgmt(data.featureAccessibilityMgmt ?? false);
      setFeatureInstitutionalReports(data.featureInstitutionalReports ?? false);
      setFeatureEditaisSubmission(data.featureEditaisSubmission ?? false);

      // Group Level Flags
      setFeatureGroupContent(data.featureGroupContent ?? true);
      setFeatureGroupEvents(data.featureGroupEvents ?? true);
      setFeatureGroupEngagement(data.featureGroupEngagement ?? true);
      setFeatureGroupGamification(data.featureGroupGamification ?? true);
      setFeatureGroupInstitutional(data.featureGroupInstitutional ?? true);
      setFeatureGroupTools(data.featureGroupTools ?? true);
      setFeatureGroupAnalytics(data.featureGroupAnalytics ?? true);
      setFeatureGroupSocial(data.featureGroupSocial ?? true);
      setFeatureGroupPreservation(data.featureGroupPreservation ?? true);
      setFeatureGroupAI(data.featureGroupAI ?? true);
      setFeatureGroupRoadmap(data.featureGroupRoadmap ?? true);

      setTermsOfUse(data.termsOfUse || "");
      setPrivacyPolicy(data.privacyPolicy || "");
      setIsPublicInstitution(data.isPublicInstitution ?? false);
    } catch {
      toast.error("Falha ao sincronizar node.");
      navigate("/master/tenants");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (isEdit && id) loadTenant();
  }, [isEdit, id, loadTenant]);

  useEffect(() => {
    api.get("/tenants").then(res => {
        const cityTenants = (Array.isArray(res.data) ? res.data : []).filter((item: TenantOption) =>
          item.type === "CITY" || item.type === "SECRETARIA" || item.isCityMode === true
        );
        setCities(cityTenants);
      }).catch(console.error);

    api.get("/plans").then(res => {
        setAvailablePlans(Array.isArray(res.data) ? res.data : []);
      }).catch(console.error);
  }, []);

  const validateStep = (stepIndex: number) => {
    switch (stepIndex) {
      case 0:
        if (!name.trim()) return "O nome da instituição é obrigatório.";
        if (!slug.trim()) return "O slug de URL é obrigatório.";
        return null;
      case 2:
        if (!isEdit) {
          if (!adminName.trim()) return "Nome do administrador é obrigatório.";
          if (!adminEmail.trim()) return "E-mail do administrador é obrigatório.";
          if (!adminPassword.trim()) return "Senha do administrador é obrigatória.";
        }
        return null;
      default:
        return null;
    }
  };

  const nextStep = () => {
    const error = validateStep(currentStep);
    if (error) return toast.error(error);
    setDirection(1);
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  };

  const prevStep = () => {
    setDirection(-1);
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (isDemoMode) {
      toast.error("MODO DEMO: Criação de infraestrutura bloqueada.");
      navigate("/master/tenants");
      return;
    }

    setSaving(true);
    const payload: TenantPayload = {
      name, slug, type: tenantType, parentId: parentId || null,
      isCityMode: tenantType === "CITY" || tenantType === "SECRETARIA",
      plan, maxWorks,
      featureWorks, featureTrails, featureEvents, featureGamification, featureQRCodes,
      featureChatAI, featureShop, featureDonations, featureCertificates, featureReviews,
      featureGuestbook, featureAccessibility, featureEditais, featureMinigames,
      featureProviders, featureTickets, featureProjects, featureAccessibilityMgmt,
      featureInstitutionalReports, featureEditaisSubmission,
      featureGroupContent, featureGroupEvents, featureGroupEngagement,
      featureGroupGamification, featureGroupInstitutional, featureGroupTools,
      featureGroupAnalytics, featureGroupSocial, featureGroupPreservation,
      featureGroupAI, featureGroupRoadmap,
      termsOfUse, privacyPolicy,
      isPublicInstitution
    };

    if (!isEdit) {
      payload.adminEmail = adminEmail;
      payload.adminName = adminName;
      payload.adminPassword = adminPassword;
    }

    try {
      if (id) {
        await api.put(`/tenants/${id}`, payload);
        toast.success("Arquitetura de Node atualizada.");
      } else {
        await api.post("/tenants", payload);
        toast.success("Novo Node implantado com sucesso!");
      }
      navigate("/master/tenants");
    } catch (error: unknown) {
      toast.error("Falha no manifesto de implantação.");
    } finally {
      setSaving(false);
    }
  };

  const typeOptions = [
    { value: "SECRETARIA", icon: <Building2 size={28} />, label: "Secretaria de Cultura", desc: "Gestão pública de múltiplos equipamentos culturais." },
    { value: "CITY", icon: <Map size={28} />, label: "Cidade / Órgão", desc: "Instância de governança turística ou cultural." },
    { value: "MUSEUM", icon: <Landmark size={28} />, label: "Museu / Unidade", desc: "Tipologia clássica com acervo e exposições." },
    { value: "PRODUCER", icon: <Music size={28} />, label: "Produtora", desc: "Foco em eventos e projetos itinerantes." },
    { value: "CULTURAL_SPACE", icon: <Tent size={28} />, label: "Espaço Cultural", desc: "Galerias e centros comunitários." }
  ];

  interface FeatureToggleProps {
      label: string;
      state: boolean;
      setter: React.Dispatch<React.SetStateAction<boolean>>;
      premium?: boolean;
      icon?: React.FC<{ size?: number }>;
  }

  const FeatureToggle: React.FC<FeatureToggleProps> = ({ label, state, setter, premium, icon: Icon }) => (
    <div
      onClick={() => setter(!state)}
      className={`p-6 rounded-3xl border-2 cursor-pointer transition-all flex items-center gap-4 group ${state ? 'bg-blue-600/10 border-blue-500/30' : 'bg-white/[0.02] border-white/5 opacity-50 hover:opacity-100'}`}
    >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${state ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/5 text-slate-500'}`}>
            {Icon ? <Icon size={18} /> : (state ? <CheckCircle2 size={18} /> : <div className="w-2 h-2 rounded-full bg-slate-700" />)}
        </div>
        <div className="flex-1">
            <span className={`text-[10px] font-black uppercase tracking-widest ${state ? 'text-white' : 'text-slate-500'}`}>
                {label}
            </span>
        </div>
        {premium && <Badge className="bg-amber-600 text-white border-none text-[7px] font-black uppercase">PRO</Badge>}
    </div>
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-black animate-pulse uppercase tracking-widest text-[10px]">Lendo Arquitetura de Node...</p>
    </div>
  );

  return (
    <AnimateIn className="space-y-12 pb-32">
        {/* Header Area */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <Badge className="bg-blue-600/10 text-blue-400 border-none px-4 py-1.5 text-[8px] font-black uppercase tracking-[0.3em] italic">
                        Node Architect & Ecosystem Deployment
                    </Badge>
                </div>
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => navigate('/master/tenants')}
                        className="w-14 h-14 rounded-2xl bg-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center border border-white/5 shadow-xl"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter italic leading-none">
                        {isEdit ? 'Revisar' : 'Implantar'} <span className="text-blue-600">Node</span>
                    </h1>
                </div>
                <p className="text-slate-500 font-medium text-xl max-w-3xl leading-relaxed">
                    Passo {currentStep + 1} de {STEPS.length}: <span className="text-white font-black italic uppercase tracking-tighter">{STEPS[currentStep].title}</span>
                </p>
            </div>
        </div>

        {/* Stepper Progress */}
        <div className="relative flex justify-between items-center max-w-4xl mx-auto px-4">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/5 -translate-y-1/2" />
            <motion.div 
                className="absolute top-1/2 left-0 h-0.5 bg-blue-600 -translate-y-1/2 transition-all duration-500"
                style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
            />
            {STEPS.map((step, idx) => (
                <div key={idx} className="relative z-10 flex flex-col items-center gap-3 group cursor-pointer" onClick={() => (isEdit || idx < currentStep) && setCurrentStep(idx)}>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 border-2 ${
                        idx < currentStep ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-600/20' : 
                        idx === currentStep ? 'bg-[#0f172a] border-blue-500 text-blue-400 shadow-2xl' : 
                        'bg-[#0f172a] border-white/5 text-slate-700'
                    }`}>
                        <step.icon size={24} />
                    </div>
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] transition-colors ${idx <= currentStep ? 'text-white' : 'text-slate-700'}`}>
                        {step.title}
                    </span>
                </div>
            ))}
        </div>

        {/* Wizard Content */}
        <div className="min-h-[500px]">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: direction > 0 ? 40 : -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direction > 0 ? -40 : 40 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                    {/* STEP 0: DNA */}
                    {currentStep === 0 && (
                        <div className="space-y-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                                {typeOptions.map(opt => (
                                    <Card 
                                        key={opt.value}
                                        onClick={() => setTenantType(opt.value as unknown)}
                                        className={`p-8 rounded-[40px] cursor-pointer transition-all border-2 flex flex-col items-center text-center group hover:scale-105 ${tenantType === opt.value ? 'bg-blue-600/10 border-blue-500 shadow-2xl shadow-blue-600/10' : 'bg-white/[0.02] border-white/5 grayscale opacity-50 hover:grayscale-0 hover:opacity-100'}`}
                                    >
                                        <div className={`w-16 h-16 rounded-[24px] mb-6 flex items-center justify-center transition-all ${tenantType === opt.value ? 'bg-blue-600 text-white shadow-xl' : 'bg-white/5 text-slate-500'}`}>
                                            {opt.icon}
                                        </div>
                                        <h4 className={`text-xs font-black uppercase tracking-tighter italic mb-3 ${tenantType === opt.value ? 'text-white' : 'text-slate-500'}`}>{opt.label}</h4>
                                        <p className="text-[10px] text-slate-600 font-medium leading-relaxed italic">{opt.desc}</p>
                                    </Card>
                                ))}
                            </div>

                            <Card className="p-12 bg-white/[0.02] border-white/5 rounded-[56px] space-y-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-500 flex items-center justify-center">
                                        <Dna size={24} />
                                    </div>
                                    <h3 className="text-2xl font-black text-white tracking-tighter italic uppercase">Dados de Identidade</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Nome da Instituição / Node</label>
                                        <Input
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            placeholder="Ex: Museu de Arte Contemporânea"
                                            className="h-16 bg-white/5 border-white/5 rounded-2xl px-6"
                                            leftIcon={<Landmark size={20} className="text-blue-500" />}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Identificador de URL (Slug)</label>
                                        <Input
                                            value={slug}
                                            onChange={e => setSlug(e.target.value)}
                                            placeholder="mac-museu"
                                            className="h-16 bg-white/5 border-white/5 rounded-2xl px-6 font-mono"
                                            leftIcon={<Globe size={20} className="text-blue-500" />}
                                        />
                                    </div>
                                </div>
                                {(tenantType === "MUSEUM" || tenantType === "PRODUCER") && (
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Vinculação de Hierarquia (Node Pai)</label>
                                        <Select
                                            value={parentId || ""}
                                            onChange={e => setParentId(e.target.value || null)}
                                            className="h-16 bg-white/5 border-white/5 rounded-2xl px-6"
                                            leftIcon={<Layers size={20} className="text-blue-500" />}
                                        >
                                            <option value="">Independente / Global</option>
                                            {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </Select>
                                    </div>
                                )}

                                {/* Public vs Private toggle */}
                                {(tenantType === "MUSEUM" || tenantType === "CULTURAL_SPACE") && (
                                    <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[32px] space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isPublicInstitution ? 'bg-emerald-600/20 text-emerald-400' : 'bg-amber-600/20 text-amber-400'}`}>
                                                    {isPublicInstitution ? <ShieldCheck size={20} /> : <Briefcase size={20} />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-white">{isPublicInstitution ? 'Instituição Pública' : 'Instituição Privada'}</p>
                                                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">
                                                        {isPublicInstitution 
                                                            ? 'Pagamentos gerenciados pela Secretaria. Sem conta bancária própria.' 
                                                            : 'Pode cadastrar conta bancária própria e receber pagamentos diretamente.'}
                                                    </p>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => setIsPublicInstitution(!isPublicInstitution)}
                                                className={`w-14 h-7 rounded-full relative transition-all ${isPublicInstitution ? 'bg-emerald-600' : 'bg-amber-600'}`}
                                            >
                                                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-lg ${isPublicInstitution ? 'left-8' : 'left-1'}`} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        </div>
                    )}

                    {/* STEP 1: MODULES */}
                    {currentStep === 1 && (
                        <div className="space-y-10">
                            <Card className="p-10 bg-white/[0.02] border-white/5 rounded-[56px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="col-span-full mb-4 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-500 flex items-center justify-center">
                                        <Settings size={24} />
                                    </div>
                                    <h3 className="text-2xl font-black text-white tracking-tighter italic uppercase">Arquitetura de Módulos</h3>
                                </div>
                                
                                <FeatureToggle label="Gestão de Acervo" state={featureWorks} setter={setFeatureWorks} icon={Database} />
                                <FeatureToggle label="Trilhas & Roteiros" state={featureTrails} setter={setFeatureTrails} icon={Map} />
                                <FeatureToggle label="Eventos & Agenda" state={featureEvents} setter={setFeatureEvents} icon={Calendar} />
                                <FeatureToggle label="Gamificação" state={featureGamification} setter={setFeatureGamification} icon={Zap} />
                                <FeatureToggle label="QR System" state={featureQRCodes} setter={setFeatureQRCodes} icon={Globe} />
                                <FeatureToggle label="Chat de IA" state={featureChatAI} setter={setFeatureChatAI} icon={Bot} premium />
                                <FeatureToggle label="Loja Virtual" state={featureShop} setter={setFeatureShop} icon={Sticker} premium />
                                <FeatureToggle label="Doações" state={featureDonations} setter={setFeatureDonations} icon={HeartHandshake} premium />
                                <FeatureToggle label="Certificação" state={featureCertificates} setter={setFeatureCertificates} icon={Award} />
                                <FeatureToggle label="Venda Ingressos" state={featureTickets} setter={setFeatureTickets} icon={Ticket} premium />
                                <FeatureToggle label="Minigames" state={featureMinigames} setter={setFeatureMinigames} icon={Puzzle} premium />
                                <FeatureToggle label="PCD/Acessibilidade" state={featureAccessibility} setter={setFeatureAccessibility} icon={Microscope} />
                                
                                <div className="col-span-full mt-10 pt-10 border-t border-white/5">
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-8 ml-4 italic">Painel Administrativo: Seções Habilitadas</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                        {[
                                            { label: "Conteúdo", state: featureGroupContent, setter: setFeatureGroupContent },
                                            { label: "Eventos", state: featureGroupEvents, setter: setFeatureGroupEvents },
                                            { label: "Engagement", state: featureGroupEngagement, setter: setFeatureGroupEngagement },
                                            { label: "Gami", state: featureGroupGamification, setter: setFeatureGroupGamification },
                                            { label: "Institu", state: featureGroupInstitutional, setter: setFeatureGroupInstitutional },
                                            { label: "Tools", state: featureGroupTools, setter: setFeatureGroupTools },
                                            { label: "Analytics", state: featureGroupAnalytics, setter: setFeatureGroupAnalytics },
                                            { label: "AI/Bot", state: featureGroupAI, setter: setFeatureGroupAI },
                                        ].map((g, i) => (
                                            <button 
                                                key={i} 
                                                onClick={() => g.setter(!g.state)}
                                                className={`p-4 rounded-2xl border transition-all text-[8px] font-black uppercase tracking-widest ${g.state ? 'bg-blue-600/20 border-blue-500/30 text-white' : 'bg-white/5 border-white/5 text-slate-700'}`}
                                            >
                                                {g.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* STEP 2: PLAN & ADMIN */}
                    {currentStep === 2 && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            <Card className="p-12 bg-white/[0.02] border-white/5 rounded-[56px] space-y-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-600/10 text-amber-500 flex items-center justify-center">
                                        <Package size={24} />
                                    </div>
                                    <h3 className="text-2xl font-black text-white tracking-tighter italic uppercase">Assinatura & SLA</h3>
                                </div>
                                <div className="space-y-6">
                                    <Select
                                        label="Plano de Serviço"
                                        value={plan}
                                        onChange={e => setPlan(e.target.value)}
                                        className="h-16 bg-white/5 border-white/5 rounded-2xl px-6"
                                    >
                                        <option value="START">Start Edition</option>
                                        <option value="PRO">Professional</option>
                                        <option value="ENTERPRISE">Enterprise (Global)</option>
                                        <option value="CUSTOM">Customized Layout</option>
                                    </Select>
                                    <Input
                                        label="Quota Máxima de Ativos (Obras)"
                                        type="number"
                                        value={maxWorks}
                                        onChange={e => setMaxWorks(parseInt(e.target.value) || 0)}
                                        className="h-16 bg-white/5 border-white/5 rounded-2xl px-6 font-mono"
                                    />
                                    <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl flex items-center gap-4">
                                        <Activity size={24} className="text-emerald-500/50" />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">SLA Garantido</span>
                                            <span className="text-sm font-black text-emerald-500 italic">99.9% High Availability</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {!isEdit && (
                                <Card className="p-12 bg-white/[0.02] border-white/5 rounded-[56px] space-y-10 border-indigo-500/20 shadow-2xl shadow-indigo-500/5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center">
                                            <ShieldCheck size={24} />
                                        </div>
                                        <h3 className="text-2xl font-black text-white tracking-tighter italic uppercase">Gestor do Node</h3>
                                    </div>
                                    <div className="space-y-6">
                                        <Input
                                            label="Nome do Primeiro Admin"
                                            value={adminName}
                                            onChange={e => setAdminName(e.target.value)}
                                            placeholder="Ex: Alexander Pierce"
                                            className="h-16 bg-white/5 border-white/5 rounded-2xl px-6"
                                            leftIcon={<Users size={18} className="text-indigo-400" />}
                                        />
                                        <Input
                                            label="E-mail de Autoridade"
                                            type="email"
                                            value={adminEmail}
                                            onChange={e => setAdminEmail(e.target.value)}
                                            placeholder="admin@hml.com"
                                            className="h-16 bg-white/5 border-white/5 rounded-2xl px-6"
                                            leftIcon={<Mail size={18} className="text-indigo-400" />}
                                        />
                                        <Input
                                            label="Senha de Acesso"
                                            type="password"
                                            value={adminPassword}
                                            onChange={e => setAdminPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="h-16 bg-white/5 border-white/5 rounded-2xl px-6"
                                            leftIcon={<Lock size={18} className="text-indigo-400" />}
                                        />
                                    </div>
                                </Card>
                            )}
                        </div>
                    )}

                    {/* STEP 3: REVIEW */}
                    {currentStep === 3 && (
                        <div className="max-w-4xl mx-auto space-y-10">
                            <Card className="p-12 bg-emerald-500/5 border border-emerald-500/20 rounded-[64px] text-center space-y-6 relative overflow-hidden">
                                <div className="w-24 h-24 bg-emerald-600/20 rounded-full flex items-center justify-center mx-auto text-emerald-500 border border-emerald-500/30">
                                    <CheckCircle size={48} className="animate-pulse" />
                                </div>
                                <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase">Arquitetura Validada</h2>
                                <p className="text-slate-500 font-medium max-w-lg mx-auto italic">Revise o manifesto de implantação abaixo antes de confirmar a ativação do node de infraestrutura.</p>
                                <div className="absolute top-[-50%] right-[-10%] w-80 h-80 bg-emerald-600/5 rounded-full blur-[100px] pointer-events-none" />
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Card className="p-10 bg-white/[0.02] border-white/5 rounded-[48px] space-y-6">
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic border-b border-white/5 pb-4">Manifesto DNA</h4>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-slate-600 uppercase">Nome</span><span className="text-sm font-black text-white italic">{name}</span></div>
                                        <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-slate-600 uppercase">Slug</span><span className="text-sm font-black text-blue-400 italic">{slug}</span></div>
                                        <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-slate-600 uppercase">Tipo</span><span className="text-sm font-black text-white italic">{tenantType}</span></div>
                                        <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-slate-600 uppercase">Plano</span><Badge variant="glass" className="bg-amber-600/20 text-amber-500">{plan}</Badge></div>
                                    </div>
                                </Card>
                                <Card className="p-10 bg-white/[0.02] border-white/5 rounded-[48px] space-y-6">
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic border-b border-white/5 pb-4">Capacidade de Carga</h4>
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-slate-600 uppercase">Obras (Quota)</span><span className="text-xl font-black text-white italic">{maxWorks} UN</span></div>
                                        <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-slate-600 uppercase">SLA</span><span className="text-xs font-black text-emerald-500 italic tracking-widest uppercase">High Performance</span></div>
                                        <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-slate-600 uppercase">Módulos Ativos</span><span className="text-xs font-black text-blue-400 italic">Optimized</span></div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-10 border-t border-white/5">
            <Button
                variant="ghost"
                onClick={prevStep}
                disabled={currentStep === 0 || saving}
                className="h-16 px-10 rounded-2xl text-slate-500 hover:text-white hover:bg-white/5 font-black uppercase tracking-widest text-[10px]"
            >
                {currentStep === 0 ? '' : 'Voltar Etapa'}
            </Button>
            
            <div className="flex items-center gap-4">
                {currentStep < STEPS.length - 1 ? (
                    <Button
                        onClick={nextStep}
                        className="h-16 px-12 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest shadow-2xl shadow-blue-600/20 text-xs hover:bg-blue-500"
                    >
                        Próxima Etapa <ArrowRight size={18} className="ml-3" />
                    </Button>
                ) : (
                    <Button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="h-16 px-16 rounded-2xl bg-emerald-600 text-white font-black uppercase tracking-widest shadow-2xl shadow-emerald-600/20 text-xs hover:bg-emerald-500"
                    >
                        {saving ? <Activity className="animate-spin mr-3" size={20} /> : <Save size={20} className="mr-3" />}
                        {isEdit ? 'Finalizar Revisão' : 'Implantar Node'}
                    </Button>
                )}
            </div>
        </div>
    </AnimateIn>
  );
};
