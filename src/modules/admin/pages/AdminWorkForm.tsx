import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { QRCodeCanvas } from "qrcode.react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { useParams, useNavigate } from "react-router-dom";

export const AdminWorkForm: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { tenantId } = useAuth();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [requestType, setRequestType] = useState<"LIBRAS" | "AUDIO_DESC" | "BOTH">("BOTH");
  const [requestNotes, setRequestNotes] = useState("");
  const [isRequesting, setIsRequesting] = useState(false);

  const [code, setCode] = useState("");

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [year, setYear] = useState("");
  const [category, setCategory] = useState(""); // Stores categoryId now
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [description, setDescription] = useState(
    t("admin.workForm.defaultDescription")
  );
  const [room, setRoom] = useState("Sala 2");
  const [floor, setFloor] = useState("1º andar");
  const [imageUrl, setImageUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [librasUrl, setLibrasUrl] = useState("");

  const [published, setPublished] = useState(false);
  const [radius, setRadius] = useState(5);

  // Fetch data on load
  React.useEffect(() => {
    if (tenantId) {
      // 1. Fetch Categories
      api.get(`/categories`, { params: { tenantId } })
        .then(res => {
          // Filter only WORK or GENERAL types if needed, or show all. 
          // Assuming backend lists all. We might want to filter by type later.
          // For now, list all.
          setCategories(res.data);
        })
        .catch(console.error);
    }

    if (id && tenantId) {
      // 2. Fetch Work details
      api.get(`/works/${id}`).then((res) => {
        const data = res.data;
        setTitle(data.title);
        setArtist(data.artist || "");
        setYear(data.year || "");
        // Set categoryId if available
        setCategory(data.categoryId || "");
        setDescription(data.description || "");
        setRoom(data.room || "");
        setFloor(data.floor || "");
        setImageUrl(data.imageUrl || "");
        setAudioUrl(data.audioUrl || "");
        setLibrasUrl(data.librasUrl || "");
        setPublished(data.published ?? true);
        setRadius(data.radius || 5);

        if (data.qrCode) {
          setCode(data.qrCode.code);
        }
      }).catch(console.error);
    }
  }, [id, tenantId]);

  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "audio" | "video", setter: (url: string) => void) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);

      try {
        setIsUploading(true);
        const res = await api.post(`/upload/${type}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        setter(res.data.url);
      } catch (error) {
        console.error(`Error uploading ${type}`, error);
        alert(t("common.errorUpload"));
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => handleUpload(e, "image", setImageUrl);
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => handleUpload(e, "audio", setAudioUrl);
  const handleLibrasUpload = (e: React.ChangeEvent<HTMLInputElement>) => handleUpload(e, "video", setLibrasUrl);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tenantId) return;

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
      tenantId,
      code,
      published,
      radius: Number(radius)
    };

    try {
      if (id) {
        await api.put(`/works/${id}`, payload);
        alert(t("common.success"));
        navigate("/admin/obras");
      } else {
        const res = await api.post("/works", payload);
        alert("Obra criada! Agora você pode solicitar acessibilidade.");
        // Stay on page (redirect to edit) to allow accessibility request
        navigate(`/admin/obras/${res.data.id}`);
      }
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error("Erro ao salvar obra", err);
      alert(error.response?.data?.message || t("common.error"));
    }
  };

  return (
    <div>
      {isUploading && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.7)", zIndex: 9999,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          color: "white"
        }}>
          <div className="spinner" style={{
            width: "50px", height: "50px", border: "5px solid rgba(255,255,255,0.3)",
            borderTopColor: "var(--primary-color)", borderRadius: "50%", animation: "spin 1s linear infinite"
          }}></div>
          <p style={{ marginTop: "1rem", fontSize: "1.2rem", fontWeight: "bold" }}>Enviando arquivo... (Isso pode levar alguns minutos)</p>
          <p style={{ fontSize: "0.9rem", opacity: 0.8 }}>Por favor, não feche a página.</p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      <h1 className="section-title">
        {isEdit ? t("admin.workForm.editTitle") : t("admin.workForm.newTitle")}
      </h1>
      {/* ... */}

      <form onSubmit={handleSubmit} className="card" style={{ maxWidth: 840 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          {isEdit && id && (
            <div style={{ gridColumn: "1 / -1", display: "flex", gap: "1rem", alignItems: "flex-start", background: "rgba(0,0,0,0.1)", padding: "1rem", borderRadius: "0.5rem" }}>
              <div style={{ flex: 1 }}>
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
              </div>

              {code && (
                <div style={{ textAlign: "center" }}>
                  <label>QR Code</label>
                  <div style={{ background: "white", padding: "0.5rem", borderRadius: "0.5rem", marginTop: "0.25rem" }}>
                    <QRCodeCanvas value={window.location.origin + "/qr/" + code} size={100} level="H" />
                  </div>
                  <small style={{ display: "block", marginTop: "0.25rem" }}>#{code}</small>
                </div>
              )}
            </div>
          )}

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ color: "#d4af37", fontWeight: "bold" }}>🔢 Código Numérico (Discador)</label>
            <input
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="Ex: 101"
              style={{ width: "100%", padding: "0.5rem", borderRadius: "0.6rem", border: "1px solid #d4af37" }}
            />
            <small style={{ color: "var(--text-secondary)" }}>Código usado no discador e para gerar o QR Code.</small>
          </div>

          <div>
            <label>{t("admin.workForm.labels.title")}</label>
            {/* ... title input */}
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              style={{ width: "100%", padding: "0.5rem", borderRadius: "0.6rem" }}
            />
          </div>
          {/* ... other inputs */}
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
              <option value="">{t("admin.dashboard.select")}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
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

        {/* ... description and uploads ... */}
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
          <button
            type="button"
            className="btn btn-secondary"
            style={{ borderColor: "#d4af37", color: "#d4af37" }}
            onClick={() => setShowAccessModal(true)}
          >
            ♿ Solicitar Acessibilidade (Master)
          </button>
          <small style={{ color: "#9ca3af" }}>
            Solicite ao time Master a produção de Libras/Audiodescrição.
          </small>
        </div>

        {showAccessModal && (
          <div className="modal-overlay" style={{
            position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.8)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
          }}>
            <div className="card" style={{ width: "100%", maxWidth: "500px", padding: "1.5rem" }}>
              <h3 className="section-title" style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>
                Solicitar Acessibilidade
              </h3>
              <p style={{ marginBottom: "1rem", color: "var(--text-secondary)" }}>
                O time Master receberá sua solicitação e fará o upload dos arquivos diretamente nesta obra.
              </p>

              <div className="form-group">
                <label>O que você precisa?</label>
                <select
                  className="input"
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value as any)}
                  style={{ width: "100%" }}
                >
                  <option value="LIBRAS">Apenas Vídeo em Libras</option>
                  <option value="AUDIO_DESC">Apenas Audiodescrição</option>
                  <option value="BOTH">Ambos (Libras + Áudio)</option>
                </select>
              </div>

              <div className="form-group" style={{ marginTop: "1rem" }}>
                <label>Observações (Opcional)</label>
                <textarea
                  className="input"
                  rows={3}
                  value={requestNotes}
                  onChange={e => setRequestNotes(e.target.value)}
                  placeholder="Ex: Gostaria de uma interpretação mais didática..."
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.5rem", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAccessModal(false)}
                  disabled={isRequesting}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={async () => {
                    if (!id) {
                      alert("Salve a obra primeiro antes de solicitar acessibilidade.");
                      setShowAccessModal(false);
                      return;
                    }
                    try {
                      setIsRequesting(true);
                      await api.post("/accessibility", {
                        workId: id,
                        type: requestType,
                        notes: requestNotes
                      });
                      alert("Solicitação enviada com sucesso!");
                      setShowAccessModal(false);
                    } catch (error: any) {
                      console.error(error);
                      const msg = error.response?.data?.message || error.message || "Erro desconhecido";
                      alert(`Erro ao enviar solicitação: ${msg}`);
                    } finally {
                      setIsRequesting(false);
                    }
                  }}
                  disabled={isRequesting}
                >
                  {isRequesting ? "Enviando..." : "Enviar Solicitação"}
                </button>
              </div>
            </div>
          </div>
        )}

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