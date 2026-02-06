import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../api/client";
import { useAuth } from "../auth/AuthContext";

export const RegisterProducer: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    // Gets tenant from URL if needed, or defaults to context/props if passed.
    // For simplicity, we assume we might be at a root level or known tenant. 
    // Ideally, this page might need to know WHICH tenant (City) to register for.
    // We'll use a hardcoded tenant ID or query param for now, or let user select.
    // Assuming access via a City's portal, we might grab tenantId from URL/Context.

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        cpf: "",
        phone: "",
        bio: "",
        website: ""
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // We need a tenantId to register under. 
    // Option 1: Pass via query param ?tenantId=...
    // Option 2: Hardcode for the main city if there's only one.
    // Option 3: Let user select (complex).
    // Let's grab from URL params for flexibility.
    const queryParams = new URLSearchParams(window.location.search);
    const tenantId = queryParams.get("tenantId") || "";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError("Senhas não conferem");
            return;
        }
        if (!tenantId) {
            setError("Erro: Identificador da Cidade não encontrado. Acesse através do portal da cidade.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            await api.post("/auth/register", {
                ...formData,
                role: "PRODUCER",
                tenantId
            });
            alert("Cadastro realizado com sucesso! Faça login para continuar.");
            navigate("/login");
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || "Erro ao realizar cadastro");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #1a1108 0%, #2a1810 100%)",
            padding: "2rem"
        }}>
            <div style={{
                width: "100%",
                maxWidth: "500px",
                background: "rgba(30, 30, 30, 0.95)",
                padding: "2rem",
                borderRadius: "1rem",
                border: "1px solid #d4af37",
                boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
            }}>
                <h2 style={{ color: "#d4af37", textAlign: "center", marginBottom: "1rem", fontSize: "1.8rem" }}>
                    Sou Produtor Cultural
                </h2>
                <p style={{ color: "#aaa", textAlign: "center", marginBottom: "2rem" }}>
                    Cadastre-se para submeter e gerenciar seus projetos culturais.
                </p>

                {error && <div style={{ background: "rgba(239, 68, 68, 0.2)", color: "#ef4444", padding: "0.75rem", borderRadius: "0.5rem", marginBottom: "1rem", textAlign: "center" }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <input type="text" name="name" placeholder="Nome Completo / Razão Social" required value={formData.name} onChange={handleChange} className="input" style={inputStyle} />
                    <input type="text" name="cpf" placeholder="CPF / CNPJ" required value={formData.cpf} onChange={handleChange} className="input" style={inputStyle} />
                    <input type="email" name="email" placeholder="E-mail" required value={formData.email} onChange={handleChange} className="input" style={inputStyle} />
                    <input type="text" name="phone" placeholder="Telefone / WhatsApp" value={formData.phone} onChange={handleChange} className="input" style={inputStyle} />
                    <input type="text" name="website" placeholder="Site / Portfólio (opcional)" value={formData.website} onChange={handleChange} className="input" style={inputStyle} />

                    <textarea name="bio" rows={3} placeholder="Breve biografia ou descrição da atuação cultural..." value={formData.bio} onChange={handleChange} className="input" style={{ ...inputStyle, resize: "vertical" }} />

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <input type="password" name="password" placeholder="Senha" required value={formData.password} onChange={handleChange} className="input" style={inputStyle} />
                        <input type="password" name="confirmPassword" placeholder="Confirmar Senha" required value={formData.confirmPassword} onChange={handleChange} className="input" style={inputStyle} />
                    </div>

                    <button type="submit" disabled={loading} style={{
                        background: "#d4af37",
                        color: "#1a1108",
                        fontWeight: "bold",
                        padding: "1rem",
                        border: "none",
                        borderRadius: "0.5rem",
                        cursor: "pointer",
                        marginTop: "1rem",
                        fontSize: "1rem"
                    }}>
                        {loading ? "Cadastrando..." : "Cadastrar como Produtor"}
                    </button>
                </form>

                <p style={{ textAlign: "center", marginTop: "1.5rem", color: "#888" }}>
                    Já possui conta? <span onClick={() => navigate("/login")} style={{ color: "#d4af37", cursor: "pointer", textDecoration: "underline" }}>Fazer Login</span>
                </p>
            </div>
        </div>
    );
};

const inputStyle = {
    width: "100%",
    padding: "0.75rem",
    background: "rgba(0,0,0,0.3)",
    border: "1px solid #555",
    borderRadius: "0.5rem",
    color: "#fff",
    fontSize: "0.95rem"
};

export default RegisterProducer;
