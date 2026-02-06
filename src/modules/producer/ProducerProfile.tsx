import React, { useEffect, useState } from "react";
import { api } from "../../api/client";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";

export const ProducerProfile: React.FC = () => {
    const { t } = useTranslation();
    const { name, email, updateSession, token, refreshToken, role, tenantId } = useAuth();
    const [formData, setFormData] = useState({
        name: name || "",
        email: email || "",
        cpf: "",
        phone: "",
        bio: "",
        website: ""
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

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
        }).catch(console.error);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        try {
            const res = await api.put("/users/me", formData); // Endpoint to update own profile
            setMessage("Perfil atualizado com sucesso!");

            // Update context
            if (token && refreshToken && role) {
                updateSession(token, refreshToken, role, tenantId, formData.name);
            }
        } catch (err: any) {
            console.error(err);
            setMessage("Erro ao atualizar perfil: " + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card max-w-4xl mx-auto p-8 bg-surface-darker/50 backdrop-blur-sm border border-gold/10 rounded-lg">
            <h2 className="mb-6 text-2xl font-bold text-gold border-b border-gold/20 pb-4">Meu Perfil de Produtor</h2>
            {message && <div className={`p-4 mb-6 rounded glass-panel ${message.includes("sucesso") ? "text-green-400 border-l-4 border-green-500" : "text-red-400 border-l-4 border-red-500"}`}>{message}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group">
                        <label className="block text-sm font-medium text-gold/80 mb-2 uppercase tracking-wide">Nome Completo</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="input-field w-full" />
                    </div>
                    <div className="form-group">
                        <label className="block text-sm font-medium text-gold/80 mb-2 uppercase tracking-wide">Email</label>
                        <input type="email" name="email" value={formData.email} disabled className="input-field w-full opacity-50 cursor-not-allowed bg-black/20" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group">
                        <label className="block text-sm font-medium text-gold/80 mb-2 uppercase tracking-wide">CPF / CNPJ</label>
                        <input type="text" name="cpf" value={formData.cpf} onChange={handleChange} className="input-field w-full" placeholder="000.000.000-00" />
                    </div>
                    <div className="form-group">
                        <label className="block text-sm font-medium text-gold/80 mb-2 uppercase tracking-wide">Telefone / WhatsApp</label>
                        <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="input-field w-full" placeholder="(00) 00000-0000" />
                    </div>
                </div>

                <div className="form-group">
                    <label className="block text-sm font-medium text-gold/80 mb-2 uppercase tracking-wide">Site / Portfólio / Redes Sociais</label>
                    <input type="text" name="website" value={formData.website} onChange={handleChange} className="input-field w-full" placeholder="https://..." />
                </div>

                <div className="form-group">
                    <label className="block text-sm font-medium text-gold/80 mb-2 uppercase tracking-wide">Biografia / Apresentação</label>
                    <textarea name="bio" rows={5} value={formData.bio} onChange={handleChange} className="input-field w-full resize-y" placeholder="Conte um pouco sobre sua trajetória cultural..." />
                </div>

                <div className="flex justify-end pt-4 border-t border-white/5">
                    <button type="submit" disabled={loading} className="btn-primary px-8 py-3 text-lg">
                        {loading ? "Salvando..." : "Salvar Alterações"}
                    </button>
                </div>
            </form>
        </div>
    );
};
