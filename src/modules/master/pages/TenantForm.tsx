import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api, isDemoMode } from "../../../api/client";
import {
  Building2, Save, ArrowLeft, Package, Map, Settings,
  Landmark, Music, Tent, CheckCircle2,
  Users, Mail, Lock, Globe, FileText, ChevronRight, CheckCircle
} from "lucide-react";
import { Button, Input, Select, Textarea } from "../../../components/ui";
import { useToast } from "../../../contexts/ToastContext";
import { motion, AnimatePresence } from "framer-motion";
import "./MasterShared.css";

// Steps Configuration
const STEPS = [
  { id: 0, title: "Identificação", icon: Landmark, description: "Tipo e dados básicos" },
  { id: 1, title: "Funcionalidades", icon: Settings, description: "Módulos ativos" },
  { id: 2, title: "Plano & Acesso", icon: Package, description: "Contrato e admin" },
  { id: 3, title: "Revisão", icon: CheckCircle, description: "Confirmação final" }
];

export const TenantForm: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { addToast } = useToast();

  // Wizard State
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [termsOfUse, setTermsOfUse] = useState("");
  const [privacyPolicy, setPrivacyPolicy] = useState("");

  // Tenant Type and Hierarchy
  const [tenantType, setTenantType] = useState<"MUSEUM" | "PRODUCER" | "CITY" | "CULTURAL_SPACE">("MUSEUM");
  const [parentId, setParentId] = useState<string | null>(null);
  const [cities, setCities] = useState<{ id: string; name: string }[]>([]);

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
  const [featureMinigames, setFeatureMinigames] = useState(false);

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadTenant = async () => {
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
      setFeatureMinigames(data.featureMinigames ?? false);

      setTermsOfUse(data.termsOfUse || "");
      setPrivacyPolicy(data.privacyPolicy || "");
    } catch {
      addToast(t("common.errorLoad"), "error");
      navigate("/master/tenants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEdit && id) {
      loadTenant();
    }
  }, [isEdit, id]);

  // Load cities for parent selector
  useEffect(() => {
    api.get("/tenants/public")
      .then(res => {
        const cityTenants = res.data.filter((t: any) => t.type === "CITY" || t.type === "SECRETARIA");
        setCities(cityTenants);
      })
      .catch(console.error);
  }, []);

  const validateStep = (stepIndex: number) => {
    switch (stepIndex) {
      case 0:
        if (!name.trim()) return "O nome da instituição é obrigatório";
        if (!slug.trim()) return "O slug é obrigatório";
        return null;
      case 2:
        if (!isEdit) {
          if (!adminName.trim()) return "Nome do administrador é obrigatório";
          if (!adminEmail.trim()) return "E-mail do administrador é obrigatório";
          if (!adminPassword.trim()) return "Senha do administrador é obrigatória";
        }
        return null;
      default:
        return null;
    }
  };

  const nextStep = () => {
    const error = validateStep(currentStep);
    if (error) {
      addToast(error, "error");
      return;
    }
    setDirection(1);
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  };

  const prevStep = () => {
    setDirection(-1);
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (isDemoMode) {
      addToast(t("master.tenantForm.demoAlert"), "info");
      navigate("/master/tenants");
      return;
    }

    setSaving(true);
    interface TenantPayload {
      name: string;
      slug: string;
      isCityMode?: boolean;
      type?: string;
      parentId?: string | null;

      adminEmail?: string;
      adminName?: string;
      adminPassword?: string;
      plan?: string;
      maxWorks?: number;
      // Feature Flags
      featureWorks?: boolean;
      featureTrails?: boolean;
      featureEvents?: boolean;
      featureGamification?: boolean;
      featureQRCodes?: boolean;
      featureChatAI?: boolean;
      featureShop?: boolean;
      featureDonations?: boolean;
      featureCertificates?: boolean;
      featureReviews?: boolean;
      featureGuestbook?: boolean;
      featureAccessibility?: boolean;
      featureMinigames?: boolean;

      termsOfUse?: string;
      privacyPolicy?: string;
    }

    const payload: TenantPayload = {
      name,
      slug,
      isCityMode: tenantType === "CITY",
      type: tenantType,
      parentId: parentId || null,

      plan,
      maxWorks,
      // Feature Flags
      featureWorks,
      featureTrails,
      featureEvents,
      featureGamification,
      featureQRCodes,
      featureChatAI,
      featureShop,
      featureDonations,
      featureCertificates,
      featureReviews,
      featureGuestbook,
      featureAccessibility,
      featureMinigames,

      termsOfUse,
      privacyPolicy
    };

    if (!isEdit) {
      payload.adminEmail = adminEmail;
      payload.adminName = adminName;
      payload.adminPassword = adminPassword;
      payload.plan = plan;
    }

    try {
      if (id) {
        await api.put(`/tenants/${id}`, payload);
        addToast("Instituição atualizada com sucesso!", "success");
      } else {
        await api.post("/tenants", payload);
        addToast("Instituição criada com sucesso!", "success");
      }
      navigate("/master/tenants");
    } catch (error) {
      console.error("Erro ao salvar tenant", error);
      addToast(t("master.tenantForm.errorSave"), "error");
    } finally {
      setSaving(false);
    }
  };

  const typeOptions = [
    { value: "MUSEUM", icon: <Landmark size={24} />, label: "Museu", desc: "Tipologia clássica com acervo, salas e exposições." },
    { value: "CITY", icon: <Map size={24} />, label: "Cidade / Secretaria", desc: "Gestão de múltiplos equipamentos e roteiros turísticos." },
    { value: "PRODUCER", icon: <Music size={24} />, label: "Produtora Cultural", desc: "Foco em eventos, projetos itinerantes e editais." },
    { value: "CULTURAL_SPACE", icon: <Tent size={24} />, label: "Espaço Cultural", desc: "Galerias, bibliotecas e centros comunitários." }
  ];

  const featureGroups = [
    {
      title: "Acervo e Visitação",
      items: [
        { label: "Obras/Artefatos", state: featureWorks, setter: setFeatureWorks },
        { label: "Trilhas/Roteiros", state: featureTrails, setter: setFeatureTrails },
        { label: "QR Codes", state: featureQRCodes, setter: setFeatureQRCodes },
      ]
    },
    {
      title: "Engajamento",
      items: [
        { label: "Gamificação", state: featureGamification, setter: setFeatureGamification },
        { label: "Minigames", state: featureMinigames, setter: setFeatureMinigames },
        { label: "Livro de Visitas", state: featureGuestbook, setter: setFeatureGuestbook },
        { label: "Avaliações", state: featureReviews, setter: setFeatureReviews },
      ]
    },
    {
      title: "Serviços e Eventos",
      items: [
        { label: "Eventos", state: featureEvents, setter: setFeatureEvents },
        { label: "Certificados", state: featureCertificates, setter: setFeatureCertificates },
        { label: "Acessibilidade", state: featureAccessibility, setter: setFeatureAccessibility },
      ]
    },
    {
      title: "Premium / Monetização",
      items: [
        { label: "Chat IA", state: featureChatAI, setter: setFeatureChatAI, premium: true },
        { label: "Loja Virtual", state: featureShop, setter: setFeatureShop, premium: true },
        { label: "Doações", state: featureDonations, setter: setFeatureDonations, premium: true },
      ]
    }
  ];

  // Feature Toggle Component
  const FeatureToggle = ({ label, state, setter, premium }: any) => (
    <div
      onClick={() => setter(!state)}
      className={`
        flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all hover:bg-white/5 hover:translate-x-1
        ${state
          ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-100'
          : 'bg-transparent border-white/5 text-slate-500 line-through decoration-slate-600'}
        ${premium ? 'ring-1 ring-yellow-500/20' : ''}
        `}
    >
      <div className={`
        w-5 h-5 rounded flex items-center justify-center border transition-colors shrink-0
        ${state ? 'bg-emerald-500 border-emerald-500' : 'border-white/20 bg-transparent'}
        `}>
        {state && <CheckCircle2 size={12} className="text-black" />}
      </div>

      <span className="text-sm font-medium truncate select-none">
        {label}
      </span>
      {premium && <span className="text-[9px] bg-yellow-500 text-black font-black px-1.5 py-0.5 rounded ml-auto">PRO</span>}
    </div>
  );

  // Animation Variants
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0
    })
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-white">
        <div className="w-12 h-12 border-4 border-white/10 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400">Carregando instituição...</p>
      </div>
    );
  }

  return (
    <div className="master-page-container bg-[#0a0a0c] min-h-screen text-white pb-24">

      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
        <Button variant="ghost" onClick={() => navigate("/master/tenants")} className="h-10 w-10 p-0 rounded-full hover:bg-white/10">
          <ArrowLeft size={24} className="text-slate-400" />
        </Button>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            {isEdit ? "Editar Instituição" : "Nova Instituição"}
            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs font-bold rounded uppercase tracking-wider border border-blue-500/20">
              Master Admin
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Passo {currentStep + 1} de {STEPS.length}: <span className="text-white font-bold">{STEPS[currentStep].title}</span>
          </p>
        </div>
      </div>

      {/* STEPPER */}
      <div className="max-w-4xl mx-auto mb-10 hidden md:flex items-center justify-between relative px-4">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/10 rounded-full -z-0"></div>
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 rounded-full -z-0 transition-all duration-500"
          style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
        ></div>

        {STEPS.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={`relative z-10 flex flex-col items-center gap-2 cursor-pointer group`}
              onClick={() => {
                if (isEdit || index < currentStep) {
                  setDirection(index > currentStep ? 1 : -1);
                  setCurrentStep(index);
                }
              }}
            >
              <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300
                        ${isActive ? 'bg-blue-600 border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.5)] scale-110' :
                  isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' :
                    'bg-[#0a0a0c] border-white/10 text-slate-500 group-hover:border-white/30'}
                    `}>
                {isCompleted ? <CheckCircle2 size={24} /> : <Icon size={20} />}
              </div>
              <div className="text-center">
                <div className={`text-xs font-bold transition-colors ${isActive ? 'text-white' : 'text-slate-500'}`}>
                  {step.title}
                </div>
                <div className="text-[10px] text-slate-600 hidden lg:block">{step.description}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CONTENT AREA */}
      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full"
          >
            {/* STEP 0: IDENTIFICAÇÃO */}
            {currentStep === 0 && (
              <div className="space-y-8">
                {/* Type Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {typeOptions.map(opt => {
                    const isSelected = tenantType === opt.value;
                    return (
                      <div
                        key={opt.value}
                        onClick={() => setTenantType(opt.value as any)}
                        className={`
                                        relative flex flex-col p-5 rounded-3xl cursor-pointer border transition-all duration-300 group
                                        ${isSelected
                            ? 'bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border-blue-500/50 shadow-lg shadow-blue-500/10 scale-[1.02]'
                            : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10'}
                                    `}
                      >
                        <div className={`mb-3 p-3 w-fit rounded-xl transition-colors ${isSelected ? 'bg-blue-500 text-white' : 'bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-white'}`}>
                          {opt.icon}
                        </div>
                        <div className={`font-bold text-lg mb-1 transition-colors ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                          {opt.label}
                        </div>
                        <div className="text-xs text-slate-500 leading-relaxed">
                          {opt.desc}
                        </div>
                        {isSelected && (
                          <div className="absolute top-4 right-4 text-blue-500 animate-in zoom-in duration-200">
                            <CheckCircle2 size={24} fill="currentColor" className="text-blue-500 bg-white rounded-full" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Basic Info */}
                <div className="bg-white/5 border border-white/5 rounded-3xl p-8 space-y-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Building2 className="text-blue-400" size={20} /> Detalhes Principais
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Nome Oficial"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Ex: Museu Nacional..."
                      required
                      className="bg-black/20 border-white/10 h-12 text-lg"
                    />
                    <Input
                      label="Slug (URL)"
                      value={slug}
                      onChange={e => setSlug(e.target.value)}
                      placeholder="ex: museu-nacional"
                      required
                      leftIcon={<Globe size={18} />}
                      className="bg-black/20 border-white/10 h-12 font-mono text-sm text-blue-300"
                    />
                  </div>

                  {(tenantType === "MUSEUM" || tenantType === "PRODUCER" || tenantType === "CULTURAL_SPACE") && (
                    <div className="p-5 bg-black/20 rounded-2xl border border-white/5 flex flex-col sm:flex-row gap-5 items-center mt-4">
                      <div className="flex-1 w-full">
                        <Select
                          label="Vínculo Hierárquico (Opcional)"
                          value={parentId || ""}
                          onChange={e => setParentId(e.target.value || null)}
                          className="w-full h-11 bg-white/5 border-white/10"
                        >
                          <option value="">Sem vínculo (Independente)</option>
                          {cities.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </Select>
                      </div>
                      <div className="text-xs text-slate-500 max-w-xs leading-relaxed">
                        <span className="text-blue-400 font-bold block mb-1">Dica:</span>
                        Vincule a uma Cidade/Secretaria para aparecer nos relatórios agregados da gestão pública.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 1: FUNCIONALIDADES */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 text-center mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">Módulos do Sistema</h3>
                  <p className="text-slate-400 text-sm">Ative ou desative funcionalidades conforme o plano contratado.</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {featureGroups.map((group, gIdx) => (
                    <div key={gIdx} className="bg-white/5 border border-white/5 rounded-3xl p-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none"></div>

                      <h4 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
                        {group.title}
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 relative z-10">
                        {group.items.map((feat: any, idx) => (
                          <FeatureToggle
                            key={idx}
                            label={feat.label}
                            state={feat.state}
                            setter={feat.setter}
                            premium={feat.premium}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: PLANO E ADMIN */}
            {currentStep === 2 && (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Plan Selection */}
                <div className="lg:col-span-3 space-y-6">
                  <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>

                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                      <Package className="text-blue-400" size={24} /> Configuração do Plano
                    </h3>

                    <div className="space-y-6 relative z-10">
                      <Select
                        label="Nível de Serviço"
                        value={plan}
                        onChange={e => {
                          const newPlan = e.target.value;
                          setPlan(newPlan);
                          if (newPlan === "START") setMaxWorks(50);
                          else if (newPlan === "PRO") setMaxWorks(200);
                          else if (newPlan === "ENTERPRISE") setMaxWorks(500);
                        }}
                        className="bg-black/40 border-white/10 h-12 text-lg"
                      >
                        <option value="START">Start (Básico)</option>
                        <option value="PRO">Professional</option>
                        <option value="ENTERPRISE">Enterprise</option>
                        <option value="CUSTOM">Customizado</option>
                      </Select>

                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Limite de Obras"
                          type="number"
                          value={maxWorks}
                          onChange={e => setMaxWorks(parseInt(e.target.value) || 0)}
                          className="bg-black/40 border-white/10 font-mono text-center"
                        />
                        <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center justify-center text-center">
                          <div>
                            <div className="text-xs text-slate-500 uppercase font-bold mb-1">SLA Definido</div>
                            <div className="text-emerald-400 font-bold">99.9% Uptime</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <FileText className="text-yellow-400" size={20} /> Documentos Legais
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <Textarea
                        label="Termos de Uso"
                        rows={2}
                        value={termsOfUse}
                        onChange={e => setTermsOfUse(e.target.value)}
                        placeholder="Cole os termos aqui..."
                        className="text-xs bg-black/20 border-white/10 min-h-[60px]"
                      />
                      <Textarea
                        label="Política de Privacidade"
                        rows={2}
                        value={privacyPolicy}
                        onChange={e => setPrivacyPolicy(e.target.value)}
                        placeholder="Cole a política aqui..."
                        className="text-xs bg-black/20 border-white/10 min-h-[60px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Admin Account */}
                <div className="lg:col-span-2">
                  {!isEdit ? (
                    <div className="bg-white/5 border border-white/5 rounded-3xl p-6 relative h-full">
                      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Users className="text-pink-400" size={20} /> Primeiro Acesso
                      </h3>
                      <div className="space-y-4">
                        <Input
                          label="Nome do Admin"
                          value={adminName}
                          onChange={e => setAdminName(e.target.value)}
                          placeholder="Nome completo"
                          required
                          leftIcon={<Users size={16} />}
                          className="h-11 bg-black/20 border-white/10"
                        />
                        <Input
                          label="E-mail de Login"
                          type="email"
                          value={adminEmail}
                          onChange={e => setAdminEmail(e.target.value)}
                          placeholder="admin@hml.com"
                          required
                          leftIcon={<Mail size={16} />}
                          className="h-11 bg-black/20 border-white/10"
                        />
                        <Input
                          label="Senha Inicial"
                          type="password"
                          value={adminPassword}
                          onChange={e => setAdminPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          leftIcon={<Lock size={16} />}
                          className="h-11 bg-black/20 border-white/10"
                        />
                      </div>
                      <div className="mt-6 p-4 bg-pink-500/10 border border-pink-500/20 rounded-xl text-xs text-pink-200 leading-relaxed">
                        Este usuário terá permissão total (ADMIN) sobre a nova instituição.
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white/5 border border-white/5 rounded-3xl p-6 h-full flex flex-col items-center justify-center text-center opacity-50">
                      <Users size={48} className="text-slate-600 mb-4" />
                      <p className="text-slate-500 text-sm">
                        A edição de administradores é feita na aba "Usuários".
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: REVISÃO */}
            {currentStep === 3 && (
              <div className="space-y-8">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center">
                  <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 size={40} />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">Tudo pronto!</h2>
                  <p className="text-slate-400 max-w-md mx-auto">
                    Revise os dados abaixo antes de criar o ambiente da instituição.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/5 rounded-2xl p-6 space-y-4 border border-white/5">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-white/5 pb-2">Dados Gerais</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Nome:</span>
                        <span className="text-white font-medium text-right">{name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Slug:</span>
                        <span className="text-blue-400 font-mono text-sm text-right">{slug}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Tipo:</span>
                        <span className="text-white text-right">{tenantType}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-6 space-y-4 border border-white/5">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-white/5 pb-2">Contrato</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Plano:</span>
                        <span className="text-emerald-400 font-bold text-right">{plan}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Limite Obras:</span>
                        <span className="text-white text-right">{maxWorks}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Admin:</span>
                        <span className="text-white text-right">{isEdit ? '(Existente)' : adminEmail}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* FOOTER NAVIGATION */}
      <div className="fixed bottom-0 left-0 w-full bg-[#0a0a0c]/90 backdrop-blur-md border-t border-white/10 p-4 z-40 transform translate-y-0 shadow-2xl">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={currentStep === 0 ? () => navigate("/master/tenants") : prevStep}
            className="text-slate-400 hover:text-white px-6"
          >
            {currentStep === 0 ? "Cancelar" : "Voltar"}
          </Button>

          <div className="flex gap-3">
            {currentStep === STEPS.length - 1 ? (
              <Button
                onClick={handleSubmit}
                isLoading={saving}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 h-12 rounded-xl text-base font-bold shadow-lg shadow-emerald-900/20"
                leftIcon={!saving ? <Save size={18} /> : undefined}
              >
                {isEdit ? "Salvar Alterações" : "Criar Instituição"}
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 h-12 rounded-xl text-base font-bold shadow-lg shadow-blue-900/20"
                rightIcon={<ChevronRight size={20} />}
              >
                Próximo
              </Button>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
