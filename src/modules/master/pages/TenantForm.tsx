import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api, isDemoMode } from "../../../api/client";
import {
  Building2, Save, ArrowLeft, Package, Map, Settings, Shield,
  Landmark, Music, Palette, Tent, ShieldCheck, CheckCircle2,
  Users, Mail, Lock, Globe, FileText, ChevronRight
} from "lucide-react";
import { Button, Input, Select, Textarea } from "../../../components/ui";
import { useToast } from "../../../contexts/ToastContext";
import "./MasterShared.css";

export const TenantForm: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { addToast } = useToast();

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

  const loadTenant = async () => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

  return (
    <div className="master-page-container bg-[#0a0a0c]">
      {/* COMPACT HERO */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-8 border-b border-white/10 gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/master/tenants')}
            className="w-10 h-10 p-0 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 flex items-center justify-center shrink-0"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-white tracking-tight">
                {isEdit ? 'Editar Instituição' : 'Nova Instituição'}
              </h1>
              {isEdit && (
                <div className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-bold rounded uppercase tracking-wider">
                  Editando
                </div>
              )}
            </div>
            <p className="text-slate-500 text-sm font-medium mt-1">Configure os detalhes, funcionalidades e acessos.</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full shrink-0">
          <ShieldCheck size={16} className="text-blue-400" />
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Modo Master</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-8 pb-24">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN - MAIN INFO */}
          <div className="lg:col-span-2 space-y-8">

            {/* TYPE SELECTION */}
            <div className="bg-white/5 border border-white/5 rounded-3xl p-6 md:p-8">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Palette className="text-purple-400" size={20} /> Tipo de Instituição
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {typeOptions.map(opt => (
                  <label key={opt.value} className={`
                                        relative flex flex-col p-5 rounded-2xl cursor-pointer border transition-all duration-300 group
                                        ${tenantType === opt.value
                      ? 'bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border-blue-500/50 shadow-lg shadow-blue-500/10'
                      : 'bg-[#12121e] border-white/5 hover:border-white/10 hover:bg-white/5'}
                                    `}>
                    <input
                      type="radio"
                      name="tenantType"
                      className="hidden"
                      checked={tenantType === opt.value}
                      onChange={() => setTenantType(opt.value as any)}
                    />
                    <div className={`mb-3 p-3 w-fit rounded-xl transition-colors ${tenantType === opt.value ? 'bg-blue-500 text-white' : 'bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-white'}`}>
                      {opt.icon}
                    </div>
                    <span className={`font-bold text-lg mb-1 transition-colors ${tenantType === opt.value ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                      {opt.label}
                    </span>
                    <span className="text-xs text-slate-500 leading-relaxed">
                      {opt.desc}
                    </span>
                    {tenantType === opt.value && (
                      <div className="absolute top-4 right-4 text-blue-500 animate-in zoom-in duration-200">
                        <CheckCircle2 size={20} fill="currentColor" className="text-blue-500 bg-white rounded-full" />
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* BASIC DETAILS */}
            <div className="bg-white/5 border border-white/5 rounded-3xl p-6 md:p-8 space-y-6">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Building2 className="text-blue-400" size={20} /> Detalhes da Instituição
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Nome Oficial"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ex: Museu Nacional..."
                  required
                  leftIcon={<Building2 size={18} />}
                  className="h-12 bg-black/20"
                />
                <Input
                  label="Slug (URL Amigável)"
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  placeholder="ex: museu-nacional"
                  required
                  leftIcon={<Globe size={18} />}
                  className="h-12 font-mono text-sm bg-black/20"
                  helperText="Usado na URL (ex: museus.app/seu-slug)"
                />
              </div>

              {(tenantType === "MUSEUM" || tenantType === "PRODUCER" || tenantType === "CULTURAL_SPACE") && (
                <div className="p-5 bg-black/20 rounded-2xl border border-white/5 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                  <div className="flex-1 w-full">
                    <label className="text-sm font-bold text-slate-400 mb-2 block flex items-center gap-2">
                      <Map size={14} /> Vínculo Hierárquico (Opcional)
                    </label>
                    <Select
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
                  <div className="flex-1 text-xs text-slate-500 leading-relaxed p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                    <span className="text-blue-400 font-bold block mb-1">Por que vincular?</span>
                    Vincular a uma Cidade/Secretaria permite que esta instituição apareça nos relatórios consolidados do gestor público.
                  </div>
                </div>
              )}
            </div>

            {/* FEATURE FLAGS */}
            <div className="bg-white/5 border border-white/5 rounded-3xl p-6 md:p-8">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Settings className="text-emerald-400" size={20} /> Funcionalidades Ativas
              </h3>

              <div className="space-y-8">
                {featureGroups.map((group, gIdx) => (
                  <div key={gIdx} className="bg-black/20 rounded-2xl p-5 border border-white/5 relative overflow-hidden">
                    {/* Group decoration */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-2xl rounded-full -mr-10 -mt-10 pointer-events-none"></div>

                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <div className="w-1 h-3 bg-slate-600 rounded-full"></div>
                      {group.title}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 relative z-10">
                      {group.items.map((feat, idx) => (
                        <label key={idx} className={`
                                                    flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all hover:bg-white/5 hover:translate-x-1
                                                    ${feat.state
                            ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-100'
                            : 'bg-transparent border-white/5 text-slate-500 line-through decoration-slate-600'}
                                                    ${feat.premium ? 'ring-1 ring-yellow-500/20' : ''}
                                                `}>
                          <div className={`
                                                        w-5 h-5 rounded flex items-center justify-center border transition-colors shrink-0
                                                        ${feat.state ? 'bg-emerald-500 border-emerald-500' : 'border-white/20 bg-transparent'}
                                                    `}>
                            {feat.state && <CheckCircle2 size={12} className="text-black" />}
                          </div>
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={feat.state}
                            onChange={e => feat.setter(e.target.checked)}
                          />
                          <span className="text-sm font-medium truncate">
                            {feat.label}
                          </span>
                          {feat.premium && <span className="text-[9px] bg-yellow-500 text-black font-black px-1.5 py-0.5 rounded ml-auto">PRO</span>}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN - SIDEBAR */}
          <div className="space-y-8">

            {/* PLAN & LIMITS */}
            <div className="bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-blue-500/20 transition-all duration-1000"></div>

              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                <Package className="text-blue-400" size={20} /> Plano Contratual
              </h3>

              <div className="space-y-5 relative z-10">
                <Select
                  label="Nível do Plano"
                  value={plan}
                  onChange={e => {
                    const newPlan = e.target.value;
                    setPlan(newPlan);
                    if (newPlan === "START") setMaxWorks(50);
                    else if (newPlan === "PRO") setMaxWorks(200);
                    else if (newPlan === "ENTERPRISE") setMaxWorks(500);
                  }}
                  className="bg-black/30 border-white/10"
                >
                  <option value="START">Start (Básico)</option>
                  <option value="PRO">Professional</option>
                  <option value="ENTERPRISE">Enterprise</option>
                  <option value="CUSTOM">Customizado</option>
                </Select>

                <Input
                  label="Limite de Obras"
                  type="number"
                  value={maxWorks}
                  onChange={e => setMaxWorks(parseInt(e.target.value) || 0)}
                  leftIcon={<Building2 size={16} />}
                  className="bg-black/30 border-white/10"
                  helperText="Teto de itens no acervo."
                />

                <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-xs text-slate-400 leading-relaxed">
                  <div className="flex items-center gap-2 text-white font-bold mb-1">
                    <ShieldCheck size={14} className="text-green-500" /> SLA & Suporte
                  </div>
                  O nível do plano define automaticamente o SLA de atendimento e acesso a recursos de suporte prioritário.
                </div>
              </div>
            </div>

            {/* INITIAL ADMIN */}
            {!isEdit && (
              <div className="bg-white/5 border border-white/5 rounded-3xl p-6 relative overflow-hidden">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                  <Users className="text-pink-400" size={20} /> Primeiro Acesso
                </h3>
                <div className="space-y-4 relative z-10">
                  <Input
                    label="Nome do Admin"
                    value={adminName}
                    onChange={e => setAdminName(e.target.value)}
                    placeholder="Nome completo"
                    required
                    leftIcon={<Users size={16} />}
                    className="h-11"
                  />
                  <Input
                    label="E-mail de Acesso"
                    type="email"
                    value={adminEmail}
                    onChange={e => setAdminEmail(e.target.value)}
                    placeholder="admin@instituicao.com"
                    required
                    leftIcon={<Mail size={16} />}
                    className="h-11"
                  />
                  <Input
                    label="Senha Inicial"
                    type="password"
                    value={adminPassword}
                    onChange={e => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    leftIcon={<Lock size={16} />}
                    className="h-11"
                  />
                </div>
              </div>
            )}

            {/* LEGAL INFO (Collapsed style for sidebar) */}
            <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="text-yellow-400" size={20} /> Legal (LGPD)
              </h3>
              <div className="space-y-4">
                <Textarea
                  label="Termos de Uso"
                  rows={3}
                  value={termsOfUse}
                  onChange={e => setTermsOfUse(e.target.value)}
                  placeholder="Cole os termos aqui..."
                  className="text-xs bg-black/20 border-white/10 min-h-[80px]"
                />
                <Textarea
                  label="Política de Privacidade"
                  rows={3}
                  value={privacyPolicy}
                  onChange={e => setPrivacyPolicy(e.target.value)}
                  placeholder="Cole a política aqui..."
                  className="text-xs bg-black/20 border-white/10 min-h-[80px]"
                />
              </div>
            </div>

          </div>
        </div>

        {/* ACTION BAR */}
        <div className="fixed bottom-6 left-0 right-0 z-50 pointer-events-none px-4">
          <div className="max-w-4xl mx-auto bg-[#0f172a] border border-white/10 p-2 pr-3 pl-4 rounded-2xl flex items-center justify-between shadow-2xl pointer-events-auto transform translate-y-0 transition-transform">
            <Button
              variant="ghost"
              type="button"
              onClick={() => navigate('/master/tenants')}
              className="text-slate-400 hover:text-white px-4 h-12"
            >
              Cancelar
            </Button>
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right pr-4 border-r border-white/10 mr-1">
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Status</div>
                <div className="text-xs font-bold text-emerald-400">Pronto para salvar</div>
              </div>
              <Button
                type="submit"
                disabled={saving}
                className="px-8 h-12 rounded-xl font-bold text-base shadow-lg shadow-blue-600/20 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-none"
                leftIcon={saving ? undefined : <Save size={18} />}
                rightIcon={!saving ? <ChevronRight size={18} className="opacity-50" /> : undefined}
              >
                {saving ? 'Salvando...' : 'Salvar Instituição'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
