import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { useParams, useNavigate } from "react-router-dom";

export const AdminEventForm: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { tenantId } = useAuth();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [certificateBackgroundUrl, setCertificateBackgroundUrl] = useState("");
  const [certificateText, setCertificateText] = useState("");
  const [minMinutesForCertificate, setMinMinutesForCertificate] = useState("");

  React.useEffect(() => {
    if (id && tenantId) {
      api.get(`/events/${id}`)
        .then((res) => {
          const data = res.data;
          setTitle(data.title);
          setDescription(data.description || "");
          setLocation(data.location || "");
          setStartDate(data.startDate ? new Date(data.startDate).toISOString().slice(0, 16) : "");
          setEndDate(data.endDate ? new Date(data.endDate).toISOString().slice(0, 16) : "");
          setCertificateBackgroundUrl(data.certificateBackgroundUrl || "");
          setCertificateText(data.certificateText || "");
          setMinMinutesForCertificate(data.minMinutesForCertificate || "");
        })
        .catch(console.error);
    }
  }, [id, tenantId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tenantId) return;

    const payload = {
      title,
      description,
      location,
      startDate: new Date(startDate).toISOString(),
      endDate: endDate ? new Date(endDate).toISOString() : null,
      tenantId,
      certificateBackgroundUrl,
      certificateText,
      minMinutesForCertificate: minMinutesForCertificate ? Number(minMinutesForCertificate) : null
    };

    try {
      if (id) {
        await api.put(`/events/${id}`, payload);
      } else {
        await api.post("/events", payload);
      }
      navigate("/admin/eventos");
    } catch (error) {
      console.error("Erro ao salvar evento", error);
      alert(t("common.error"));
    }
  };

  return (
    <div>
      <h1 className="section-title">
        {isEdit ? t("admin.eventForm.editTitle") : t("admin.eventForm.newTitle")}
      </h1>
      <p className="section-subtitle">
        {t("admin.eventForm.subtitle")}
      </p>

      <form onSubmit={handleSubmit} className="card" style={{ maxWidth: 720 }}>
        <div className="form-group">
          <label htmlFor="title">{t("admin.eventForm.labels.title")}</label>
          <input
            id="title"
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("admin.eventForm.placeholders.title")}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">{t("admin.eventForm.labels.description")}</label>
          <textarea
            id="description"
            className="input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder={t("admin.eventForm.placeholders.description")}
          />
        </div>

        <div className="form-group">
          <label htmlFor="location">{t("admin.eventForm.labels.location")}</label>
          <input
            id="location"
            className="input"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={t("admin.eventForm.placeholders.location")}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div className="form-group">
            <label htmlFor="startDate">{t("admin.eventForm.labels.startDate")}</label>
            <input
              id="startDate"
              type="datetime-local"
              className="input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">{t("admin.eventForm.labels.endDate")}</label>
            <input
              id="endDate"
              type="datetime-local"
              className="input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <h3 className="section-subtitle" style={{ marginTop: '2rem', marginBottom: '1rem' }}>Certificado Digital</h3>
        <div className="card-section">
          <div className="form-group">
            <label htmlFor="certificateBackgroundUrl">URL da Imagem de Fundo (Padrão A4 Paisagem)</label>
            <input
              id="certificateBackgroundUrl"
              className="input"
              value={certificateBackgroundUrl}
              onChange={(e) => setCertificateBackgroundUrl(e.target.value)}
              placeholder="https://... (Deixe em branco para usar o padrão do museu)"
            />
          </div>
          <div className="form-group">
            <label htmlFor="minMinutesForCertificate">Minutos Mínimos para Elegibilidade</label>
            <input
              id="minMinutesForCertificate"
              type="number"
              className="input"
              value={minMinutesForCertificate}
              onChange={(e) => setMinMinutesForCertificate(e.target.value)}
              placeholder="Ex: 60"
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
          <button type="submit" className="btn">
            {t("common.save")}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/admin/eventos")}
          >
            {t("common.cancel")}
          </button>
        </div>
      </form>
    </div>
  );
};
