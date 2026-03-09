import React, { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { Input, Textarea, Button } from "../../components/ui";
import { User, Mail, Phone, Globe, FileText, Save, Briefcase } from "lucide-react";

export const ProducerProfile: React.FC = () => {
    const { t } = useTranslation();
    const { name, email, updateSession, token, refreshToken, role, tenantId } = useAuth();
    const { addToast } = useToast();

    const [formData, setFormData] = useState({
        name: name || "",
        email: email || "",
        cpf: "",
        phone: "",
        bio: "",
        website: ""
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.get("/auth/me").then(res => {
            const u = res.data.user || res.data;
            setFormData({
                name: u.name || "",
                email: u.email || "",
                cpf: u.cpf || "",
                phone: u.phone || "",
                bio: u.bio || "",
                website: u.website || ""
            });
        }).catch(err => {
            console.error(err);
            addToast("Erro ao carregar perfil", "error");
        });
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.put("/users/me", formData);
            addToast("Perfil atualizado com sucesso!", "success");

            if (token && refreshToken && role) {
                updateSession(token, refreshToken, role, tenantId, formData.name);
            }
        } catch (err: any) {
            console.error(err);
            addToast("Erro ao atualizar perfil: " + (err.response?.data?.message || err.message), "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-16 animate-in fade-in duration-500">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#D4AF37] mb-2 font-serif">Meu Perfil</h1>
                <p className="text-[#B0A090]">{t("producer.producerprofile.gerencieSuasInformaesPessoaisE", "Gerencie suas informações pessoais e de contato.")}</p>
            </div>

            <div className="bg-[#2c1e10] rounded-2xl p-8 border border-[#463420] shadow-lg shadow-black/20">
                <div className="flex items-center gap-4 mb-8 pb-6 border-b border-[#463420]">
                    <div className="p-4 bg-[#D4AF37]/10 rounded-full border border-[#D4AF37]/20">
                        <User size={32} className="text-[#D4AF37]" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-[#EAE0D5] font-serif">Dados do Produtor</h2>
                        <p className="text-sm text-[#B0A090]">{t("producer.producerprofile.informaesVisveisParaAdministra", "Informações visíveis para administradores e em seus projetos")}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Nome Completo"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            leftIcon={<User size={18} className="text-[#D4AF37]" />}
                            required
                            className="bg-black/20 border-[#463420] text-[#EAE0D5] focus:border-[#D4AF37] h-12"
                        />

                        <Input
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            disabled
                            leftIcon={<Mail size={18} className="text-[#B0A090]" />}
                            className="bg-black/40 border-[#463420] text-[#B0A090] cursor-not-allowed h-12"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="CPF / CNPJ"
                            name="cpf"
                            value={formData.cpf}
                            onChange={handleChange}
                            placeholder="000.000.000-00"
                            leftIcon={<FileText size={18} className="text-[#D4AF37]" />}
                            className="bg-black/20 border-[#463420] text-[#EAE0D5] focus:border-[#D4AF37] h-12"
                        />

                        <Input
                            label="Telefone / WhatsApp"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="(00) 00000-0000"
                            leftIcon={<Phone size={18} className="text-[#D4AF37]" />}
                            className="bg-black/20 border-[#463420] text-[#EAE0D5] focus:border-[#D4AF37] h-12"
                        />
                    </div>

                    <Input
                        label={t("producer.producerprofile.sitePortflioRedesSociais", "Site / Portfólio / Redes Sociais")}
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="https://..."
                        leftIcon={<Globe size={18} className="text-[#D4AF37]" />}
                        className="bg-black/20 border-[#463420] text-[#EAE0D5] focus:border-[#D4AF37] h-12"
                    />

                    <Textarea
                        label={t("producer.producerprofile.biografiaApresentao", "Biografia / Apresentação")}
                        name="bio"
                        rows={5}
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder={t("producer.producerprofile.conteUmPoucoSobreSuaTrajetriaC", "Conte um pouco sobre sua trajetória cultural...")}
                        className="bg-black/20 border-[#463420] text-[#EAE0D5] focus:border-[#D4AF37]"
                    />

                    <div className="flex justify-end pt-6 border-t border-[#463420]">
                        <Button
                            type="submit"
                            isLoading={loading}
                            leftIcon={<Save size={18} />{t("producer.producerprofile.Classnamebgd4af37Text1a1108Hov", "}
                            className="bg-[#D4AF37] text-[#1a1108] hover:bg-[#c5a028] px-8 font-bold h-12 shadow-lg shadow-[#D4AF37]/20 border-none"
                        >
                            Salvar Alterações")}</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
