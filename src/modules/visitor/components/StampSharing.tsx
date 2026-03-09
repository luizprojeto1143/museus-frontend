import React, { useRef } from "react";
import { motion } from "framer-motion";
import { Share2, Instagram, MessageCircle, Download, Check } from "lucide-react";
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

    const handleShareWhatsApp = () => {
        const text = `Acabei de completar a trilha "${title}" no Cultura Viva Betim! 🏛️✨`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    };

    const handleDownload = () => {
        // In a real app, we'd use html2canvas to capture the stampRef
        toast.success("Download iniciado! (Simulação)");
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
                <button className="stamp-close" onClick={onClose}>×</button>

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
                        <div className="stamp-bg-image" style={{ backgroundImage: `url(${imageUrl})` }}></div>
                    )}
                    <div className="stamp-gradient"></div>
                </div>

                <div className="stamp-actions">
                    <h3 className="share-prompt">Compartilhe sua conquista</h3>
                    <div className="share-buttons">
                        <button onClick={handleShareWhatsApp} className="share-btn whatsapp">
                            <MessageCircle size={20} />
                            WhatsApp
                        </button>
                        <button className="share-btn instagram">
                            <Instagram size={20} />
                            Instagram
                        </button>
                        <button onClick={handleDownload} className="share-btn download">
                            <Download size={20} />
                            Baixar Imagem
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};
