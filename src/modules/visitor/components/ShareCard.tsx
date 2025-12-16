import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { useTranslation } from "react-i18next";
import { getFullUrl } from "../../../utils/url";

interface ShareCardProps {
    work: {
        title: string;
        artist: string;
        imageUrl?: string | null;
    };
    onClose: () => void;
}

export const ShareCard: React.FC<ShareCardProps> = ({ work, onClose }) => {
    const { t } = useTranslation();
    const cardRef = useRef<HTMLDivElement>(null);
    const [generating, setGenerating] = useState(false);

    const handleDownload = async () => {
        if (!cardRef.current) return;
        setGenerating(true);
        try {
            const canvas = await html2canvas(cardRef.current, {
                useCORS: true,
                scale: 2, // Higher resolution
                backgroundColor: "#1a1108"
            });

            const link = document.createElement("a");
            link.download = `cultura-viva-${work.title.replace(/\s+/g, "-").toLowerCase()}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
        } catch (err) {
            console.error("Failed to generate image", err);
            alert(t("common.error"));
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
            padding: "1rem"
        }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center" }}>

                {/* The Card to Capture */}
                <div
                    ref={cardRef}
                    style={{
                        width: "300px",
                        height: "500px",
                        backgroundColor: "#1f2937",
                        borderRadius: "1rem",
                        overflow: "hidden",
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                    }}
                >
                    {/* Image Area */}
                    <div style={{
                        flex: 1,
                        background: work.imageUrl ? `url(${getFullUrl(work.imageUrl)}) center/cover` : "linear-gradient(135deg, #d4af37 0%, #1a1108 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "2rem"
                    }}>
                        {!work.imageUrl && "🎨"}
                    </div>

                    {/* Text Area */}
                    <div style={{ padding: "1.5rem", backgroundColor: "#111827", color: "white" }}>
                        <h2 style={{ margin: "0 0 0.5rem 0", fontSize: "1.25rem", color: "#d4af37" }}>{work.title}</h2>
                        <p style={{ margin: 0, fontSize: "0.9rem", color: "#9ca3af" }}>{work.artist}</p>

                        <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid #374151", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "0.8rem", fontWeight: "bold" }}>Cultura Viva</span>
                            <span style={{ fontSize: "0.7rem", color: "#6b7280" }}>{new Date().toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "1rem" }}>
                    <button
                        onClick={onClose}
                        className="btn btn-secondary"
                    >
                        {t("common.close", "Fechar")}
                    </button>
                    <button
                        onClick={handleDownload}
                        className="btn btn-primary"
                        disabled={generating}
                    >
                        {generating ? t("common.generating", "Gerando...") : t("visitor.share.download", "Baixar Imagem")}
                    </button>
                </div>
            </div>
        </div>
    );
};
