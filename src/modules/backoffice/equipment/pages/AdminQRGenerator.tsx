import React, { useState, useCallback, useRef } from "react";
import { api } from "../../../../api/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  QrCode, Download, Copy, Link2, BarChart2, Eye, EyeOff,
  Palette, RefreshCcw, CheckCircle, AlertCircle, Loader2
} from "lucide-react";
import "./AdminQRGenerator.css";

type QRType =
  | "CIDADE" | "EQUIPAMENTO" | "OBRA" | "EVENTO"
  | "EXPOSICAO" | "ROTEIRO" | "MAPA" | "AUDIOGUIA"
  | "INGRESSO" | "PATROCINIO" | "FEEDBACK" | "CHECKIN";

interface QRStats {
  scanCount: number;
  uniqueScans: number;
  lastScan?: string;
}

interface GeneratedQR {
  id: string;
  code: string;
  url: string;
  imageDataUrl: string;
  type: QRType;
  name: string;
  stats?: QRStats;
}

const QR_TYPE_OPTIONS: { value: QRType; label: string; icon: string }[] = [
  { value: "EQUIPAMENTO", label: "Museu / Equipamento", icon: "🏛️" },
  { value: "OBRA", label: "Obra de Arte", icon: "🎨" },
  { value: "EVENTO", label: "Evento", icon: "📅" },
  { value: "EXPOSICAO", label: "Exposição", icon: "🖼️" },
  { value: "ROTEIRO", label: "Roteiro / Trilha", icon: "🗺️" },
  { value: "CHECKIN", label: "Check-in de Visita", icon: "✅" },
  { value: "MAPA", label: "Mapa Interno", icon: "📍" },
  { value: "AUDIOGUIA", label: "Audioguia", icon: "🎧" },
  { value: "INGRESSO", label: "Ingresso", icon: "🎫" },
  { value: "FEEDBACK", label: "Formulário de Avaliação", icon: "⭐" },
  { value: "PATROCINIO", label: "Espaço de Patrocinador", icon: "🤝" },
  { value: "CIDADE", label: "Cidade / Tenant", icon: "🏙️" },
];

const COLOR_PRESETS = [
  { label: "Preto", fg: "#000000", bg: "#ffffff" },
  { label: "Dourado", fg: "#b8860b", bg: "#fffbf0" },
  { label: "Museu Azul", fg: "#1a3a6e", bg: "#f0f5ff" },
  { label: "Verde", fg: "#1a6e3a", bg: "#f0fff5" },
  { label: "Vinho", fg: "#6e1a2e", bg: "#fff0f3" },
];

export const AdminQRGenerator: React.FC = () => {
  const [qrType, setQrType] = useState<QRType>("EQUIPAMENTO");
  const [qrName, setQrName] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [colorFg, setColorFg] = useState("#000000");
  const [colorBg, setColorBg] = useState("#ffffff");
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [expiresAt, setExpiresAt] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generated, setGenerated] = useState<GeneratedQR | null>(null);
  const [copied, setCopied] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleGenerate = useCallback(async () => {
    if (!qrName.trim()) {
      setError("Informe um nome para o QR Code.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.post("/qr/generate", {
        type: qrType,
        name: qrName.trim(),
        referenceId: referenceId || undefined,
        colorForeground: colorFg,
        colorBackground: colorBg,
        trackingEnabled,
        expiresAt: expiresAt || undefined,
        note: note || undefined,
      });
      setGenerated(res.data);
    } catch (err: unknown) {
      setError(err?.response?.data?.message || "Erro ao gerar QR Code. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [qrType, qrName, referenceId, colorFg, colorBg, trackingEnabled, expiresAt, note]);

  const handleCopyUrl = async () => {
    if (!generated?.url) return;
    await navigator.clipboard.writeText(generated.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPNG = () => {
    if (!generated?.imageDataUrl) return;
    const a = document.createElement("a");
    a.href = generated.imageDataUrl;
    a.download = `qr-${generated.code}.png`;
    a.click();
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
          <h1>Gerador de QR Codes</h1>
          <p>Crie e gerencie QR Codes rastreáveis para seu equipamento</p>
        </div>
      </div>

      <div className="aqr-layout">
        {/* Formulário */}
        <div className="aqr-form-col">
          <div className="aqr-card">
            <h2>Configurar QR Code</h2>

            {/* Tipo */}
            <div className="aqr-field">
              <label>Tipo de QR</label>
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
              <label htmlFor="aqr-name">Nome / Descrição do QR</label>
              <input
                id="aqr-name"
                type="text"
                className="aqr-input"
                placeholder="Ex: Entrada Principal — Hall A"
                value={qrName}
                onChange={e => setQrName(e.target.value)}
                maxLength={80}
              />
            </div>

            {/* Referência */}
            <div className="aqr-field">
              <label htmlFor="aqr-ref">ID do Destino (opcional)</label>
              <input
                id="aqr-ref"
                type="text"
                className="aqr-input"
                placeholder="ID do equipamento, obra, evento..."
                value={referenceId}
                onChange={e => setReferenceId(e.target.value)}
              />
              <small className="aqr-hint">Deixe vazio para QR genérico sem destino fixo</small>
            </div>

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
              <div className="aqr-color-custom">
                <div className="aqr-color-row">
                  <label>QR</label>
                  <input type="color" value={colorFg} onChange={e => setColorFg(e.target.value)} className="aqr-color-picker" />
                  <span>{colorFg}</span>
                </div>
                <div className="aqr-color-row">
                  <label>Fundo</label>
                  <input type="color" value={colorBg} onChange={e => setColorBg(e.target.value)} className="aqr-color-picker" />
                  <span>{colorBg}</span>
                </div>
              </div>
            </div>

            {/* Opções Avançadas */}
            <div className="aqr-field">
              <label>Opções</label>
              <div className="aqr-options">
                <label className="aqr-toggle">
                  <input
                    type="checkbox"
                    checked={trackingEnabled}
                    onChange={e => setTrackingEnabled(e.target.checked)}
                  />
                  <span className="aqr-toggle-slider" />
                  <span>Rastreamento de leituras</span>
                </label>
              </div>
            </div>

            <div className="aqr-field">
              <label htmlFor="aqr-expires">Validade (opcional)</label>
              <input
                id="aqr-expires"
                type="date"
                className="aqr-input"
                value={expiresAt}
                onChange={e => setExpiresAt(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
              <small className="aqr-hint">Após a data, o QR será desativado automaticamente</small>
            </div>

            <div className="aqr-field">
              <label htmlFor="aqr-note">Nota interna (opcional)</label>
              <textarea
                id="aqr-note"
                className="aqr-input aqr-textarea"
                placeholder="Ex: Placa instalada na entrada do Salão Principal em 01/07/2026"
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={2}
                maxLength={200}
              />
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
                  {generated.imageDataUrl ? (
                    <img src={generated.imageDataUrl} alt="QR Code" className="aqr-qr-image" />
                  ) : (
                    <div className="aqr-qr-fallback">
                      <QrCode size={100} color={colorFg} />
                    </div>
                  )}
                </div>

                <div className="aqr-result-info">
                  <strong>{generated.name}</strong>
                  <small>Código: {generated.code}</small>
                </div>

                <div className="aqr-result-url">
                  <Link2 size={14} />
                  <span>{generated.url}</span>
                </div>

                {/* Estatísticas */}
                {trackingEnabled && (
                  <div className="aqr-stats-section">
                    <button className="aqr-stats-toggle" onClick={() => setShowStats(!showStats)}>
                      <BarChart2 size={16} />
                      Estatísticas
                      {showStats ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    {showStats && generated.stats && (
                      <div className="aqr-stats-grid">
                        <div className="aqr-stat">
                          <strong>{generated.stats.scanCount}</strong>
                          <small>Total de leituras</small>
                        </div>
                        <div className="aqr-stat">
                          <strong>{generated.stats.uniqueScans}</strong>
                          <small>Leitores únicos</small>
                        </div>
                        {generated.stats.lastScan && (
                          <div className="aqr-stat aqr-stat-wide">
                            <strong>{new Date(generated.stats.lastScan).toLocaleString("pt-BR")}</strong>
                            <small>Última leitura</small>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

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

                <canvas ref={canvasRef} style={{ display: "none" }} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AdminQRGenerator;
