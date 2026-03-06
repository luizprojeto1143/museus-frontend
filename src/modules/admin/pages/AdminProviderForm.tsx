import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { useToast } from "../../../contexts/ToastContext";
import { Input, Button } from "../../../components/ui";
import { ArrowLeft, Save, User, Phone, Mail, Star, CheckCircle, Briefcase, FileText, CheckCircle2 } from "lucide-react";
import "./AdminShared.css";


const ACCESSIBILITY_SERVICES = [
    { value: "LIBRAS_INTERPRETATION", label: "Interpretação em LIBRAS", icon: "🤟" },
    { value: "AUDIO_DESCRIPTION", label: "Audiodescrição", icon: "🎧" },
    { value: "CAPTIONING", label: "Legendagem", icon: "📝" },
    { value: "BRAILLE", label: "Material em Braille", icon: "⠿" },
    { value: "TACTILE_MODEL", label: "Maquete Tátil", icon: "🖐️" },
    { value: "EASY_READING", label: "Leitura Fácil", icon: "📖" }
];

export const AdminProviderForm: React.FC = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { tenantId } = useAuth();
    const { addToast } = useToast();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

                        />
                    </div >
                </div >

    {/* Serviços */ }
    < div className = "bg-zinc-900/50 border border-white/5 rounded-3xl p-6 md:p-8 space-y-6" >
                    <div>
                        <h2 className="text-lg font-bold text-white mb-1">♿ Serviços Oferecidos</h2>
                        <p className="text-sm text-zinc-400">
                            Selecione todos os serviços de acessibilidade que este prestador oferece:
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {ACCESSIBILITY_SERVICES.map(service => {
                            const isSelected = formData.services.includes(service.value);
                            return (
                                <button
                                    key={service.value}
                                    type="button"
                                    onClick={() => toggleService(service.value)}
                                    className={`
                                        p-4 rounded-xl border transition-all flex items-center gap-3 text-left group
                                        ${isSelected
                                            ? "border-gold bg-gold/10 text-gold shadow-[0_0_15px_rgba(212,175,55,0.1)]"
                                            : "border-white/10 bg-zinc-900/50 text-zinc-400 hover:border-white/20 hover:text-white"}
                                    `}
                                >
                                    <span className="text-2xl">{service.icon}</span>
                                    <span className="font-medium">
                                        {service.label}
                                    </span>
                                    {isSelected && (
                                        <CheckCircle2 size={18} className="ml-auto text-gold" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div >

    {/* Avaliação e Histórico */ }
    < div className = "bg-zinc-900/50 border border-white/5 rounded-3xl p-6 md:p-8 space-y-6" >
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Briefcase size={20} className="text-gold" /> Avaliação e Histórico
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Avaliação (0-5)"
                            type="number"
                            step="0.1"
                            min="0"
                            max="5"
                            value={formData.rating}
                            onChange={e => setFormData({ ...formData, rating: e.target.value })}
                            placeholder="4.5"
                            leftIcon={<Star size={16} />}
                            className="bg-zinc-900/50 border-white/10 text-white focus:border-gold/50"
                        />

                        <Input
                            label="Trabalhos Concluídos"
                            type="number"
                            min="0"
                            value={formData.completedJobs}
                            onChange={e => setFormData({ ...formData, completedJobs: parseInt(e.target.value) || 0 })}
                            className="bg-zinc-900/50 border-white/10 text-white focus:border-gold/50"
                        />
                    </div>

                    <div className="p-4 bg-zinc-900/50 rounded-xl border border-white/5">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className={`
                                w-5 h-5 rounded border flex items-center justify-center transition-colors
                                ${formData.active ? 'bg-gold border-gold' : 'border-zinc-600 group-hover:border-zinc-500'}
                            `}>
                                {formData.active && <CheckCircle size={14} className="text-black" />}
                            </div>
                            <input
                                type="checkbox"
                                checked={formData.active}
                                onChange={e => setFormData({ ...formData, active: e.target.checked })}
                                className="hidden"
                            />
                            <span className="font-medium text-zinc-200 group-hover:text-white transition-colors">
                                Prestador ativo (disponível para novos trabalhos)
                            </span>
                        </label>
                    </div>
                </div >

    {/* Ações */ }
    < div className = "fixed bottom-6 left-0 right-0 z-50 pointer-events-none px-4" >
        <div className="max-w-4xl mx-auto bg-zinc-900/90 border border-white/10 p-2 pr-3 pl-4 rounded-2xl flex items-center justify-between shadow-2xl backdrop-blur-xl pointer-events-auto">
            <Button
                variant="ghost"
                type="button"
                onClick={() => navigate("/admin/prestadores")}
                className="text-zinc-400 hover:text-white px-4 h-12 hover:bg-zinc-900/40 border border-gold/20/5"
                disabled={saving}
            >
                Cancelar
            </Button>
            <div className="flex items-center gap-3">
                <Button
                    type="submit"
                    disabled={saving}
                    className="px-8 h-12 rounded-xl font-bold text-base shadow-lg shadow-gold/20 bg-gold hover:bg-gold/90 text-black border-none"
                    leftIcon={saving ? undefined : <Save size={18} />}
                >
                    {saving ? 'Salvando...' : (isEdit ? "Salvar Alterações" : "Cadastrar Prestador")}
                </Button>
            </div>
        </div>
                </div >
            </form >
        </div >
    );
};
