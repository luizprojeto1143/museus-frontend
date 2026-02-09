import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api, isDemoMode } from "../../../api/client";
import { Building2, Save, ArrowLeft, Package, Map, Settings, Shield } from "lucide-react";
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
    }
  };

  return (
    <div className="master-page-container">
      {/* HERO SECTION */}
      <section className="master-hero" style={{ padding: '2rem 1rem', marginBottom: '2rem', position: 'relative' }}>
        <div className="master-hero-content">
          <Button
            variant="outline"
            onClick={() => navigate('/master/tenants')}
            className="absolute top-4 left-4 w-auto h-auto py-2 px-4"
            leftIcon={<ArrowLeft size={16} />}
          >
            {t("common.back")}
          </Button>

          <span className="master-badge">
            {isEdit ? '📝 Editar Instituição' : '✨ Nova Instituição'}
          </span>
          <h1 className="master-title">
            {isEdit ? name : t("master.tenantForm.newTitle")}
          </h1>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="master-card" style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* BASIC INFO */}
        <div className="master-card-header">
          <div className="master-icon-wrapper master-icon-blue">
            <Building2 size={24} />
          </div>
          <h3>Informações Básicas</h3>
        </div>

        <div className="master-form space-y-4">
          <Input
            label={t("master.tenantForm.labels.name")}
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={t("master.tenantForm.placeholders.name")}
            required
          />

          <Input
            label={t("master.tenantForm.labels.slug")}
            value={slug}
            onChange={e => setSlug(e.target.value)}
            placeholder={t("master.tenantForm.placeholders.slug")}
            required
            helperText={t("master.tenantForm.helpers.slug")}
          />
        </div>

        <hr style={{ border: 0, borderTop: '1px solid rgba(255,255,255,0.1)', margin: '2rem 0' }} />

        {/* PLAN & MODE */}
        <div className="master-card-header">
          <div className="master-icon-wrapper master-icon-green">
            <Package size={24} />
          </div>
          <h3>Plano e Operação</h3>
        </div>

        <div className="master-form space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label={t("master.tenantForm.labels.plan")}
              value={plan}
              onChange={e => {
                const newPlan = e.target.value;
                setPlan(newPlan);
                if (newPlan === "START") setMaxWorks(50);
                else if (newPlan === "PRO") setMaxWorks(200);
                else if (newPlan === "ENTERPRISE") setMaxWorks(500);
              }}
            >
              <option value="START">{t("master.tenantForm.plans.start")}</option>
              <option value="PRO">{t("master.tenantForm.plans.pro")}</option>
              <option value="ENTERPRISE">{t("master.tenantForm.plans.enterprise")}</option>
              <option value="CUSTOM">{t("master.tenantForm.plans.custom")}</option>
            </Select>

            <Input
              label={t("master.tenantForm.labels.maxWorks")}
              type="number"
              value={maxWorks}
              onChange={e => setMaxWorks(parseInt(e.target.value) || 0)}
            />
          </div>

          {/* TENANT TYPE SELECTION */}
          <div className="bg-white/5 p-6 rounded-xl border border-white/10">
            <label className="block text-sm font-semibold mb-4">
              🏗️ Tipo de Instituição
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { value: "MUSEUM", icon: "🏛️", label: "Museu", desc: "Interior, salas, andares" },
                { value: "CITY", icon: "🏙️", label: "Cidade/Secretaria", desc: "Geo-localização, roteiros" },
                { value: "PRODUCER", icon: "🎬", label: "Produtor Cultural", desc: "Projetos, eventos, editais" },
                { value: "CULTURAL_SPACE", icon: "🎨", label: "Espaço Cultural", desc: "Centro cultural, biblioteca" }
              ].map(opt => (
                <label key={opt.value} className={`
                                    flex items-center gap-4 p-4 rounded-xl cursor-pointer border transition-all
                                    ${tenantType === opt.value ? 'bg-blue-500/10 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-transparent border-white/10 hover:border-white/20'}
                                `}>
                  <input
                    type="radio"
                    name="tenantType"
                    className="w-4 h-4 text-blue-600"
                    checked={tenantType === opt.value}
                    onChange={() => setTenantType(opt.value as any)}
                  />
                  <div className="flex flex-col">
                    <span className="font-bold text-white flex items-center gap-2">
                      <span>{opt.icon}</span> {opt.label}
                    </span>
                    <span className="text-xs text-slate-400">{opt.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* PARENT TENANT (for linking) */}
          {(tenantType === "MUSEUM" || tenantType === "PRODUCER" || tenantType === "CULTURAL_SPACE") && (
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <label className="block text-sm font-semibold mb-1">
                🔗 Vínculo Hierárquico (opcional)
              </label>
              <p className="text-xs text-slate-400 mb-4">
                Vincule esta instituição a uma Cidade/Secretaria para aparecer nos relatórios consolidados.
              </p>
              <Select
                value={parentId || ""}
                onChange={e => setParentId(e.target.value || null)}
              >
                <option value="">Sem vínculo (independente)</option>
                {cities.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </div>
          )}
        </div>

        <hr style={{ border: 0, borderTop: '1px solid rgba(255,255,255,0.1)', margin: '2rem 0' }} />

        {/* LEGAL & TERMS */}
        <div className="master-card-header">
          <div className="master-icon-wrapper master-icon-yellow">
            <Shield size={24} />
          </div>
          <h3>Termos e Privacidade (LGPD)</h3>
        </div>

        <div className="master-form space-y-4">
          <Textarea
            label="Termos de Uso"
            rows={6}
            value={termsOfUse}
            onChange={e => setTermsOfUse(e.target.value)}
            placeholder="Digite os termos de uso aqui..."
            className="font-mono text-sm"
          />
          <Textarea
            label="Política de Privacidade"
            rows={6}
            value={privacyPolicy}
            onChange={e => setPrivacyPolicy(e.target.value)}
            placeholder="Digite a política de privacidade..."
            className="font-mono text-sm"
          />
        </div>

        <hr style={{ border: 0, borderTop: '1px solid rgba(255,255,255,0.1)', margin: '2rem 0' }} />

        {/* FEATURE FLAGS */}
        <div className="master-card-header">
          <div className="master-icon-wrapper master-icon-purple">
            <Settings size={24} />
          </div>
          <h3>Funcionalidades</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: "🎨 Obras/Artefatos", state: featureWorks, setter: setFeatureWorks },
            { label: "🗺️ Trilhas/Roteiros", state: featureTrails, setter: setFeatureTrails },
            { label: "📅 Eventos", state: featureEvents, setter: setFeatureEvents },
            { label: "🏆 Gamificação", state: featureGamification, setter: setFeatureGamification },
            { label: "📷 QR Codes", state: featureQRCodes, setter: setFeatureQRCodes },
            { label: "📜 Certificados", state: featureCertificates, setter: setFeatureCertificates },
            { label: "♿ Acessibilidade", state: featureAccessibility, setter: setFeatureAccessibility },
            { label: "🎮 Minigame", state: featureMinigames, setter: setFeatureMinigames },
            { label: "🤖 Chat IA ⭐", state: featureChatAI, setter: setFeatureChatAI, premium: true },
            { label: "🛒 Loja Virtual ⭐", state: featureShop, setter: setFeatureShop, premium: true },
          ].map((feat, idx) => (
            <label key={idx} className={`
                            flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors
                            ${feat.state ? 'bg-purple-500/10 border-purple-500/50' : 'bg-transparent border-white/10 hover:border-white/20'}
                            ${feat.premium ? 'ring-1 ring-yellow-500/30' : ''}
                        `}>
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-white/20 text-purple-600 focus:ring-purple-500 bg-transparent"
                checked={feat.state}
                onChange={e => feat.setter(e.target.checked)}
              />
              <span className={`text-sm ${feat.state ? 'text-white' : 'text-slate-400'}`}>
                {feat.label}
              </span>
            </label>
          ))}
        </div>

        {!isEdit && (
          <>
            <hr style={{ border: 0, borderTop: '1px solid rgba(255,255,255,0.1)', margin: '2rem 0' }} />

            <div className="master-card-header">
              <div className="master-icon-wrapper master-icon-red">
                <Shield size={24} />
              </div>
              <h3>Administrador Inicial</h3>
            </div>

            <div className="master-form space-y-4">
              <Input
                label={t("master.tenantForm.labels.adminName")}
                value={adminName}
                onChange={e => setAdminName(e.target.value)}
                placeholder={t("master.tenantForm.placeholders.adminName")}
                required
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={t("master.tenantForm.labels.adminEmail")}
                  type="email"
                  value={adminEmail}
                  onChange={e => setAdminEmail(e.target.value)}
                  placeholder={t("master.tenantForm.placeholders.adminEmail")}
                  required
                />
                <Input
                  label={t("master.tenantForm.labels.adminPassword")}
                  type="password"
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                  placeholder={t("master.tenantForm.placeholders.adminPassword")}
                  required
                />
              </div>
            </div>
          </>
        )}

        <div className="mt-8 pt-8 border-t border-white/10">
          <Button
            type="submit"
            className="w-full md:w-auto min-w-[200px]"
            leftIcon={<Save size={18} />}
          >
            {t("common.save")}
          </Button>
        </div>
      </form>
    </div>
  );
};
