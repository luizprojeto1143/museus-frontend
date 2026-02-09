import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Save, Bell, Lock, User, Globe, Shield } from "lucide-react";
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
        <div className="max-w-4xl mx-auto pb-12">
            <div className="mb-8">
                <h1 className="section-title">Configurações</h1>
                <p className="section-subtitle">Gerencie suas preferências de conta e privacidade.</p>
            </div>

            <div className="space-y-6">

                {/* Notifications Section */}
                <section className="card">
                    <h3 className="card-title flex items-center gap-2 mb-4">
                        <Bell size={20} className="text-gold" /> Notificações
                    </h3>
                    <div className="flex justify-between items-center py-4 border-b border-gray-700">
                        <span className="text-gray-300">Receber atualizações de projetos por e-mail</span>
                        <div
                            onClick={() => toggleSetting('emailNotifications')}
                            className={`w-12 h-6 rounded-full flex items-center transition-colors cursor-pointer p-1 ${settings.emailNotifications ? 'bg-green-500' : 'bg-gray-700'}`}
                        >
                            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${settings.emailNotifications ? 'translate-x-6' : 'translate-x-0'}`} />
                        </div>
                    </div>
                </section>

                {/* Privacy Section */}
                <section className="card">
                    <h3 className="card-title flex items-center gap-2 mb-4">
                        <Globe size={20} className="text-gold" /> Privacidade
                    </h3>
                    <div className="flex justify-between items-center py-4">
                        <span className="text-gray-300">Perfil Público visível na plataforma</span>
                        <div
                            onClick={() => toggleSetting('publicProfile')}
                            className={`w-12 h-6 rounded-full flex items-center transition-colors cursor-pointer p-1 ${settings.publicProfile ? 'bg-gold' : 'bg-gray-700'}`}
                        >
                            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${settings.publicProfile ? 'translate-x-6' : 'translate-x-0'}`} />
                        </div>
                    </div>
                </section>

                {/* Security Section */}
                <section className="card">
                    <h3 className="card-title flex items-center gap-2 mb-4">
                        <Shield size={20} className="text-gold" /> Segurança
                    </h3>
                    <div className="flex justify-between items-center py-4 border-b border-gray-700">
                        <span className="text-gray-300">Ativar Autenticação de Dois Fatores (2FA)</span>
                        <div
                            onClick={() => toggleSetting('twoFactor')}
                            className={`w-12 h-6 rounded-full flex items-center transition-colors cursor-pointer p-1 ${settings.twoFactor ? 'bg-gold' : 'bg-gray-700'}`}
                        >
                            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${settings.twoFactor ? 'translate-x-6' : 'translate-x-0'}`} />
                        </div>
                    </div>
                    <div className="mt-4">
                        <Button variant="outline" leftIcon={<Lock size={16} />}>
                            Alterar Senha
                        </Button>
                    </div>
                </section>

                <div className="flex justify-end pt-4">
                    <Button
                        onClick={handleSave}
                        isLoading={loading}
                        leftIcon={<Save size={20} />}
                        className="px-8"
                    >
                        Salvar Alterações
                    </Button>
                </div>

            </div>
        </div>
    );
};
