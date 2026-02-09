import React, { useEffect, useState } from "react";
import { api } from "../../api/client";
import { CheckCircle, MessageSquare, Mic, Ear, ShieldCheck, ArrowRight, PlayCircle, Star, Phone } from "lucide-react";
import { EmptyState } from "../../components/EmptyState";

type Provider = {
    id: string;
    name: string;
    description: string;
    email: string;
    phone: string;
    services: string[];
    rating: number;
    completedJobs: number;
};

export const ProducerServices: React.FC = () => {
    const [providers, setProviders] = useState<Provider[]>([]);
    const [loading, setLoading] = useState(true);

    const serviceLabels: Record<string, string> = {
        "LIBRAS_INTERPRETATION": "Libras",
        "AUDIO_DESCRIPTION": "Audiodescrição",
        "CAPTIONING": "Legendagem",
        "BRAILLE": "Braille",
        "TACTILE_MODEL": "Maquete Tátil",
        "EASY_READING": "Leitura Simples"
    };

    const serviceIcons: Record<string, React.ReactNode> = {
        "LIBRAS_INTERPRETATION": <Ear size={40} color="#d4af37" />,
        "AUDIO_DESCRIPTION": <Mic size={40} color="#d4af37" />,
        "CAPTIONING": <MessageSquare size={40} color="#d4af37" />,
        "BRAILLE": <ShieldCheck size={40} color="#d4af37" />,
        "TACTILE_MODEL": <PlayCircle size={40} color="#d4af37" />,
        "EASY_READING": <ArrowRight size={40} color="#d4af37" />
    };

    useEffect(() => {
        api.get("/providers")
            .then(res => setProviders(res.data))
            .catch(err => console.error("Error fetching providers", err))
            .finally(() => setLoading(false));
    }, []);

    const handleWhatsApp = (provider: Provider) => {
        const message = `Olá ${provider.name}, vi seu perfil na plataforma Museus e gostaria de um orçamento para serviços de acessibilidade.`;
        const phone = provider.phone ? provider.phone.replace(/\D/g, "") : "";
        if (phone) {
            window.open(`https://wa.me/55${phone}?text=${encodeURIComponent(message)}`, "_blank");
        } else {
            alert("Telefone não cadastrado para este prestador.");
        }
    };

    return (
        <div className="producer-services">
            <div style={{ textAlign: "center", marginBottom: "4rem" }}>
                <h1 style={{ fontSize: "2.5rem", color: "#d4af37", marginBottom: "1rem" }}>Marketplace de Acessibilidade</h1>
                <p style={{ maxWidth: "700px", margin: "0 auto", opacity: 0.7, fontSize: "1.1rem", lineHeight: "1.6" }}>
                    Encontre prestadores homologados para tornar seu projeto acessível e cumprir as exigências legais.
                    Contrate direto pela plataforma.
                </p>
            </div>

            {loading ? (
                <p style={{ textAlign: "center", opacity: 0.7 }}>Carregando prestadores...</p>
            ) : providers.length === 0 ? (
                <EmptyState
                    title="Nenhum prestador disponível"
                    description="No momento não há prestadores cadastrados nesta categoria. Tente novamente mais tarde."
                    icon={ShieldCheck}
                />
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
                    {providers.map(provider => (
                        <div key={provider.id} style={{
                            background: "linear-gradient(145deg, #1e1e24, #15151a)",
                            borderRadius: "1.5rem",
                            padding: "2rem",
                            border: "1px solid rgba(255,255,255,0.05)",
                            display: "flex",
                            flexDirection: "column",
                            gap: "1rem"
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div>
                                    <h3 style={{ fontSize: "1.3rem", fontWeight: "bold", color: "#fff" }}>{provider.name}</h3>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.9rem", color: "#ffd700", marginTop: "0.2rem" }}>
                                        <Star size={14} fill="#ffd700" />
                                        <span>{provider.rating?.toFixed(1) || "Novo"}</span>
                                        <span style={{ opacity: 0.5, color: "#fff", marginLeft: "0.5rem" }}>({provider.completedJobs} jobs)</span>
                                    </div>
                                </div>
                                <div style={{ background: "rgba(212,175,55,0.1)", padding: "0.8rem", borderRadius: "50%" }}>
                                    {serviceIcons[provider.services[0]] || <ShieldCheck size={24} color="#d4af37" />}
                                </div>
                            </div>

                            <p style={{ opacity: 0.8, fontSize: "0.95rem", lineHeight: "1.5", color: "#ddd" }}>
                                {provider.description || "Prestador especializado em acessibilidade cultural."}
                            </p>

                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
                                {provider.services.map(s => (
                                    <span key={s} style={{
                                        background: "rgba(255,255,255,0.05)",
                                        padding: "0.3rem 0.8rem",
                                        borderRadius: "1rem",
                                        fontSize: "0.8rem",
                                        border: "1px solid rgba(255,255,255,0.1)"
                                    }}>
                                        {serviceLabels[s] || s}
                                    </span>
                                ))}
                            </div>

                            <div style={{ marginTop: "auto", paddingTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                                <button
                                    onClick={() => handleWhatsApp(provider)}
                                    style={{
                                        width: "100%",
                                        padding: "0.8rem",
                                        background: "#25D366", // WhatsApp Green
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "0.5rem",
                                        fontWeight: "bold",
                                        cursor: "pointer",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        gap: "0.5rem",
                                        transition: "all 0.2s"
                                    }}>
                                    <Phone size={18} /> Contatar no WhatsApp
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
