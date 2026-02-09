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
  MonitorPlay, Share2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Steps Configuration
const STEPS = [
  { id: 0, title: "Dados Básicos", icon: FileText, description: "Informações principais da obra" },
  { id: 1, title: "Localização", icon: MapPin, description: "Onde encontrar a obra" },
  { id: 2, title: "Mídia e Conteúdo", icon: MonitorPlay, description: "Imagens, áudios e vídeos" },
  { id: 3, title: "Revisão", icon: CheckCircle, description: "Confirmação e publicação" }
];

export const AdminWorkForm: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { tenantId } = useAuth();
  const { addToast } = useToast();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

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

  // Form Fields
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [year, setYear] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState(t("admin.workForm.defaultDescription"));
  const [room, setRoom] = useState("Sala 2");
  const [floor, setFloor] = useState("1º andar");
  const [imageUrl, setImageUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [librasUrl, setLibrasUrl] = useState("");
  const [published, setPublished] = useState(false);
  const [radius, setRadius] = useState(5);

  // Fetch Data
  useEffect(() => {
    if (tenantId) {
      api.get(`/categories`, { params: { tenantId } })
        .then(res => setCategories(res.data))
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
        setRadius(data.radius || 5);
        if (data.qrCode) setCode(data.qrCode.code);
      }).catch(err => {
        console.error(err);
        addToast("Erro ao carregar obra", "error");
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

  const validateStep = (stepIndex: number) => {
    switch (stepIndex) {
      case 0: // Basic Info
        if (!title.trim()) return "O título é obrigatório";
        if (!artist.trim()) return "O artista é obrigatório";
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
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  };

  const prevStep = () => {
    setDirection(-1);
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!tenantId) return;

    setSaving(true);
    const payload = {
      title, artist, year, category, description,
      room, floor, imageUrl, audioUrl, librasUrl,
      tenantId, code, published, radius: Number(radius)
    };

    try {
      if (id) {
        await api.put(`/works/${id}`, payload);
        addToast("Obra atualizada com sucesso!", "success");
        navigate("/admin/obras");
      } else {
        const res = await api.post("/works", payload);
        addToast("Obra criada com sucesso!", "success");
        // Option to stay allows adding accessibility request immediately
        navigate(`/admin/obras/${res.data.id}`);
      }
    } catch (err: any) {
      console.error("Erro ao salvar obra", err);
      addToast("Erro ao salvar obra. Verifique os dados.", "error");
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
    <div className="max-w-5xl mx-auto pb-20">
      {isUploading && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex flex-col items-center justify-center text-white backdrop-blur-sm">
          <div className="w-16 h-16 border-4 border-white/10 border-t-blue-500 rounded-full animate-spin mb-6"></div>
          <p className="text-xl font-bold">Enviando arquivo...</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => navigate("/admin/obras")} className="h-10 w-10 p-0 rounded-full hover:bg-white/10">
          <ArrowLeft size={24} />
        </Button>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {isEdit ? "Editar Obra" : "Nova Obra"}
          </h1>
          <p className="text-slate-400 text-sm">
            Passo {currentStep + 1} de {STEPS.length}: {STEPS[currentStep].title}
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div className="mb-8 hidden md:flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/10 rounded-full -z-0"></div>
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-500 rounded-full -z-0 transition-all duration-500"
          style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
        ></div>

        {STEPS.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={`relative z-10 flex flex-col items-center gap-2 cursor-pointer group`}
              onClick={() => {
                if (isEdit || index < currentStep) {
                  setDirection(index > currentStep ? 1 : -1);
                  setCurrentStep(index);
                }
              }}
            >
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300
                ${isActive ? 'bg-blue-600 border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.5)] scale-110' :
                  isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' :
                    'bg-gray-900 border-white/10 text-slate-500 group-hover:border-white/30'}
              `}>
                {isCompleted ? <CheckCircle size={20} /> : <Icon size={20} />}
              </div>
              <span className={`text-xs font-bold transition-colors ${isActive ? 'text-white' : 'text-slate-500'}`}>
                {step.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Content */}
      <div className="bg-white/5 border border-white/5 rounded-3xl p-6 md:p-8 min-h-[400px] overflow-hidden relative">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full"
          >
            {/* STEP 0: DADOS BÁSICOS */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Título da Obra"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Ex: Abaporu"
                    className="bg-black/20 text-lg font-bold"
                  />
                  <Input
                    label="Artista / Autor"
                    value={artist}
                    onChange={e => setArtist(e.target.value)}
                    placeholder="Ex: Tarsila do Amaral"
                    className="bg-black/20"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Select
                    label="Categoria"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    options={[
                      { value: "", label: "Selecione uma categoria..." },
                      ...categories.map(c => ({ value: c.id, label: c.name }))
                    ]}
                    className="bg-black/20"
                  />
                  <Input
                    label="Ano de Criação"
                    value={year}
                    onChange={e => setYear(e.target.value)}
                    placeholder="Ex: 1928"
                    className="bg-black/20"
                  />
                </div>

                <Textarea
                  label="Descrição Completa"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={6}
                  className="bg-black/20"
                  placeholder="Conte a história desta obra..."
                />
              </div>
            )}

            {/* STEP 1: LOCALIZAÇÃO */}
            {currentStep === 1 && (
              <div className="space-y-8">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-center">
                  <div className="flex-1 space-y-4 w-full">
                    <Input
                      label="🔢 Código do Discador"
                      value={code}
                      onChange={e => setCode(e.target.value)}
                      placeholder="Ex: 101"
                      className="bg-black/20 text-2xl font-mono tracking-widest text-center border-blue-500/50 focus:border-blue-400 h-16"
                    />
                    <p className="text-sm text-slate-400 text-center">
                      Este código será usado pelos visitantes para encontrar a obra no app e gerar o QR Code.
                    </p>
                  </div>

                  {code && (
                    <div className="bg-white p-4 rounded-xl shadow-lg flex flex-col items-center">
                      <QRCodeCanvas value={`${window.location.origin}/qr/${code}`} size={120} level="H" />
                      <span className="text-black font-mono font-bold mt-2 text-lg">#{code}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Input
                    label="Sala / Espaço"
                    value={room}
                    onChange={e => setRoom(e.target.value)}
                    placeholder="Ex: Sala Moderna"
                    className="bg-black/20"
                  />
                  <Input
                    label="Andar"
                    value={floor}
                    onChange={e => setFloor(e.target.value)}
                    placeholder="Ex: 1º Pavimento"
                    className="bg-black/20"
                  />
                  <Input
                    label="Raio de Detecção (m)"
                    type="number"
                    value={radius}
                    onChange={e => setRadius(Number(e.target.value))}
                    className="bg-black/20"
                  />
                </div>
              </div>
            )}

            {/* STEP 2: MÍDIA */}
            {currentStep === 2 && (
              <div className="space-y-8">
                {/* Image Upload */}
                <div className="relative group rounded-2xl overflow-hidden bg-black/40 aspect-video md:aspect-[21/9] flex items-center justify-center border-2 border-dashed border-white/10 hover:border-blue-500/50 transition-all">
                  {imageUrl ? (
                    <>
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <label className="cursor-pointer bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-slate-200 transition-colors flex items-center gap-2">
                          <ImageIcon size={20} /> Trocar Imagem
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, "image", setImageUrl)} />
                        </label>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-8">
                      <ImageIcon size={48} className="mx-auto text-slate-500 mb-4" />
                      <h3 className="text-xl font-bold text-slate-300 mb-2">Imagem da Obra</h3>
                      <p className="text-slate-500 mb-6 max-w-sm mx-auto">Arraste uma imagem ou clique para selecionar. Formatos JPG ou PNG.</p>
                      <label className="cursor-pointer bg-blue-600 text-white px-6 py-3 rounded-full font-bold hover:bg-blue-500 transition-colors inline-flex items-center gap-2">
                        <Upload size={20} /> Selecionar Arquivo
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUpload(e, "image", setImageUrl)} />
                      </label>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Audio Upload */}
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-colors">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Volume2 className="text-blue-400" /> Áudio Guia
                    </h3>
                    <div className="space-y-4">
                      {audioUrl && (
                        <audio controls src={audioUrl} className="w-full h-10 rounded" />
                      )}

                      <label className="cursor-pointer flex items-center justify-center border border-white/10 bg-black/20 hover:bg-white/5 rounded-xl h-12 gap-2 text-sm text-slate-300 transition-colors">
                        <Upload size={16} /> {audioUrl ? "Substituir Áudio" : "Enviar Áudio (MP3)"}
                        <input type="file" className="hidden" accept="audio/*" onChange={(e) => handleUpload(e, "audio", setAudioUrl)} />
                      </label>
                    </div>
                  </div>

                  {/* Libras Upload */}
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/5 hover:border-white/10 transition-colors">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Video className="text-purple-400" /> Vídeo em Libras
                    </h3>
                    <div className="space-y-4">
                      {librasUrl && (
                        <video controls src={librasUrl} className="w-full max-h-32 rounded bg-black" />
                      )}

                      <label className="cursor-pointer flex items-center justify-center border border-white/10 bg-black/20 hover:bg-white/5 rounded-xl h-12 gap-2 text-sm text-slate-300 transition-colors">
                        <Upload size={16} /> {librasUrl ? "Substituir Vídeo" : "Enviar Vídeo (MP4)"}
                        <input type="file" className="hidden" accept="video/*" onChange={(e) => handleUpload(e, "video", setLibrasUrl)} />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: REVISÃO */}
            {currentStep === 3 && (
              <div className="space-y-8">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center">
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400">
                    <CheckCircle size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Tudo pronto!</h2>
                  <p className="text-slate-400 max-w-md mx-auto">
                    Revise os dados abaixo antes de publicar. Você poderá editar tudo depois se necessário.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-300 uppercase text-xs tracking-wider">Resumo</h3>
                    <div className="bg-white/5 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Título:</span>
                        <span className="font-bold text-white text-right">{title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Artista:</span>
                        <span className="font-bold text-white text-right">{artist}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Código:</span>
                        <span className="font-mono text-blue-400 font-bold bg-blue-500/10 px-2 rounded">#{code}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Mídias:</span>
                        <div className="flex gap-2">
                          {imageUrl && <ImageIcon size={16} className="text-emerald-400" />}
                          {audioUrl && <Volume2 size={16} className="text-emerald-400" />}
                          {librasUrl && <Video size={16} className="text-emerald-400" />}
                          {!imageUrl && !audioUrl && !librasUrl && <span className="text-xs text-slate-600">Nenhuma</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-300 uppercase text-xs tracking-wider">Ações Adicionais</h3>

                    <div
                      className={`
                        p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between
                        ${published ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}
                      `}
                      onClick={() => setPublished(!published)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${published ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                          <Share2 size={20} />
                        </div>
                        <div>
                          <h4 className={`font-bold ${published ? 'text-white' : 'text-slate-300'}`}>
                            {published ? "Visível no App" : "Oculto (Rascunho)"}
                          </h4>
                          <p className="text-xs text-slate-500">Disponibilidade para visitantes</p>
                        </div>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${published ? 'border-emerald-500 bg-emerald-500' : 'border-slate-500'}`}>
                        {published && <CheckCircle size={14} className="text-white" />}
                      </div>
                    </div>

                    <div
                      className="p-4 rounded-xl border border-dashed border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10 cursor-pointer transition-all flex items-center gap-3"
                      onClick={() => setShowAccessModal(true)}
                    >
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
                        <Accessibility size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-purple-200">Acessibilidade Master</h4>
                        <p className="text-xs text-purple-300/60">Solicitar produção de Libras/Áudio</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ERROR MESSAGE IF NO STEP MATCHES */}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Navigation */}
      <div className="fixed bottom-0 left-0 w-full bg-[#0f172a] border-t border-white/10 p-4 z-40">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={currentStep === 0 ? () => navigate("/admin/obras") : prevStep}
            className="text-slate-400 hover:text-white"
          >
            {currentStep === 0 ? "Cancelar" : "Voltar"}
          </Button>

          <div className="flex gap-2">
            {currentStep === STEPS.length - 1 ? (
              <Button
                onClick={handleSubmit}
                isLoading={saving}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-8"
                leftIcon={<Save size={18} />}
              >
                Salvar Obra
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                className="bg-blue-600 hover:bg-blue-500 text-white px-8"
                rightIcon={<ChevronRight size={18} />}
              >
                Próximo
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Accessibility Modal (Preserved but styled) */}
      {showAccessModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-white/10 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Accessibility className="text-purple-400" /> Solicitar Acessibilidade
            </h3>
            <p className="text-slate-400 mb-6 text-sm">
              Envie um pedido para o time Master produzir os conteúdos de acessibilidade para esta obra.
            </p>

            <div className="space-y-4">
              <Select
                label="Tipo de Serviço"
                value={requestType}
                onChange={(e) => setRequestType(e.target.value as any)}
                options={[
                  { value: "LIBRAS", label: "Apenas Vídeo em Libras" },
                  { value: "AUDIO_DESC", label: "Apenas Audiodescrição" },
                  { value: "BOTH", label: "Combo (Libras + Áudio)" }
                ]}
                className="bg-black/40"
              />

              <Textarea
                label="Observações"
                value={requestNotes}
                onChange={e => setRequestNotes(e.target.value)}
                placeholder="Ex: Prioridade alta, detalhes específicos..."
                rows={3}
                className="bg-black/40"
              />
            </div>

            <div className="flex justify-end gap-3 mt-8">
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
                    addToast("Salve a obra primeiro antes de solicitar.", "info");
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
                className="bg-purple-600 hover:bg-purple-500 text-white"
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