import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { QRCodeCanvas } from "qrcode.react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { useToast } from "../../../contexts/ToastContext";
import { useParams, useNavigate } from "react-router-dom";
import { Input, Select, Textarea, Button } from "../../../components/ui";
import { Save, ArrowLeft, Trash2, Upload, Volume2, Video, Image as ImageIcon, Accessibility } from "lucide-react";

export const AdminWorkForm: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { tenantId } = useAuth();
  const { addToast } = useToast();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [showAccessModal, setShowAccessModal] = useState(false);
  const [requestType, setRequestType] = useState<"LIBRAS" | "AUDIO_DESC" | "BOTH">("BOTH");
  const [requestNotes, setRequestNotes] = useState("");
  const [isRequesting, setIsRequesting] = useState(false);
  const [saving, setSaving] = useState(false);

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
      }).catch(err => {
        console.error(err);
        addToast("Erro ao carregar obra", "error");
      });
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
        addToast("Arquivo enviado com sucesso!", "success");
      } catch (error) {
        console.error(`Error uploading ${type}`, error);
        addToast(t("common.errorUpload"), "error");
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

    if (!tenantId) {
      addToast("Erro de autenticação", "error");
      return;
    }

    setSaving(true);
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
        addToast(t("common.success"), "success");
        navigate("/admin/obras");
      } else {
        const res = await api.post("/works", payload);
        addToast("Obra criada! Agora você pode solicitar acessibilidade.", "success");
        // Stay on page (redirect to edit) to allow accessibility request
        navigate(`/admin/obras/${res.data.id}`);
      }
    } catch (err: any) {
      console.error("Erro ao salvar obra", err);
      const msg = err.response?.data?.message || t("common.error");
      addToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm(t("common.confirmDelete") || "Tem certeza que deseja excluir esta obra?")) return;

    try {
      await api.delete(`/works/${id}`);
      addToast(t("common.success") || "Obra excluída com sucesso!", "success");
      navigate("/admin/obras");
    } catch (error) {
      console.error(error);
      addToast(t("common.error") || "Erro ao excluir obra.", "error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {isUploading && (
        <div className="fixed inset-0 bg-black/70 z-50 flex flex-col items-center justify-center text-white">
          <div className="w-12 h-12 border-4 border-white/30 border-t-gold rounded-full animate-spin mb-4"></div>
          <p className="text-xl font-bold">Enviando arquivo...</p>
          <p className="text-sm opacity-80">Por favor, não feche a página.</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => navigate("/admin/obras")} className="p-2">
          <ArrowLeft size={24} />
        </Button>
        <div>
          <h1 className="section-title">
            {isEdit ? t("admin.workForm.editTitle") : t("admin.workForm.newTitle")}
          </h1>
          <p className="section-subtitle">
            Gerencie as informações detalhadas da obra de arte
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isEdit && id && (
              <div className="md:col-span-2 bg-gray-800/50 p-4 rounded-lg flex flex-col md:flex-row gap-4 items-start">
                <div className="flex-1 w-full">
                  <Input
                    label={t("admin.workForm.labels.id")}
                    value={id}
                    disabled
                    containerClassName="mb-0"
                  />
                  <button
                    type="button"
                    className="text-xs text-gold hover:underline mt-1"
                    onClick={() => {
                      navigator.clipboard.writeText(id);
                      addToast("ID copiado!", "success");
                    }}
                  >
                    Copiar ID
                  </button>
                </div>
                {code && (
                  <div className="flex flex-col items-center bg-white p-2 rounded-lg">
                    <QRCodeCanvas value={window.location.origin + "/qr/" + code} size={100} level="H" />
                    <small className="text-black font-mono font-bold mt-1">#{code}</small>
                  </div>
                )}
              </div>
            )}

            <div className="md:col-span-2">
              <Input
                label="🔢 Código Numérico (Discador)"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="Ex: 101"
                className="border-gold/50 focus:border-gold"
              />
              <p className="text-xs text-gray-500 -mt-2 mb-4">Código usado no discador e para gerar o QR Code.</p>
            </div>

            <div className="md:col-span-2">
              <Input
                label={t("admin.workForm.labels.title")}
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>

            <Input
              label={t("admin.workForm.labels.artist")}
              value={artist}
              onChange={e => setArtist(e.target.value)}
              required
            />

            <Input
              label={t("admin.workForm.labels.year")}
              value={year}
              onChange={e => setYear(e.target.value)}
            />

            <Select
              label={t("admin.workForm.labels.category")}
              value={category}
              onChange={e => setCategory(e.target.value)}
            >
              <option value="">{t("admin.dashboard.select")}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Select>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t("admin.workForm.labels.room")}
                value={room}
                onChange={e => setRoom(e.target.value)}
              />
              <Input
                label={t("admin.workForm.labels.floor")}
                value={floor}
                onChange={e => setFloor(e.target.value)}
              />
            </div>
          </div>

          <Textarea
            label={t("admin.workForm.labels.description")}
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={5}
            containerClassName="mt-4"
          />
        </div>

        {/* Uploads */}
        <div className="card">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Upload size={20} className="text-gold" /> Mídia e Arquivos
          </h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">{t("admin.workForm.labels.image")}</label>
              <div className="flex items-center gap-4">
                {imageUrl && (
                  <img src={imageUrl} alt="Preview" className="w-20 h-20 object-cover rounded-lg border border-gray-700" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="block w-full text-sm text-gray-400
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-gray-800 file:text-gold
                                hover:file:bg-gray-700
                            "
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <Volume2 size={16} /> {t("admin.workForm.labels.audio")}
                </label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  className="block w-full text-sm text-gray-400
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-gray-800 file:text-blue-400
                                hover:file:bg-gray-700 mb-2
                            "
                />
                {audioUrl && (
                  <audio controls src={audioUrl} className="w-full h-8 mt-2" />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <Video size={16} /> {t("admin.workForm.labels.libras")}
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleLibrasUpload}
                  className="block w-full text-sm text-gray-400
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-gray-800 file:text-purple-400
                                hover:file:bg-gray-700 mb-2
                            "
                />
                {librasUrl && (
                  <video controls src={librasUrl} className="w-full max-h-32 rounded-lg bg-black mt-2" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Acessibilidade */}
        <div className="card flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold flex items-center gap-2 text-gold">
              <Accessibility size={20} /> Solicitar Acessibilidade (Master)
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Solicite ao time Master a produção de Libras/Audiodescrição.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="border-gold text-gold hover:bg-gold/10"
            onClick={() => setShowAccessModal(true)}
          >
            Solicitar Agora
          </Button>
        </div>

        {/* Visibilidade */}
        <div className="card">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={published}
              onChange={e => setPublished(e.target.checked)}
              className="w-5 h-5 rounded text-gold focus:ring-gold bg-gray-900 border-gray-600"
            />
            <span className="text-gray-200 font-medium">{t("admin.workForm.labels.publish")}</span>
          </label>
          <p className="text-sm text-gray-500 mt-1 ml-8">
            Se desmarcado, a obra não aparecerá para os visitantes no app.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/admin/obras")}
            disabled={saving}
          >
            {t("common.cancel")}
          </Button>

          {isEdit && (
            <Button
              type="button"
              className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/50"
              onClick={handleDelete}
              disabled={saving}
              leftIcon={<Trash2 size={18} />}
            >
              {t("common.delete")}
            </Button>
          )}

          <Button
            type="submit"
            isLoading={saving}
            leftIcon={<Save size={18} />}
          >
            {t("common.save")}
          </Button>
        </div>
      </form>

      {/* Modal de Acessibilidade */}
      {showAccessModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-lg w-full p-6 shadow-2xl border border-gray-700 animate-fadeIn">
            <h3 className="section-title text-xl mb-4">
              Solicitar Acessibilidade
            </h3>
            <p className="text-gray-400 mb-6">
              O time Master receberá sua solicitação e fará o upload dos arquivos diretamente nesta obra.
            </p>

            <Select
              label="O que você precisa?"
              value={requestType}
              onChange={(e) => setRequestType(e.target.value as any)}
            >
              <option value="LIBRAS">Apenas Vídeo em Libras</option>
              <option value="AUDIO_DESC">Apenas Audiodescrição</option>
              <option value="BOTH">Ambos (Libras + Áudio)</option>
            </Select>

            <Textarea
              label="Observações (Opcional)"
              value={requestNotes}
              onChange={e => setRequestNotes(e.target.value)}
              placeholder="Ex: Gostaria de uma interpretação mais didática..."
              rows={3}
            />

            <div className="flex justify-end gap-3 mt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowAccessModal(false)}
                disabled={isRequesting}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={async () => {
                  if (!id) {
                    addToast("Salve a obra primeiro antes de solicitar acessibilidade.", "info");
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
                    addToast("Solicitação enviada com sucesso!", "success");
                    setShowAccessModal(false);
                  } catch (error: any) {
                    console.error(error);
                    const msg = error.response?.data?.message || error.message || "Erro desconhecido";
                    addToast(`Erro ao enviar solicitação: ${msg}`, "error");
                  } finally {
                    setIsRequesting(false);
                  }
                }}
                isLoading={isRequesting}
              >
                Enviar Solicitação
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};