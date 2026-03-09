import { useTranslation } from "react-i18next";
﻿import React, { useState, useRef, useCallback, useEffect } from "react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Loader2, Instagram, Download, RefreshCw, Image as ImageIcon, Palette, Type } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { toast } from "react-hot-toast";
import "./AdminShared.css";


const templates = [
    { id: 'classic', name: 'Split Moderno', bg: 'linear-gradient(135deg, #1a1c22, #111827)', textColor: '#ffffff', accentColor: '#d4af37' },
    { id: 'dark', name: 'Cyber Neon', bg: 'linear-gradient(135deg, #0a0b0d, #1a1c22)', textColor: '#ffffff', accentColor: '#a78bfa' },
    { id: 'warm', name: 'Polaroid', bg: 'linear-gradient(135deg, #fdfbf7, #f4ede4)', textColor: '#4a2c1a', accentColor: '#d4af37' },
    { id: 'modern', name: 'Capa Editorial', bg: 'linear-gradient(135deg, #1c1917, #0f0a06)', textColor: '#ffffff', accentColor: '#d4af37' }
];

export const AdminInstagramCard: React.FC = () => {
  const { t } = useTranslation();
    const { tenantId } = useAuth();
    const [works, setWorks] = useState<any[]>([]);
    const [selectedWork, setSelectedWork] = useState<any>(null);
    const [template, setTemplate] = useState(templates[0]);
    const [loading, setLoading] = useState(true);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [customText, setCustomText] = useState('');

    useEffect(() => {
        if (tenantId) {
            api.get(`/works?tenantId=${tenantId}`).then(res => setWorks(Array.isArray(res.data) ? res.data : (res.data.data || []))).catch(console.error).finally(() => setLoading(false));
        }
    }, [tenantId]);

    const drawCard = useCallback(async () => {
        const canvas = canvasRef.current;
        if (!canvas || !selectedWork) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = 1080;
        canvas.height = 1080;

        const loadImage = (url: string): Promise<HTMLImageElement> => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.onload = () => resolve(img);
                img.onerror = (e) => {
                    console.error("Image load failed for URL:", url, e);
                    reject(e);
                };
                img.src = url;
            });
        };

        const drawText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number, color: string, font: string) => {
            ctx.fillStyle = color;
            ctx.font = font;
            const words = text.split(' ');
            let line = '';
            let currentY = y;
            for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                const metrics = ctx.measureText(testLine);
                if (metrics.width > maxWidth && n > 0) {
                    ctx.fillText(line, x, currentY);
                    line = words[n] + ' ';
                    currentY += lineHeight;
                } else {
                    line = testLine;
                }
            }
            ctx.fillText(line, x, currentY);
            return currentY;
        };

        const drawImageCover = (imgParam: HTMLImageElement, x: number, y: number, w: number, h: number) => {
            const imgRatio = imgParam.width / imgParam.height;
            const targetRatio = w / h;
            let srcX = 0, srcY = 0, srcW = imgParam.width, srcH = imgParam.height;

            if (imgRatio > targetRatio) {
                srcW = imgParam.height * targetRatio;
                srcX = (imgParam.width - srcW) / 2;
            } else {
                srcH = imgParam.width / targetRatio;
                srcY = (imgParam.height - srcH) / 2;
            }
            ctx.drawImage(imgParam, srcX, srcY, srcW, srcH, x, y, w, h);
        };

        let img: HTMLImageElement | null = null;
        if (selectedWork.imageUrl) {
            console.log("Attempting to load image from:", selectedWork.imageUrl);
            try {
                img = await loadImage(selectedWork.imageUrl);
                console.log("Image loaded successfully:", img.width, "x", img.height);
            } catch (e) { console.error("Canvas failed to load image:", e); }
        } else {
            console.log("No imageUrl present in selectedWork", selectedWork);
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // --- Template: modern (Editorial Full Img) ---
        if (template.id === 'modern') {
            if (img) {
                drawImageCover(img, 0, 0, 1080, 1080);
            } else {
                ctx.fillStyle = '#fafaf9';
                ctx.fillRect(0, 0, 1080, 1080);
            }
            // Gradient Overlay
            const grad = ctx.createLinearGradient(0, 400, 0, 1080);
            grad.addColorStop(0, 'rgba(0,0,0,0)');
            grad.addColorStop(0.5, 'rgba(0,0,0,0.6)');
            grad.addColorStop(1, 'rgba(0,0,0,0.95)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 1080, 1080);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 80px "Georgia", serif';
            ctx.fillText(selectedWork.title || 'Título', 80, 750);

            ctx.fillStyle = template.accentColor;
            ctx.font = 'italic 40px "Georgia", serif';
            ctx.fillText((selectedWork.artist || 'Artista') + (selectedWork.year ? `, ${selectedWork.year}` : ''), 80, 810);

            const text = customText || selectedWork.description || '';
            if (text) drawText(text, 80, 880, 920, 40, '#e5e7eb', '30px sans-serif');

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 24px sans-serif';
            try { (ctx as any).letterSpacing = "4px"; } catch (e) { }
            ctx.fillText('MUSEU CULTURA VIVA', 80, 80);
            try { (ctx as any).letterSpacing = "0px"; } catch (e) { }
        }

        // --- Template: dark (Cyber Neon / Floating Image) ---
        else if (template.id === 'dark') {
            const grad = ctx.createLinearGradient(0, 0, 1080, 1080);
            grad.addColorStop(0, '#0a0b0d');
            grad.addColorStop(1, '#1a1c22');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 1080, 1080);

            if (img) {
                ctx.save();
                ctx.beginPath();
                if ((ctx as any).roundRect) (ctx as any).roundRect(80, 80, 920, 500, 40);
                else ctx.rect(80, 80, 920, 500);
                ctx.clip();
                drawImageCover(img, 80, 80, 920, 500);
                ctx.restore();
            }

            ctx.fillStyle = template.accentColor;
            ctx.font = 'bold 60px sans-serif';
            ctx.fillText(selectedWork.title || 'Título', 80, 670);

            ctx.fillStyle = '#9ca3af';
            ctx.font = '36px sans-serif';
            ctx.fillText(selectedWork.artist || 'Artista', 80, 730);

            ctx.fillStyle = template.accentColor;
            ctx.fillRect(80, 770, 100, 6);

            const text = customText || selectedWork.description || '';
            if (text) drawText(text, 80, 830, 920, 45, '#f3f4f6', '30px sans-serif');

            ctx.fillStyle = template.accentColor;
            ctx.font = 'bold 24px sans-serif';
            ctx.fillText('@MUSEUCULTURAVIVA', 80, 1020);
        }

        // --- Template: warm (Polaroid Gallery) ---
        else if (template.id === 'warm') {
            ctx.fillStyle = '#f4ede4';
            ctx.fillRect(0, 0, 1080, 1080);

            let textY = 200;
            if (img) {
                ctx.shadowColor = 'rgba(0,0,0,0.15)';
                ctx.shadowBlur = 40;
                ctx.shadowOffsetY = 20;
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(140, 100, 800, 650);
                ctx.shadowColor = 'transparent';

                drawImageCover(img, 170, 130, 740, 480);

                ctx.fillStyle = '#4a2c1a';
                ctx.font = 'italic 34px "Georgia", serif';
                ctx.textAlign = 'center';
                ctx.fillText(selectedWork.title || 'Título', 540, 680);
                ctx.textAlign = 'left';
                textY = 820;
            } else {
                ctx.fillStyle = '#4a2c1a';
                ctx.font = 'bold 70px "Georgia", serif';
                ctx.fillText(selectedWork.title || 'Título', 140, 250);
                textY = 350;
            }

            if (img) {
                ctx.fillStyle = '#5c4808';
                ctx.font = 'bold 28px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(selectedWork.artist || '', 540, 720);
                ctx.textAlign = 'left';
            }

            const text = customText || selectedWork.description || '';
            if (text) drawText(text, 140, textY, 800, 42, '#4a2c1a', '28px "Georgia", serif');

            ctx.fillStyle = '#d4af37';
            ctx.fillRect(140, 1080 - 120, 800, 3);
            ctx.fillStyle = '#4a2c1a';
            ctx.font = 'bold 24px sans-serif';
            ctx.fillText('EXPOSIÇÃO PERMANENTE', 140, 1080 - 70);
        }

        // --- Template: classic (Two-tone split) ---
        else {
            if (img) {
                drawImageCover(img, 0, 0, 1080, 540);
            } else {
                ctx.fillStyle = '#2d2d35';
                ctx.fillRect(0, 0, 1080, 540);
            }

            ctx.fillStyle = '#1a1c22';
            ctx.fillRect(0, 540, 1080, 540);

            ctx.fillStyle = template.accentColor;
            ctx.fillRect(0, 540, 1080, 10);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 65px sans-serif';
            ctx.fillText(selectedWork.title || 'Título', 80, 640);

            ctx.fillStyle = template.accentColor;
            ctx.font = '36px sans-serif';
            ctx.fillText(selectedWork.artist || 'Artista', 80, 700);

            const text = customText || selectedWork.description || '';
            if (text) drawText(text, 80, 760, 920, 45, '#d1d5db', '30px sans-serif');

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 24px sans-serif';
            ctx.fillText('MUSEU CULTURA VIVA', 80, 1020);
        }

    }, [selectedWork, template, customText]);

    useEffect(() => { drawCard(); }, [drawCard]);

    const onDownload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = `card_${selectedWork?.title?.replace(/\s/g, '_') || 'obra'}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        toast.success("Card baixado! Pronto para postar no Instagram 📸");
    };

    if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: "5rem 0" }}><Loader2 className="animate-spin" style={{ color: "#d4af37" }} /></div>;

    return (
        <div style={{ display: "grid", gap: "2rem" }}>
            <div>
                <h1 className="section-title" style={{ margin: 0 }}>Card para Instagram</h1>
                <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.25rem" }}>Gere cards visuais para divulgar obras nas redes sociais</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Controls */}
                <div style={{ display: "grid", gap: "1rem" }}>
                    <div className="card" style={{ display: "grid", gap: "1rem" }}>
                        <div>
                            <label style={{ display: "block", color: "#d4af37", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>Obra</label>
                            <select value={selectedWork?.id || ''} onChange={e => setSelectedWork(works.find(w => w.id === e.target.value))} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "white", fontSize: "0.85rem", outline: "none" }}>
                                <option value="">Selecione uma obra...</option>
                                {works.map((w: any) => <option key={w.id} value={w.id}>{w.title}</option>)}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: "block", color: "#d4af37", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>Template</label>
                            <div className="grid grid-cols-2 gap-2">
                                {templates.map(t => (
                                    <button key={t.id} onClick={() => setTemplate(t)} className={`p-3 rounded-xl border text-sm font-bold text-left transition-all ${template.id === t.id ? 'border-amber-500 bg-amber-500/10 text-amber-400' : 'border-white/10 text-gray-400 hover:bg-zinc-900/40 border border-gold/20/5'}`}>
                                        <div className="w-full h-4 rounded mb-2" style={{ background: t.bg }} />
                                        {t.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label style={{ display: "block", color: "#d4af37", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>Texto Customizado (opcional)</label>
                            <textarea value={customText} onChange={e => setCustomText(e.target.value)} rows={3} placeholder={t("admin.instagramcard.deixeEmBrancoParaUsarADescrioD", "Deixe em branco para usar a descrição da obra")} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none resize-none focus:border-amber-500" />
                        </div>

                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            <Button onClick={onDownload} disabled={!selectedWork} leftIcon={<Download size={16} />}>Baixar PNG</Button>
                            <Button variant="outline" onClick={drawCard} leftIcon={<RefreshCw size={16} />}>Atualizar</Button>
                        </div>
                    </div>
                </div>

                {/* Preview */}
                <div className="card">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">{t("admin.instagramcard.prvia10801080", "Prévia 1080×1080")}</p>
                    <canvas ref={canvasRef} style={{ width: '100%', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
            </div>
        </div>
    );
};
