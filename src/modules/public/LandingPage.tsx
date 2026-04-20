import { useTranslation } from "react-i18next";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Smartphone, Globe, Ear, Eye, Award, ArrowRight, Layout, Menu, X, Mail, Instagram, MapPin } from "lucide-react";
import { ContactForm } from "./ContactForm";
import { useTenant } from "../auth/TenantContext";
import { TenantLogo } from "../../components/Branding/TenantLogo";
import { 
    Badge, 
    Button, 
    AnimateIn, 
    AnimatedCounter, 
    ParticleBackground 
} from "@/components/ui";
import { staggerContainer, staggerItem, fadeInUp } from "@/lib/motion";
import { motion } from "framer-motion";

export const LandingPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const tenant = useTenant();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Helper para scroll suave que funciona em SPA
    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
            setMobileMenuOpen(false);
        }
    };

    const containerVariants = {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.3 } }
    };

    return (
        <div className="landing-page bg-[var(--bg-page)] min-h-screen text-[var(--fg-main)] font-[var(--font-heading)] overflow-x-hidden">

            {/* HEADER FIXO */}
            <nav className="flex justify-between items-center px-8 py-4 border-b border-[var(--border-default)] bg-[var(--bg-overlay)] fixed top-0 left-0 right-0 z-[1000] backdrop-blur-md" aria-label={t("public.landingpage.navegaoPrincipal", `Navegação Principal`)}>
                <div
                    role="button"
                    tabIndex={0}
                    className="text-2xl font-bold text-[var(--accent-primary)] flex items-center gap-2 cursor-pointer"
                    onClick={() => window.scrollTo(0, 0)}
                    onKeyDown={(e) => e.key === 'Enter' && window.scrollTo(0, 0)}
                    aria-label={`${tenant?.name || 'Cultura Viva'} - Voltar ao topo`}
                >
                    <TenantLogo size={40} />
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex gap-8 text-[0.95rem] font-[var(--font-body)]" role="menubar">
                    <button role="menuitem" onClick={() => scrollToSection("solucoes")} className="bg-none border-none text-inherit cursor-pointer hover:text-[var(--accent-primary)] transition-colors">Soluções</button>
                    <button role="menuitem" onClick={() => scrollToSection("acessibilidade")} className="bg-none border-none text-inherit cursor-pointer hover:text-[var(--accent-primary)] transition-colors">Acessibilidade</button>
                    <button role="menuitem" onClick={() => scrollToSection("casos")} className="bg-none border-none text-inherit cursor-pointer hover:text-[var(--accent-primary)] transition-colors">Benefícios</button>
                </div>

                <div className="hidden md:flex gap-4 desktop-actions">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("/welcome")}
                        aria-label="Abrir aplicativo como visitante"
                    >
                        Iniciar Visita (App)
                    </Button>
                    <Button
                        onClick={() => navigate("/login")}
                    >
                        Entrar
                    </Button>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden bg-none border-none text-[var(--accent-primary)]"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
                    aria-expanded={mobileMenuOpen}
                >
                    {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </nav>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div style={{
                    position: "fixed", top: "70px", left: 0, right: 0, bottom: 0,
                    background: "var(--bg-page)", zIndex: 999,
                    display: "flex", flexDirection: "column", padding: "2rem", gap: "1.5rem"
                }} role="menu">
                    <button role="menuitem" onClick={() => scrollToSection("solucoes")} style={{ background: "none", border: "none", color: "var(--accent-primary)", fontSize: "1.2rem", textAlign: "left" }}>Soluções</button>
                    <button role="menuitem" onClick={() => scrollToSection("acessibilidade")} style={{ background: "none", border: "none", color: "var(--accent-primary)", fontSize: "1.2rem", textAlign: "left" }}>Acessibilidade</button>
                    <button role="menuitem" onClick={() => scrollToSection("casos")} style={{ background: "none", border: "none", color: "var(--accent-primary)", fontSize: "1.2rem", textAlign: "left" }}>Benefícios</button>
                    <hr style={{ borderColor: "var(--border-subtle)" }} />
                    <button role="menuitem" onClick={() => scrollToSection("contato")} style={{ padding: "1rem", background: "var(--accent-primary)", color: "var(--bg-page)", borderRadius: "var(--radius-md)", fontWeight: "bold" }}>Sou Produtor Cultural</button>
                    <button role="menuitem" onClick={() => navigate("/welcome")} style={{ padding: "1rem", border: "1px solid var(--accent-primary)", background: "transparent", color: "var(--accent-primary)", borderRadius: "var(--radius-md)" }}>Iniciar Visita</button>
                </div>
            )}

            {/* HERO SECTION */}
            <header className="relative flex flex-col items-center justify-center min-h-[90vh] px-8 pt-32 pb-24 text-center overflow-hidden">
                <ParticleBackground />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--bg-page)]/80 to-[var(--bg-page)] z-10"></div>
                
                <motion.div 
                    variants={containerVariants}
                    initial="initial"
                    animate="animate"
                    className="relative z-20 flex flex-col items-center"
                >
                    <motion.div variants={fadeInUp} className="px-4 py-2 border border-[var(--border-default)] rounded-full mb-8 text-xs tracking-widest text-[var(--accent-primary)] bg-[var(--accent-primary)]/5">
                        {t("public.landingpage.plataformaDeGestoCultural40", `PLATAFORMA DE GESTÃO CULTURAL 4.0`)}
                    </motion.div>

                    <motion.h1 variants={fadeInUp} className="text-[clamp(2.5rem,5vw,4.5rem)] mb-6 font-bold leading-tight tracking-tight">
                        Transforme Patrimônio <br />
                        {tenant ? (
                            <span className="bg-gradient-to-r from-[var(--accent-primary)] via-white to-[var(--accent-primary)] bg-clip-text text-transparent"> em {tenant.name}.</span>
                        ) : (
                            <span className="bg-gradient-to-r from-[var(--accent-primary)] via-white to-[var(--accent-primary)] bg-clip-text text-transparent">{t("public.landingpage.emExperinciaViva", ` em Experiência Viva.`)}</span>
                        )}
                    </motion.h1>

                    <motion.p variants={fadeInUp} className="max-w-2xl mx-auto mb-12 text-lg md:text-xl opacity-80 leading-relaxed font-[var(--font-body)]">
                        {t("public.landingpage.aSoluoCompletaParaDigitalizarMuseusECida", `
                            A solução completa para digitalizar museus, centros culturais e monumentos históricos.
                            Sinta o pulso da cultura em tempo real com o novo Pulse Hub e engaje visitantes com gamificação avançada.
                        `)}
                    </motion.p>

                    <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            size="lg"
                            onClick={() => navigate("/welcome")}
                            rightIcon={<ArrowRight size={20} />}
                            className="shadow-2xl shadow-[var(--accent-primary)]/20"
                        >
                            Iniciar Visita
                        </Button>

                        <Button
                            variant="glass"
                            size="lg"
                            onClick={() => scrollToSection("solucoes")}
                        >
                            Conhecer Soluções
                        </Button>
                    </motion.div>
                </motion.div>
            </header>

            {/* FEATURES GRID */}
            <section id="solucoes" className="py-24 px-8 max-w-7xl mx-auto">
                <AnimateIn variant="fadeUp">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">{t("public.landingpage.tecnologiaAServioDaCultura", `Tecnologia a Serviço da Cultura`)}</h2>
                        <p className="opacity-70 font-[var(--font-body)] max-w-xl mx-auto">{t("public.landingpage.tudoOQueVocPrecisaParaModernizarSuaInsti", `Tudo o que você precisa para modernizar sua instituição.`)}</p>
                    </div>
                </AnimateIn>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <AnimateIn variant="fadeUp" delay={0.1}>
                        <div className="p-10 bg-[var(--bg-surface)] rounded-[var(--radius-lg)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)]/30 transition-all group">
                            <Smartphone size={48} className="text-[var(--accent-primary)] mb-6 group-hover:scale-110 transition-transform" />
                            <h3 className="text-2xl font-bold mb-4">Web App (PWA)</h3>
                            <p className="opacity-70 font-[var(--font-body)] leading-relaxed">
                                {t("public.landingpage.semNecessidadeDeDownloadNasLojasSeusVisi", `
                                    Sem necessidade de download nas lojas. Seus visitantes acessam instantaneamente o guia multimídia
                                    através de QR Codes inteligentes espalhados pelo acervo.
                                `)}
                            </p>
                        </div>
                    </AnimateIn>
                    <AnimateIn variant="fadeUp" delay={0.2}>
                        <div className="p-10 bg-[var(--bg-surface)] rounded-[var(--radius-lg)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)]/30 transition-all group">
                            <Globe size={48} className="text-[var(--accent-primary)] mb-6 group-hover:scale-110 transition-transform" />
                            <h3 className="text-2xl font-bold mb-4">Turismo Inteligente</h3>
                            <p className="opacity-70 font-[var(--font-body)] leading-relaxed">
                                {t("public.landingpage.mapasInterativosRoteirosSugeridosPorIaEI", `
                                    Pulse Hub: Mapas interativos, roteiros inteligentes e descoberta de monumentos via QR Code.
                                    Conecte seu patrimônio ao pulso digital da cidade.
                                `)}
                            </p>
                        </div>
                    </AnimateIn>
                </div>
            </section>

            {/* ACCESSIBILITY SECTION */}
            <section id="acessibilidade" className="py-32 px-8 bg-[var(--bg-surface-active)] relative overflow-hidden">
                <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

                <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <AnimateIn variant="fadeRight">
                        <div>
                            <Badge variant="outline" className="mb-6 tracking-widest">IN MinC 01/2023</Badge>
                            <h2 className="text-5xl font-bold mb-6 leading-tight">Adequação Total à <br />Lei Rouanet</h2>
                            <p className="text-xl opacity-80 mb-10 leading-relaxed font-[var(--font-body)]">
                                {t("public.landingpage.garantaAAprovaoDaSuaPrestaoDeContasNossa", `
                                    Garanta a aprovação da sua prestação de contas. Nossa plataforma já vem com a suíte técnica exigida, e oferecemos a produção de conteúdo como serviço.
                                `)}
                            </p>

                            <ul className="space-y-6">
                                {[
                                    { icon: <Ear size={20} />, title: "Libras", sub: "Janela de vídeo integrada ao player" },
                                    { icon: <Eye size={20} />, title: "Audiodescrição", sub: "Narração descritiva para deficientes visuais" },
                                    { icon: <Shield size={20} />, title: "Relatórios Automáticos", sub: "Gere comprovantes de acessibilidade em 1 clique" }
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-4 group">
                                        <div className="p-3 bg-[var(--accent-primary)]/10 rounded-xl text-[var(--accent-primary)] group-hover:scale-110 transition-transform">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <strong className="block text-lg">{item.title}</strong>
                                            <span className="text-sm opacity-60 font-[var(--font-body)]">{item.sub}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </AnimateIn>

                    <AnimateIn variant="fadeLeft">
                        <div className="p-12 bg-gradient-to-br from-[var(--bg-surface-hover)] to-[var(--bg-surface)] rounded-[2.5rem] border border-[var(--accent-primary)]/20 text-center shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-[var(--accent-primary)]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <h3 className="text-[var(--accent-primary)] text-2xl font-bold mb-4 relative z-10">Precisa de Ajuda?</h3>
                            <p className="mb-10 font-[var(--font-body)] opacity-80 relative z-10 px-4">
                                {t("public.landingpage.nossaEquipeDeEspecialistasProduzOsVdeosD", `
                                    Nossa equipe de especialistas produz os vídeos de Libras e os áudios de descrição para o seu acervo.
                                `)}
                            </p>
                            <Button 
                                variant="outline" 
                                size="lg" 
                                className="w-full font-bold relative z-10"
                                onClick={() => scrollToSection("contato")}
                            >
                                Falar com Consultor
                            </Button>
                        </div>
                    </AnimateIn>
                </div>
            </section>

            {/* CASES / BENEFITS */}
            <section id="casos" className="py-24 px-8 max-w-7xl mx-auto">
                <AnimateIn variant="fadeUp">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold">Quem usa, recomenda</h2>
                    </div>
                </AnimateIn>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                    <AnimateIn variant="scaleIn" delay={0.1}>
                        <div>
                            <div className="text-5xl font-bold text-[var(--accent-primary)] mb-4">
                                +<AnimatedCounter value={40} />%
                            </div>
                            <p className="font-[var(--font-body)] opacity-70">Aumento no engajamento jovem</p>
                        </div>
                    </AnimateIn>
                    <AnimateIn variant="scaleIn" delay={0.2}>
                        <div>
                            <div className="text-5xl font-bold text-[var(--accent-primary)] mb-4">
                                <AnimatedCounter value={100} />%
                            </div>
                            <p className="font-[var(--font-body)] opacity-70">{t("public.landingpage.aprovaoNasContasDaRouanet", `Aprovação nas contas da Rouanet`)}</p>
                        </div>
                    </AnimateIn>
                    <AnimateIn variant="scaleIn" delay={0.3}>
                        <div>
                            <div className="text-5xl font-bold text-[var(--accent-primary)] mb-4">
                                24/7
                            </div>
                            <p className="font-[var(--font-body)] opacity-70">{t("public.landingpage.museuDisponvelNoDigital", `Museu disponível no digital`)}</p>
                        </div>
                    </AnimateIn>
                </div>
            </section>

            {/* CONTACT FORM SECTION */}
            <section id="contato" className="py-24 px-8 max-w-3xl mx-auto">
                <AnimateIn variant="fadeUp">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Fale com um Especialista</h2>
                        <p className="opacity-70 font-[var(--font-body)]">{t("public.landingpage.tireSuasDvidasSobreALeiRouanetPlanosEImp", `Tire suas dúvidas sobre a Lei Rouanet, Planos e Implementação.`)}</p>
                    </div>
                </AnimateIn>
                <ContactForm />
            </section>

            {/* PRODUCER CTA */}
            <section className="py-32 px-8 text-center bg-gradient-to-t from-[var(--bg-surface)] to-[var(--bg-page)] relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--accent-primary)]/5 blur-[120px] rounded-full"></div>
                <AnimateIn variant="scaleIn">
                    <h2 className="text-5xl font-bold mb-6 relative z-10">{t("public.landingpage.comeceSuaTransformaoDigital", `Comece sua Transformação Digital`)}</h2>
                    <p className="max-w-xl mx-auto mb-12 opacity-70 text-xl font-[var(--font-body)] relative z-10 leading-relaxed">
                        {t("public.landingpage.junteseAosMuseusEProjetosCulturaisQueJEs", `
                            Junte-se aos museus e projetos culturais que já estão no futuro.
                            Crie seu espaço agora mesmo.
                        `)}
                    </p>
                    <Button
                        size="lg"
                        className="px-16 py-8 text-xl font-bold relative z-10 shadow-[0_0_50px_rgba(212,175,55,0.3)] transition-all hover:scale-105"
                        onClick={() => scrollToSection("contato")}
                    >
                        Quero Cadastrar Meu Projeto
                    </Button>
                </AnimateIn>
            </section>

            {/* FOOTER */}
            <footer className="py-20 px-8 border-t border-[var(--border-subtle)] bg-[var(--bg-page)] relative z-10">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    <div className="col-span-1 md:col-span-2">
                        <div className="text-2xl font-bold text-[var(--accent-primary)] mb-6 flex items-center gap-3">
                            <Layout size={32} /> Cultura Viva
                        </div>
                        <p className="opacity-50 text-sm leading-relaxed font-[var(--font-body)] max-w-xs">
                            Tecnologia para valorizar nossa história.<br />
                            Implementando acessibilidade e engajamento digital para museus 4.0.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold mb-6">Plataforma</h4>
                        <ul className="space-y-4 opacity-70 text-sm font-[var(--font-body)]">
                            <li><button onClick={() => scrollToSection("solucoes")} className="hover:text-[var(--accent-primary)] transition-colors">Funcionalidades</button></li>
                            <li><button onClick={() => scrollToSection("acessibilidade")} className="hover:text-[var(--accent-primary)] transition-colors">Acessibilidade</button></li>
                            <li><button onClick={() => navigate("/login")} className="hover:text-[var(--accent-primary)] transition-colors">{t("public.landingpage.reaDoCliente", `Área do Cliente`)}</button></li>
                        </ul>
                    </div>
                </div>
                <div className="text-center mt-20 pt-10 border-t border-white/5 opacity-30 text-xs font-[var(--font-body)]">
                    &copy; {new Date().getFullYear()} Cultura Viva Tecnologia. Desenvolvido para o impacto cultural nacional.
                </div>
            </footer>
        </div>
    );
};
