import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from "react";
import { User, Mail, Phone, FileText, CheckCircle, Tag, Save } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { api } from "../../api/client";
import { Button, Input, Textarea } from "../../components/ui";
import { toast } from "react-hot-toast";

export const ProviderProfile: React.FC = () => {
  const { t } = useTranslation();
    const { name } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<any>({
        name: "",
        email: "",
        phone: "",
        document: "",
        description: "",
        services: []
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get("/providers/me");
                setProfile(res.data);
            } catch (err) {
                console.error("Error fetching provider profile", err);
                toast.error("Erro ao carregar perfil");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async () => {
        try {
            setSaving(true);
            await api.put(`/providers/${profile.id}`, profile);
            toast.success("Perfil atualizado com sucesso!");
        } catch (err) {
            console.error("Error saving profile", err);
            toast.error("Erro ao salvar perfil");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center animate-pulse text-[#9f7aea]">Carregando perfil...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Meu Perfil de Prestador</h1>
                    <p className="text-[#b794f4] mt-1">{t("provider.providerprofile.gerencieComoOsProdutoresVisualizamSeusSe", `Gerencie como os produtores visualizam seus serviços.`)}</p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-[#9f7aea] hover:bg-[#805ad5] text-white px-8 py-6 rounded-2xl font-bold shadow-lg shadow-[#9f7aea]/20 flex items-center gap-2"
                >
                    <Save size={20} /> {saving ? "Salvando..." : "Salvar Alterações"}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Avatar & Basic Info */}
                <div className="space-y-6">
                    <div className="bg-[#1a0f2c] p-8 rounded-3xl border border-[#3b2164] flex flex-col items-center text-center">
                        <div className="w-32 h-32 bg-[#9f7aea] rounded-3xl flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-[#9f7aea]/40 mb-4 transform -rotate-3 hover:rotate-0 transition-transform cursor-pointer">
                            {profile.name?.slice(0, 2).toUpperCase()}
                        </div>
                        <h2 className="text-xl font-bold text-white">{profile.name}</h2>
                        <div className="flex items-center gap-1 text-[#b794f4] text-xs mt-1 uppercase font-black tracking-widest">
                            <CheckCircle size={12} className="text-green-400" /> Prestador Verificado
                        </div>
                    </div>

                    <div className="bg-[#1a0f2c] p-6 rounded-3xl border border-[#3b2164] space-y-4">
                        <h3 className="text-white font-bold text-sm uppercase tracking-widest flex items-center gap-2">{t("provider.providerprofile.estatsticas", `
                            Estatísticas
                        `)}</h3>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-[#b794f4]">{t("provider.providerprofile.avaliaoMdia", `Avaliação Média`)}</span>
                            <span className="text-white font-bold">4.9 / 5.0</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-[#b794f4]">{t("provider.providerprofile.projetosConcludos", `Projetos Concluídos`)}</span>
                            <span className="text-white font-bold">{profile.completedJobs || 0}</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Form */}
                <div className="md:col-span-2 space-y-6">
                    <section className="bg-black/20 p-8 rounded-3xl border border-[#3b2164] space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[#b794f4] uppercase tracking-widest ml-1">Nome Comercial</label>
                                <Input
                                    value={profile.name}
                                    onChange={e => setProfile({ ...profile, name: e.target.value })}
                                    className="bg-[#0f0a1a] border-[#3b2164] text-white focus:border-[#9f7aea]"
                                    placeholder="Ex: Acessibilidade Digital Ltda"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[#b794f4] uppercase tracking-widest ml-1">{t("provider.providerprofile.emailParaOramentos", `E-mail para Orçamentos`)}</label>
                                <Input
                                    value={profile.email}
                                    onChange={e => setProfile({ ...profile, email: e.target.value })}
                                    className="bg-[#0f0a1a] border-[#3b2164] text-white focus:border-[#9f7aea]"
                                    placeholder="email@empresa.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[#b794f4] uppercase tracking-widest ml-1">Telefone / WhatsApp</label>
                                <Input
                                    value={profile.phone}
                                    onChange={e => setProfile({ ...profile, phone: e.target.value })}
                                    className="bg-[#0f0a1a] border-[#3b2164] text-white focus:border-[#9f7aea]"
                                    placeholder="(11) 99999-9999"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-[#b794f4] uppercase tracking-widest ml-1">Documento (CPF/CNPJ)</label>
                                <Input
                                    value={profile.document}
                                    onChange={e => setProfile({ ...profile, document: e.target.value })}
                                    className="bg-[#0f0a1a] border-[#3b2164] text-white focus:border-[#9f7aea]"
                                    placeholder="00.000.000/0001-00"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-[#b794f4] uppercase tracking-widest ml-1">{t("provider.providerprofile.descrioBio", `Descrição / Bio`)}</label>
                            <Textarea
                                value={profile.description}
                                onChange={e => setProfile({ ...profile, description: e.target.value })}
                                className="bg-[#0f0a1a] border-[#3b2164] text-white focus:border-[#9f7aea] min-h-[150px]"
                                placeholder={t("provider.providerprofile.conteUmPoucoSobreSuaExperinciaEOsServios", `Conte um pouco sobre sua experiência e os serviços que oferece...`)}
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-xs font-bold text-[#b794f4] uppercase tracking-widest ml-1">{t("provider.providerprofile.serviosOferecidos", `Serviços Oferecidos`)}</label>
                            <div className="flex flex-wrap gap-2">
                                {["LIBRAS", "AUDIODESCRICAO", "LEGENDA", "ADAPTACAO_FISICA"].map(service => (
                                    <button
                                        key={service}
                                        onClick={() => {
                                            const services = profile.services.includes(service)
                                                ? profile.services.filter((s: string) => s !== service)
                                                : [...profile.services, service];
                                            setProfile({ ...profile, services });
                                        }}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${profile.services.includes(service)
                                                ? 'bg-[#9f7aea]/20 border-[#9f7aea] text-white'
                                                : 'bg-transparent border-[#3b2164] text-[#b794f4] hover:border-[#9f7aea]/50'
                                            }`}
                                    >
                                        {service}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};
