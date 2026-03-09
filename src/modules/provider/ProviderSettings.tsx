import { useTranslation } from "react-i18next";
import React, { useEffect, useState, useCallback } from "react";
import { Settings, Loader2, Save, User as UserIcon, Phone, FileText } from "lucide-react";
import { api } from "../../api/client";
import { toast } from "react-hot-toast";

export const ProviderSettings: React.FC = () => {
  const { t } = useTranslation();
    const [provider, setProvider] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const res = await api.get("/providers/me");
            setProvider(res.data);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar dados");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            await api.put(`/providers/${provider.id}`, provider);
            toast.success("Perfil atualizado com sucesso!");
        } catch (error) {
            toast.error("Erro ao salvar alterações");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-[60vh]">
            <Loader2 className="animate-spin text-[#9f7aea]" size={40} />
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <div>
                <h1 className="text-3xl font-black text-white tracking-tight">{t("provider.providersettings.configuraesDoPerfil", `Configurações do Perfil`)}</h1>
                <p className="text-[#b794f4] mt-2">{t("provider.providersettings.personalizeComoOsProdutoresCulturaisVero", `Personalize como os produtores culturais verão seu serviço.`)}</p>
            </div>

            <form onSubmit={handleSave} className="bg-[#1a0f2c] border border-[#3b2164] rounded-2xl p-8 shadow-xl max-w-3xl space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[#b794f4] flex items-center gap-2">
                            <UserIcon size={16} /> Nome Público / Institucional
                        </label>
                        <input
                            type="text"
                            value={provider.name || ""}
                            onChange={e => setProvider({ ...provider, name: e.target.value })}
                            className="w-full bg-black/40 border border-[#3b2164] rounded-xl px-4 py-3 text-white focus:border-[#9f7aea] outline-none transition-all"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[#b794f4] flex items-center gap-2">
                            CPF / CNPJ
                        </label>
                        <input
                            type="text"
                            value={provider.document || ""}
                            onChange={e => setProvider({ ...provider, document: e.target.value })}
                            className="w-full bg-black/40 border border-[#3b2164] rounded-xl px-4 py-3 text-white focus:border-[#9f7aea] outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[#b794f4] flex items-center gap-2">
                            <Phone size={16} /> Telefone de Contato
                        </label>
                        <input
                            type="text"
                            value={provider.phone || ""}
                            onChange={e => setProvider({ ...provider, phone: e.target.value })}
                            className="w-full bg-black/40 border border-[#3b2164] rounded-xl px-4 py-3 text-white focus:border-[#9f7aea] outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[#b794f4]">{t("provider.providersettings.emailPblico", `Email Público`)}</label>
                        <input
                            type="email"
                            value={provider.email || ""}
                            onChange={e => setProvider({ ...provider, email: e.target.value })}
                            className="w-full bg-black/40 border border-[#3b2164] rounded-xl px-4 py-3 text-white focus:border-[#9f7aea] outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-[#b794f4] flex items-center gap-2">
                        <FileText size={16} /> Descrição Profissional / Currículo resumido
                    </label>
                    <textarea
                        rows={4}
                        value={provider.description || ""}
                        onChange={e => setProvider({ ...provider, description: e.target.value })}
                        className="w-full bg-black/40 border border-[#3b2164] rounded-xl px-4 py-3 text-white focus:border-[#9f7aea] outline-none transition-all resize-none"
                    />
                </div>

                <div className="pt-4 border-t border-[#3b2164] flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-[#9f7aea] hover:bg-[#805ad5] text-white font-black px-8 py-3 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        Salvar Alterações
                    </button>
                </div>
            </form>
        </div>
    );
};
