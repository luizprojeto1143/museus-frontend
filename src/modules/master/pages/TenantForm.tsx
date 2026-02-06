import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api, isDemoMode } from "../../../api/client";
import { Building2, Save, ArrowLeft, Package, Map, Settings, Shield } from "lucide-react";
import "./MasterShared.css";

export const TenantForm: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

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
  // ...
  // In loadTenant:
  // setTermsOfUse(data.termsOfUse || "");
  // setPrivacyPolicy(data.privacyPolicy || "");

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
      setName(data.name);
      setSlug(data.slug);
      setIsCityMode(data.isCityMode ?? false);
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
      setFeatureAccessibility(data.featureAccessibility ?? true);
      setFeatureMinigames(data.featureMinigames ?? false);

      setTermsOfUse(data.termsOfUse || "");
      setPrivacyPolicy(data.privacyPolicy || "");
    } catch {
      console.error("Failed to load tenant");
      alert(t("common.errorLoad"));
      navigate("/master/tenants");
    }
  };

  React.useEffect(() => {
    if (isEdit && id) {
      loadTenant();
    }
  }, [isEdit, id]);

  // Load cities for parent selector
  React.useEffect(() => {
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
      alert(t("master.tenantForm.demoAlert"));
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
      } else {
        await api.post("/tenants", payload);
      }
      navigate("/master/tenants");
    } catch (error) {
      console.error("Erro ao salvar tenant", error);
      alert(t("master.tenantForm.errorSave"));
    }
  };

  return (
    <div className="master-page-container" >

      {/* HERO SECTION */}
      < section className="master-hero" style={{ padding: '2rem 1rem', marginBottom: '2rem' }} >
        <div className="master-hero-content">
          <button
            onClick={() => navigate('/master/tenants')}
            className="master-btn btn-outline"
            style={{ width: 'auto', position: 'absolute', top: '1rem', left: '1rem', marginTop: 0, padding: '0.5rem 1rem' }}
          >
            <ArrowLeft size={16} />
            {t("common.back")}
          </button>

          <span className="master-badge">
            {isEdit ? 'âœï¸ Editar Museu' : 'âœ¨ Novo Museu'}
          </span>
          <h1 className="master-title">
            {isEdit ? name : t("master.tenantForm.newTitle")}
          </h1>
        </div>
      </section >


      <form onSubmit={handleSubmit} className="master-card" style={{ maxWidth: 800, margin: '0 auto' }}>

        {/* BASIC INFO */}
        <div className="master-card-header">
          <div className="master-icon-wrapper master-icon-blue">
            <Building2 size={24} />
          </div>
          <h3>InformaÃ§Ãµes BÃ¡sicas</h3>
        </div>

        <div className="master-form">
          <div className="master-input-group">
            <label htmlFor="name">{t("master.tenantForm.labels.name")}</label>
            <input
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={t("master.tenantForm.placeholders.name")}
              required
            />
          </div>

          <div className="master-input-group">
            <label htmlFor="slug">{t("master.tenantForm.labels.slug")}</label>
            <input
              id="slug"
              value={slug}
              onChange={e => setSlug(e.target.value)}
              placeholder={t("master.tenantForm.placeholders.slug")}
              required
            />
            <p style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.25rem" }}>
              {t("master.tenantForm.helpers.slug")}
            </p>
          </div>
        </div>

        <hr style={{ border: 0, borderTop: '1px solid rgba(255,255,255,0.1)', margin: '2rem 0' }} />

        {/* PLAN & MODE */}
        <div className="master-card-header">
          <div className="master-icon-wrapper master-icon-green">
            <Package size={24} />
          </div>
          <h3>Plano e OperaÃ§Ã£o</h3>
        </div>

        <div className="master-form">
          <div className="master-grid-2">
            <div className="master-input-group">
              <label htmlFor="plan">{t("master.tenantForm.labels.plan")}</label>
              <select
                id="plan"
                value={plan}
                onChange={e => {
                  setPlan(e.target.value);
                  if (e.target.value === "START") setMaxWorks(50);
                  if (e.target.value === "PRO") setMaxWorks(200);
                  if (e.target.value === "ENTERPRISE") setMaxWorks(500);
                }}
              >
                <option value="START">{t("master.tenantForm.plans.start")}</option>
                <option value="PRO">{t("master.tenantForm.plans.pro")}</option>
                <option value="ENTERPRISE">{t("master.tenantForm.plans.enterprise")}</option>
                <option value="CUSTOM">{t("master.tenantForm.plans.custom")}</option>
              </select>
            </div>

            <div className="master-input-group">
              <label htmlFor="maxWorks">{t("master.tenantForm.labels.maxWorks")}</label>
              <input
                id="maxWorks"
                type="number"
                value={maxWorks}
                onChange={e => setMaxWorks(parseInt(e.target.value))}
              />
            </div>
          </div>

          {/* TENANT TYPE SELECTION */}
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <label className="master-input-group" style={{ marginBottom: '1rem', display: 'block', fontWeight: 600 }}>
              ðŸ—ï¸ Tipo de Tenant
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
              {[
                { value: "MUSEUM", icon: "ðŸ›ï¸", label: "Museu", desc: "Interior, salas, andares" },
                { value: "CITY", icon: "ðŸ™ï¸", label: "Cidade/Secretaria", desc: "Geo-localizaÃ§Ã£o, roteiros" },
                { value: "PRODUCER", icon: "ðŸŽ¬", label: "Produtor Cultural", desc: "Projetos, eventos, editais" },
                { value: "CULTURAL_SPACE", icon: "ðŸŽ­", label: "EspaÃ§o Cultural", desc: "Centro cultural, biblioteca" }
              ].map(opt => (
                <label key={opt.value} style={{
                  display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer",
                  padding: "1rem", border: tenantType === opt.value ? "2px solid #3b82f6" : "1px solid #334155", borderRadius: "0.75rem",
                  background: tenantType === opt.value ? "rgba(59, 130, 246, 0.1)" : "transparent",
                  transition: "all 0.2s"
                }}>
                  <input
                    type="radio"
                    name="tenantType"
                    checked={tenantType === opt.value}
                    onChange={() => setTenantType(opt.value as any)}
                    style={{ width: 'auto' }}
                  />
                  <div>
                    <strong style={{ display: "block", color: "#fff" }}>{opt.icon} {opt.label}</strong>
                    <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{opt.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* PARENT TENANT (for linking) */}
          {(tenantType === "MUSEUM" || tenantType === "PRODUCER" || tenantType === "CULTURAL_SPACE") && (
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginTop: '1rem' }}>
              <label className="master-input-group" style={{ marginBottom: '1rem', display: 'block', fontWeight: 600 }}>
                ðŸ”— VÃ­nculo HierÃ¡rquico (opcional)
              </label>
              <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "1rem" }}>
                Vincule este tenant a uma Cidade/Secretaria para aparecer nos relatÃ³rios consolidados.
              </p>
              <select
                value={parentId || ""}
                onChange={e => setParentId(e.target.value || null)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  background: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: "0.5rem",
                  color: "#e2e8f0"
                }}
              >
                <option value="">Sem vÃ­nculo (independente)</option>
                {cities.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
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

        <div className="master-form">
          <div className="master-input-group">
            <label htmlFor="termsOfUse">Termos de Uso</label>
            <textarea
              id="termsOfUse"
              rows={6}
              value={termsOfUse}
              onChange={e => setTermsOfUse(e.target.value)}
              placeholder="Digite os termos de uso aqui..."
              style={{ width: "100%", padding: "0.75rem", background: "#0f172a", border: "1px solid #334155", borderRadius: "0.5rem", color: "#e2e8f0", fontFamily: "monospace" }}
            />
          </div>
          <div className="master-input-group">
            <label htmlFor="privacyPolicy">PolÃ­tica de Privacidade</label>
            <textarea
              id="privacyPolicy"
              rows={6}
              value={privacyPolicy}
              onChange={e => setPrivacyPolicy(e.target.value)}
              placeholder="Digite a polÃ­tica de privacidade..."
              style={{ width: "100%", padding: "0.75rem", background: "#0f172a", border: "1px solid #334155", borderRadius: "0.5rem", color: "#e2e8f0", fontFamily: "monospace" }}
            />
          </div>
        </div>

        <hr style={{ border: 0, borderTop: '1px solid rgba(255,255,255,0.1)', margin: '2rem 0' }} />

        {/* FEATURE FLAGS */}
        <div className="master-card-header">
          <div className="master-icon-wrapper master-icon-purple">
            <Settings size={24} />
          </div>
          <h3>Funcionalidades</h3>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1rem"
        }}>
          <label className="feature-checkbox">
            <input type="checkbox" checked={featureWorks} onChange={e => setFeatureWorks(e.target.checked)} />
            ðŸŽ¨ Obras/Artefatos
          </label>
          <label className="feature-checkbox">
            <input type="checkbox" checked={featureTrails} onChange={e => setFeatureTrails(e.target.checked)} />
            ðŸ—ºï¸ Trilhas/Roteiros
          </label>
          <label className="feature-checkbox">
            <input type="checkbox" checked={featureEvents} onChange={e => setFeatureEvents(e.target.checked)} />
            ðŸ“… Eventos
          </label>
          <label className="feature-checkbox">
            <input type="checkbox" checked={featureGamification} onChange={e => setFeatureGamification(e.target.checked)} />
            ðŸ† GamificaÃ§Ã£o
          </label>
          <label className="feature-checkbox">
            <input type="checkbox" checked={featureQRCodes} onChange={e => setFeatureQRCodes(e.target.checked)} />
            ðŸ“¸ QR Codes
          </label>
          <label className="feature-checkbox">
            <input type="checkbox" checked={featureCertificates} onChange={e => setFeatureCertificates(e.target.checked)} />
            ðŸ“œ Certificados
          </label>
          <label className="feature-checkbox">
            <input type="checkbox" checked={featureAccessibility} onChange={e => setFeatureAccessibility(e.target.checked)} />
            â™¿ Acessibilidade
          </label>
          <label className="feature-checkbox">
            <input type="checkbox" checked={featureMinigames} onChange={e => setFeatureMinigames(e.target.checked)} />
            ðŸŽ® Minigame
          </label>

          {/* Premium Features */}
          <label className="feature-checkbox premium">
            <input type="checkbox" checked={featureChatAI} onChange={e => setFeatureChatAI(e.target.checked)} />
            ðŸ¤– Chat IA â­
          </label>
          <label className="feature-checkbox premium">
            <input type="checkbox" checked={featureShop} onChange={e => setFeatureShop(e.target.checked)} />
            ðŸ›’ Loja Virtual â­
          </label>
        </div>

        {
          !isEdit && (
            <>
              <hr style={{ border: 0, borderTop: '1px solid rgba(255,255,255,0.1)', margin: '2rem 0' }} />

              <div className="master-card-header">
                <div className="master-icon-wrapper master-icon-red">
                  <Shield size={24} />
                </div>
                <h3>Administrador Inicial</h3>
              </div>

              <div className="master-form">
                <div className="master-input-group">
                  <label htmlFor="adminName">{t("master.tenantForm.labels.adminName")}</label>
                  <input
                    id="adminName"
                    value={adminName}
                    onChange={e => setAdminName(e.target.value)}
                    placeholder={t("master.tenantForm.placeholders.adminName")}
                    required
                  />
                </div>

                <div className="master-grid-2">
                  <div className="master-input-group">
                    <label htmlFor="adminEmail">{t("master.tenantForm.labels.adminEmail")}</label>
                    <input
                      id="adminEmail"
                      type="email"
                      value={adminEmail}
                      onChange={e => setAdminEmail(e.target.value)}
                      placeholder={t("master.tenantForm.placeholders.adminEmail")}
                      required
                    />
                  </div>
                  <div className="master-input-group">
                    <label htmlFor="adminPassword">{t("master.tenantForm.labels.adminPassword")}</label>
                    <input
                      id="adminPassword"
                      type="password"
                      value={adminPassword}
                      onChange={e => setAdminPassword(e.target.value)}
                      placeholder={t("master.tenantForm.placeholders.adminPassword")}
                      required
                    />
                  </div>
                </div>
              </div>
            </>
          )
        }

        <div style={{ marginTop: "2rem", display: "flex", gap: "0.75rem" }}>
          <button type="submit" className="master-btn btn-primary">
            <Save size={18} />
            {t("common.save")}
          </button>
        </div>
      </form>
    </div>
  );
};

