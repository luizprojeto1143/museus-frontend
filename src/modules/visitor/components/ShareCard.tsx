import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { useTranslation } from "react-i18next";
import { getFullUrl } from "../../../utils/url";
import { Download } from "lucide-react";
import "./ShareCard.css";

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
                scale: 2,
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
        <div className="share-card-backdrop">
            <div className="share-card-container">
                {/* The Card to Capture */}
                <div ref={cardRef} className="share-card-canvas">
                    {/* Image Area */}
                    <div
                        className="share-card-image-area"
                        style={{
                            background: work.imageUrl
                                ? `url(${getFullUrl(work.imageUrl)}) center/cover`
                                : "linear-gradient(135deg, #d4af37 0%, #1a1108 100%)"
                        }}
                    >
                        {!work.imageUrl && "🎨"}
                    </div>

                    {/* Text Area */}
                    <div className="share-card-text-area">
                        <h2 className="share-card-title">{work.title}</h2>
                        <p className="share-card-artist">{work.artist}</p>

                        <div className="share-card-footer">
                            <span className="share-card-brand">Cultura Viva</span>
                            <span className="share-card-date">{new Date().toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="share-card-actions">
                    <button onClick={onClose} className="share-card-close-btn">
                        {t("common.close", "Fechar")}
                    </button>
                    <button
                        onClick={handleDownload}
                        className="share-card-download-btn"
                        disabled={generating}
                    >
                        <Download size={18} />
                        {generating ? t("common.generating", "Gerando...") : t("visitor.share.download", "Baixar Imagem")}
                    </button>
                </div>
            </div>
        </div>
    );
};
