import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Smartphone, Globe, Ear, Eye, Award, ArrowRight, Layout, Menu, X, Mail, Instagram, MapPin } from "lucide-react";
import { ContactForm } from "./ContactForm";

export const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Helper para scroll suave que funciona em SPA
    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
            setMobileMenuOpen(false);
        }
    };

    return (
        <div className="landing-page" style={{ background: "#0f0a06", minHeight: "100vh", color: "#f5e6d3", fontFamily: "'Georgia', serif", overflowX: "hidden" }}>

            {/* HEADER FIXO */}
            <nav style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1rem 2rem",
                borderBottom: "1px solid rgba(212,175,55,0.2)",
                background: "rgba(15, 10, 6, 0.95)",
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                backdropFilter: "blur(10px)"
            }}>
                <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#d4af37", display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }} onClick={() => window.scrollTo(0, 0)}>
                    <Layout size={28} /> Cultura Viva
                </div>

                {/* Desktop Menu */}
                <div style={{ display: "flex", gap: "2rem", fontSize: "0.95rem" }} className="desktop-menu">
                    <button onClick={() => scrollToSection("solucoes")} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontFamily: "sans-serif" }}>Soluções</button>
                    <button onClick={() => scrollToSection("acessibilidade")} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontFamily: "sans-serif" }}>Acessibilidade</button>
                    <button onClick={() => scrollToSection("casos")} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontFamily: "sans-serif" }}>Benefícios</button>
                </div>

                <div style={{ display: "flex", gap: "1rem" }} className="desktop-actions">
                    <button
                        onClick={() => navigate("/select-museum")}
                        style={{ padding: "0.5rem 1rem", border: "1px solid #d4af37", background: "transparent", color: "#d4af37", borderRadius: "0.5rem", cursor: "pointer", fontFamily: "sans-serif", fontSize: "0.9rem" }}
                    >
                        Sou Visitante
                    </button>
                    <button
                        onClick={() => navigate("/login")}
                        style={{ padding: "0.5rem 1.5rem", background: "#d4af37", color: "#1a1108", borderRadius: "0.5rem", cursor: "pointer", fontWeight: "bold", border: "none", fontFamily: "sans-serif", fontSize: "0.9rem" }}
                    >
                        Entrar
                    </button>
                </div>

                {/* Mobile Toggle */}
                <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ background: "none", border: "none", color: "#d4af37" }}>
                    {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </nav>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div style={{
                    position: "fixed", top: "70px", left: 0, right: 0, bottom: 0, background: "#1a1108", zIndex: 999,
                    display: "flex", flexDirection: "column", padding: "2rem", gap: "1.5rem"
                }}>
                    <button onClick={() => scrollToSection("solucoes")} style={{ background: "none", border: "none", color: "#d4af37", fontSize: "1.2rem", textAlign: "left" }}>Soluções</button>
                    <button onClick={() => scrollToSection("acessibilidade")} style={{ background: "none", border: "none", color: "#d4af37", fontSize: "1.2rem", textAlign: "left" }}>Acessibilidade</button>
                    <button onClick={() => scrollToSection("casos")} style={{ background: "none", border: "none", color: "#d4af37", fontSize: "1.2rem", textAlign: "left" }}>Benefícios</button>
                    <hr style={{ borderColor: "rgba(255,255,255,0.1)" }} />
                    <button onClick={() => navigate("/sou-produtor")} style={{ padding: "1rem", background: "#d4af37", color: "#000", borderRadius: "0.5rem", fontWeight: "bold" }}>Sou Produtor Cultural</button>
                    <button onClick={() => navigate("/select-museum")} style={{ padding: "1rem", border: "1px solid #d4af37", background: "transparent", color: "#d4af37", borderRadius: "0.5rem" }}>Sou Visitante</button>
                </div>
            )}

            {/* HERO SECTION */}
            <header style={{
                textAlign: "center",
                padding: "10rem 2rem 6rem",
                background: "radial-gradient(circle at 50% 30%, rgba(212,175,55,0.15), transparent 60%), linear-gradient(to bottom, #0f0a06 0%, #1a1108 100%)",
                minHeight: "80vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center"
            }}>
                <div style={{
                    padding: "0.5rem 1rem",
                    border: "1px solid rgba(212,175,55,0.3)",
                    borderRadius: "2rem",
                    marginBottom: "2rem",
                    display: "inline-block",
                    fontSize: "0.8rem",
                    letterSpacing: "1px",
                    color: "#d4af37",
                    background: "rgba(212,175,55,0.05)"
                }}>
                    PLATAFORMA DE GESTÃO CULTURAL 4.0
                </div>

                <h1 style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)", marginBottom: "1.5rem", lineHeight: "1.1", fontWeight: "bold" }}>
                    Transforme Patrimônio <br />
                    <span style={{
                        background: "linear-gradient(to right, #d4af37, #f9eac3, #d4af37)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent"
                    }}>
                        em Experiência Viva.
                    </span>
                </h1>

                <p style={{ maxWidth: "700px", margin: "0 auto 3rem", fontSize: "1.2rem", opacity: 0.8, lineHeight: "1.6", fontFamily: "'Inter', sans-serif" }}>
                    A solução completa para digitalizar museus e cidades históricas.
                    Engaje visitantes com gamificação, cumpra a Lei Rouanet com excelência e tenha controle total do seu acervo.
                </p>

                <div style={{ display: "flex", gap: "1rem", flexDirection: "row", flexWrap: "wrap", justifyContent: "center" }}>
                    <button
                        onClick={() => navigate("/sou-produtor")}
                        style={{
                            padding: "1rem 2.5rem",
                            background: "linear-gradient(135deg, #d4af37, #b8941f)",
                            color: "#1a1108",
                            borderRadius: "0.5rem",
                            fontSize: "1.1rem",
                            fontWeight: "bold",
                            border: "none",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            boxShadow: "0 10px 30px rgba(212,175,55,0.2)",
                            transition: "transform 0.2s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                    >
                        Começar Agora <ArrowRight size={20} />
                    </button>

                    <button
                        onClick={() => scrollToSection("solucoes")}
                        style={{
                            padding: "1rem 2.5rem",
                            background: "rgba(255,255,255,0.05)",
                            color: "#f5e6d3",
                            borderRadius: "0.5rem",
                            fontSize: "1.1rem",
                            border: "1px solid rgba(255,255,255,0.1)",
                            cursor: "pointer",
                            fontFamily: "sans-serif"
                        }}
                    >
                        Conhecer Soluções
                    </button>
                </div>
            </header>

            {/* FEATURES GRID */}
            <section id="solucoes" style={{ padding: "6rem 2rem", maxWidth: "1200px", margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: "4rem" }}>
                    <h2 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>Tecnologia a Serviço da Cultura</h2>
                    <p style={{ opacity: 0.7, fontFamily: "sans-serif" }}>Tudo o que você precisa para modernizar sua instituição.</p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
                    <div className="feature-card" style={{ padding: "2.5rem", background: "#150f0a", borderRadius: "1.5rem", border: "1px solid rgba(212,175,55,0.1)" }}>
                        <Award size={48} color="#d4af37" style={{ marginBottom: "1.5rem" }} />
                        <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Gamificação Real</h3>
                        <p style={{ opacity: 0.7, fontFamily: "sans-serif", lineHeight: "1.6" }}>
                            Sistema de XP, conquistas e níveis que transforma a visitação em uma jornada engajadora.
                            Aumente a retenção e o interesse do público jovem com desafios interativos.
                        </p>
                    </div>
                    <div className="feature-card" style={{ padding: "2.5rem", background: "#150f0a", borderRadius: "1.5rem", border: "1px solid rgba(212,175,55,0.1)" }}>
                        <Smartphone size={48} color="#d4af37" style={{ marginBottom: "1.5rem" }} />
                        <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Web App (PWA)</h3>
                        <p style={{ opacity: 0.7, fontFamily: "sans-serif", lineHeight: "1.6" }}>
                            Sem necessidade de download nas lojas. Seus visitantes acessam instantaneamente o guia multimídia
                            através de QR Codes inteligentes espalhados pelo acervo.
                        </p>
                    </div>
                    <div className="feature-card" style={{ padding: "2.5rem", background: "#150f0a", borderRadius: "1.5rem", border: "1px solid rgba(212,175,55,0.1)" }}>
                        <Globe size={48} color="#d4af37" style={{ marginBottom: "1.5rem" }} />
                        <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Turismo Inteligente</h3>
                        <p style={{ opacity: 0.7, fontFamily: "sans-serif", lineHeight: "1.6" }}>
                            Mapas interativos, roteiros sugeridos por IA e integração com a economia local.
                            Conecte seu museu ao ecossistema da cidade.
                        </p>
                    </div>
                </div>
            </section>

            {/* ACCESSIBILITY SECTION */}
            <section id="acessibilidade" style={{ padding: "8rem 2rem", background: "#22150d", position: "relative", overflow: "hidden" }}>
                {/* Background Ornament */}
                <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0.05, background: "url('https://www.transparenttextures.com/patterns/cubes.png')" }}></div>

                <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "5rem", alignItems: "center", position: "relative" }}>
                    <div>
                        <span style={{ color: "#d4af37", fontWeight: "bold", textTransform: "uppercase", fontSize: "0.9rem", letterSpacing: "2px" }}>IN MinC 01/2023</span>
                        <h2 style={{ fontSize: "3rem", margin: "1rem 0", lineHeight: "1.1" }}>Adequação Total à <br />Lei Rouanet</h2>
                        <p style={{ fontSize: "1.1rem", opacity: 0.8, marginBottom: "2.5rem", lineHeight: "1.6", fontFamily: "sans-serif" }}>
                            Garanta a aprovação da sua prestação de contas. Nossa plataforma já vem com a suíte técnica exigida, e oferecemos a produção de conteúdo como serviço.
                        </p>

                        <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                            <li style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                <div style={{ background: "rgba(212,175,55,0.1)", p: "0.5rem", borderRadius: "50%", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}><Ear size={20} color="#d4af37" /></div>
                                <div>
                                    <strong style={{ display: "block", fontSize: "1.1rem" }}>Libras (Língua de Sinais)</strong>
                                    <span style={{ fontSize: "0.9rem", opacity: 0.6, fontFamily: "sans-serif" }}>Janela de vídeo integrada ao player</span>
                                </div>
                            </li>
                            <li style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                <div style={{ background: "rgba(212,175,55,0.1)", p: "0.5rem", borderRadius: "50%", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}><Eye size={20} color="#d4af37" /></div>
                                <div>
                                    <strong style={{ display: "block", fontSize: "1.1rem" }}>Audiodescrição</strong>
                                    <span style={{ fontSize: "0.9rem", opacity: 0.6, fontFamily: "sans-serif" }}>Narração descritiva para deficientes visuais</span>
                                </div>
                            </li>
                            <li style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                <div style={{ background: "rgba(212,175,55,0.1)", p: "0.5rem", borderRadius: "50%", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}><Shield size={20} color="#d4af37" /></div>
                                <div>
                                    <strong style={{ display: "block", fontSize: "1.1rem" }}>Relatórios Automáticos</strong>
                                    <span style={{ fontSize: "0.9rem", opacity: 0.6, fontFamily: "sans-serif" }}>Gere comprovantes de acessibilidade em 1 clique</span>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div style={{
                        background: "linear-gradient(145deg, #2a1810, #1a1108)",
                        padding: "3rem",
                        borderRadius: "2rem",
                        border: "1px solid rgba(212,175,55,0.3)",
                        textAlign: "center",
                        boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
                    }}>
                        <h3 style={{ color: "#d4af37", marginBottom: "1rem", fontSize: "1.5rem" }}>Precisa de Ajuda?</h3>
                        <p style={{ marginBottom: "2rem", fontFamily: "sans-serif", opacity: 0.8 }}>
                            Nossa equipe de especialistas produz os vídeos de Libras e os áudios de descrição para o seu acervo.
                        </p>
                        <button onClick={() => scrollToSection("contato")} style={{
                            padding: "1rem 2rem",
                            background: "transparent",
                            border: "1px solid #d4af37",
                            color: "#d4af37",
                            borderRadius: "0.5rem",
                            cursor: "pointer",
                            width: "100%",
                            fontWeight: "bold",
                            fontSize: "1rem",
                            transition: "all 0.2s"
                        }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "#d4af37"; e.currentTarget.style.color = "#000" }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#d4af37" }}
                        >
                            Falar com Consultor
                        </button>
                    </div>
                </div>
            </section>

            {/* CASES / BENEFITS */}
            <section id="casos" style={{ padding: "6rem 2rem", maxWidth: "1200px", margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                    <h2 style={{ fontSize: "2.5rem" }}>Quem usa, recomenda</h2>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "2rem", textAlign: "center" }}>
                    <div>
                        <h3 style={{ fontSize: "3rem", color: "#d4af37", marginBottom: "0.5rem" }}>+40%</h3>
                        <p style={{ fontFamily: "sans-serif", opacity: 0.7 }}>Aumento no engajamento jovem</p>
                    </div>
                    <div>
                        <h3 style={{ fontSize: "3rem", color: "#d4af37", marginBottom: "0.5rem" }}>100%</h3>
                        <p style={{ fontFamily: "sans-serif", opacity: 0.7 }}>Aprovação nas contas da Rouanet</p>
                    </div>
                    <div>
                        <h3 style={{ fontSize: "3rem", color: "#d4af37", marginBottom: "0.5rem" }}>24/7</h3>
                        <p style={{ fontFamily: "sans-serif", opacity: 0.7 }}>Museu disponível no digital</p>
                    </div>
                </div>
            </section>

            {/* CONTACT FORM SECTION */}
            <section id="contato" style={{ padding: "6rem 2rem", maxWidth: "800px", margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                    <h2 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>Fale com um Especialista</h2>
                    <p style={{ opacity: 0.7, fontFamily: "sans-serif" }}>Tire suas dúvidas sobre a Lei Rouanet, Planos e Implementação.</p>
                </div>
                <ContactForm />
            </section>

            {/* PRODUCER CTA */}
            <section style={{ padding: "8rem 2rem", textAlign: "center", background: "linear-gradient(to top, #1a1108, #2a1810)" }}>
                <h2 style={{ fontSize: "3rem", marginBottom: "1.5rem" }}>Comece sua Transformação Digital</h2>
                <p style={{ maxWidth: "600px", margin: "0 auto 3rem", opacity: 0.7, fontSize: "1.2rem", fontFamily: "sans-serif" }}>
                    Junte-se aos museus e projetos culturais que já estão no futuro.
                    Crie seu espaço agora mesmo.
                </p>
                <button
                    onClick={() => navigate("/sou-produtor")}
                    style={{
                        padding: "1.2rem 3.5rem",
                        background: "#d4af37",
                        color: "#1a1108",
                        borderRadius: "0.5rem",
                        fontSize: "1.3rem",
                        fontWeight: "bold",
                        border: "none",
                        cursor: "pointer",
                        boxShadow: "0 0 30px rgba(212,175,55,0.4)"
                    }}
                >
                    Quero Cadastrar Meu Projeto
                </button>
            </section>

            {/* FOOTER */}
            <footer style={{ padding: "4rem 2rem", borderTop: "1px solid rgba(212,175,55,0.1)", background: "#0a0604" }}>
                <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "3rem" }}>
                    <div>
                        <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#d4af37", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <Layout size={24} /> Cultura Viva
                        </div>
                        <p style={{ opacity: 0.5, fontSize: "0.9rem", lineHeight: "1.6", fontFamily: "sans-serif" }}>
                            Tecnologia para valorizar nossa história.<br />
                            Feito com ❤️ no Brasil.
                        </p>
                    </div>

                    <div>
                        <h4 style={{ color: "#fff", marginBottom: "1rem" }}>Plataforma</h4>
                        <ul style={{ listStyle: "none", padding: 0, opacity: 0.7, fontSize: "0.95rem", display: "flex", flexDirection: "column", gap: "0.5rem", fontFamily: "sans-serif" }}>
                            <li><a href="#solucoes" style={{ color: "inherit", textDecoration: "none" }} onClick={(e) => { e.preventDefault(); scrollToSection("solucoes"); }}>Funcionalidades</a></li>
                            <li><a href="#acessibilidade" style={{ color: "inherit", textDecoration: "none" }} onClick={(e) => { e.preventDefault(); scrollToSection("acessibilidade"); }}>Acessibilidade</a></li>
                            <li><a href="/login" style={{ color: "inherit", textDecoration: "none" }}>Área do Cliente</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ color: "#fff", marginBottom: "1rem" }}>Contato</h4>
                        <ul style={{ listStyle: "none", padding: 0, opacity: 0.7, fontSize: "0.95rem", display: "flex", flexDirection: "column", gap: "0.5rem", fontFamily: "sans-serif" }}>
                            <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><Mail size={16} /> contato@culturaviva.com</li>
                            <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><Instagram size={16} /> @culturaviva</li>
                            <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><MapPin size={16} /> São Paulo, SP</li>
                        </ul>
                    </div>
                </div>
                <div style={{ textAlign: "center", marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid rgba(255,255,255,0.05)", opacity: 0.4, fontSize: "0.8rem", fontFamily: "sans-serif" }}>
                    &copy; {new Date().getFullYear()} Cultura Viva Tecnologia. Todos os direitos reservados.
                </div>
            </footer>

            {/* Styles for responsive menu */}
            <style>{`
        .desktop-menu, .desktop-actions { display: flex; }
        .mobile-toggle { display: none; }
        
        @media (max-width: 768px) {
          .desktop-menu, .desktop-actions { display: none !important; }
          .mobile-toggle { display: block; }
          h1 { font-size: 2.5rem !important; }
        }
      `}</style>
        </div>
    );
};
