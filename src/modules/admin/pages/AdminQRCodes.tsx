import React, { useState, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";


type QRCodeItem = {
  id: string;
  code: string;
  type: string;
  title: string;
  xpReward: number;
  referenceId?: string;
};

export const AdminQRCodes: React.FC = () => {
  const { t } = useTranslation();


  const { tenantId } = useAuth();
  const [qrcodes, setQrcodes] = useState<QRCodeItem[]>([]);
  const [showForm, setShowForm] = useState(false);

  const fetchQRCodes = React.useCallback(() => {
    if (!tenantId) return;
    api.get("/qrcodes", { params: { tenantId } })
      .then(res => setQrcodes(res.data))
      .catch(console.error);
  }, [tenantId]);

  React.useEffect(() => {
    fetchQRCodes();
  }, [fetchQRCodes]);

  // Dados do formulário
  const [type, setType] = useState("WORK");
  const [referenceId, setReferenceId] = useState("");
  const [customUrl, setCustomUrl] = useState("");

  // Resultado
  const [generatedValue, setGeneratedValue] = useState("");
  const qrRef = useRef<HTMLDivElement>(null);





  const handleGenerate = async () => {
    if (!tenantId) return;

    try {
      const res = await api.post("/qrcodes", {
        type,
        referenceId: type === "CUSTOM" ? null : referenceId,
        title: type === "CUSTOM" ? customUrl : `${type} ${referenceId}`,
        tenantId,
        code: type === "CUSTOM" ? undefined : undefined // Let backend generate code
      });

      const newQr = res.data;
      setGeneratedValue(newQr.code); // Or full URL if needed
      fetchQRCodes();
      setShowForm(false);
      alert(t("common.success"));
    } catch (err) {
      console.error("Erro ao gerar QR Code", err);
      alert(t("common.error"));
    }
  };

  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `qrcode-${type}-${referenceId || "custom"}.png`;
      a.click();
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    const canvas = qrRef.current?.querySelector("canvas");
    if (printWindow && canvas) {
      const imgUrl = canvas.toDataURL("image/png");
      printWindow.document.write(`
        <html>
          <head><title>Print QR Code</title></head>
          <body style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh;">
            <h1>QR Code</h1>
            <img src="${imgUrl}" style="width:300px; height:300px;" />
            <p>${generatedValue}</p>
            <script>window.print();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
        <div>
          <h1 className="section-title">{t("admin.qrCodes.title")}</h1>
          <p className="section-subtitle">
            {t("admin.qrCodes.subtitle")}
          </p>
        </div>
        <button className="btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? t("admin.qrCodes.cancel") : t("admin.qrCodes.new")}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ maxWidth: 600, marginBottom: "2rem" }}>
          <div className="form-group">
            <label htmlFor="type">{t("admin.qrCodes.labels.type")}</label>
            <select
              id="type"
              className="input"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="WORK">{t("admin.qrCodes.types.work")}</option>
              <option value="TRAIL">{t("admin.qrCodes.types.trail")}</option>
              <option value="EVENT">{t("admin.qrCodes.types.event")}</option>
              <option value="SPACE">{t("admin.qrCodes.types.space")}</option>
              <option value="CUSTOM">{t("admin.qrCodes.types.custom")}</option>
            </select>
          </div>

          {type !== "CUSTOM" ? (
            <div className="form-group">
              <label htmlFor="refId">{t("admin.qrCodes.labels.reference")}</label>
              <input
                id="refId"
                className="input"
                value={referenceId}
                onChange={(e) => setReferenceId(e.target.value)}
                placeholder="ID (ex: 123)"
              />
              <small style={{ color: "var(--text-secondary)" }}>
                {t("admin.qrCodes.helper")}
              </small>
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="customUrl">{t("admin.qrCodes.labels.customUrl")}</label>
              <input
                id="customUrl"
                className="input"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
          )}

          <button className="btn btn-primary" onClick={handleGenerate}>
            {t("admin.qrCodes.generate")}
          </button>
        </div>
      )}

      {generatedValue && (
        <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
          <div ref={qrRef} style={{ padding: "1rem", background: "#fff", borderRadius: "8px" }}>
            <QRCodeCanvas value={generatedValue} size={256} level="H" />
          </div>
          <p style={{ fontFamily: "monospace", wordBreak: "break-all" }}>{generatedValue}</p>

          <div style={{ display: "flex", gap: "1rem" }}>
            <button className="btn btn-secondary" onClick={handleDownload}>
              {t("admin.qrCodes.download")}
            </button>
            <button className="btn btn-secondary" onClick={handlePrint}>
              {t("admin.qrCodes.print")}
            </button>
          </div>
        </div>
      )}

      {/* Lista de QR Codes existentes (apenas visualização por enquanto) */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: "1rem" }}>{t("admin.qrCodes.listTitle")}</h3>
        <table className="table">
          <thead>
            <tr>
              <th>{t("admin.qrCodes.table.code")}</th>
              <th>{t("admin.qrCodes.table.type")}</th>
              <th>{t("admin.qrCodes.table.reference")}</th>
              <th style={{ textAlign: "right" }}>{t("common.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {qrcodes.map((qr) => (
              <tr key={qr.id}>
                <td>{qr.code}</td>
                <td>{qr.type}</td>
                <td>{qr.referenceId || "-"}</td>
                <td style={{ textAlign: "right" }}>
                  <button
                    className="btn btn-secondary"
                    style={{ color: "#ef4444", borderColor: "#ef4444", padding: "0.25rem 0.5rem" }}
                    onClick={async () => {
                      if (confirm(t("common.confirmDelete"))) {
                        try {
                          await api.delete(`/qrcodes/${qr.id}`);
                          fetchQRCodes();
                        } catch {
                          alert(t("common.error"));
                        }
                      }
                    }}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
            {qrcodes.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: "1rem" }}>
                  {t("common.noData")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
