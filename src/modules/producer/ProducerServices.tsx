import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle, MessageSquare, Mic, Ear, ShieldCheck, ArrowRight, PlayCircle } from "lucide-react";

type ServicePackage = {
    id: string;
    icon: React.ReactNode;
    title: string;
    description: string;
    price: string;
    features: string[];
    popular?: boolean;
};

export const ProducerServices: React.FC = () => {
    // Mock Services
    const services: ServicePackage[] = [
        {
            id: "libras",
            icon: <Ear size={40} color="#d4af37" />,
            title: "Tradução em Libras",
            description: "Torne seus vídeos e transmissões acessíveis para a comunidade surda.",
            price: "A partir de R$ 350,00",
            features: ["Janela de intérprete PIP", "Sincronia labial perfeita", "Entrega em até 48h", "Certificado de Acessibilidade"],
            popular: true
        },
        {
            id: "audio",
            icon: <Mic size={40} color="#d4af37" />,
            title: "Audiodescrição (AD)",
            description: "Narração descritiva de cenas, ambientes e obras para deficientes visuais.",
            price: "A partir de R$ 200,00/min",
            features: ["Roteiro técnico especializado", "Narração humanizada (vários idiomas)", "Mixagem de som inclusa", "Relatório LBI"],
        },
        {
            id: "rouanet",
            icon: <ShieldCheck size={40} color="#d4af37" />,
            title: "Consultoria Rouanet",
            description: "Apoio jurídico e técnico para prestação de contas e aprovação de projetos.",
            price: "Sob Consulta",
            features: ["Análise de documentação", "Adequação à IN 01/2023", "Defesa técnica", "Emissão de Laudos"],
        }
    ];

    return (
        <div className="producer-services">
            <div style={{ textAlign: "center", marginBottom: "4rem" }}>
                <h1 style={{ fontSize: "2.5rem", color: "#d4af37", marginBottom: "1rem" }}>Serviços Especializados</h1>
                <p style={{ maxWidth: "700px", margin: "0 auto", opacity: 0.7, fontSize: "1.1rem", lineHeight: "1.6" }}>
                    Não tem equipe técnica? Nós fazemos para você.
                    Contrate os serviços de acessibilidade obrigatórios por lei e garanta a aprovação do seu projeto.
                </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
                {services.map(service => (
                    <div key={service.id} style={{
                        background: "linear-gradient(145deg, #1e1e24, #15151a)",
                        borderRadius: "1.5rem",
                        padding: "2.5rem",
                        border: service.popular ? "1px solid #d4af37" : "1px solid rgba(255,255,255,0.05)",
                        position: "relative",
                        display: "flex",
                        flexDirection: "column"
                    }}>
                        {service.popular && (
                            <div style={{ position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%)", background: "#d4af37", color: "#000", padding: "0.3rem 1rem", borderRadius: "1rem", fontSize: "0.8rem", fontWeight: "bold", textTransform: "uppercase" }}>
                                Mais Contratado
                            </div>
                        )}

                        <div style={{ marginBottom: "1.5rem", background: "rgba(212,175,55,0.1)", width: "fit-content", padding: "1rem", borderRadius: "1rem" }}>
                            {service.icon}
                        </div>

                        <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{service.title}</h3>
                        <p style={{ opacity: 0.6, lineHeight: "1.5", marginBottom: "2rem", flex: 1 }}>{service.description}</p>

                        <div style={{ marginBottom: "2rem" }}>
                            {service.features.map((feat, idx) => (
                                <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "0.8rem", fontSize: "0.9rem" }}>
                                    <CheckCircle size={16} color="#4cd964" />
                                    <span style={{ opacity: 0.8 }}>{feat}</span>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: "auto" }}>
                            <div style={{ fontSize: "0.9rem", opacity: 0.5, marginBottom: "0.5rem" }}>Investimento</div>
                            <div style={{ fontSize: "1.3rem", fontWeight: "bold", color: "#fff", marginBottom: "1.5rem" }}>{service.price}</div>

                            <button
                                onClick={() => window.open(`https://wa.me/5511999999999?text=Ol%C3%A1%2C%20gostaria%20de%20um%20or%C3%A7amento%20para%20${encodeURIComponent(service.title)}.`, "_blank")}
                                style={{
                                    width: "100%",
                                    padding: "1rem",
                                    background: service.popular ? "#d4af37" : "rgba(255,255,255,0.05)",
                                    color: service.popular ? "#000" : "#fff",
                                    border: service.popular ? "none" : "1px solid rgba(255,255,255,0.1)",
                                    borderRadius: "0.8rem",
                                    fontWeight: "bold",
                                    cursor: "pointer",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    transition: "all 0.2s"
                                }}>
                                Solicitar Orçamento <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: "4rem", background: "rgba(212,175,55,0.05)", borderRadius: "1rem", padding: "3rem", display: "flex", alignItems: "center", gap: "2rem", border: "1px dashed rgba(212,175,55,0.3)" }}>
                <div style={{ background: "#d4af37", borderRadius: "50%", padding: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <MessageSquare size={32} color="#000" />
                </div>
                <div>
                    <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem", color: "#d4af37" }}>Precisa de algo personalizado?</h3>
                    <p style={{ opacity: 0.8 }}>
                        Nossa equipe também desenvolve projetos de acessibilidade física, arquitetônica e treinamento de staff.
                        Fale direto com nosso especialista técnico.
                    </p>
                </div>
                <button
                    onClick={() => window.open("https://wa.me/5511999999999?text=Ol%C3%A1%2C%20tenho%20interesse%20em%20consultoria%20personalizada%20para%20meu%20projeto%20cultural.", "_blank")}
                    style={{ marginLeft: "auto", whiteSpace: "nowrap", padding: "1rem 2rem", background: "transparent", border: "1px solid #d4af37", color: "#d4af37", borderRadius: "0.5rem", fontWeight: "bold", cursor: "pointer" }}>
                    Falar no WhatsApp
                </button>
            </div>
        </div>
    );
};
