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
  const [featureEditais, setFeatureEditais] = useState(false);
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
      setFeatureEditais(data.featureEditais ?? false);
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
    // Use authenticated endpoint to ensure we see all tenants (avoiding rate limits or public-only filters)
    api.get("/tenants")
      .then(res => {
        // Filter for tenants that can be parents (CITY, SECRETARIA or isCityMode)
        const cityTenants = (Array.isArray(res.data) ? res.data : []).filter((t: any) =>
          t.type === "CITY" ||
          t.type === "SECRETARIA" ||
          t.isCityMode === true
        );
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
      featureEditais?: boolean;
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
      featureEditais,
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
        { label: "Editais (Gestão)", state: featureEditais, setter: setFeatureEditais, premium: true },
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

  // Feature Toggle Component (Now using semantic classes)
  const FeatureToggle = ({ label, state, setter, premium }: any) => (
    <div
      onClick={() => setter(!state)}
      className={`feature-item ${state ? 'active' : ''}`}
    >
      <div className="feature-checkbox">
        {state && <CheckCircle2 size={12} className="text-black" />}
      </div>
      <span className="feature-label">
        {label}
      </span>
      {premium && <span className="feature-pro-badge">PRO</span>}
    </div>
  );

  // Animation Variants (Framer Motion works regardless of CSS framework)
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
      <div className="flex-col items-center justify-center min-h-[60vh] text-center" style={{ display: 'flex' }}>
        <div className="animate-spin" style={{ marginBottom: '1rem' }}>
          <CheckCircle2 size={48} className="text-blue-500" />
        </div>
        <p className="text-slate-400">Carregando instituição...</p>
      </div>
    );
  }

  return (
    <div className="master-page-container">

      {/* HEADER */}
      <div className="master-wizard-header">
        <Button variant="ghost" onClick={() => navigate("/master/tenants")} className="p-0">
          <ArrowLeft size={24} className="text-slate-400" />
        </Button>
        <div>
          <h1 className="master-wizard-title">
            {isEdit ? "Editar Instituição" : "Nova Instituição"}
            <span className="master-wizard-badge">Master Admin</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Passo {currentStep + 1} de {STEPS.length}: <span style={{ color: '#fff', fontWeight: 'bold' }}>{STEPS[currentStep].title}</span>
          </p>
        </div>
      </div>

      {/* STEPPER */}
      <div className="master-wizard-stepper">
        <div className="master-stepper-progress-bg"></div>
        <div
          className="master-stepper-progress-fill"
          style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
        ></div>

        {STEPS.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={`master-step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              onClick={() => {
                if (isEdit || index < currentStep) {
                  setDirection(index > currentStep ? 1 : -1);
                  setCurrentStep(index);
                }
              }}
            >
              <div className="master-step-icon">
                <Icon size={20} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div className="master-step-label">
                  {step.title}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CONTENT AREA */}
      <div className="master-wizard-content">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{ width: "100%" }}
          >
            {/* STEP 0: IDENTIFICAÇÃO */}
            {currentStep === 0 && (
              <div className="flex-col gap-4">
                {/* Type Selection */}
                <div className="master-grid-2" style={{ marginBottom: '2rem' }}>
                  {typeOptions.map(opt => {
                    const isSelected = tenantType === opt.value;
                    return (
                      <div
                        key={opt.value}
                        onClick={() => setTenantType(opt.value as any)}
                        className={`wizard-type-card ${isSelected ? 'selected' : ''}`}
                      >
                        <div className="wizard-type-icon">
                          {opt.icon}
                        </div>
                        <div className="wizard-type-title">
                          {opt.label}
                        </div>
                        <div className="wizard-type-desc">
                          {opt.desc}
                        </div>
                        {isSelected && (
                          <div style={{ position: 'absolute', top: '1rem', right: '1rem', color: '#3b82f6' }}>
                            <CheckCircle2 size={24} fill="currentColor" className="text-blue-500 bg-white rounded-full" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Basic Info */}
                <div className="wizard-section">
                  <h3 className="wizard-section-title">
                    <Building2 size={20} style={{ color: '#60a5fa' }} /> Detalhes Principais
                  </h3>

                  <div className="master-grid-2">
                    <Input
                      label="Nome Oficial"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Ex: Museu Nacional..."
                      required
                    />
                    <Input
                      label="Slug (URL)"
                      value={slug}
                      onChange={e => setSlug(e.target.value)}
                      placeholder="ex: museu-nacional"
                      required
                      leftIcon={<Globe size={18} />}
                      style={{ fontFamily: 'monospace' }}
                    />
                  </div>

                  {(tenantType === "MUSEUM" || tenantType === "PRODUCER" || tenantType === "CULTURAL_SPACE") && (
                    <div className="flex-col mt-4">
                      <div style={{ marginBottom: '1rem' }}>
                        <Select
                          label="Vínculo Hierárquico (Opcional)"
                          value={parentId || ""}
                          onChange={e => setParentId(e.target.value || null)}
                        >
                          <option value="">Sem vínculo (Independente)</option>
                          {cities.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </Select>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b', padding: '1rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '12px' }}>
                        <strong style={{ color: '#60a5fa', display: 'block', marginBottom: '0.25rem' }}>Dica:</strong>
                        Vincule a uma Cidade/Secretaria para aparecer nos relatórios agregados da gestão pública.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 1: FUNCIONALIDADES */}
            {currentStep === 1 && (
              <div className="flex-col gap-4">
                <div style={{ textAlign: 'center', marginBottom: '2rem', padding: '1.5rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '1.5rem', border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem' }}>Módulos do Sistema</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Ative ou desative funcionalidades conforme o plano contratado.</p>
                </div>

                <div className="flex-col gap-4">
                  {featureGroups.map((group, gIdx) => (
                    <div key={gIdx} className="feature-group">
                      <h4 className="feature-group-title">
                        {group.title}
                      </h4>

                      <div className="master-grid-3">
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
              <div className="master-grid-2">
                {/* Plan Selection */}
                <div className="flex-col gap-4">
                  <div className="wizard-section" style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))' }}>
                    <h3 className="wizard-section-title">
                      <Package size={24} style={{ color: '#60a5fa' }} /> Configuração do Plano
                    </h3>

                    <div className="flex-col gap-4">
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
                      >
                        <option value="START">Start (Básico)</option>
                        <option value="PRO">Professional</option>
                        <option value="ENTERPRISE">Enterprise</option>
                        <option value="CUSTOM">Customizado</option>
                      </Select>

                      <div className="master-grid-2">
                        <Input
                          label="Limite de Obras"
                          type="number"
                          value={maxWorks}
                          onChange={e => setMaxWorks(parseInt(e.target.value) || 0)}
                          style={{ textAlign: 'center', fontFamily: 'monospace' }}
                        />
                        <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', marginBottom: '0.25rem' }}>SLA DEFINIDO</div>
                            <div style={{ color: '#34d399', fontWeight: '700' }}>99.9% Uptime</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="wizard-section">
                    <h3 className="wizard-section-title">
                      <FileText size={20} style={{ color: '#facc15' }} /> Documentos Legais
                    </h3>
                    <div className="flex-col gap-4">
                      <Textarea
                        label="Termos de Uso"
                        rows={2}
                        value={termsOfUse}
                        onChange={e => setTermsOfUse(e.target.value)}
                        placeholder="Cole os termos aqui..."
                      />
                      <Textarea
                        label="Política de Privacidade"
                        rows={2}
                        value={privacyPolicy}
                        onChange={e => setPrivacyPolicy(e.target.value)}
                        placeholder="Cole a política aqui..."
                      />
                    </div>
                  </div>
                </div>

                {/* Admin Account */}
                <div style={{ height: '100%' }}>
                  {!isEdit ? (
                    <div className="wizard-section" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <h3 className="wizard-section-title">
                        <Users size={20} style={{ color: '#f472b6' }} /> Primeiro Acesso
                      </h3>
                      <div className="flex-col gap-4 flex-1">
                        <Input
                          label="Nome do Admin"
                          value={adminName}
                          onChange={e => setAdminName(e.target.value)}
                          placeholder="Nome completo"
                          required
                          leftIcon={<Users size={16} />}
                        />
                        <Input
                          label="E-mail de Login"
                          type="email"
                          value={adminEmail}
                          onChange={e => setAdminEmail(e.target.value)}
                          placeholder="admin@hml.com"
                          required
                          leftIcon={<Mail size={16} />}
                        />
                        <Input
                          label="Senha Inicial"
                          type="password"
                          value={adminPassword}
                          onChange={e => setAdminPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          leftIcon={<Lock size={16} />}
                        />
                      </div>
                      <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(236, 72, 153, 0.1)', border: '1px solid rgba(236, 72, 153, 0.2)', borderRadius: '12px', fontSize: '0.85rem', color: '#fbcfe8', lineHeight: '1.5' }}>
                        Este usuário terá permissão total (ADMIN) sobre a nova instituição.
                      </div>
                    </div>
                  ) : (
                    <div className="wizard-section" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5, textAlign: 'center' }}>
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
              <div className="flex-col gap-4">
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '1.5rem', padding: '2rem', textAlign: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ width: '80px', height: '80px', background: 'rgba(16, 185, 129, 0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                    <CheckCircle2 size={40} />
                  </div>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem' }}>Tudo pronto!</h2>
                  <p style={{ color: '#94a3b8', maxWidth: '400px', margin: '0 auto' }}>
                    Revise os dados abaixo antes de criar o ambiente da instituição.
                  </p>
                </div>

                <div className="master-grid-2">
                  <div className="wizard-section">
                    <h3 className="feature-group-title">Dados Gerais</h3>
                    <div className="flex-col gap-4">
                      <div className="flex justify-between">
                        <span style={{ color: '#64748b' }}>Nome:</span>
                        <span style={{ color: '#fff', fontWeight: '500' }}>{name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: '#64748b' }}>Slug:</span>
                        <span style={{ color: '#60a5fa', fontFamily: 'monospace' }}>{slug}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: '#64748b' }}>Tipo:</span>
                        <span style={{ color: '#fff' }}>{tenantType}</span>
                      </div>
                    </div>
                  </div>

                  <div className="wizard-section">
                    <h3 className="feature-group-title">Contrato</h3>
                    <div className="flex-col gap-4">
                      <div className="flex justify-between">
                        <span style={{ color: '#64748b' }}>Plano:</span>
                        <span style={{ color: '#34d399', fontWeight: '700' }}>{plan}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: '#64748b' }}>Limite Obras:</span>
                        <span style={{ color: '#fff' }}>{maxWorks}</span>
                      </div>
                      <div className="flex justify-between">
                        <span style={{ color: '#64748b' }}>Admin:</span>
                        <span style={{ color: '#fff' }}>{isEdit ? '(Existente)' : adminEmail}</span>
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
      <div className="master-wizard-footer">
        <div className="master-wizard-footer-inner">
          <Button
            variant="ghost"
            onClick={currentStep === 0 ? () => navigate("/master/tenants") : prevStep}
            className="btn-ghost"
          >
            {currentStep === 0 ? "Cancelar" : "Voltar"}
          </Button>

          <div className="flex gap-2">
            {currentStep === STEPS.length - 1 ? (
              <Button
                onClick={handleSubmit}
                isLoading={saving}
                className="btn-primary"
                leftIcon={!saving ? <Save size={18} /> : undefined}
              >
                {isEdit ? "Salvar Alterações" : "Criar Instituição"}
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                className="btn-primary"
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
