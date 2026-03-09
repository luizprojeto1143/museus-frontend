import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Save, Bell, Lock, User, Globe, Shield, ToggleLeft, ToggleRight } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { api } from "../../api/client";
import { useToast } from "../../contexts/ToastContext";
import { Button } from "../../components/ui";

export const ProducerSettings: React.FC = () => {
    const { t } = useTranslation();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState({
        emailNotifications: true,
        publicProfile: true,
        language: "pt-BR",
        twoFactor: false
    });

    const handleSave = async () => {
        setLoading(true);
        try {
            await api.put("/users/me/settings", {
                preferences: settings
            });
            addToast("Configurações salvas com sucesso!", "success");
        } catch (error) {
            console.error("Error saving settings", error);
            addToast("Erro ao salvar configurações", "error");
        } finally {
            setLoading(false);
        }
    };

    // Load initial settings
    React.useEffect(() => {
        api.get("/auth/me").then(res => {
            if (res.data.preferences) {
                setSettings(prev => ({ ...prev, ...res.data.preferences }));
            }
        }).catch(console.error);
    }, []);

    const toggleSetting = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="max-w-4xl mx-auto pb-16 animate-in fade-in duration-500">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#D4AF37] mb-2 font-serif">{t("producer.producersettings.configuraes", `Configurações`)}</h1>
                <p className="text-[#B0A090]">{t("producer.producersettings.gerencieSuasPrefernciasDeContaEPrivacida", `Gerencie suas preferências de conta e privacidade.`)}</p>
            </div>

            <div className="space-y-6">

                {/* Notifications Section */}
                <section className="bg-[#2c1e10] rounded-2xl p-6 border border-[#463420] shadow-lg shadow-black/20">
                    <h3 className="text-lg font-bold text-[#EAE0D5] flex items-center gap-2 mb-6 border-b border-[#463420] pb-4">
                        <Bell size={20} className="text-[#D4AF37]" /> Notificações
                    </h3>
                    <div className="flex justify-between items-center py-2">
                        <span className="text-[#B0A090] text-sm">{t("producer.producersettings.receberAtualizaesDeProjetosPorEmail", `Receber atualizações de projetos por e-mail`)}</span>
                        <div
                            onClick={() => toggleSetting('emailNotifications')}
                            className="text-[#D4AF37] cursor-pointer hover:scale-110 transition-transform"
                        >
                            {settings.emailNotifications ?
                                <ToggleRight size={48} fill="currentColor" className="text-[#D4AF37]" /> :
                                <ToggleLeft size={48} className="text-[#B0A090]" />
                            }
                        </div>
                    </div>
                </section>

                {/* Privacy Section */}
                <section className="bg-[#2c1e10] rounded-2xl p-6 border border-[#463420] shadow-lg shadow-black/20">
                    <h3 className="text-lg font-bold text-[#EAE0D5] flex items-center gap-2 mb-6 border-b border-[#463420] pb-4">
                        <Globe size={20} className="text-[#D4AF37]" /> Privacidade
                    </h3>
                    <div className="flex justify-between items-center py-2">
                        <span className="text-[#B0A090] text-sm">{t("producer.producersettings.perfilPblicoVisvelNaPlataforma", `Perfil Público visível na plataforma`)}</span>
                        <div
                            onClick={() => toggleSetting('publicProfile')}
                            className="text-[#D4AF37] cursor-pointer hover:scale-110 transition-transform"
                        >
                            {settings.publicProfile ?
                                <ToggleRight size={48} fill="currentColor" className="text-[#D4AF37]" /> :
                                <ToggleLeft size={48} className="text-[#B0A090]" />
                            }
                        </div>
                    </div>
                </section>

                {/* Security Section */}
                <section className="bg-[#2c1e10] rounded-2xl p-6 border border-[#463420] shadow-lg shadow-black/20">
                    <h3 className="text-lg font-bold text-[#EAE0D5] flex items-center gap-2 mb-6 border-b border-[#463420] pb-4">
                        <Shield size={20} className="text-[#D4AF37]" /> Segurança
                    </h3>
                    <div className="flex justify-between items-center py-2 mb-6">
                        <span className="text-[#B0A090] text-sm">{t("producer.producersettings.ativarAutenticaoDeDoisFatores2fa", `Ativar Autenticação de Dois Fatores (2FA)`)}</span>
                        <div
                            onClick={() => toggleSetting('twoFactor')}
                            className="text-[#D4AF37] cursor-pointer hover:scale-110 transition-transform"
                        >
                            {settings.twoFactor ?
                                <ToggleRight size={48} fill="currentColor" className="text-[#D4AF37]" /> :
                                <ToggleLeft size={48} className="text-[#B0A090]" />
                            }
                        </div>
                    </div>
                    <div className="pt-4 border-t border-[#463420]">
                        <Button
                            variant="outline"
                            leftIcon={<Lock size={16} />}
                            className="border-[#463420] text-[#B0A090] hover:text-[#EAE0D5] hover:bg-white/5 hover:border-[#D4AF37]/30"
                        >
                            Alterar Senha
                        </Button>
                    </div>
                </section>

                <div className="flex justify-end pt-6">
                    <Button
                        onClick={handleSave}
                        isLoading={loading}
                        leftIcon={<Save size={20} />}
                        className="bg-[#D4AF37] text-[#1a1108] hover:bg-[#c5a028] px-8 py-6 font-bold text-lg shadow-lg shadow-[#D4AF37]/20 border-none rounded-xl"
                    >
                        Salvar Alterações
                    </Button>
                </div>

            </div>
        </div>
    );
};
