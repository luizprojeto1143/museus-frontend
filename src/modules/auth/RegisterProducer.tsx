import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../api/client";
import { User, Building2, Mail, Phone, Globe, Lock, ArrowRight, Check } from "lucide-react";

interface City {
    id: string;
    name: string;
    type: string;
}

export const RegisterProducer: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

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

    const [selectedCity, setSelectedCity] = useState<string>("");
    const [cities, setCities] = useState<City[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);

    // Get tenantId from URL if provided (for linked registration via city portal)
    const queryParams = new URLSearchParams(window.location.search);
    const urlTenantId = queryParams.get("tenantId") || "";

    // Load available cities for optional linking
    useEffect(() => {
        api.get("/tenants/public")
            .then(res => {
                const cityTenants = res.data.filter((t: City) => t.type === "CITY");
                setCities(cityTenants);
                if (urlTenantId) {
                    setSelectedCity(urlTenantId);
                }
            })
            .catch(console.error);
    }, [urlTenantId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError("Senhas não conferem");
            return;
        }

        setLoading(true);
        setError("");

        try {
            await api.post("/auth/register-producer", {
                ...formData,
                role: "PRODUCER",
                parentTenantId: selectedCity || null // Optional city link
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

    const nextStep = () => {
        if (step === 1) {
            if (!formData.name || !formData.cpf || !formData.email) {
                setError("Preencha todos os campos obrigatórios");
                return;
            }
            setError("");
        }
        setStep(s => s + 1);
    };

    const prevStep = () => setStep(s => s - 1);

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #1a1108 0%, #2c1e10 50%, #1a1108 100%)",
            padding: "2rem"
        }}>
            <div style={{
                width: "100%",
                maxWidth: "520px",
                background: "rgba(44, 30, 16, 0.98)",
                padding: "2.5rem",
                borderRadius: "1.5rem",
                border: "1px solid rgba(212, 175, 55, 0.3)",
                boxShadow: "0 25px 80px rgba(0,0,0,0.6), 0 0 40px rgba(212, 175, 55, 0.1)"
            }}>
                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <div style={{
                        width: "80px",
                        height: "80px",
                        background: "linear-gradient(135deg, #d4af37 0%, #f5d769 100%)",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 1.5rem",
                        boxShadow: "0 10px 30px rgba(212, 175, 55, 0.3)"
                    }}>
                        <User size={40} color="#1a1108" />
                    </div>
                    <h2 style={{ color: "#d4af37", marginBottom: "0.5rem", fontSize: "1.8rem", fontWeight: "bold" }}>
                        🎬 Sou Produtor Cultural
                    </h2>
                    <p style={{ color: "#B0A090", fontSize: "0.95rem" }}>
                        Cadastre-se para submeter projetos e gerenciar sua produção cultural
                    </p>
                </div>

                {/* Progress Steps */}
                <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginBottom: "2rem" }}>
                    {[1, 2, 3].map(s => (
                        <div key={s} style={{
                            width: s === step ? "3rem" : "2rem",
                            height: "4px",
                            background: s <= step ? "#d4af37" : "#334155",
                            borderRadius: "2px",
                            transition: "all 0.3s"
                        }} />
                    ))}
                </div>

                {error && (
                    <div style={{
                        background: "rgba(239, 68, 68, 0.15)",
                        color: "#ef4444",
                        padding: "1rem",
                        borderRadius: "0.75rem",
                        marginBottom: "1.5rem",
                        textAlign: "center",
                        border: "1px solid rgba(239, 68, 68, 0.3)"
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Step 1: Basic Info */}
                    {step === 1 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <h3 style={{ color: "#e2e8f0", fontSize: "1.1rem", marginBottom: "0.5rem" }}>
                                📋 Dados Básicos
                            </h3>

                            <div style={inputWrapperStyle}>
                                <User size={18} color="#64748b" />
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Nome Completo / Razão Social *"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    style={inputStyle}
                                />
                            </div>

                            <div style={inputWrapperStyle}>
                                <Building2 size={18} color="#64748b" />
                                <input
                                    type="text"
                                    name="cpf"
                                    placeholder="CPF / CNPJ *"
                                    required
                                    value={formData.cpf}
                                    onChange={handleChange}
                                    style={inputStyle}
                                />
                            </div>

                            <div style={inputWrapperStyle}>
                                <Mail size={18} color="#64748b" />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="E-mail *"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    style={inputStyle}
                                />
                            </div>

                            <div style={inputWrapperStyle}>
                                <Phone size={18} color="#64748b" />
                                <input
                                    type="text"
                                    name="phone"
                                    placeholder="Telefone / WhatsApp"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    style={inputStyle}
                                />
                            </div>

                            <button type="button" onClick={nextStep} style={primaryButtonStyle}>
                                Continuar <ArrowRight size={18} />
                            </button>
                        </div>
                    )}

                    {/* Step 2: Profile & City */}
                    {step === 2 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <h3 style={{ color: "#e2e8f0", fontSize: "1.1rem", marginBottom: "0.5rem" }}>
                                🎭 Perfil e Vínculo
                            </h3>

                            <div style={inputWrapperStyle}>
                                <Globe size={18} color="#64748b" />
                                <input
                                    type="text"
                                    name="website"
                                    placeholder="Site / Portfólio (opcional)"
                                    value={formData.website}
                                    onChange={handleChange}
                                    style={inputStyle}
                                />
                            </div>

                            <textarea
                                name="bio"
                                rows={3}
                                placeholder="Breve biografia ou descrição da atuação cultural..."
                                value={formData.bio}
                                onChange={handleChange}
                                style={{
                                    ...inputStyle,
                                    padding: "1rem",
                                    resize: "vertical",
                                    background: "rgba(15, 23, 42, 0.8)",
                                    border: "1px solid #334155",
                                    borderRadius: "0.75rem"
                                }}
                            />

                            {/* City Selector */}
                            <div style={{
                                background: "rgba(212, 175, 55, 0.05)",
                                border: "1px solid rgba(212, 175, 55, 0.2)",
                                borderRadius: "0.75rem",
                                padding: "1rem"
                            }}>
                                <label style={{ display: "block", color: "#d4af37", fontWeight: "600", marginBottom: "0.5rem" }}>
                                    🏙️ Vincular a uma Cidade (opcional)
                                </label>
                                <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "0.75rem" }}>
                                    Ao vincular, seus projetos aparecerão nos relatórios da Secretaria de Cultura.
                                </p>
                                <select
                                    value={selectedCity}
                                    onChange={e => setSelectedCity(e.target.value)}
                                    style={{
                                        width: "100%",
                                        padding: "0.75rem",
                                        background: "#0f172a",
                                        border: "1px solid #334155",
                                        borderRadius: "0.5rem",
                                        color: "#e2e8f0",
                                        fontSize: "0.95rem"
                                    }}
                                >
                                    <option value="">Cadastro independente (sem vínculo)</option>
                                    {cities.map(city => (
                                        <option key={city.id} value={city.id}>{city.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: "flex", gap: "1rem" }}>
                                <button type="button" onClick={prevStep} style={secondaryButtonStyle}>
                                    Voltar
                                </button>
                                <button type="button" onClick={nextStep} style={{ ...primaryButtonStyle, flex: 1 }}>
                                    Continuar <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Password */}
                    {step === 3 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <h3 style={{ color: "#e2e8f0", fontSize: "1.1rem", marginBottom: "0.5rem" }}>
                                🔐 Segurança
                            </h3>

                            <div style={inputWrapperStyle}>
                                <Lock size={18} color="#64748b" />
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Senha *"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    style={inputStyle}
                                />
                            </div>

                            <div style={inputWrapperStyle}>
                                <Lock size={18} color="#64748b" />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirmar Senha *"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    style={inputStyle}
                                />
                            </div>

                            {/* Summary */}
                            <div style={{
                                background: "rgba(59, 130, 246, 0.1)",
                                border: "1px solid rgba(59, 130, 246, 0.3)",
                                borderRadius: "0.75rem",
                                padding: "1rem"
                            }}>
                                <h4 style={{ color: "#3b82f6", marginBottom: "0.5rem" }}>Resumo do Cadastro</h4>
                                <div style={{ fontSize: "0.9rem", color: "#94a3b8" }}>
                                    <div><strong>Nome:</strong> {formData.name}</div>
                                    <div><strong>E-mail:</strong> {formData.email}</div>
                                    <div><strong>Vínculo:</strong> {selectedCity ? cities.find(c => c.id === selectedCity)?.name : "Independente"}</div>
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: "1rem" }}>
                                <button type="button" onClick={prevStep} style={secondaryButtonStyle}>
                                    Voltar
                                </button>
                                <button type="submit" disabled={loading} style={{ ...primaryButtonStyle, flex: 1 }}>
                                    {loading ? "Cadastrando..." : (
                                        <>
                                            <Check size={18} /> Finalizar Cadastro
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </form>

                <p style={{ textAlign: "center", marginTop: "2rem", color: "#64748b" }}>
                    Já possui conta?{" "}
                    <span
                        onClick={() => navigate("/login")}
                        style={{ color: "#d4af37", cursor: "pointer", textDecoration: "underline" }}
                    >
                        Fazer Login
                    </span>
                </p>
            </div>
        </div>
    );
};

const inputWrapperStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    background: "rgba(26, 17, 8, 0.8)",
    border: "1px solid #463420",
    borderRadius: "0.75rem",
    padding: "0 1rem"
};

const inputStyle: React.CSSProperties = {
    flex: 1,
    padding: "0.9rem 0",
    background: "transparent",
    border: "none",
    color: "#EAE0D5",
    fontSize: "0.95rem",
    outline: "none"
};

const primaryButtonStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    background: "linear-gradient(135deg, #d4af37 0%, #f5d769 100%)",
    color: "#1a1108",
    fontWeight: "bold",
    padding: "1rem",
    border: "none",
    borderRadius: "0.75rem",
    cursor: "pointer",
    fontSize: "1rem",
    marginTop: "0.5rem",
    transition: "all 0.3s"
};

const secondaryButtonStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    background: "transparent",
    color: "#B0A090",
    fontWeight: "600",
    padding: "1rem",
    border: "1px solid #463420",
    borderRadius: "0.75rem",
    cursor: "pointer",
    fontSize: "0.95rem"
};

export default RegisterProducer;
