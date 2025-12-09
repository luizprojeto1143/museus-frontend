import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { api, isDemoMode } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { useParams, useNavigate } from "react-router-dom";

export const AdminWorkForm: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { tenantId } = useAuth();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [title, setTitle] = useState(isEdit ? t("visitor.home.exampleArtwork") + " 1" : "");
  const [artist, setArtist] = useState(isEdit ? "Artista A" : "");
  const [year, setYear] = useState(isEdit ? "1920" : "");
  const [category, setCategory] = useState("Pintura");
  const [description, setDescription] = useState(
    t("admin.workForm.defaultDescription")
  );
  const [room, setRoom] = useState("Sala 2");
  const [floor, setFloor] = useState("1º andar");
  const [imageUrl, setImageUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [librasUrl, setLibrasUrl] = useState("");
  const [published, setPublished] = useState(true);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await api.post("/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setImageUrl(res.data.url);
    } catch (err) {
      console.error("Erro ao enviar imagem", err);
      alert(t("common.error"));
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await api.post("/upload/audio", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setAudioUrl(res.data.url);
    } catch (err) {
      console.error("Erro ao enviar áudio", err);
      alert(t("common.error"));
    }
  };

  const handleLibrasUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await api.post("/upload/video", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setLibrasUrl(res.data.url);
    } catch (err) {
      console.error("Erro ao enviar vídeo de Libras", err);
      alert(t("common.error"));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isDemoMode || !tenantId) {
      alert(t("admin.workForm.demoSave"));
      navigate("/admin/obras");
      return;
    }

    const payload = {
      title,
      artist,
      year,
      category,
      description,
      room,
      floor,
      imageUrl,
      audioUrl,
      librasUrl,
      tenantId
    };

    try {
      if (id) {
        await api.put(`/works/${id}`, payload);
      } else {
        await api.post("/works", payload);
      }
      navigate("/admin/obras");
    } catch (error) {
      console.error("Erro ao salvar obra", error);
      alert(t("common.error"));
    }
  };

  return (
    <div>
      <h1 className="section-title">
        {isEdit ? t("admin.workForm.editTitle") : t("admin.workForm.newTitle")}
      </h1>
      <p className="section-subtitle">
        {t("admin.workForm.subtitle")}
      </p>

      <form onSubmit={handleSubmit} className="card" style={{ maxWidth: 840 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          {isEdit && id && (
            <div style={{ gridColumn: "1 / -1" }}>
              <label>{t("admin.workForm.labels.id")}</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  value={id}
                  readOnly
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "0.6rem", background: "rgba(0,0,0,0.2)", color: "var(--text-secondary)" }}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    navigator.clipboard.writeText(id);
                    alert("ID copiado!");
                  }}
                >
                  📋
                </button>
              </div>
              <small style={{ color: "var(--text-secondary)" }}>Use este ID para gerar o QR Code.</small>
            </div>
          )}
          <div>
            <label>{t("admin.workForm.labels.title")}</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              style={{ width: "100%", padding: "0.5rem", borderRadius: "0.6rem" }}
            />
          </div>
          <div>
            <label>{t("admin.workForm.labels.artist")}</label>
            <input
              value={artist}
              onChange={e => setArtist(e.target.value)}
              required
              style={{ width: "100%", padding: "0.5rem", borderRadius: "0.6rem" }}
            />
          </div>
          <div>
            <label>{t("admin.workForm.labels.year")}</label>
            <input
              value={year}
              onChange={e => setYear(e.target.value)}
              style={{ width: "100%", padding: "0.5rem", borderRadius: "0.6rem" }}
            />
          </div>
          <div>
            <label>{t("admin.workForm.labels.category")}</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              style={{ width: "100%", padding: "0.5rem", borderRadius: "0.6rem" }}
            >
              <option>Pintura</option>
              <option>Escultura</option>
              <option>Fotografia</option>
              <option>Instalação</option>
            </select>
          </div>
          <div>
            <label>{t("admin.workForm.labels.room")}</label>
            <input
              value={room}
              onChange={e => setRoom(e.target.value)}
              style={{ width: "100%", padding: "0.5rem", borderRadius: "0.6rem" }}
            />
          </div>
          <div>
            <label>{t("admin.workForm.labels.floor")}</label>
            <input
              value={floor}
              onChange={e => setFloor(e.target.value)}
              style={{ width: "100%", padding: "0.5rem", borderRadius: "0.6rem" }}
            />
          </div>
        </div>

        <div style={{ marginTop: "1rem" }}>
          <label>{t("admin.workForm.labels.description")}</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={5}
            style={{
              width: "100%",
              padding: "0.6rem",
              borderRadius: "0.6rem",
              resize: "vertical"
            }}
          />
        </div>

        <div style={{ marginTop: "1rem" }}>
          <label>{t("admin.workForm.labels.image")}</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ width: "100%", padding: "0.5rem", borderRadius: "0.6rem" }}
          />
          {imageUrl && <p style={{ fontSize: "0.8rem", color: "#10b981", marginTop: "0.25rem" }}>✓ {t("admin.workForm.success.image")}</p>}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
            marginTop: "1rem"
          }}
        >
          <div>
            <label>{t("admin.workForm.labels.audio")}</label>
            <input
              type="file"
              accept="audio/*"
              onChange={handleAudioUpload}
              style={{ width: "100%", padding: "0.5rem", borderRadius: "0.6rem" }}
            />
            {audioUrl && <p style={{ fontSize: "0.8rem", color: "#10b981", marginTop: "0.25rem" }}>✓ {t("admin.workForm.success.audio")}</p>}
          </div>
          <div>
            <label>{t("admin.workForm.labels.libras")}</label>
            <input
              type="file"
              accept="video/*"
              onChange={handleLibrasUpload}
              style={{ width: "100%", padding: "0.5rem", borderRadius: "0.6rem" }}
            />
            {librasUrl && <p style={{ fontSize: "0.8rem", color: "#10b981", marginTop: "0.25rem" }}>✓ {t("admin.workForm.success.libras")}</p>}
          </div>
        </div>

        <div style={{ marginTop: "1rem", display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <label>
            <input
              type="checkbox"
              checked={published}
              onChange={e => setPublished(e.target.checked)}
            />{" "}
            {t("admin.workForm.labels.publish")}
          </label>
        </div>

        <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem" }}>
          <button type="submit" className="btn">
            {t("common.save")}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/admin/obras")}
          >
            {t("common.cancel")}
          </button>
        </div>
      </form>
    </div>
  );
};