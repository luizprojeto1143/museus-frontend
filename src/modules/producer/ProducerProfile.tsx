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
            // Assuming /auth/me returns the user object with extra fields
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
            await api.put("/users/me", formData); // Endpoint to update own profile
            addToast("Perfil atualizado com sucesso!", "success");

            // Update context
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
        <div className="max-w-4xl mx-auto pb-12">
            <div className="mb-8">
                <h1 className="section-title">Meu Perfil</h1>
                <p className="section-subtitle">Gerencie suas informações pessoais e de contato.</p>
            </div>

            <div className="card">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-700">
                    <div className="p-3 bg-gold/10 rounded-full">
                        <User size={24} className="text-gold" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-100">Dados do Produtor</h2>
                        <p className="text-sm text-gray-400">Informações visíveis para administradores e contratos</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Nome Completo"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            leftIcon={<User size={18} />}
                            required
                        />

                        <Input
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            disabled
                            leftIcon={<Mail size={18} />}
                            className="opacity-60 cursor-not-allowed"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="CPF / CNPJ"
                            name="cpf"
                            value={formData.cpf}
                            onChange={handleChange}
                            placeholder="000.000.000-00"
                            leftIcon={<FileText size={18} />}
                        />

                        <Input
                            label="Telefone / WhatsApp"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="(00) 00000-0000"
                            leftIcon={<Phone size={18} />}
                        />
                    </div>

                    <Input
                        label="Site / Portfólio / Redes Sociais"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="https://..."
                        leftIcon={<Globe size={18} />}
                    />

                    <Textarea
                        label="Biografia / Apresentação"
                        name="bio"
                        rows={5}
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder="Conte um pouco sobre sua trajetória cultural..."
                    />

                    <div className="flex justify-end pt-4 border-t border-gray-700">
                        <Button
                            type="submit"
                            isLoading={loading}
                            leftIcon={<Save size={18} />}
                            className="px-8"
                        >
                            Salvar Alterações
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
