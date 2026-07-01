import React, { useState, useCallback, useRef, useEffect } from "react";
import { api } from "../../../../api/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  QrCode, Download, Copy, Link2,
  RefreshCcw, CheckCircle, AlertCircle, Loader2, List
} from "lucide-react";
import { useAuth } from "../../../auth/AuthContext";
import { QRCodeCanvas } from "qrcode.react";
import "./AdminQRCodes.css";

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

  // Seletores de contexto
  const [options, setOptions] = useState<{id: string, name: string}[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const fetchQRCodes = useCallback(() => {
    if (!tenantId) return;
    api.get("/qrcodes", { params: { tenantId } })
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
        api.get(endpoint, { params: { tenantId } })
            .then(res => {
                const data = res.data.works || res.data.events || res.data.trails || res.data.exhibitions || res.data || [];
                setOptions(data.map((item: any) => ({
                    id: item.id,
                    name: item.title || item.name || item.id
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
      const res = await api.post("/qrcodes", {
        type: qrType,
        title: qrName.trim(),
        referenceId: referenceId || null,
        tenantId
      });
      setGenerated(res.data);
      fetchQRCodes();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Erro ao gerar QR Code. Tente novamente.");
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

  const handleDownloadPNG = () => {
    if (!generated) return;
    const canvas = qrCanvasRef.current?.querySelector("canvas");
    if (!canvas) return;
    
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `qr-${generated.code}.png`;
    a.click();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este QR Code?")) {
      try {
        await api.delete(`/qrcodes/${id}`);
        fetchQRCodes();
        if (generated?.id === id) setGenerated(null);
      } catch (err) {
        console.error("Erro ao excluir QR Code", err);
      }
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
                                        onClick={() => handleDelete(qr.id)}
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
    </div>
  );
};
