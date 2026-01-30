import React from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Smartphone, Globe, Ear, Eye, Award, ArrowRight, Layout } from "lucide-react";

export const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="landing-page dark" style={{ background: "#1a1108", minHeight: "100vh", color: "#f5e6d3", fontFamily: "Georgia, serif" }}>
            {/* HEADER */}
            <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5rem 3rem", borderBottom: "1px solid rgba(212,175,55,0.2)" }}>
                <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#d4af37", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Layout size={28} /> Cultura Viva
                </div>
                <div style={{ display: "flex", gap: "2rem", fontSize: "0.9rem" }} className="hidden md:flex">
                    <a href="#solucoes" style={{ color: "inherit", textDecoration: "none" }}>Soluções</a>
                    <a href="#acessibilidade" style={{ color: "inherit", textDecoration: "none" }}>Acessibilidade</a>
                    <a href="#casos" style={{ color: "inherit", textDecoration: "none" }}>Casos de Uso</a>
                </div>
                <div style={{ display: "flex", gap: "1rem" }}>
                    <button
                        onClick={() => navigate("/select-museum")}
                        style={{ padding: "0.5rem 1rem", border: "1px solid #d4af37", background: "transparent", color: "#d4af37", borderRadius: "0.5rem", cursor: "pointer" }}
                    >
                        Sou Visitante / App
                    </button>
                    <button
                        onClick={() => navigate("/login")}
                        style={{ padding: "0.5rem 1.5rem", background: "#d4af37", color: "#1a1108", borderRadius: "0.5rem", cursor: "pointer", fontWeight: "bold", border: "none" }}
                    >
                        Entrar
                    </button>
                </div>
            </nav>

            {/* HERO SECTION */}
            <header id="solucoes" style={{ textAlign: "center", padding: "6rem 2rem", background: "radial-gradient(circle at center, rgba(212,175,55,0.15), transparent 70%)" }}>
                <span style={{ textTransform: "uppercase", letterSpacing: "2px", fontSize: "0.8rem", color: "#d4af37", marginBottom: "1rem", display: "block" }}>
                    Plataforma de Gestão Cultural
                </span>
                <h1 style={{ fontSize: "3.5rem", marginBottom: "1.5rem", lineHeight: "1.2" }}>
                    Transforme Patrimônio <br />
                    <span style={{ color: "#d4af37" }}>em Experiência Viva.</span>
                </h1>
                <p style={{ maxWidth: "700px", margin: "0 auto 3rem", fontSize: "1.1rem", opacity: 0.8, lineHeight: "1.6", fontFamily: "system-ui, sans-serif" }}>
                    A solução completa para digitalizar museus, galerias e cidades históricas.
                    Engaje visitantes com gamificação, cumpra a Lei Rouanet com excelência e tenha controle total do seu acervo.
                </p>
                <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
                    <button
                        onClick={() => navigate("/sou-produtor")}
                        style={{ padding: "1rem 2rem", background: "linear-gradient(135deg, #d4af37, #b8941f)", color: "#1a1108", borderRadius: "0.5rem", fontSize: "1.1rem", fontWeight: "bold", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", boxShadow: "0 10px 25px rgba(212,175,55,0.3)" }}
                    >
                        Digitalize seu Acervo <ArrowRight size={20} />
                    </button>
                </div>
            </header>

            {/* FEATURES GRID */}
            <section style={{ padding: "4rem 2rem", maxWidth: "1200px", margin: "0 auto" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
                    <div className="feature-card" style={{ padding: "2rem", background: "rgba(255,255,255,0.03)", borderRadius: "1rem", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <Award size={40} color="#d4af37" style={{ marginBottom: "1rem" }} />
                        <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Gamificação Real</h3>
                        <p style={{ opacity: 0.7, fontFamily: "system-ui" }}>Sistema de XP, conquistas e níveis que transforma a visitação em uma jornada engajadora para o público jovem.</p>
                    </div>
                    <div className="feature-card" style={{ padding: "2rem", background: "rgba(255,255,255,0.03)", borderRadius: "1rem", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <Smartphone size={40} color="#d4af37" style={{ marginBottom: "1rem" }} />
                        <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>App Web (PWA)</h3>
                        <p style={{ opacity: 0.7, fontFamily: "system-ui" }}>Sem necessidade de download nas lojas. Seus visitantes acessam instantaneamente através de QR Codes inteligentes.</p>
                    </div>
                    <div className="feature-card" style={{ padding: "2rem", background: "rgba(255,255,255,0.03)", borderRadius: "1rem", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <Globe size={40} color="#d4af37" style={{ marginBottom: "1rem" }} />
                        <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Turismo Inteligente</h3>
                        <p style={{ opacity: 0.7, fontFamily: "system-ui" }}>Mapas interativos, roteiros sugeridos por IA e integração com a economia local (lojas e serviços).</p>
                    </div>
                </div>
            </section>

            {/* ACCESSIBILITY SECTION */}
            <section id="acessibilidade" style={{ padding: "6rem 2rem", background: "#2a1810" }}>
                <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }}>
                    <div>
                        <span style={{ color: "#d4af37", fontWeight: "bold", textTransform: "uppercase", fontSize: "0.9rem" }}>IN MinC 01/2023</span>
                        <h2 style={{ fontSize: "2.5rem", margin: "1rem 0" }}>Adequação Total à Lei Rouanet</h2>
                        <p style={{ fontSize: "1.1rem", opacity: 0.8, marginBottom: "2rem", lineHeight: "1.6" }}>
                            Garanta a aprovação da sua prestação de contas. Nossa plataforma oferece uma suíte completa de acessibilidade, e nós produzimos o conteúdo para você.
                        </p>
                        <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <li style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                <Ear size={24} color="#d4af37" />
                                <span style={{ fontSize: "1.1rem" }}>Intérprete de Libras (Janela de vídeo)</span>
                            </li>
                            <li style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                <Eye size={24} color="#d4af37" />
                                <span style={{ fontSize: "1.1rem" }}>Audiodescrição para Deficientes Visuais</span>
                            </li>
                            <li style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                <Shield size={24} color="#d4af37" />
                                <span style={{ fontSize: "1.1rem" }}>Relatórios de Conformidade Automáticos</span>
                            </li>
                        </ul>
                    </div>
                    <div style={{ background: "#1a1108", padding: "2rem", borderRadius: "1rem", border: "2px solid #d4af37", textAlign: "center" }}>
                        <h3 style={{ color: "#d4af37", marginBottom: "1.5rem" }}>Pacote Acessibilidade</h3>
                        <p style={{ marginBottom: "2rem" }}>Contrate a adequação completa do seu projeto diretamente pelo painel administrativo.</p>
                        <button style={{ padding: "0.8rem 1.5rem", background: "transparent", border: "1px solid #fff", color: "#fff", borderRadius: "0.5rem", cursor: "pointer", width: "100%" }}>
                            Saiba Mais
                        </button>
                    </div>
                </div>
            </section>

            {/* PRODUCER CTA */}
            <section style={{ padding: "6rem 2rem", textAlign: "center" }}>
                <h2 style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>Área do Produtor Cultural</h2>
                <p style={{ maxWidth: "600px", margin: "0 auto 2rem", opacity: 0.7 }}>
                    Junte-se a centenas de museus e projetos culturais que já estão no futuro. Crie seu espaço, cadastre suas obras e solicite serviços.
                </p>
                <button
                    onClick={() => navigate("/sou-produtor")}
                    style={{ padding: "1rem 3rem", background: "#d4af37", color: "#1a1108", borderRadius: "0.5rem", fontSize: "1.2rem", fontWeight: "bold", border: "none", cursor: "pointer" }}
                >
                    Quero Cadastrar Meu Projeto
                </button>
            </section>

            {/* FOOTER */}
            <footer style={{ padding: "2rem", borderTop: "1px solid rgba(255,255,255,0.1)", textAlign: "center", opacity: 0.5, fontSize: "0.9rem" }}>
                <p>&copy; 2024 Cultura Viva. Todos os direitos reservados.</p>
            </footer>
        </div>
    );
};
