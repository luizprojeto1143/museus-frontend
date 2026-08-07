import React, { useState, useCallback, useRef, useEffect } from "react";
import { isAxiosError } from "axios";

import { api } from "../../../../api/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  QrCode, Download, Copy, Link2,
  RefreshCcw, CheckCircle, AlertCircle, Loader2, List
} from "lucide-react";
import { useAuth } from "../../../auth/AuthContext";
import { QRCodeCanvas } from "qrcode.react";
import { QRCodeArtCard } from "../../../../components/qrcode/QRCodeArtCard";
import "./AdminQRCodes.css";

// ---------- Canvas helpers ----------
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(" ");
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      line = word;
      y += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, y);
}
// ------------------------------------

type QRType =
  | "CITY" | "EQUIPMENT" | "WORK" | "EVENT"
  | "EXHIBITION" | "TRAIL" | "ROOM" | "AUDIOGUIDE"
  | "TICKET" | "SPONSORSHIP" | "FEEDBACK";

interface GeneratedQR {
  id: string;
  code: string;
  type: QRType;
  referenceId: string | null;
  title: string;
  xpReward: number;
}

interface SelectOption {
  id: string;
  name: string;
}

interface ResourceOptionResponse {
  works?: Array<Partial<SelectOption> & { title?: string }>;
  events?: Array<Partial<SelectOption> & { title?: string }>;
  trails?: Array<Partial<SelectOption> & { title?: string }>;
  exhibitions?: Array<Partial<SelectOption> & { title?: string }>;
}

type ResourceOptionItem = Partial<SelectOption> & { title?: string };

const QR_TYPE_OPTIONS: { value: QRType; label: string; icon: string }[] = [
  { value: "EQUIPMENT", label: "Museu / Equipamento", icon: "🏛️" },
  { value: "WORK", label: "Obra de Arte", icon: "🎨" },
  { value: "EVENT", label: "Evento", icon: "📅" },
  { value: "EXHIBITION", label: "Exposição", icon: "🖼️" },
  { value: "TRAIL", label: "Roteiro / Trilha", icon: "🗺️" },
  { value: "ROOM", label: "Espaço", icon: "📍" },
  { value: "CITY", label: "Cidade / Tenant", icon: "🏙️" },
];

const COLOR_PRESETS = [
  { label: "Preto", fg: "#000000", bg: "#ffffff" },
  { label: "Dourado", fg: "#b8860b", bg: "#fffbf0" },
  { label: "Museu Azul", fg: "#1a3a6e", bg: "#f0f5ff" },
];

export const AdminQRCodes: React.FC = () => {
  const { tenantId } = useAuth();
  
  const [qrcodes, setQrcodes] = useState<GeneratedQR[]>([]);
  
  const [qrType, setQrType] = useState<QRType>("EQUIPMENT");
  const [qrName, setQrName] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [colorFg, setColorFg] = useState("#000000");
  const [colorBg, setColorBg] = useState("#ffffff");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [generated, setGenerated] = useState<GeneratedQR | null>(null);
  const [copied, setCopied] = useState(false);
  const qrCanvasRef = useRef<HTMLDivElement>(null);
  const qrArtRef = useRef<HTMLDivElement>(null);
  const [deleteTarget, setDeleteTarget] = useState<GeneratedQR | null>(null);

  // Seletores de contexto
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const fetchQRCodes = useCallback(() => {
    if (!tenantId) return;
    api.get<GeneratedQR[]>("/qrcodes", { params: { tenantId } })
      .then(res => setQrcodes(res.data))
      .catch(console.error);
  }, [tenantId]);

  useEffect(() => {
    fetchQRCodes();
  }, [fetchQRCodes]);

  useEffect(() => {
    setReferenceId(""); // Reset ref
    if (["CITY", "EQUIPMENT", "ROOM"].includes(qrType)) {
        setOptions([]);
        return;
    }

    setLoadingOptions(true);
    let endpoint = "";
    if (qrType === "WORK") endpoint = "/works";
    else if (qrType === "EVENT") endpoint = "/events";
    else if (qrType === "TRAIL") endpoint = "/trails";
    else if (qrType === "EXHIBITION") endpoint = "/exhibitions";

    if (endpoint) {
        api.get<ResourceOptionResponse | ResourceOptionItem[]>(endpoint, { params: { tenantId } })
            .then(res => {
                const data = Array.isArray(res.data)
                  ? res.data
                  : res.data.works || res.data.events || res.data.trails || res.data.exhibitions || [];
                setOptions(data.map((item: ResourceOptionItem) => ({
                    id: String(item.id || ""),
                    name: String(item.title || item.name || item.id || "")
                })));
            })
            .catch(() => setOptions([]))
            .finally(() => setLoadingOptions(false));
    } else {
        setOptions([]);
        setLoadingOptions(false);
    }
  }, [qrType, tenantId]);

  const handleGenerate = useCallback(async () => {
    if (!qrName.trim()) {
      setError("Informe um nome para o QR Code.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.post<GeneratedQR>("/qrcodes", {
        type: qrType,
        title: qrName.trim(),
        referenceId: referenceId || null,
        tenantId
      });
      setGenerated(res.data);
      fetchQRCodes();
    } catch (err) {
      const message = isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message
        : undefined;
      setError(message || "Erro ao gerar QR Code. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [qrType, qrName, referenceId, tenantId, fetchQRCodes]);

  const getQRUrl = () => {
    if (!generated) return "";
    return `${window.location.origin}/qr/${generated.code}`;
  };

  const handleCopyUrl = async () => {
    const url = getQRUrl();
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
    if (!generated) return;
    const canvas = (qrCanvasRef.current?.querySelector("canvas") || document.querySelector("canvas")) as HTMLCanvasElement | null;
    if (!canvas) return;
    
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `qr-${generated.code}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  const handleDownloadArtPNG = async () => {
    if (!generated) return;

    // Find the QR canvas rendered inside the art card ref or preview fallback
    const qrCanvas = (qrArtRef.current?.querySelector("canvas") || qrCanvasRef.current?.querySelector("canvas") || document.querySelector("canvas")) as HTMLCanvasElement | null;

    const SCALE = 2;
    const W = 720 * SCALE;
    const H = 940 * SCALE;

    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(SCALE, SCALE);

    // --- Outer golden board ---
    const outerR = 44;
    ctx.save();
    const grad = ctx.createLinearGradient(0, 0, 720, 940);
    grad.addColorStop(0, "#e9c997");
    grad.addColorStop(0.48, "#d8a965");
    grad.addColorStop(1, "#c89350");
    ctx.fillStyle = grad;
    roundRect(ctx, 0, 0, 720, 940, outerR);
    ctx.fill();
    ctx.restore();

    // Outer border
    ctx.save();
    ctx.strokeStyle = "rgba(99,60,24,0.35)";
    ctx.lineWidth = 2;
    roundRect(ctx, 1, 1, 718, 938, outerR);
    ctx.stroke();
    ctx.restore();

    // Inner frame line
    ctx.save();
    ctx.strokeStyle = "rgba(90,55,24,0.24)";
    ctx.lineWidth = 1;
    roundRect(ctx, 16, 16, 688, 908, 34);
    ctx.stroke();
    ctx.restore();

    // --- Inner paper ---
    const paperX = 52, paperY = 52, paperW = 616, paperH = 836, paperR = 34;
    ctx.save();
    const paperGrad = ctx.createLinearGradient(paperX, paperY, paperX + paperW, paperY + paperH);
    paperGrad.addColorStop(0, "#fffaf0");
    paperGrad.addColorStop(1, "#f6ecd8");
    ctx.fillStyle = paperGrad;
    roundRect(ctx, paperX, paperY, paperW, paperH, paperR);
    ctx.fill();
    ctx.restore();

    // Paper border
    ctx.save();
    ctx.strokeStyle = "rgba(107,69,31,0.18)";
    ctx.lineWidth = 1;
    roundRect(ctx, paperX, paperY, paperW, paperH, paperR);
    ctx.stroke();
    ctx.restore();

    const cx = 360; // horizontal center
    let y = paperY + 44;

    // --- Brand ---
    ctx.save();
    ctx.fillStyle = "#7b4b1e";
    ctx.font = "bold 28px Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText("Cultura Viva", cx, y + 28);
    ctx.restore();
    y += 56;

    // Divider line
    ctx.save();
    ctx.strokeStyle = "rgba(120,75,30,0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(paperX + 60, y);
    ctx.lineTo(paperX + paperW - 60, y);
    ctx.stroke();
    ctx.restore();
    y += 24;

    // --- Title ---
    ctx.save();
    ctx.fillStyle = "#2b2118";
    ctx.font = "bold 34px Georgia, serif";
    ctx.textAlign = "center";
    wrapText(ctx, generated.title || "QR Code", cx, y, paperW - 80, 42);
    y += 52;

    // Type label
    ctx.save();
    ctx.fillStyle = "#7b4b1e";
    ctx.font = "20px Georgia, serif";
    ctx.textAlign = "center";
    const typeLabel = generated.type === "WORK" ? "Obra" : generated.type === "EQUIPMENT" ? "Entrada" : "QR";
    ctx.fillText(`${typeLabel} nº ${generated.code}`, cx, y + 22);
    ctx.restore();
    y += 44;

    // Short divider
    ctx.save();
    ctx.strokeStyle = "rgba(120,75,30,0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 80, y);
    ctx.lineTo(cx + 80, y);
    ctx.stroke();
    ctx.restore();
    y += 24;

    // --- QR Code ---
    const qrSize = 260;
    const qrX = cx - qrSize / 2;
    if (qrCanvas) {
      ctx.save();
      ctx.fillStyle = "#fbf6eb";
      ctx.fillRect(qrX - 10, y - 10, qrSize + 20, qrSize + 20);
      ctx.drawImage(qrCanvas, qrX, y, qrSize, qrSize);
      ctx.restore();
    }
    y += qrSize + 24;

    // --- Footer instruction ---
    ctx.save();
    ctx.fillStyle = "#7b4b1e";
    ctx.font = "18px Georgia, serif";
    ctx.textAlign = "center";
    const instruction = generated.type === "EQUIPMENT" ? "Aponte a câmera para entrar" : "Aponte a câmera para acessar";
    ctx.fillText(instruction, cx, y + 20);
    ctx.restore();

    // Download via Blob
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `qrcode-placa-${generated.code}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/qrcodes/${deleteTarget.id}`);
      fetchQRCodes();
      if (generated?.id === deleteTarget.id) setGenerated(null);
      setDeleteTarget(null);
    } catch (err) {
      console.error("Erro ao excluir QR Code", err);
    }
  };

  const handleReset = () => {
    setGenerated(null);
    setQrName("");
    setReferenceId("");
    setError(null);
  };

  return (
    <div className="aqr-page">
      <div className="aqr-header">
        <QrCode size={24} />
        <div>
          <h1>Gerenciador de QR Codes</h1>
          <p>Crie e gerencie QR Codes inteligentes para o ecossistema</p>
        </div>
      </div>

      <div className="aqr-layout">
        {/* Formulário */}
        <div className="aqr-form-col">
          <div className="aqr-card">
            <h2>Configurar QR Code</h2>

            {/* Tipo */}
            <div className="aqr-field">
              <label>Tipo de Destino</label>
              <div className="aqr-type-grid">
                {QR_TYPE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    id={`aqr-type-${opt.value.toLowerCase()}`}
                    className={`aqr-type-btn ${qrType === opt.value ? "active" : ""}`}
                    onClick={() => setQrType(opt.value)}
                  >
                    <span className="aqr-type-icon">{opt.icon}</span>
                    <span className="aqr-type-label">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Nome */}
            <div className="aqr-field">
              <label htmlFor="aqr-name">Nome / Título do QR</label>
              <input
                id="aqr-name"
                type="text"
                className="aqr-input"
                placeholder="Ex: Escultura O Pensador"
                value={qrName}
                onChange={e => setQrName(e.target.value)}
                maxLength={80}
              />
            </div>

            {/* Referência */}
            {options.length > 0 ? (
                <div className="aqr-field">
                <label htmlFor="aqr-ref">Vincular a:</label>
                <select
                    id="aqr-ref"
                    className="aqr-input"
                    value={referenceId}
                    onChange={e => setReferenceId(e.target.value)}
                >
                    <option value="">-- Selecione (Opcional) --</option>
                    {options.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.name}</option>
                    ))}
                </select>
                </div>
            ) : loadingOptions ? (
                <div className="aqr-field">
                    <p className="text-sm text-gray-400"><Loader2 size={14} className="inline animate-spin mr-1" /> Carregando opções...</p>
                </div>
            ) : (
                <div className="aqr-field">
                    <label htmlFor="aqr-ref">ID do Destino (opcional)</label>
                    <input
                        id="aqr-ref"
                        type="text"
                        className="aqr-input"
                        placeholder="ID ou URL caso customizado"
                        value={referenceId}
                        onChange={e => setReferenceId(e.target.value)}
                    />
                </div>
            )}

            {/* Cores */}
            <div className="aqr-field">
              <label>Cores</label>
              <div className="aqr-color-presets">
                {COLOR_PRESETS.map(preset => (
                  <button
                    key={preset.label}
                    className={`aqr-color-preset ${colorFg === preset.fg ? "active" : ""}`}
                    onClick={() => { setColorFg(preset.fg); setColorBg(preset.bg); }}
                    title={preset.label}
                    style={{ background: preset.bg, border: `2px solid ${preset.fg}` }}
                  >
                    <span style={{ color: preset.fg, fontWeight: 700, fontSize: 11 }}>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="aqr-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <button
              id="aqr-generate-btn"
              className="aqr-generate-btn"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? (
                <><Loader2 size={18} className="aqr-spin" /> Gerando...</>
              ) : (
                <><QrCode size={18} /> Gerar QR Code</>
              )}
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="aqr-preview-col">
          <AnimatePresence mode="wait">
            {!generated ? (
              <motion.div
                key="placeholder"
                className="aqr-card aqr-preview-placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <QrCode size={80} strokeWidth={1} />
                <p>Configure e clique em <strong>Gerar QR Code</strong></p>
              </motion.div>
            ) : (
              <motion.div
                key="generated"
                className="aqr-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="aqr-result-header">
                  <CheckCircle size={20} className="aqr-success-icon" />
                  <h3>QR Code Gerado!</h3>
                </div>

                <div className="aqr-qr-preview" style={{ background: colorBg }}>
                    <div ref={qrCanvasRef} className="flex items-center justify-center p-4 bg-white rounded-lg shadow-sm">
                        <QRCodeCanvas value={getQRUrl()} size={200} fgColor={colorFg} bgColor={colorBg} level="H" />
                    </div>
                </div>

                <div className="aqr-art-preview">
                  <div className="aqr-art-scale">
                    <QRCodeArtCard
                      ref={qrArtRef}
                      title={generated.title}
                      subtitle={generated.type === "EQUIPMENT" ? "Entrada do equipamento" : undefined}
                      code={generated.code}
                      url={getQRUrl()}
                      typeLabel={generated.type === "WORK" ? "Obra" : generated.type === "EQUIPMENT" ? "Entrada" : "QR"}
                      instruction={generated.type === "EQUIPMENT" ? "Aponte a camera para entrar" : "Aponte a camera para acessar"}
                    />
                  </div>
                </div>

                <div className="aqr-result-info">
                  <strong>{generated.title}</strong>
                  <small>Código: {generated.code}</small>
                </div>

                <div className="aqr-result-url">
                  <Link2 size={14} />
                  <span>{getQRUrl()}</span>
                </div>

                {/* Ações */}
                <div className="aqr-result-actions">
                  <button id="aqr-download-png" className="aqr-result-btn" onClick={handleDownloadPNG}>
                    <Download size={16} /> PNG
                  </button>
                  <button id="aqr-download-art-png" className="aqr-result-btn" onClick={handleDownloadArtPNG}>
                    <Download size={16} /> Placa
                  </button>
                  <button id="aqr-copy-url" className="aqr-result-btn" onClick={handleCopyUrl}>
                    {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                    {copied ? "Copiado!" : "URL"}
                  </button>
                  <button id="aqr-new" className="aqr-result-btn aqr-result-btn-outline" onClick={handleReset}>
                    <RefreshCcw size={16} /> Novo
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Listagem */}
          <div className="aqr-card mt-6">
            <h3 className="flex items-center gap-2 mb-4 font-bold"><List size={18}/> Meus QR Codes</h3>
            <div className="overflow-y-auto max-h-[300px]">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-gray-800 text-gray-400">
                            <th className="pb-2 font-medium">Nome</th>
                            <th className="pb-2 font-medium">Tipo</th>
                            <th className="pb-2 font-medium text-right">Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {qrcodes.map(qr => (
                            <tr key={qr.id} className="border-b border-gray-800/50 hover:bg-white/5">
                                <td className="py-3 pr-2 text-white">{qr.title}</td>
                                <td className="py-3 text-gray-400 text-xs">{qr.type}</td>
                                <td className="py-3 text-right">
                                    <button 
                                        className="text-red-400 hover:text-red-300 transition-colors px-2 py-1 bg-red-400/10 rounded"
                                        onClick={() => setDeleteTarget(qr)}
                                    >
                                        Excluir
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {qrcodes.length === 0 && (
                            <tr>
                                <td colSpan={3} className="py-4 text-center text-gray-500">Nenhum QR Code gerado ainda.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
          </div>
        </div>
      </div>
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Excluir QR Code?</h3>
            <p className="mt-2 text-sm text-slate-400">
              Esta acao remove o QR Code "{deleteTarget.title}" e nao pode ser desfeita.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button className="rounded-lg bg-white/10 px-4 py-2 text-sm font-bold text-white" onClick={() => setDeleteTarget(null)}>
                Cancelar
              </button>
              <button className="rounded-lg bg-red-500 px-4 py-2 text-sm font-bold text-white" onClick={handleDelete}>
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
