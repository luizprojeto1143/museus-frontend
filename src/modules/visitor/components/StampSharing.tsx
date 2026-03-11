import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Share2, Instagram, MessageCircle, Download, Check, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import "./StampSharing.css";
import { toast } from "react-hot-toast";

interface StampSharingProps {
    title: string;
    subtitle: string;
    imageUrl?: string;
    date: string;
    onClose: () => void;
}

export const StampSharing: React.FC<StampSharingProps> = ({ title, subtitle, imageUrl, date, onClose }) => {
    const stampRef = useRef<HTMLDivElement>(null);
    const [capturing, setCapturing] = useState(false);

    const handleShareWhatsApp = () => {
        const text = `Acabei de completar a trilha "${title}" no Cultura Viva Betim! 🏛️✨`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    };

    const handleDownload = async () => {
        if (!stampRef.current) return;
        
        try {
            setCapturing(true);
            toast.loading("Gerando seu carimbo...", { id: "stamp-gen" });

            // Small delay to ensure styles are ready
            await new Promise(r => setTimeout(r, 500));

            const canvas = await html2canvas(stampRef.current, {
                useCORS: true,
                scale: 2, // Higher resolution
                backgroundColor: "#000000",
                logging: false,
                onclone: (clonedDoc) => {
                    // Force any specific clone adjustments if needed
                    const el = clonedDoc.querySelector('.stamp-preview') as HTMLElement;
                    if (el) el.style.borderRadius = '0';
                }
            });

            const image = canvas.toDataURL("image/png", 1.0);
            const link = document.createElement("a");
            link.download = `carimbo-${title.toLowerCase().replace(/\s+/g, '-')}.png`;
            link.href = image;
            link.click();

            toast.success("Carimbo salvo com sucesso!", { id: "stamp-gen" });
        } catch (err) {
            console.error("Erro ao gerar imagem:", err);
            toast.error("Erro ao gerar imagem para download", { id: "stamp-gen" });
        } finally {
            setCapturing(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="stamp-overlay"
        >
            <motion.div
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="stamp-card"
            >
                <button className="stamp-close" onClick={onClose} disabled={capturing}>×</button>

                <div className="stamp-preview" ref={stampRef}>
                    <div className="stamp-seal">
                        <div className="seal-inner">
                            <div className="seal-border"></div>
                            <div className="seal-content">
                                <div className="seal-icon">
                                    <Check size={40} strokeWidth={3} />
                                </div>
                                <div className="seal-text">
                                    <span className="seal-completed">CONCLUÍDO</span>
                                    <span className="seal-year">{new Date(date).getFullYear()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="stamp-info">
                        <h2 className="stamp-title">{title}</h2>
                        <p className="stamp-subtitle">{subtitle}</p>
                        <div className="stamp-badge">Cultura Viva Betim</div>
                    </div>

                    {imageUrl && (
                        <img 
                            src={imageUrl} 
                            alt="" 
                            className="stamp-bg-image-img" 
                            crossOrigin="anonymous" 
                        />
                    )}
                    <div className="stamp-gradient"></div>
                </div>

                <div className="stamp-actions">
                    <h3 className="share-prompt">Compartilhe sua conquista</h3>
                    <div className="share-buttons">
                        <button onClick={handleShareWhatsApp} className="share-btn whatsapp" disabled={capturing}>
                            <MessageCircle size={20} />
                            WhatsApp
                        </button>
                        <button className="share-btn instagram" disabled={capturing}>
                            <Instagram size={20} />
                            Instagram
                        </button>
                        <button 
                            onClick={handleDownload} 
                            className="share-btn download" 
                            disabled={capturing}
                        >
                            {capturing ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                            {capturing ? "Gerando..." : "Baixar Imagem"}
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};
