import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { QRCodeCanvas } from "qrcode.react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { useToast } from "../../../contexts/ToastContext";
import { useParams, useNavigate } from "react-router-dom";
import { Input, Select, Textarea, Button } from "../../../components/ui";
import {
  Save, ArrowLeft, Trash2, Upload, Volume2, Video,
  Image as ImageIcon, Accessibility, CheckCircle,
  ChevronRight, ChevronLeft, MapPin, FileText,
  MonitorPlay, Share2, Languages, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./AdminShared.css";

import { useTerminology } from "../../../hooks/useTerminology";
import { useIsCityMode, useTenant } from "../../auth/TenantContext";

// Steps Configuration
// Note: We move STEPS inside the component or make it a function to use terminology, 
// but for simplicity we will rename labels inside the component render.

export const AdminWorkForm: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { tenantId } = useAuth();
  const term = useTerminology(); // Dynamic terms
  const { addToast } = useToast();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const isCity = useIsCityMode();
  const tenant = useTenant();
  const isCultural = tenant?.type === 'CULTURAL_SPACE';

  // Steps Configuration Adjusted
  const steps = [
    { id: 0, title: "Dados Básicos", icon: FileText, description: `Informações principais da ${term.work.toLowerCase()}` },
    { id: 1, title: "Localização", icon: MapPin, description: `Onde encontrar o ${term.work.toLowerCase()}` },
    { id: 2, title: "Mídia e Conteúdo", icon: MonitorPlay, description: "Imagens, áudios e vídeos" },
    { id: 3, title: "Revisão", icon: CheckCircle, description: "Confirmação e publicação" }
  ];

  // Wizard State
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);

  // Modal State
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [requestType, setRequestType] = useState<"LIBRAS" | "AUDIO_DESC" | "BOTH">("BOTH");
  const [requestNotes, setRequestNotes] = useState("");
  const [isRequesting, setIsRequesting] = useState(false);

  // Data State
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [equipamentos, setEquipamentos] = useState<Array<{ id: string; nome: string }>>([]);

  // Form Fields
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [titleEs, setTitleEs] = useState("");
  const [artist, setArtist] = useState("");
  const [year, setYear] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState(t("admin.workForm.defaultDescription"));
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionEs, setDescriptionEs] = useState("");
  const [room, setRoom] = useState("Sala 2");
  const [floor, setFloor] = useState("1º andar");
  const [imageUrl, setImageUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [librasUrl, setLibrasUrl] = useState("");
  const [published, setPublished] = useState(false);
  const [technique, setTechnique] = useState("");
  const [period, setPeriod] = useState("");
  const [workMedium, setWorkMedium] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [radius, setRadius] = useState(5);
  const [equipamentoId, setEquipamentoId] = useState("");

  // Fetch Data
  useEffect(() => {
    if (tenantId) {
      api.get(`/categories`, { params: { tenantId } })
        .then(res => setCategories(res.data))
        .catch(console.error);

      api.get(`/equipamentos`)
        .then(res => setEquipamentos(res.data))
        .catch(console.error);
    }

    if (id && tenantId) {
      api.get(`/works/${id}`).then((res) => {
        const data = res.data;
        setTitle(data.title);
        setArtist(data.artist || "");
        setYear(data.year || "");
        setCategory(data.categoryId || "");
        setDescription(data.description || "");
        setRoom(data.room || "");
        setFloor(data.floor || "");
        setImageUrl(data.imageUrl || "");
        setAudioUrl(data.audioUrl || "");
        setLibrasUrl(data.librasUrl || "");
        setPublished(data.published ?? true);
        setEquipamentoId(data.equipamentoId || "");

        // Load translations if available in backend
        if (data.metadata?.translations?.en) {
          setTitleEn(data.metadata.translations.en.title || "");
          setDescriptionEn(data.metadata.translations.en.description || "");
        }
        if (data.metadata?.translations?.es) {
          setTitleEs(data.metadata.translations.es.title || "");
          setDescriptionEs(data.metadata.translations.es.description || "");
        }

        setRadius(data.radius || 5);
        setTechnique(data.technique || "");
        setPeriod(data.period || "");
        setWorkMedium(data.medium || "");
        setDimensions(data.dimensions || "");
        if (data.qrCode) setCode(data.qrCode.code);
      }).catch(err => {
        console.error(err);
        addToast(`Erro ao carregar ${term.work.toLowerCase()}`, "error");
      });
    }
  }, [id, tenantId]);

  // Handlers
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

  const [isTranslating, setIsTranslating] = useState(false);

  const handleAutoTranslate = async () => {
    if (!title && !description) {
      addToast("Preencha o título ou a descrição em português primeiro.", "info");
      return;
    }

    try {
      setIsTranslating(true);
      const res = await api.post("/ai/translate", {
        title,
        description
      });

      const { en, es } = res.data;

      if (en) {
        if (en.title) setTitleEn(en.title);
        if (en.description) setDescriptionEn(en.description);
      }

      if (es) {
        if (es.title) setTitleEs(es.title);
        if (es.description) setDescriptionEs(es.description);
      }

      addToast("Tradução concluída com sucesso!", "success");
    } catch (err) {
      console.error("Erro na tradução:", err);
      addToast("Houve um erro ao gerar a tradução automática.", "error");
    } finally {
      setIsTranslating(false);
    }
  };

  const validateStep = (stepIndex: number) => {
    switch (stepIndex) {
      case 0: // Basic Info
        if (!title.trim()) return "O título é obrigatório";
        // Artist might not be mandatory for city points, but let's keep it consistent or optional
        // if (!artist.trim()) return "O artista é obrigatório"; 
        return null;
      case 1: // Location
        if (!code.trim()) return "O código do discador é obrigatório";
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
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => {
    setDirection(-1);
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!tenantId) return;

    setSaving(true);

    // Clean up payload (Zod schema expects undefined/null, not empty strings for optional UUIDs/URLs)
    const payload: any = {
      title,
      artist: artist || undefined,
      year: year || undefined,
      description: description || undefined,
      room: room || undefined,
      floor: floor || undefined,
      technique: technique || undefined,
      period: period || undefined,
      medium: workMedium || undefined,
      dimensions: dimensions || undefined,
      tenantId,
      equipamentoId: equipamentoId || undefined,
      code: code || undefined,
      published,
      radius: Number(radius) || 5,
      metadata: {
        translations: {
          en: { title: titleEn, description: descriptionEn },
          es: { title: titleEs, description: descriptionEs }
        }
      }
    };

    if (category) payload.categoryId = category;
    if (imageUrl) payload.imageUrl = imageUrl;
    if (audioUrl) payload.audioUrl = audioUrl;
    if (librasUrl) payload.librasUrl = librasUrl;

    try {
      if (id) {
        await api.put(`/works/${id}`, payload);
        addToast(`${term.work} atualizada com sucesso!`, "success");
        navigate("/admin/obras");
      } else {
        const res = await api.post("/works", payload);
        addToast(`${term.work} criada com sucesso!`, "success");
        // Option to stay allows adding accessibility request immediately
        navigate(`/admin/obras/${res.data.id}`);
      }
    } catch (err: any) {
      console.error("Erro ao salvar obra", err);
      addToast("Erro ao salvar. Verifique os dados.", "error");
    } finally {
      setSaving(false);
    }
  };

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

  return (
    <div className="admin-form-container">
      {isUploading && (
        <div className="admin-modal-overlay">
          <div style={{ textAlign: 'center', color: 'white' }}>
            <div className="w-12 h-12 border-4 border-white/10 border-t-gold rounded-full animate-spin mb-4 mx-auto"></div>
            <p>Enviando arquivo...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="admin-wizard-header">
        <Button variant="ghost" onClick={() => navigate("/admin/obras")} className="p-0">
          <ArrowLeft size={24} />
        </Button>
        <div>
          <h1 className="admin-wizard-title">
            {isEdit ? `Editar ${term.work}` : `Nova ${term.work}`}
          </h1>
          <p className="admin-wizard-subtitle">
            Passo {currentStep + 1} de {steps.length}: {steps[currentStep].title}
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div className="admin-wizard-stepper">
        <div className="admin-stepper-progress-bg"></div>
        <div
          className="admin-stepper-progress-fill"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        ></div>

        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={`admin-step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
            >
              <div className="admin-step-icon">
                {isCompleted ? <CheckCircle size={20} /> : <Icon size={20} />}
              </div>
              <span className="admin-step-label">
                {step.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Content */}
      <div className="admin-wizard-content">
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
            {/* STEP 0: DADOS BÁSICOS */}
            {currentStep === 0 && (
              <div className="flex-col gap-6">
                <div className="admin-grid-2">
                  <Input
                    label={isCity ? "Nome do Ponto/Monumento (PT-BR)" : isCultural ? "Título da Atividade (PT-BR)" : "Título da Obra (PT-BR)"}
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder={isCity ? "Ex: Cristo Redentor" : isCultural ? "Ex: Oficina de Cerâmica" : "Ex: Abaporu"}
                    required
                  />
                  <Input
                    label={term.artist}
                    value={artist}
                    onChange={e => setArtist(e.target.value)}
                    placeholder={isCity ? "Ex: Heitor da Silva Costa" : isCultural ? "Ex: Instrutor João" : "Ex: Tarsila do Amaral"}
                  />
                </div>

                <div className="admin-grid-2">
                  <Select
                    label={term.technique}
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                  >
                    <option value="">Selecione uma categoria...</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </Select>
                  <Input
                    label={isCity ? "Ano de Inauguração" : isCultural ? "Data/Ano" : "Ano de Criação"}
                    value={year}
                    onChange={e => setYear(e.target.value)}
                    placeholder="Ex: 1928"
                  />
                </div>

                <div className="admin-grid-2">
                  <Select
                    label="Equipamento Responsável"
                    value={equipamentoId}
                    onChange={e => setEquipamentoId(e.target.value)}
                    required
                  >
                    <option value="">Selecione o equipamento...</option>
                    {equipamentos.map(e => (
                      <option key={e.id} value={e.id}>{e.nome}</option>
                    ))}
                  </Select>
                  <Input
                    label={t("admin.work.tcnica", `Técnica`)}
                    value={technique}
                    onChange={e => setTechnique(e.target.value)}
                    placeholder={t("admin.work.exLeoSobreTelaEsculturaEmBronze", `Ex: Óleo sobre tela, Escultura em bronze`)}
                  />
                </div>

                <div className="admin-grid-2">
                  <Input
                    label={t("admin.work.perodoEstilo", `Período / Estilo`)}
                    value={period}
                    onChange={e => setPeriod(e.target.value)}
                    placeholder="Ex: Barroco, Impressionismo, Arte Moderna"
                  />
                </div>

                <div className="admin-grid-2">
                  <Input
                    label="Suporte / Material"
                    value={workMedium}
                    onChange={e => setWorkMedium(e.target.value)}
                    placeholder={t("admin.work.exTelaMadeiraMrmore", `Ex: Tela, Madeira, Mármore`)}
                  />
                  <Input
                    label={t("admin.work.dimenses", `Dimensões`)}
                    value={dimensions}
                    onChange={e => setDimensions(e.target.value)}
                    placeholder="Ex: 85 x 73 cm"
                  />
                </div>

                <Textarea
                  label={t("admin.work.descrioCompleta", `Descrição Completa (PT-BR)`)}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={6}
                  placeholder={`Conte a história desta ${term.work.toLowerCase()}...`}
                />

                <div className="admin-section" style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 className="admin-section-title" style={{ margin: 0 }}>
                      <Languages color="#60a5fa" /> Traduções (Opcional)
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAutoTranslate}
                      isLoading={isTranslating}
                      leftIcon={<Sparkles size={16} color="#fbbf24" />}
                      style={{ borderColor: 'rgba(251, 191, 36, 0.3)', color: '#fbbf24', fontSize: '0.8rem' }}
                    >
                      Traduzir com IA
                    </Button>
                  </div>

                  <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="space-y-3">
                        <Input
                          label="Título em Inglês"
                          value={titleEn}
                          onChange={e => setTitleEn(e.target.value)}
                          placeholder="Ex: The Last Supper"
                        />
                        <Textarea
                          label="Descrição em Inglês"
                          value={descriptionEn}
                          onChange={e => setDescriptionEn(e.target.value)}
                          rows={4}
                          placeholder="English description..."
                        />
                      </div>

                      <div className="space-y-3">
                        <Input
                          label="Título em Espanhol"
                          value={titleEs}
                          onChange={e => setTitleEs(e.target.value)}
                          placeholder="Ex: La Última Cena"
                        />
                        <Textarea
                          label="Descrição em Espanhol"
                          value={descriptionEs}
                          onChange={e => setDescriptionEs(e.target.value)}
                          rows={4}
                          placeholder="Descripción en español..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1: LOCALIZAÇÃO */}
            {currentStep === 1 && (
              <div className="flex-col gap-6">
                <div className="admin-section" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ flex: 1 }}>
                    <Input
                      label={t("admin.work.CdigoDoDiscadorApenasNmeros", `🔢 Código do Discador (Apenas Números)`)}
                      value={code}
                      onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="Ex: 101"
                      style={{ fontSize: '1.5rem', textAlign: 'center', letterSpacing: '0.2em' }}
                    />
                    <p style={{ fontSize: '0.8rem', color: 'gray', textAlign: 'center', marginTop: '0.5rem' }}>
                      Este código será usado pelos {term.visitors.toLowerCase()} para encontrar o item no app.
                    </p>
                  </div>

                  {code && (
                    <div className="qr-container flex-col gap-4">
                      <div id={`qr-${code}`} style={{ display: 'inline-block' }}>
                        <QRCodeCanvas value={`${window.location.origin}/qr/${code}`} size={120} level="H" />
                      </div>
                      <span className="qr-code-display" style={{ marginTop: '0.5rem' }}>#{code}</span>
                      <Button
                        variant="ghost"
                        leftIcon={<Upload size={16} style={{ transform: 'rotate(180deg)' }} />}
                        onClick={() => {
                          const originalCanvas = document.querySelector(`#qr-${code} canvas`) as HTMLCanvasElement;
                          if (originalCanvas) {
                            const canvas = document.createElement("canvas");
                            const ctx = canvas.getContext("2d");
                            if (!ctx) return;

                            const padding = 40;
                            const bottomTextHeight = 100;
                            const minWidth = 360;
                            canvas.width = Math.max(originalCanvas.width + (padding * 2), minWidth);
                            canvas.height = originalCanvas.height + (padding * 2) + bottomTextHeight;

                            // Background
                            ctx.fillStyle = "#0f172a"; // dark premium background
                            ctx.fillRect(0, 0, canvas.width, canvas.height);

                            // Premium Gold/Dark Border
                            ctx.strokeStyle = "#1e293b"; // slate-800 outer border
                            ctx.lineWidth = 10;
                            ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);
                            ctx.strokeStyle = "#fbbf24"; // gold inner border
                            ctx.lineWidth = 2;
                            ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);

                            // Draw QR Code
                            const qrX = (canvas.width - originalCanvas.width) / 2;
                            // Preencher um quadrado branco para garantir opacidade do QR se original for transparente
                            ctx.fillStyle = "#ffffff";
                            ctx.fillRect(qrX - 5, padding - 5, originalCanvas.width + 10, originalCanvas.height + 10);
                            ctx.drawImage(originalCanvas, qrX, padding);

                            // Draw Text
                            ctx.fillStyle = "#f8fafc"; // white text
                            ctx.font = "bold 32px 'Inter', sans-serif";
                            ctx.textAlign = "center";
                            ctx.fillText(`CÓDIGO: ${code}`, canvas.width / 2, originalCanvas.height + padding + 40);
                            ctx.font = "normal 14px 'Inter', sans-serif";
                            ctx.fillStyle = "#94a3b8"; // slate-400
                            ctx.fillText("Escaneie ou digite no app", canvas.width / 2, originalCanvas.height + padding + 75);

                            const url = canvas.toDataURL("image/png");
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `qrcode-moldura-${code}.png`;
                            a.click();
                          }
                        }}
                      >
                        Baixar QR Code com Moldura
                      </Button>
                    </div>
                  )}
                </div>

                <div className="admin-grid-2">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                    <Input
                      label={term.room}
                      value={room}
                      onChange={e => setRoom(e.target.value)}
                      placeholder={isCity ? "Ex: Centro Histórico" : isCultural ? "Ex: Sala de Ensaio 1" : "Ex: Sala Moderna"}
                    />
                    <Input
                      label={term.floor}
                      value={floor}
                      onChange={e => setFloor(e.target.value)}
                      placeholder={isCity ? "Ex: Zona Sul" : isCultural ? "Ex: Térreo" : "Ex: 1º Pavimento"}
                    />
                  </div>
                  <Input
                    label={t("admin.work.raioDeDetecoM", `Raio de Detecção (m)`)}
                    type="number"
                    value={radius}
                    onChange={e => setRadius(Number(e.target.value))}
                  />
                </div>
              </div>
            )}

            {/* STEP 2: MÍDIA */}
            {currentStep === 2 && (
              <div className="flex-col gap-6">
                {/* Image Upload */}
                <div className="upload-box">
                  {imageUrl ? (
                    <>
                      <img src={imageUrl} alt="Preview" />
                      <div className="upload-overlay">
                        <label className="upload-btn">
                          <ImageIcon size={20} /> Trocar Imagem
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, "image", setImageUrl)} style={{ display: 'none' }} />
                        </label>
                      </div>
                    </>
                  ) : (
                    <div className="upload-placeholder">
                      <ImageIcon size={48} style={{ margin: '0 auto 1rem', display: 'block' }} />
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Imagem Principal</h3>
                      <p>Arraste uma imagem ou clique para selecionar</p>
                      <label className="upload-btn" style={{ marginTop: '1rem' }}>
                        <Upload size={20} /> Selecionar Arquivo
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, "image", setImageUrl)} style={{ display: 'none' }} />
                      </label>
                    </div>
                  )}
                </div>

                <div className="admin-grid-2">
                  {/* Audio Upload */}
                  <div className="media-card">
                    <h3 className="admin-section-title">
                      <Volume2 style={{ color: "#60a5fa" }} /> Áudio Guia {isCity ? "do Ponto" : isCultural ? "da Atividade" : "da Obra"}
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      {audioUrl && (
                        <audio controls src={audioUrl} style={{ width: '100%' }} />
                      )}

                      <label className="upload-btn" style={{ width: '100%', justifyContent: 'center' }}>
                        <Upload size={16} /> {audioUrl ? "Substituir Áudio" : "Enviar Áudio (MP3)"}
                        <input type="file" className="hidden" accept="audio/*" onChange={(e) => handleUpload(e, "audio", setAudioUrl)} style={{ display: 'none' }} />
                      </label>
                    </div>
                  </div>

                  {/* Libras Upload */}
                  <div className="media-card">
                    <h3 className="admin-section-title">
                      <Video style={{ color: "#a78bfa" }} /> Vídeo em Libras
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      {librasUrl && (
                        <video controls src={librasUrl} style={{ width: '100%', maxHeight: '150px', background: 'black', borderRadius: '8px' }} />
                      )}

                      <label className="upload-btn" style={{ width: '100%', justifyContent: 'center' }}>
                        <Upload size={16} /> {librasUrl ? "Substituir Vídeo" : "Enviar Vídeo (MP4)"}
                        <input type="file" className="hidden" accept="video/*" onChange={(e) => handleUpload(e, "video", setLibrasUrl)} style={{ display: 'none' }} />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: REVISÃO */}
            {currentStep === 3 && (
              <div className="flex-col gap-6">
                <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '1rem', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                  <CheckCircle size={48} color="var(--status-success)" style={{ margin: '0 auto 1rem' }} />
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--fg-main)' }}>Tudo pronto!</h2>
                  <p style={{ color: 'var(--fg-muted)' }}>Revise os dados abaixo antes de publicar.</p>
                </div>

                <div className="admin-grid-2">
                  <div className="admin-section">
                    <h3 className="admin-section-title">Resumo</h3>
                    <div className="summary-card">
                      <div className="summary-row">
                        <span className="summary-label">{t("admin.work.nomettulo", `Nome/Título:`)}</span>
                        <span className="summary-value">{title}</span>
                      </div>
                      <div className="summary-row">
                        <span className="summary-label">{term.artist}:</span>
                        <span className="summary-value">{artist}</span>
                      </div>
                      <div className="summary-row">
                        <span className="summary-label">{t("admin.work.cdigo", `Código:`)}</span>
                        <span className="summary-value">#{code}</span>
                      </div>
                      <div className="summary-row">
                        <span className="summary-label">{t("admin.work.mdias", `Mídias:`)}</span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {imageUrl && <ImageIcon size={16} color="var(--status-success)" />}
                          {audioUrl && <Volume2 size={16} color="var(--status-success)" />}
                          {librasUrl && <Video size={16} color="var(--status-success)" />}
                          {!imageUrl && !audioUrl && !librasUrl && <span style={{ fontSize: '0.8rem', color: 'gray' }}>Nenhuma</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <h3 className="admin-section-title">{t("admin.work.aesAdicionais", `Ações Adicionais`)}</h3>

                    <div
                      onClick={() => setPublished(!published)}
                      style={{
                        padding: '1rem',
                        borderRadius: '1rem',
                        border: `1px solid ${published ? 'var(--status-success)' : 'rgba(255,255,255,0.1)'}`,
                        background: published ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255,255,255,0.05)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: published ? 'var(--status-success)' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Share2 size={20} color="white" />
                        </div>
                        <div>
                          <div style={{ fontWeight: 'bold', color: 'var(--fg-main)' }}>
                            {published ? "Visível no App" : "Oculto (Rascunho)"}
                          </div>
                          <p style={{ fontSize: '0.8rem', color: 'var(--fg-muted)' }}>Disponibilidade para {term.visitors.toLowerCase()}</p>
                        </div>
                      </div>
                      {published && <CheckCircle size={20} color="var(--status-success)" />}
                    </div>

                    <div
                      onClick={() => setShowAccessModal(true)}
                      style={{
                        padding: '1rem',
                        borderRadius: '1rem',
                        border: '1px dashed #c084fc',
                        background: 'rgba(192, 132, 252, 0.05)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                      }}
                    >
                      <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: 'rgba(192, 132, 252, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Accessibility size={20} color="#c084fc" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 'bold', color: '#c084fc' }}>Acessibilidade Master</div>
                        <p style={{ fontSize: '0.8rem', color: '#e9d5ff' }}>{t("admin.work.solicitarProduoDeLibrasudio", `Solicitar produção de Libras/Áudio`)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Navigation */}
      <div className="admin-wizard-footer">
        <div className="admin-wizard-footer-inner">
          <Button
            variant="ghost"
            onClick={currentStep === 0 ? () => navigate("/admin/obras") : prevStep}
          >
            {currentStep === 0 ? "Cancelar" : "Voltar"}
          </Button>

          <div className="flex gap-2">
            {currentStep === steps.length - 1 ? (
              <Button
                onClick={handleSubmit}
                isLoading={saving}
                className="btn-primary"
                leftIcon={<Save size={18} />}
              >
                Salvar {term.work}
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                className="btn-primary"
                rightIcon={<ChevronRight size={18} />}
              >
                Próximo
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Accessibility Modal */}
      {showAccessModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h3 className="admin-section-title">
              <Accessibility color="#c084fc" /> Solicitar Acessibilidade
            </h3>
            <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--fg-muted)' }}>
              Envie um pedido para o time Master produzir os conteúdos de acessibilidade para {isCity ? "este ponto" : isCultural ? "esta atividade" : "esta obra"}.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <Select
                label={t("admin.work.tipoDeServio", `Tipo de Serviço`)}
                value={requestType}
                onChange={(e) => setRequestType(e.target.value as any)}
              >
                <option value="LIBRAS">{t("admin.work.apenasVdeoEmLibras", `Apenas Vídeo em Libras`)}</option>
                <option value="AUDIO_DESC">{t("admin.work.apenasAudiodescrio", `Apenas Audiodescrição`)}</option>
                <option value="BOTH">{t("admin.work.comboLibrasUdio", `Combo (Libras + Áudio)`)}</option>
              </Select>

              <Textarea
                label={t("admin.work.observaes", `Observações`)}
                value={requestNotes}
                onChange={e => setRequestNotes(e.target.value)}
                placeholder={t("admin.work.exPrioridadeAltaDetalhesEspecficos", `Ex: Prioridade alta, detalhes específicos...`)}
                rows={3}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
              <Button
                variant="ghost"
                onClick={() => setShowAccessModal(false)}
                disabled={isRequesting}
              >
                Fechar
              </Button>
              <Button
                onClick={async () => {
                  if (!id) {
                    addToast(`Salve ${isCity ? "o ponto" : isCultural ? "a atividade" : "a obra"} primeiro antes de solicitar.`, "info");
                    return;
                  }
                  try {
                    setIsRequesting(true);
                    await api.post("/accessibility", { workId: id, type: requestType, notes: requestNotes });
                    addToast("Solicitação enviada!", "success");
                    setShowAccessModal(false);
                  } catch (error) {
                    addToast("Erro ao enviar solicitação.", "error");
                  } finally {
                    setIsRequesting(false);
                  }
                }}
                isLoading={isRequesting}
                className="btn-primary"
                style={{ background: '#9333ea', borderColor: '#9333ea' }}
              >
                Enviar Pedido
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};