import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { api } from "../../../api/client";
import { QRCodeArtCard } from "../../../components/qrcode/QRCodeArtCard";
import { Building2, Download, Loader2, QrCode, Search, Wand2 } from "lucide-react";
import { Button, Card, Badge, AnimateIn } from "@/components/ui";
import { toast } from "react-hot-toast";
import { isAxiosError } from "axios";

interface Equipment {
  id: string;
  tenantId: string;
  nome: string;
  slug: string;
  tipo: string;
  cidade: string;
  estado: string;
  endereco?: string | null;
  ativo: boolean;
}

interface GeneratedQR {
  id: string;
  code: string;
  type: string;
  referenceId: string | null;
  title: string;
  xpReward: number;
  tenantId: string;
}

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

function getApiErrorMessage(err: unknown, fallback: string) {
  if (isAxiosError<ApiErrorResponse>(err)) {
    return err.response?.data?.message || err.response?.data?.error || fallback;
  }
  return fallback;
}

function buildQrUrl(code: string) {
  return `${window.location.origin}/qr/${code}`;
}

export const MasterEquipmentQRCodes: React.FC = () => {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState("");
  const [generated, setGenerated] = useState<GeneratedQR | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [search, setSearch] = useState("");
  const artRef = useRef<HTMLDivElement>(null);

  const selectedEquipment = useMemo(
    () => equipments.find((item) => item.id === selectedEquipmentId) || null,
    [equipments, selectedEquipmentId]
  );

  const filteredEquipments = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return equipments;
    return equipments.filter((item) => {
      const haystack = `${item.nome} ${item.cidade} ${item.estado} ${item.tipo}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [equipments, search]);

  const loadEquipments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<Equipment[]>("/equipamentos");
      const activeEquipments = (res.data || []).filter((item) => item.ativo !== false);
      setEquipments(activeEquipments);
      if (!selectedEquipmentId && activeEquipments.length > 0) {
        setSelectedEquipmentId(activeEquipments[0].id);
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Erro ao carregar equipamentos culturais."));
    } finally {
      setLoading(false);
    }
  }, [selectedEquipmentId]);

  useEffect(() => {
    loadEquipments();
  }, [loadEquipments]);

  useEffect(() => {
    setGenerated(null);
  }, [selectedEquipmentId]);

  const handleGenerate = async () => {
    if (!selectedEquipment) {
      toast.error("Selecione um equipamento cultural.");
      return;
    }

    try {
      setGenerating(true);
      const existingRes = await api.get<GeneratedQR[]>("/qrcodes", { params: { tenantId: selectedEquipment.tenantId } });
      const existing = (existingRes.data || []).find((qr) => qr.type === "EQUIPMENT" && qr.referenceId === selectedEquipment.id);
      if (existing) {
        setGenerated(existing);
        toast.success("QR de entrada ja existia e foi carregado.");
        return;
      }

      const res = await api.post<GeneratedQR>("/qrcodes", {
        tenantId: selectedEquipment.tenantId,
        type: "EQUIPMENT",
        referenceId: selectedEquipment.id,
        title: `Entrada - ${selectedEquipment.nome}`,
        xpReward: 0,
      });
      setGenerated(res.data);
      toast.success("QR de entrada gerado com sucesso.");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Erro ao gerar QR de entrada."));
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadArt = async () => {
    if (!generated || !selectedEquipment) return;

    try {
      setDownloading(true);
      const qrCanvas = (artRef.current?.querySelector("canvas") || document.querySelector("canvas")) as HTMLCanvasElement | null;

      const SCALE = 2;
      const W = 720 * SCALE;
      const H = 940 * SCALE;

      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.scale(SCALE, SCALE);

      // Outer board
      const grad = ctx.createLinearGradient(0, 0, 720, 940);
      grad.addColorStop(0, "#e9c997");
      grad.addColorStop(0.48, "#d8a965");
      grad.addColorStop(1, "#c89350");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 720, 940);

      // Inner paper
      const paperX = 52, paperY = 52, paperW = 616, paperH = 836;
      ctx.fillStyle = "#f6ecd8";
      ctx.fillRect(paperX, paperY, paperW, paperH);

      const cx = 360;
      let y = paperY + 44;

      ctx.fillStyle = "#7b4b1e";
      ctx.font = "bold 28px Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText("Cultura Viva", cx, y + 28);
      y += 60;

      ctx.fillStyle = "#2b2118";
      ctx.font = "bold 32px Georgia, serif";
      ctx.fillText(selectedEquipment.nome || "Equipamento Cultural", cx, y + 32);
      y += 50;

      ctx.fillStyle = "#7b4b1e";
      ctx.font = "20px Georgia, serif";
      ctx.fillText(`Entrada nº ${generated.code}`, cx, y + 20);
      y += 44;

      const qrSize = 260;
      const qrX = cx - qrSize / 2;
      if (qrCanvas) {
        ctx.fillStyle = "#fbf6eb";
        ctx.fillRect(qrX - 10, y - 10, qrSize + 20, qrSize + 20);
        ctx.drawImage(qrCanvas, qrX, y, qrSize, qrSize);
      }
      y += qrSize + 30;

      ctx.fillStyle = "#7b4b1e";
      ctx.font = "18px Georgia, serif";
      ctx.fillText("Aponte a câmera para entrar", cx, y + 20);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `qr-entrada-${selectedEquipment.slug || generated.code}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, "image/png");
    } catch (err) {
      toast.error("Não foi possível baixar a arte do QR Code.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <AnimateIn className="space-y-10 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-blue-500 rounded-full" />
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
              QR Codes <span className="text-blue-500">de Entrada</span>
            </h1>
          </div>
          <p className="text-slate-500 font-medium text-lg max-w-3xl">
            Gere placas nacionais para equipamentos culturais. O QR leva ao painel do visitante daquele equipamento; quem nao estiver logado sera direcionado para login ou cadastro.
          </p>
        </div>
        <Badge variant="glass" className="w-fit bg-blue-600/10 text-blue-400 border-blue-500/20 px-4 py-2 text-[10px] font-black uppercase tracking-widest">
          Master Nacional
        </Badge>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-8">
        <Card className="p-8 bg-white/[0.02] border-white/5 rounded-[32px] space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Building2 size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Equipamento Cultural</h2>
              <p className="text-xs text-slate-500">Selecione onde a placa sera instalada.</p>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome, cidade ou tipo..."
              className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-white outline-none focus:border-blue-500/50"
            />
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto custom-scrollbar pr-1">
            {loading ? (
              <div className="flex items-center justify-center gap-3 py-16 text-slate-500 text-sm">
                <Loader2 className="animate-spin" size={18} />
                Carregando equipamentos...
              </div>
            ) : filteredEquipments.length === 0 ? (
              <div className="py-16 text-center text-slate-500 text-sm">Nenhum equipamento encontrado.</div>
            ) : (
              filteredEquipments.map((equipment) => (
                <button
                  key={equipment.id}
                  type="button"
                  onClick={() => setSelectedEquipmentId(equipment.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    selectedEquipmentId === equipment.id
                      ? "bg-blue-600/10 border-blue-500/30 text-white"
                      : "bg-white/[0.03] border-white/5 text-slate-300 hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <strong className="block text-sm">{equipment.nome}</strong>
                      <span className="block text-[11px] text-slate-500 mt-1">
                        {equipment.cidade}/{equipment.estado} - {equipment.tipo}
                      </span>
                    </div>
                    <QrCode size={18} className={selectedEquipmentId === equipment.id ? "text-blue-400" : "text-slate-600"} />
                  </div>
                </button>
              ))
            )}
          </div>

          <Button
            onClick={handleGenerate}
            isLoading={generating}
            disabled={!selectedEquipment}
            className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs"
            leftIcon={<Wand2 size={18} />}
          >
            Gerar ou Carregar QR
          </Button>
        </Card>

        <Card className="p-8 bg-white/[0.02] border-white/5 rounded-[32px] overflow-hidden">
          {!selectedEquipment ? (
            <div className="min-h-[600px] flex flex-col items-center justify-center text-center text-slate-600 gap-4">
              <QrCode size={90} strokeWidth={1} />
              <p className="text-sm font-bold uppercase tracking-widest">Selecione um equipamento</p>
            </div>
          ) : !generated ? (
            <div className="min-h-[600px] flex flex-col items-center justify-center text-center text-slate-500 gap-5">
              <QrCode size={90} strokeWidth={1} className="text-blue-500/50" />
              <div>
                <h3 className="text-2xl font-black text-white">Placa pronta para gerar</h3>
                <p className="text-sm mt-2 max-w-md">
                  Clique em gerar para criar o QR de entrada de {selectedEquipment.nome}.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-black text-white">{selectedEquipment.nome}</h3>
                  <p className="text-sm text-slate-500">
                    Codigo {generated.code} - {selectedEquipment.cidade}/{selectedEquipment.estado}
                  </p>
                </div>
                <Button
                  onClick={handleDownloadArt}
                  isLoading={downloading}
                  className="h-12 rounded-2xl bg-amber-500 text-black hover:bg-amber-400 font-black uppercase tracking-widest text-xs"
                  leftIcon={<Download size={16} />}
                >
                  Baixar Placa PNG
                </Button>
              </div>

              <div className="overflow-auto rounded-[28px] bg-black/20 p-6 flex justify-center">
                <div className="origin-top scale-[0.72] md:scale-[0.82] xl:scale-90">
                  <QRCodeArtCard
                    ref={artRef}
                    title={selectedEquipment.nome}
                    subtitle={`${selectedEquipment.cidade}/${selectedEquipment.estado}`}
                    code={generated.code}
                    url={buildQrUrl(generated.code)}
                    typeLabel="Entrada"
                    instruction="Aponte a camera para entrar"
                  />
                </div>
              </div>

              <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-4 text-xs text-slate-400 break-all">
                URL: <span className="text-white">{buildQrUrl(generated.code)}</span>
              </div>
            </div>
          )}
        </Card>
      </div>
    </AnimateIn>
  );
};
