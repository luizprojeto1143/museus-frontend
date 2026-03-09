import { useTranslation } from "react-i18next";
﻿import React, { useEffect, useState, useCallback } from "react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Loader2, Baby, ToggleLeft, ToggleRight, Smile, Type, Palette } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { toast } from "react-hot-toast";

export const AdminKidsMode: React.FC = () => {
  const { t } = useTranslation();
    const { tenantId } = useAuth();
    const [enabled, setEnabled] = useState(false);
    const [config, setConfig] = useState({
        minAge: '5', maxAge: '12',
        fontSize: 'large', simplifyDescriptions: true,
        showGamification: true, showEmojis: true,
        customWelcomeMessage: 'Olá, pequeno explorador! 🎨 Vamos descobrir coisas incríveis!'
    });
    const [saving, setSaving] = useState(false);

    const onSave = async () => {
        setSaving(true);
        try {
            await api.put(`/tenants/${tenantId}`, {
                kidsMode: {
                    enabled,
                    ...config,
                    minAge: parseInt(config.minAge),
                    maxAge: parseInt(config.maxAge)
                }
            });
            toast.success("Modo Criança configurado!");
        } catch (err) { toast.error("Erro ao salvar configurações"); }
        finally { setSaving(false); }
    };

    return (
        <div style={{ display: "grid", gap: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1 className="section-title" style={{ margin: 0 }}>{t("admin.kidsmode.modoCriana", "Modo Criança")}</h1>
                    <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.25rem" }}>Interface simplificada para visitantes jovens</p>
                </div>
                <button onClick={() => setEnabled(!enabled)} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {enabled ? <ToggleRight size={40} style={{ color: "#34d399" }} /> : <ToggleLeft size={40} style={{ color: "#475569" }} />}
                    <span className={`text-sm font-bold ${enabled ? 'text-green-400' : 'text-zinc-400'}`}>{enabled ? 'Ativado' : 'Desativado'}</span>
                </button>
            </div>

            {/* Preview */}
            <div className="grid grid-cols-2 gap-6">
                <div className="card">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Smile size={20} className="text-amber-500" />{t("admin.kidsmode.prviaModoNormal", "Prévia — Modo Normal")}</h2>
                    <div className="bg-black/30 rounded-xl p-4 space-y-2">
                        <p className="text-white text-sm font-medium">{t("admin.kidsmode.ttuloDaObra", "Título da Obra")}</p>
                        <p style={{ color: "#94a3b8", fontSize: "0.75rem" }}>{t("admin.kidsmode.estaPinturaLeoSobreTelaDatadaD", "Esta pintura à óleo sobre tela, datada do período barroco brasileiro, apresenta características chiaroscuro típicas da escola...")}</p>
                        <span className="text-[10px] text-zinc-300">★ 4.5 • Sala 3 • 1750</span>
                    </div>
                </div>
                <div className="card" style={{ border: "1px solid rgba(34,197,94,0.2)" }}>
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Baby size={20} style={{ color: "#34d399" }} />{t("admin.kidsmode.prviaModoCriana", "Prévia — Modo Criança")}</h2>
                    <div className="bg-black/30 rounded-xl p-4 space-y-2" style={{ fontSize: '18px' }}>
                        <p style={{ color: "white", fontWeight: 700, fontSize: '1.2em' }}>{t("admin.kidsmode.TtuloDaObra", "🎨 Título da Obra")}</p>
                        <p className="text-gray-300" style={{ fontSize: '0.9em', lineHeight: '1.8' }}>{t("admin.kidsmode.umaPinturaBemAntigaEBonitaOArt", "Uma pintura bem antiga e bonita! O artista usou tintas especiais para fazer parecer que tem uma luz brilhando. Legal, né? ✨")}</p>
                        <span className="text-amber-400 font-bold" style={{ fontSize: '0.85em' }}>⭐⭐⭐⭐⭐ • 📍 Sala 3</span>
                    </div>
                </div>
            </div>

            {/* Configuration */}
            <div className="card" style={{ display: "grid", gap: "1.5rem" }}>
                <h2 className="card-title" style={{ margin: 0 }}>{t("admin.kidsmode.configuraes", "Configurações")}</h2>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label style={{ display: "block", color: "#d4af37", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>{t("admin.kidsmode.faixaEtria", "Faixa Etária")}</label>
                        <div className="flex gap-2 items-center">
                            <input type="number" value={config.minAge} onChange={e => setConfig({ ...config, minAge: e.target.value })} className="w-20 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none text-center" />
                            <span style={{ color: "#64748b" }}>a</span>
                            <input type="number" value={config.maxAge} onChange={e => setConfig({ ...config, maxAge: e.target.value })} className="w-20 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-sm outline-none text-center" />
                            <span className="text-zinc-400 text-sm">anos</span>
                        </div>
                    </div>
                    <div>
                        <label style={{ display: "block", color: "#d4af37", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>Tamanho da Fonte</label>
                        <select value={config.fontSize} onChange={e => setConfig({ ...config, fontSize: e.target.value })} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.75rem 1rem", color: "white", fontSize: "0.85rem", outline: "none" }}>
                            <option value="normal">Normal</option>
                            <option value="large">Grande</option>
                            <option value="extra-large">Extra Grande</option>
                        </select>
                    </div>
                </div>

                <div style={{ display: "grid", gap: "0.75rem" }}>
                    {[
                        { key: 'simplifyDescriptions', label: 'Simplificar descrições automaticamente', desc: 'Usa IA para gerar textos acessíveis para crianças' },
                        { key: 'showGamification', label: 'Gamificação mais visual', desc: 'Destaque maior para XP, badges e desafios' },
                        { key: 'showEmojis', label: 'Incluir emojis nos textos', desc: 'Adiciona emojis para tornar a leitura mais divertida' }
                    ].map(opt => (
                        <div key={opt.key} className="flex items-center justify-between bg-black/20 rounded-xl p-4">
                            <div>
                                <p style={{ color: "white", fontSize: "0.85rem", fontWeight: 700 }}>{opt.label}</p>
                                <p style={{ color: "#64748b", fontSize: "0.75rem" }}>{opt.desc}</p>
                            </div>
                            <button onClick={() => setConfig({ ...config, [opt.key]: !(config as any)[opt.key] })}>
                                {(config as any)[opt.key] ? <ToggleRight size={28} style={{ color: "#34d399" }} /> : <ToggleLeft size={28} style={{ color: "#475569" }} />}
                            </button>
                        </div>
                    ))}
                </div>

                <div>
                    <label style={{ display: "block", color: "#d4af37", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>Mensagem de Boas-Vindas</label>
                    <textarea value={config.customWelcomeMessage} onChange={e => setConfig({ ...config, customWelcomeMessage: e.target.value })} rows={2} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none resize-none" />
                </div>

                <div className="flex justify-end">
                    <Button onClick={onSave} disabled={saving}>{saving ? 'Salvando...' : 'Salvar Configurações'}</Button>
                </div>
            </div>
        </div>
    );
};
