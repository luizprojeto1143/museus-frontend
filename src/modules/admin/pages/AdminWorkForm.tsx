import { useTranslation } from "react-i18next";
import { QRCodeCanvas } from "qrcode.react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Input, 
  Select, 
  Textarea, 
  Button, 
  Switch, 
  Badge, 
  Card, 
  Dialog,
  AnimateIn
} from "@/components/ui";
import {
  Save, ArrowLeft, Trash2, Upload, Volume2, Video,
  Image as ImageIcon, Accessibility, CheckCircle,
  ChevronRight, ChevronLeft, MapPin, FileText,
  MonitorPlay, Share2, Languages, Sparkles,
  Info, AlertCircle, X, QrCode, Target, CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { useTerminology } from "../../../hooks/useTerminology";
import { useIsCityMode, useTenant } from "../../auth/TenantContext";
import { validateFileAsync, UPLOAD_PRESETS } from "../../../utils/uploadValidator";
import "./AdminShared.css";

// Steps Configuration
// Note: We move STEPS inside the component or make it a function to use terminology, 
// but for simplicity we will rename labels inside the component render.

export const AdminWorkForm: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { tenantId } = useAuth();
  const term = useTerminology();
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
    { id: 3, title: "Modo Vestígio", icon: Sparkles, description: "Gamificação e Coleção" },
    { id: 4, title: "Revisão", icon: CheckCircle, description: "Confirmação e publicação" }
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
  const [isExtracting, setIsExtracting] = useState(false);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [equipamentos, setEquipamentos] = useState<Array<{ id: string; nome: string; lat?: number; lng?: number }>>([]);

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

  // Vestige Fields
  const [vestigeActive, setVestigeActive] = useState(false);
  const [vestigeLat, setVestigeLat] = useState<number | string>("");
  const [vestigeLng, setVestigeLng] = useState<number | string>("");
  const [latitude, setLatitude] = useState<number | string>("");
  const [longitude, setLongitude] = useState<number | string>("");
  const [captureRadius, setCaptureRadius] = useState(15);
  const [vestigeType, setVestigeType] = useState("WORK"); // L4 Fix: Default should be type, not rarity
  const [vestigeExpiresAt, setVestigeExpiresAt] = useState("");
  const [vestigeImageUrl, setVestigeImageUrl] = useState("");

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

        try {
          if (data?.metadata) {
            const meta = typeof data.metadata === 'string' ? JSON.parse(data.metadata) : data.metadata;
            const trans = meta?.translations;
            
            if (trans) {
              if (trans.en) {
                setTitleEn(trans.en.title || "");
                setDescriptionEn(trans.en.description || "");
              }
              if (trans.es) {
                setTitleEs(trans.es.title || "");
                setDescriptionEs(trans.es.description || "");
              }
            }
          }
        } catch (err) {
          console.warn("Could not parse metadata translations", err);
        }

        setRadius(data.radius || 5);
        setTechnique(data.technique || "");
        setPeriod(data.period || "");
        setWorkMedium(data.medium || "");
        setDimensions(data.dimensions || "");
        if (data.qrCode) setCode(data.qrCode.code);

        // Vestige Data
        setVestigeActive(!!data.vestigeActive);
        setVestigeLat(data.lat || "");
        setVestigeLng(data.lng || "");
        setLatitude(data.latitude || "");
        setLongitude(data.longitude || "");
        setCaptureRadius(data.captureRadiusM || 15);
        setVestigeType(data.vestigeType || "WORK");
        if (data.vestigeExpiresAt) setVestigeExpiresAt(new Date(data.vestigeExpiresAt).toISOString().split('T')[0]);
        setVestigeImageUrl(data.vestigeImageUrl || "");
      }).catch(err => {
        console.error(err);
        toast.error(`Erro ao carregar ${term.work.toLowerCase()}`);
      });
    }
  }, [id, tenantId]);
  
  const handleDownloadQR = () => {
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
  };

  // Handlers
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "audio" | "video", setter: (url: string) => void) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validação prévia conforme o tipo
      const preset = type === "image" ? UPLOAD_PRESETS.imageOnly 
                   : type === "audio" ? UPLOAD_PRESETS.audioOnly 
                   : UPLOAD_PRESETS.videoOnly;
      
      const validation = await validateFileAsync(file, preset);
      
      if (!validation.valid) {
        toast.error(validation.error || "Arquivo inválido");
        return;
      }

      if (validation.warning) {
        toast(validation.warning, { icon: '⚠️' });
      }

      const formData = new FormData();
      formData.append("file", file);

      try {
        setIsUploading(true);
        const res = await api.post(`/upload/${type}`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        setter(res.data.url);
        toast.success("Arquivo enviado com sucesso!");
      } catch (error) {
        console.error(`Error uploading ${type}`, error);
        toast.error(t("common.errorUpload"));
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

      toast.success("Tradução concluída com sucesso!");
    } catch (err) {
      console.error("Erro na tradução:", err);
      toast.error("Houve um erro ao gerar a tradução automática.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handlePdfExtract = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "work");

      try {
        setIsExtracting(true);
        const res = await api.post("/ai/extract-pdf", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        const data = res.data;
        if (data.title) setTitle(data.title);
        if (data.artist) setArtist(data.artist);
        if (data.year) setYear(data.year);
        if (data.description) setDescription(data.description);
        if (data.technique) setTechnique(data.technique);
        if (data.period) setPeriod(data.period);
        if (data.medium) setWorkMedium(data.medium);
        if (data.dimensions) setDimensions(data.dimensions);
        if (data.room) setRoom(data.room);
        if (data.floor) setFloor(data.floor);

        if (data.room) setRoom(data.room);
        if (data.floor) setFloor(data.floor);

        toast.success("Informações extraídas do PDF com sucesso!");
      } catch (err) {
        console.error("Erro ao extrair PDF:", err);
        toast.error("Houve um erro ao extrair informações do PDF.");
      } finally {
        setIsExtracting(false);
      }
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
      toast.error(error);
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

    // Vestige payload
    payload.vestigeActive = vestigeActive;
    payload.lat = vestigeLat ? Number(vestigeLat) : undefined;
    payload.lng = vestigeLng ? Number(vestigeLng) : undefined;
    payload.latitude = latitude || (vestigeLat ? Number(vestigeLat) : undefined);
    payload.longitude = longitude || (vestigeLng ? Number(vestigeLng) : undefined);
    payload.captureRadiusM = Number(captureRadius);
    payload.vestigeType = vestigeType;
    payload.vestigeExpiresAt = vestigeExpiresAt || undefined;
    payload.vestigeImageUrl = vestigeImageUrl || undefined;

    try {
      if (id) {
        await api.put(`/works/${id}`, payload);
        toast.success(`${term.work} atualizada com sucesso!`);
        navigate("/admin/obras");
      } else {
        const res = await api.post("/works", payload);
        toast.success(`${term.work} criada com sucesso!`);
        navigate(`/admin/obras/${res.data.id}`);
      }
    } catch (err: any) {
      console.error("Erro ao salvar obra", err);
      toast.error("Erro ao salvar. Verifique os dados.");
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
              <div className="space-y-8">
                <AnimateIn variant="fadeUp">
                  <Card className="p-6 bg-blue-500/5 border-blue-500/20 rounded-3xl">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                           <Sparkles size={24} />
                        </div>
                        <div>
                          <h4 className="text-white font-bold text-lg">{t("admin.workForm.autoFill", "Preencher automaticamente?") || "Preencher automaticamente?"}</h4>
                          <p className="text-slate-400 text-sm">{t("admin.workForm.autoFillDesc", `Suba um arquivo PDF com os dados da ${term.work.toLowerCase()} e faremos o resto.`) || `Suba um arquivo PDF com os dados da ${term.work.toLowerCase()} e faremos o resto.`}</p>
                        </div>
                      </div>
                      <Button
                        variant="glass"
                        onClick={() => document.getElementById('pdf-upload')?.click()}
                        isLoading={isExtracting}
                        leftIcon={<Upload size={18} />}
                        className="rounded-2xl h-12 px-8 border-blue-500/20 text-blue-400 hover:bg-blue-500/10"
                      >
                        {isExtracting ? "Extraindo..." : "Subir PDF"}
                      </Button>
                      <input 
                        id="pdf-upload"
                        type="file" 
                        accept=".pdf" 
                        onChange={handlePdfExtract} 
                        disabled={isExtracting}
                        className="hidden"
                      />
                    </div>
                  </Card>
                </AnimateIn>

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
                    onChange={e => {
                      const newId = e.target.value;
                      setEquipamentoId(newId);
                      
                      const eq = equipamentos.find(item => item.id === newId);
                      if (eq && eq.lat && eq.lng && !vestigeLat && !vestigeLng) {
                        setVestigeLat(eq.lat);
                        setVestigeLng(eq.lng);
                        setLatitude(eq.lat);
                        setLongitude(eq.lng);
                        toast(`Coordenadas puxadas do equipamento: ${eq.nome}`, { icon: '📍' });
                      }
                    }}
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

                <div className="space-y-6 pt-6 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Languages className="text-gold-400" size={20} />
                      <h3 className="text-lg font-bold text-white">Traduções (Opcional)</h3>
                    </div>
                    <Button
                      variant="glass"
                      size="sm"
                      onClick={handleAutoTranslate}
                      isLoading={isTranslating}
                      leftIcon={<Sparkles size={16} />}
                      className="rounded-xl border-gold-400/20 text-gold-400 hover:bg-gold-400/10"
                    >
                      Traduzir com IA
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="p-6 bg-white/[0.02] border-white/5 rounded-3xl space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-blue-400 border-blue-400/20">EN</Badge>
                        <span className="text-xs font-black uppercase tracking-widest text-slate-500">Inglês</span>
                      </div>
                      <Input
                        label="Título"
                        value={titleEn}
                        onChange={e => setTitleEn(e.target.value)}
                        placeholder="Ex: The Last Supper"
                        className="bg-black/20"
                      />
                      <Textarea
                        label="Descrição"
                        value={descriptionEn}
                        onChange={e => setDescriptionEn(e.target.value)}
                        rows={4}
                        placeholder="English description..."
                        className="bg-black/20"
                      />
                    </Card>

                    <Card className="p-6 bg-white/[0.02] border-white/5 rounded-3xl space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-red-400 border-red-400/20">ES</Badge>
                        <span className="text-xs font-black uppercase tracking-widest text-slate-500">Espanhol</span>
                      </div>
                      <Input
                        label="Título"
                        value={titleEs}
                        onChange={e => setTitleEs(e.target.value)}
                        placeholder="Ex: La Última Cena"
                        className="bg-black/20"
                      />
                      <Textarea
                        label="Descrição"
                        value={descriptionEs}
                        onChange={e => setDescriptionEs(e.target.value)}
                        rows={4}
                        placeholder="Descripción en español..."
                        className="bg-black/20"
                      />
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1: LOCALIZAÇÃO */}
            {currentStep === 1 && (
              <div className="space-y-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <Card className="p-8 border-white/5 bg-black/20 rounded-[32px] space-y-6">
                    <div className="space-y-2">
                       <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          <QrCode className="text-gold-400" size={24} />
                          Código do Discador
                       </h3>
                       <p className="text-slate-500 text-sm">Este código será usado pelos {term.visitors.toLowerCase()} para encontrar o item no app.</p>
                    </div>
                    
                    <Input
                      value={code}
                      onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="Ex: 101"
                      className="text-4xl h-20 text-center font-black tracking-[0.3em] bg-white/5 border-white/5 focus:border-gold-400"
                    />

                    {code && (
                      <div className="pt-6 border-t border-white/5 flex flex-col items-center gap-6">
                        <div className="p-4 bg-white rounded-3xl shadow-2xl shadow-gold-400/10">
                          <QRCodeCanvas value={`${window.location.origin}/qr/${code}`} size={160} level="H" />
                        </div>
                        <Button
                          variant="ghost"
                          leftIcon={<Upload size={16} className="rotate-180" />}
                          onClick={handleDownloadQR}
                          className="rounded-xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white"
                        >
                          Baixar com Moldura Premium
                        </Button>
                      </div>
                    )}
                  </Card>

                  <div className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                    
                    <Card className="p-6 bg-gold-400/5 border-gold-400/10 rounded-2xl">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gold-400/10 flex items-center justify-center text-gold-400">
                           <Target size={20} />
                        </div>
                        <div>
                           <h4 className="text-white font-bold">{t("admin.work.raioDeDetecoM", `Raio de Detecção (m)`)}</h4>
                           <p className="text-slate-500 text-xs">Distância para disparar o conteúdo automaticamente via Bluetooth/GPS.</p>
                        </div>
                      </div>
                      <Input
                        type="number"
                        value={radius}
                        onChange={e => setRadius(Number(e.target.value))}
                        className="bg-black/40 border-white/5"
                      />
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: MÍDIA */}
            {currentStep === 2 && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="p-8 border-white/5 bg-black/20 rounded-[32px] space-y-6">
                    <div className="flex items-center gap-3">
                       <ImageIcon className="text-blue-400" size={24} />
                       <h3 className="text-xl font-bold text-white">Imagem Principal</h3>
                    </div>
                    
                    <div 
                      className="aspect-video rounded-2xl bg-white/5 border-2 border-dashed border-white/10 overflow-hidden relative group cursor-pointer"
                      onClick={() => document.getElementById('image-upload')?.click()}
                    >
                      {imageUrl ? (
                        <>
                          <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                             <Button variant="glass" className="rounded-xl">Trocar Imagem</Button>
                          </div>
                        </>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-3">
                           <Upload size={32} />
                           <span className="text-sm font-medium">Clique ou arraste para subir</span>
                        </div>
                      )}
                      <input id="image-upload" type="file" accept="image/*" onChange={(e) => handleUpload(e, "image", setImageUrl)} className="hidden" />
                    </div>
                  </Card>

                  <div className="space-y-6">
                    <Card className="p-6 border-white/5 bg-black/20 rounded-3xl space-y-4">
                       <div className="flex items-center gap-3">
                          <Volume2 className="text-gold-400" size={20} />
                          <h4 className="text-white font-bold">Áudio Guia</h4>
                       </div>
                       {audioUrl && <audio controls src={audioUrl} className="w-full h-10" />}
                       <Button
                         variant="glass"
                         onClick={() => document.getElementById('audio-upload')?.click()}
                         isLoading={isUploading}
                         className="w-full rounded-xl border-white/5"
                         leftIcon={<Upload size={16} />}
                       >
                         {audioUrl ? "Substituir Áudio" : "Subir Áudio (MP3)"}
                       </Button>
                       <input id="audio-upload" type="file" accept="audio/*" onChange={(e) => handleUpload(e, "audio", setAudioUrl)} className="hidden" />
                    </Card>

                    <Card className="p-6 border-white/5 bg-black/20 rounded-3xl space-y-4">
                       <div className="flex items-center gap-3">
                          <Video className="text-purple-400" size={20} />
                          <h4 className="text-white font-bold">Vídeo em Libras</h4>
                       </div>
                       {librasUrl && <video controls src={librasUrl} className="w-full aspect-video rounded-xl bg-black" />}
                       <Button
                         variant="glass"
                         onClick={() => document.getElementById('libras-upload')?.click()}
                         isLoading={isUploading}
                         className="w-full rounded-xl border-white/5"
                         leftIcon={<Upload size={16} />}
                       >
                         {librasUrl ? "Substituir Vídeo" : "Subir Vídeo (MP4)"}
                       </Button>
                       <input id="libras-upload" type="file" accept="video/*" onChange={(e) => handleUpload(e, "video", setLibrasUrl)} className="hidden" />
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-8">
                <Card className="p-8 border-white/5 bg-black/20 rounded-[32px]">
                   <div className="flex items-center justify-between mb-8">
                     <div className="flex items-center gap-4">
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${vestigeActive ? 'bg-gold-400/20 text-gold-400' : 'bg-white/5 text-slate-500'}`}>
                          <Sparkles size={24} />
                       </div>
                       <div>
                         <h3 className="text-xl font-bold text-white">Modo Vestígio (GPS)</h3>
                         <p className="text-slate-500 text-sm">Torna este ponto capturável via radar para gamificação.</p>
                       </div>
                     </div>
                     <Switch 
                       checked={vestigeActive}
                       onCheckedChange={setVestigeActive}
                     />
                   </div>

                   <AnimatePresence>
                     {vestigeActive && (
                       <motion.div 
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         exit={{ opacity: 0, y: 10 }}
                         className="space-y-6 pt-8 border-t border-white/5"
                       >
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input 
                              label="Latitude (GPS)"
                              type="number"
                              step="any"
                              value={vestigeLat}
                              onChange={e => {
                                setVestigeLat(e.target.value);
                                setLatitude(e.target.value);
                              }}
                              placeholder="-25.4297"
                              className="bg-black/20"
                            />
                            <Input 
                              label="Longitude (GPS)"
                              type="number"
                              step="any"
                              value={vestigeLng}
                              onChange={e => {
                                setVestigeLng(e.target.value);
                                setLongitude(e.target.value);
                              }}
                              placeholder="-49.2719"
                              className="bg-black/20"
                            />
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input 
                              label="Raio de Captura (metros)"
                              type="number"
                              value={captureRadius}
                              onChange={e => setCaptureRadius(Number(e.target.value))}
                              className="bg-black/20"
                            />
                            <Select
                              label="Tipo de Vestígio"
                              value={vestigeType}
                              onChange={e => setVestigeType(e.target.value)}
                              className="bg-black/20"
                            >
                               <option value="WORK">Obra de Arte</option>
                               <option value="STREET_ART">Arte Urbana</option>
                               <option value="INSTALLATION">Monumento</option>
                               <option value="EVENT">Evento Temporário</option>
                            </Select>
                         </div>

                         <Card className="p-4 bg-gold-400/10 border-gold-400/20 rounded-2xl flex items-center gap-4">
                            <Info className="text-gold-400 shrink-0" size={20} />
                            <p className="text-gold-400 text-xs font-bold uppercase tracking-widest leading-relaxed">
                               Dica: Ao ativar o Modo Vestígio, os visitantes podem "capturar" este item ao se aproximarem fisicamente dele.
                            </p>
                         </Card>
                       </motion.div>
                     )}
                   </AnimatePresence>
                </Card>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-10">
                <AnimateIn variant="fadeUp">
                  <div className="text-center space-y-4 py-8">
                    <div className="w-20 h-20 rounded-3xl bg-green-500/10 flex items-center justify-center text-green-400 mx-auto">
                      <CheckCircle2 size={48} />
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tighter">Tudo pronto!</h2>
                    <p className="text-slate-400 font-medium">Revise as informações antes de finalizar.</p>
                  </div>
                </AnimateIn>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="p-8 border-white/5 bg-black/20 rounded-[32px] space-y-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                       <FileText className="text-gold-400" size={20} />
                       Resumo da Obra
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-white/5">
                        <span className="text-slate-500 text-sm">Título</span>
                        <span className="text-white font-bold">{title}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-white/5">
                        <span className="text-slate-500 text-sm">Código</span>
                        <Badge variant="outline" className="text-gold-400 border-gold-400/20 font-mono">#{code}</Badge>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-white/5">
                        <span className="text-slate-500 text-sm">Mídias</span>
                        <div className="flex gap-2">
                           {imageUrl && <ImageIcon size={18} className="text-green-400" />}
                           {audioUrl && <Volume2 size={18} className="text-green-400" />}
                           {librasUrl && <Video size={18} className="text-green-400" />}
                        </div>
                      </div>
                    </div>
                  </Card>

                  <div className="space-y-6">
                    <Card 
                      className={`p-6 border-2 transition-all cursor-pointer rounded-3xl flex items-center justify-between ${published ? 'bg-green-500/5 border-green-500/20' : 'bg-white/5 border-white/10'}`}
                      onClick={() => setPublished(!published)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${published ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-slate-500'}`}>
                           <Share2 size={24} />
                        </div>
                        <div>
                           <h4 className="text-white font-bold">{published ? "Publicado" : "Rascunho"}</h4>
                           <p className="text-slate-500 text-xs">{published ? "Visível para todos os visitantes" : "Apenas administradores podem ver"}</p>
                        </div>
                      </div>
                      <Switch checked={published} onCheckedChange={setPublished} />
                    </Card>

                    <Card 
                      className="p-6 border-2 border-dashed border-purple-500/20 bg-purple-500/5 rounded-3xl cursor-pointer hover:bg-purple-500/10 transition-all flex items-center justify-between"
                      onClick={() => setShowAccessModal(true)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                           <Accessibility size={24} />
                        </div>
                        <div>
                           <h4 className="text-white font-bold">Acessibilidade Master</h4>
                           <p className="text-slate-500 text-xs">Solicitar tradução em Libras ou Audiodescrição</p>
                        </div>
                      </div>
                      <ChevronRight className="text-purple-400" size={20} />
                    </Card>
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

      <Dialog
        isOpen={showAccessModal}
        onClose={() => setShowAccessModal(false)}
        title="Solicitar Acessibilidade Master"
        className="max-w-xl"
      >
        <div className="space-y-6">
          <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-start gap-4">
            <Accessibility className="text-purple-400 shrink-0 mt-1" size={24} />
            <p className="text-slate-300 text-sm leading-relaxed">
              Envie um pedido para o time Master produzir os conteúdos de acessibilidade para {isCity ? "este ponto" : isCultural ? "esta atividade" : "esta obra"}.
            </p>
          </div>

          <div className="space-y-4">
            <Select
              label={t("admin.work.tipoDeServio", `Tipo de Serviço`)}
              value={requestType}
              onChange={(e) => setRequestType(e.target.value as any)}
              className="bg-black/20"
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
              className="bg-black/20"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="ghost"
              onClick={() => setShowAccessModal(false)}
              disabled={isRequesting}
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              onClick={async () => {
                if (!id) {
                  toast.error(`Salve ${isCity ? "o ponto" : isCultural ? "a atividade" : "a obra"} primeiro.`);
                  return;
                }
                try {
                  setIsRequesting(true);
                  await api.post("/accessibility", { workId: id, type: requestType, notes: requestNotes });
                  toast.success("Solicitação enviada com sucesso!");
                  setShowAccessModal(false);
                } catch (error) {
                  toast.error("Erro ao enviar solicitação.");
                } finally {
                  setIsRequesting(false);
                }
              }}
              isLoading={isRequesting}
              className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white"
            >
              Enviar Solicitação
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};