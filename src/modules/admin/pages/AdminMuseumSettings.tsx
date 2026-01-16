import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";

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
  bannerUrl: string;

  // 2.3 Mapa
  mapImageUrl: string;
  latitude: number;
  longitude: number;

  // 2.2 Cores e Tema
  primaryColor: string;
  secondaryColor: string;
  theme: "light" | "dark";
  historicalFont: boolean;

  // Mode
  isCityMode: boolean;
}

export const AdminMuseumSettings: React.FC = () => {
  const { t } = useTranslation();
  const { tenantId } = useAuth();
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
    bannerUrl: "",
    mapImageUrl: "",
    latitude: -20.385574, // Default Ouro Preto
    longitude: -43.503578,
    primaryColor: "#d4af37",
    secondaryColor: "#cd7f32",
    theme: "dark",
    historicalFont: true,
    isCityMode: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Floor Plans state
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
    <div>
      <h1 className="section-title">🏛 {t("admin.museumSettings.title")}</h1>
      <p className="section-subtitle">
        {t("admin.museumSettings.subtitle")}
      </p>

      {/* MODO DE OPERAÇÃO */}
      <div className="card" style={{ marginBottom: "2rem", borderLeft: "4px solid var(--primary)" }}>
        <h2 className="card-title">⚙️ Modo de Operação</h2>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h4 style={{ margin: 0 }}>Modo Cidade / Roteiro Turístico</h4>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Ative para adaptar a terminologia para cidades (Local, Roteiro, Bairro) ao invés de museus (Obra, Trilha, Sala).
            </p>
          </div>
          <label style={{ position: "relative", display: "inline-block", width: "50px", height: "26px" }}>
            <input
              type="checkbox"
              checked={settings.isCityMode}
              onChange={(e) => setSettings({ ...settings, isCityMode: e.target.checked })}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span
              style={{
                position: "absolute",
                cursor: "pointer",
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: settings.isCityMode ? "var(--primary)" : "#ccc",
                transition: "0.4s",
                borderRadius: "34px"
              }}
            >
              <span
                style={{
                  position: "absolute",
                  content: '""',
                  height: "18px",
                  width: "18px",
                  left: settings.isCityMode ? "26px" : "4px",
                  bottom: "4px",
                  backgroundColor: "white",
                  transition: "0.4s",
                  borderRadius: "50%"
                }}
              />
            </span>
          </label>
        </div>
      </div>

      {/* 2.1 DADOS DO MUSEU */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <h2 className="card-title">📋 {t("admin.museumSettings.institutionalData")}</h2>

        <div className="form-group">
          <label className="form-label">{t("admin.museumSettings.labels.name")} *</label>
          <input
            type="text"
            value={settings.name}
            onChange={(e) => setSettings({ ...settings, name: e.target.value })}
            placeholder="Ex: Museu Histórico de Ouro Preto"
          />
        </div>

        <div className="form-group">
          <label className="form-label">{t("admin.museumSettings.labels.mission")}</label>
          <textarea
            value={settings.mission}
            onChange={(e) => setSettings({ ...settings, mission: e.target.value })}
            placeholder={t("admin.museumSettings.placeholders.mission")}
            rows={4}
          />
        </div>

        <div className="form-group">
          <label className="form-label">{t("admin.museumSettings.labels.address")}</label>
          <input
            type="text"
            value={settings.address}
            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
            placeholder={t("admin.museumSettings.placeholders.address")}
          />
        </div>

        <div className="form-group">
          <label className="form-label">{t("admin.museumSettings.labels.openingHours")}</label>
          <input
            type="text"
            value={settings.openingHours}
            onChange={(e) => setSettings({ ...settings, openingHours: e.target.value })}
            placeholder="Ex: Seg-Sex 9h-17h, Sáb 10h-14h"
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
          <div className="form-group">
            <label className="form-label">{t("admin.museumSettings.labels.whatsapp")}</label>
            <input
              type="text"
              value={settings.whatsapp}
              onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
              placeholder="(31) 99999-9999"
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t("admin.museumSettings.labels.email")}</label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              placeholder="contato@museu.com.br"
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t("admin.museumSettings.labels.website")}</label>
            <input
              type="url"
              value={settings.website}
              onChange={(e) => setSettings({ ...settings, website: e.target.value })}
              placeholder="https://museu.com.br"
            />
          </div>
        </div>
      </div>

      {/* UPLOADS */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <h2 className="card-title">🖼 {t("admin.museumSettings.images.title")}</h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
          {/* Logo */}
          <div>
            <label className="form-label">{t("admin.museumSettings.images.logo")}</label>
            <div
              style={{
                width: "100%",
                height: "150px",
                border: "2px dashed var(--border-strong)",
                borderRadius: "var(--radius-md)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: settings.logoUrl ? `url(${settings.logoUrl}) center/contain no-repeat` : "rgba(42, 24, 16, 0.3)",
                cursor: "pointer",
                position: "relative"
              }}
              onClick={() => document.getElementById("logo-upload")?.click()}
            >
              {!settings.logoUrl && <span style={{ fontSize: "0.85rem" }}>{t("admin.museumSettings.images.clickToUpload")}</span>}
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => e.target.files?.[0] && handleFileUpload("logoUrl", e.target.files[0])}
              />
            </div>
          </div>

          {/* Capa */}
          <div>
            <label className="form-label">{t("admin.museumSettings.images.cover")}</label>
            <div
              style={{
                width: "100%",
                height: "150px",
                border: "2px dashed var(--border-strong)",
                borderRadius: "var(--radius-md)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: settings.coverImageUrl ? `url(${settings.coverImageUrl}) center/cover no-repeat` : "rgba(42, 24, 16, 0.3)",
                cursor: "pointer"
              }}
              onClick={() => document.getElementById("cover-upload")?.click()}
            >
              {!settings.coverImageUrl && <span style={{ fontSize: "0.85rem" }}>{t("admin.museumSettings.images.clickToUpload")}</span>}
              <input
                id="cover-upload"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => e.target.files?.[0] && handleFileUpload("coverImageUrl", e.target.files[0])}
              />
            </div>
          </div>

          {/* Ícone App */}
          <div>
            <label className="form-label">{t("admin.museumSettings.images.appIcon")}</label>
            <div
              style={{
                width: "100%",
                height: "150px",
                border: "2px dashed var(--border-strong)",
                borderRadius: "var(--radius-md)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: settings.appIconUrl ? `url(${settings.appIconUrl}) center/contain no-repeat` : "rgba(42, 24, 16, 0.3)",
                cursor: "pointer"
              }}
              onClick={() => document.getElementById("icon-upload")?.click()}
            >
              {!settings.appIconUrl && <span style={{ fontSize: "0.85rem" }}>{t("admin.museumSettings.images.clickToUpload")}</span>}
              <input
                id="icon-upload"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => e.target.files?.[0] && handleFileUpload("appIconUrl", e.target.files[0])}
              />
            </div>
          </div>

          {/* Banner */}
          <div>
            <label className="form-label">{t("admin.museumSettings.images.banner")}</label>
            <div
              style={{
                width: "100%",
                height: "150px",
                border: "2px dashed var(--border-strong)",
                borderRadius: "var(--radius-md)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: settings.bannerUrl ? `url(${settings.bannerUrl}) center/cover no-repeat` : "rgba(42, 24, 16, 0.3)",
                cursor: "pointer"
              }}
              onClick={() => document.getElementById("banner-upload")?.click()}
            >
              {!settings.bannerUrl && <span style={{ fontSize: "0.85rem" }}>{t("admin.museumSettings.images.clickToUpload")}</span>}
              <input
                id="banner-upload"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => e.target.files?.[0] && handleFileUpload("bannerUrl", e.target.files[0])}
              />
            </div>
          </div>
        </div>
      </div>



      {/* 2.3 CONFIGURAÇÃO DE MAPA */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <h2 className="card-title">📍 {t("admin.museumSettings.map.title") || "Configuração de Mapa"}</h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {/* Planta Baixa */}
          <div>
            <label className="form-label">{t("admin.museumSettings.map.floorPlan") || "Planta Baixa (Indoor)"}</label>
            <div
              style={{
                width: "100%",
                height: "200px",
                border: "2px dashed var(--border-strong)",
                borderRadius: "var(--radius-md)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: settings.mapImageUrl ? `url(${settings.mapImageUrl}) center/contain no-repeat` : "rgba(42, 24, 16, 0.3)",
                cursor: "pointer",
                marginBottom: "0.5rem"
              }}
              onClick={() => document.getElementById("map-upload")?.click()}
            >
              {!settings.mapImageUrl && <span style={{ fontSize: "0.85rem" }}>{t("admin.museumSettings.images.clickToUpload")}</span>}
              <input
                id="map-upload"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => e.target.files?.[0] && handleFileUpload("mapImageUrl", e.target.files[0])}
              />
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              Use uma imagem de alta resolução da planta do museu.
            </p>
          </div>

          {/* Coordenadas */}
          <div>
            <label className="form-label">{t("admin.museumSettings.map.coordinates") || "Coordenadas (Outdoor)"}</label>
            <div className="form-group">
              <label style={{ fontSize: "0.85rem" }}>Latitude</label>
              <input
                type="number"
                step="any"
                value={settings.latitude}
                onChange={(e) => setSettings({ ...settings, latitude: parseFloat(e.target.value) })}
                placeholder="-20.385574"
              />
            </div>
            <div className="form-group">
              <label style={{ fontSize: "0.85rem" }}>Longitude</label>
              <input
                type="number"
                step="any"
                value={settings.longitude}
                onChange={(e) => setSettings({ ...settings, longitude: parseFloat(e.target.value) })}
                placeholder="-43.503578"
              />
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              Defina a localização exata do museu para o mapa da cidade.
              <br />
              <a
                href="https://www.google.com/maps"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--primary)" }}
              >
                Consultar no Google Maps
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* 2.4 PLANTAS DE ANDARES (MULTI-FLOOR) */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div>
            <h2 className="card-title">🏢 Plantas de Andares</h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
              Adicione plantas para cada andar do museu
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingFloorPlan(null);
              setNewFloorPlan({ name: "", floor: 0, imageUrl: "" });
              setShowFloorPlanModal(true);
            }}
          >
            + Adicionar Andar
          </button>
        </div>

        {floorPlans.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", background: "rgba(0,0,0,0.1)", borderRadius: "0.5rem" }}>
            <p style={{ color: "var(--text-secondary)" }}>
              Nenhuma planta cadastrada. Adicione plantas para cada andar.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
            {floorPlans.map((plan) => (
              <div
                key={plan.id}
                style={{
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "0.5rem",
                  overflow: "hidden",
                  background: "var(--bg-card)"
                }}
              >
                <div
                  style={{
                    height: "120px",
                    background: plan.imageUrl ? `url(${plan.imageUrl}) center/cover` : "#333"
                  }}
                />
                <div style={{ padding: "0.75rem" }}>
                  <h4 style={{ marginBottom: "0.25rem" }}>{plan.name}</h4>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                    Andar: {plan.floor}
                  </p>
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                    <button
                      className="btn btn-secondary"
                      style={{ flex: 1, padding: "0.4rem" }}
                      onClick={() => openEditFloorPlan(plan)}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-secondary"
                      style={{ flex: 1, padding: "0.4rem", color: "#ef4444" }}
                      onClick={() => handleDeleteFloorPlan(plan.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal para adicionar/editar planta */}
      {showFloorPlanModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}
        >
          <div className="card" style={{ width: "90%", maxWidth: "450px", padding: "1.5rem" }}>
            <h3 style={{ marginBottom: "1rem" }}>
              {editingFloorPlan ? "Editar Planta" : "Nova Planta de Andar"}
            </h3>

            <div className="form-group">
              <label className="form-label">Nome do Andar *</label>
              <input
                type="text"
                value={newFloorPlan.name}
                onChange={(e) => setNewFloorPlan({ ...newFloorPlan, name: e.target.value })}
                placeholder="Ex: Térreo, 1º Andar, Subsolo..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Número do Andar</label>
              <input
                type="number"
                value={newFloorPlan.floor}
                onChange={(e) => setNewFloorPlan({ ...newFloorPlan, floor: parseInt(e.target.value) || 0 })}
                placeholder="0 = Térreo, 1, 2, -1..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Imagem da Planta *</label>
              <div
                style={{
                  width: "100%",
                  height: "150px",
                  border: "2px dashed var(--border-strong)",
                  borderRadius: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: newFloorPlan.imageUrl
                    ? `url(${newFloorPlan.imageUrl}) center/contain no-repeat`
                    : "rgba(42, 24, 16, 0.3)",
                  cursor: "pointer"
                }}
                onClick={() => document.getElementById("floor-plan-upload")?.click()}
              >
                {!newFloorPlan.imageUrl && (
                  <span style={{ fontSize: "0.85rem" }}>Clique para enviar imagem</span>
                )}
                <input
                  id="floor-plan-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => e.target.files?.[0] && handleFloorPlanImageUpload(e.target.files[0])}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.5rem" }}>
              <button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => {
                  setShowFloorPlanModal(false);
                  setEditingFloorPlan(null);
                }}
              >
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={handleSaveFloorPlan}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2.2 CORES E TEMA */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <h2 className="card-title">🎨 {t("admin.museumSettings.colors.title")}</h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          <div className="form-group">
            <label className="form-label">{t("admin.museumSettings.colors.primary")}</label>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <input
                type="color"
                value={settings.primaryColor}
                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                style={{ width: "60px", height: "40px", cursor: "pointer" }}
              />
              <input
                type="text"
                value={settings.primaryColor}
                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                placeholder="#d4af37"
                style={{ flex: 1 }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{t("admin.museumSettings.colors.secondary")}</label>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <input
                type="color"
                value={settings.secondaryColor}
                onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                style={{ width: "60px", height: "40px", cursor: "pointer" }}
              />
              <input
                type="text"
                value={settings.secondaryColor}
                onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                placeholder="#cd7f32"
                style={{ flex: 1 }}
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">{t("admin.museumSettings.colors.theme")}</label>
          <div style={{ display: "flex", gap: "1rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
              <input
                type="radio"
                checked={settings.theme === "light"}
                onChange={() => setSettings({ ...settings, theme: "light" })}
              />
              <span>{t("admin.museumSettings.colors.light")}</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
              <input
                type="radio"
                checked={settings.theme === "dark"}
                onChange={() => setSettings({ ...settings, theme: "dark" })}
              />
              <span>{t("admin.museumSettings.colors.dark")}</span>
            </label>
          </div>
        </div>

        <div className="form-group">
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={settings.historicalFont}
              onChange={(e) => setSettings({ ...settings, historicalFont: e.target.checked })}
            />
            <span className="form-label" style={{ marginBottom: 0 }}>{t("admin.museumSettings.colors.historicalFont")}</span>
          </label>
        </div>

        {/* Preview */}
        <div
          style={{
            marginTop: "1.5rem",
            padding: "1.5rem",
            borderRadius: "var(--radius-md)",
            background: settings.theme === "dark" ? "#1a1108" : "#f5f5f5",
            color: settings.theme === "dark" ? "#f5e6d3" : "#1a1108",
            fontFamily: settings.historicalFont ? "Georgia, serif" : "system-ui",
            border: "2px solid var(--border-subtle)"
          }}
        >
          <h3 style={{ color: settings.primaryColor, marginBottom: "0.5rem" }}>{t("admin.museumSettings.preview.title")}</h3>
          <p style={{ fontSize: "0.9rem", marginBottom: "1rem" }}>
            {t("admin.museumSettings.preview.text")}
          </p>
          <button
            className="btn"
            style={{
              background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.secondaryColor})`,
              color: settings.theme === "dark" ? "#1a1108" : "#fff"
            }}
          >
            {t("admin.museumSettings.preview.button")}
          </button>
        </div>
      </div>

      {/* Botão Salvar */}
      <button
        className="btn btn-primary"
        onClick={handleSave}
        disabled={saving}
        style={{ width: "100%", padding: "1rem", fontSize: "1rem" }}
      >
        {saving ? t("admin.museumSettings.saving") : `💾 ${t("admin.museumSettings.save")}`}
      </button>
    </div >
  );
};
