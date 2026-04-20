import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
    Shield, 
    Smartphone, 
    Globe, 
    Ear, 
    Eye, 
    ArrowRight, 
    Menu, 
    X, 
    Layout, 
    ChevronDown, 
    Zap,
    Users,
    Activity
} from "lucide-react";
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
import { staggerContainer, staggerItem, fadeInUp, scaleIn } from "@/lib/motion";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/cn";

export const LandingPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const tenant = useTenant();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Track scroll for header transition
    useEffect(() => {
        let lastScrollY = window.scrollY;
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const isScrolled = currentScrollY > 50;
            // Only update if state actually changes
            setScrolled((prev) => {
                if (prev !== isScrolled) return isScrolled;
                return prev;
            });
            lastScrollY = currentScrollY;
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const { scrollYProgress } = useScroll();
    const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
            setMobileMenuOpen(false);
        }
    };

    return (
        <div className="landing-page bg-[#05050c] min-h-screen text-[#f5e6d3] font-body overflow-x-hidden selection:bg-[var(--accent-primary)] selection:text-black">
            
            {/* AMBIENT BACKGROUND GLOWS */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--accent-primary)]/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[var(--accent-primary)]/5 blur-[150px] rounded-full" />
            </div>

            {/* STATIC NOISE OVERLAY */}
            <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-[100] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            {/* HEADER FIXO PREMIUM */}
            <nav className={cn(
                "flex justify-between items-center px-6 md:px-12 py-5 fixed top-0 left-0 right-0 z-[1000] transition-all duration-500",
                scrolled ? "bg-[#05050c]/80 backdrop-blur-xl border-b border-white/5 py-3" : "bg-transparent"
            )}>
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                    <TenantLogo size={40} showText={false} />
                    <span className="text-xl font-heading font-bold tracking-tight bg-gradient-to-r from-[var(--accent-primary)] to-white bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
                        {tenant?.name || "Cultura Viva"}
                    </span>
                </motion.div>

                {/* Desktop Menu */}
                <div className="hidden lg:flex items-center gap-10 text-sm font-bold tracking-widest uppercase">
                    {["solucoes", "acessibilidade", "casos", "contato"].map((item) => (
                        <button 
                            key={item}
                            onClick={() => scrollToSection(item)} 
                            className="relative group transition-colors hover:text-[var(--accent-primary)]"
                        >
                            {t(`public.landingpage.nav.${item}`, item.charAt(0).toUpperCase() + item.slice(1))}
                            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[var(--accent-primary)] transition-all group-hover:w-full" />
                        </button>
                    ))}
                </div>

                <div className="hidden lg:flex items-center gap-6">
                    <button 
                        onClick={() => navigate("/welcome")}
                        className="text-xs font-bold uppercase tracking-widest border-b border-[var(--accent-primary)]/30 pb-1 hover:border-[var(--accent-primary)] transition-all"
                    >
                        {t("public.landingpage.iniciarVisitaApp", "Iniciar Visita (App)")}
                    </button>
                    <Button
                        size="sm"
                        onClick={() => navigate("/login")}
                        className="px-8 shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                    >
                        {t("public.landingpage.entrar", "Entrar")}
                    </Button>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="lg:hidden p-2 text-[var(--accent-primary)]"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 bg-[#05050c] z-[999] flex flex-col p-12 pt-32 gap-8 text-2xl font-heading"
                    >
                        {["solucoes", "acessibilidade", "casos", "contato"].map((item) => (
                            <button 
                                key={item}
                                onClick={() => scrollToSection(item)} 
                                className="text-left hover:text-[var(--accent-primary)] transition-colors"
                            >
                                {item.charAt(0).toUpperCase() + item.slice(1)}
                            </button>
                        ))}
                        <hr className="border-white/5 my-4" />
                        <Button size="lg" onClick={() => navigate("/welcome")}>Iniciar Visita</Button>
                        <Button variant="outline" size="lg" onClick={() => navigate("/login")}>Entrar no Painel</Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* HERO SECTION ULTRA-MODERNA */}
            <header className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center select-none overflow-hidden">
                <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="absolute inset-0 z-0">
                    <ParticleBackground count={80} />
                    {/* Abstract Cloud Gradients */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#05050c]/80 to-[#05050c] z-10" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-[var(--accent-primary)]/5 blur-[180px] rounded-full animate-slow-spin" />
                </motion.div>
                
                <motion.div 
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="relative z-20 max-w-5xl"
                >
                    <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-5 py-2 border border-[var(--accent-primary)]/20 rounded-full mb-10 text-[10px] sm:text-xs tracking-[0.3em] font-bold text-[var(--accent-primary)] bg-[var(--accent-primary)]/5 backdrop-blur-md uppercase">
                        <Zap size={14} className="animate-pulse" />
                        {t("public.landingpage.tag", "Plataforma de Gestão Cultural 4.0")}
                    </motion.div>

                    <motion.h1 variants={fadeInUp} className="text-[clamp(2.8rem,8vw,6.5rem)] mb-10 font-heading font-black leading-[0.9] tracking-tighter text-white">
                        Transforme Patrimônio <br />
                        <span className="bg-gradient-to-r from-[var(--accent-primary)] via-[#f5e6d3] to-[var(--accent-primary)] bg-clip-text text-transparent italic px-2">
                           {t("public.landingpage.heroTitleGold", "em Experiência Viva.")}
                        </span>
                    </motion.h1>

                    <motion.p variants={fadeInUp} className="max-w-3xl mx-auto mb-14 text-base md:text-xl text-[#f5e6d3]/70 font-body leading-relaxed">
                        {t("public.landingpage.heroDesc", "A solução completa para digitalizar museus, centros culturais e cidades históricas. Engaje visitantes com gamificação, cumpra a Lei Rouanet com excelência e tenha controle total do seu acervo em tempo real.")}
                    </motion.p>

                    <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                        <Button
                            size="lg"
                            onClick={() => navigate("/welcome")}
                            rightIcon={<ArrowRight size={20} />}
                            className="h-16 px-10 text-lg shadow-[0_20px_50px_rgba(212,175,55,0.2)] rounded-2xl"
                        >
                            {t("public.landingpage.ctaPrimary", "Iniciar Jornada")}
                        </Button>

                        <button
                            onClick={() => scrollToSection("solucoes")}
                            className="group flex items-center gap-3 text-sm font-bold uppercase tracking-widest hover:text-[var(--accent-primary)] transition-all"
                        >
                            <span className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-[var(--accent-primary)] transition-all">
                                <ChevronDown size={20} className="group-hover:translate-y-1 transition-transform" />
                            </span>
                            {t("public.landingpage.ctaSecondary", "Ver Soluções")}
                        </button>
                    </motion.div>
                </motion.div>

                {/* Floating Metrics Badge */}
                <motion.div 
                    variants={scaleIn}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: 1 }}
                    className="absolute bottom-12 hidden md:flex items-center gap-12 px-10 py-6 bg-white/[0.02] border border-white/5 backdrop-blur-2xl rounded-3xl z-30"
                >
                    <div className="text-center group">
                        <div className="text-2xl font-heading font-bold text-white group-hover:text-[var(--accent-primary)] transition-colors">+<AnimatedCounter value={95} />%</div>
                        <div className="text-[9px] uppercase tracking-widest opacity-40 font-bold">Engajamento</div>
                    </div>
                    <div className="w-[1px] h-8 bg-white/10" />
                    <div className="text-center group">
                        <div className="text-2xl font-heading font-bold text-white group-hover:text-[var(--accent-primary)] transition-colors"><AnimatedCounter value={100} />%</div>
                        <div className="text-[9px] uppercase tracking-widest opacity-40 font-bold">Conformidade</div>
                    </div>
                    <div className="w-[1px] h-8 bg-white/10" />
                    <div className="text-center group">
                        <div className="text-2xl font-heading font-bold text-white group-hover:text-[var(--accent-primary)] transition-colors"><AnimatedCounter value={50} />k+</div>
                        <div className="text-[9px] uppercase tracking-widest opacity-40 font-bold">Visitantes/Mês</div>
                    </div>
                </motion.div>
            </header>

            {/* SEÇÃO SOLUÇÕES - GRID PREMIUM */}
            <section id="solucoes" className="py-32 px-6 max-w-7xl mx-auto">
                <AnimateIn variant="fadeUp">
                    <div className="text-center mb-24">
                        <Badge variant="outline" className="mb-6 uppercase tracking-[0.3em] font-bold border-[var(--accent-primary)]/30 text-[var(--accent-primary)]">Inovação</Badge>
                        <h2 className="text-4xl md:text-6xl font-heading font-bold mb-6 italic text-white">{t("public.landingpage.solucoesTitle", "Cultura Impulsionada por Dados")}</h2>
                        <p className="text-[#f5e6d3]/60 max-w-2xl mx-auto text-lg leading-relaxed">{t("public.landingpage.solucoesDesc", "Integramos o mundo físico ao digital através de um ecossistema completo de ferramentas administrativas e de engajamento.")}</p>
                    </div>
                </AnimateIn>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { 
                            icon: <Smartphone size={32} />, 
                            title: "Multi-Guia Web App", 
                            desc: "Navegação por QR Code sem downloads. Guia de áudio, mapas e conteúdo extra instantâneo." 
                        },
                        { 
                            icon: <Activity size={32} />, 
                            title: "Pulse Hub Admin", 
                            desc: "O painel de controle definitivo. Métricas de calor, fluxo de visitantes e gestão de acervo 3D." 
                        },
                        { 
                            icon: <Globe size={32} />, 
                            title: "Turismo Conectado", 
                            desc: "Mapas de cidade interativos e roteiros gerados por IA baseados no perfil do visitante." 
                        }
                    ].map((feature, i) => (
                        <AnimateIn key={i} variant="fadeUp" delay={i * 0.1}>
                            <div className="group p-10 bg-white/[0.02] border border-white/5 rounded-[40px] hover:bg-white/[0.04] transition-all hover:-translate-y-2 hover:border-[var(--accent-primary)]/30 overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    {feature.icon}
                                </div>
                                <div className="w-16 h-16 rounded-2xl bg-[var(--accent-primary)]/10 flex items-center justify-center text-[var(--accent-primary)] mb-8 transition-transform group-hover:scale-110">
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-heading font-bold mb-4 text-white">{feature.title}</h3>
                                <p className="text-[#f5e6d3]/50 font-body leading-relaxed">{feature.desc}</p>
                            </div>
                        </AnimateIn>
                    ))}
                </div>
            </section>

            {/* SEÇÃO ACESSIBILIDADE - DARK GLASS */}
            <section id="acessibilidade" className="py-32 px-6 bg-white/[0.01] border-y border-white/5 relative overflow-hidden">
                 <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                    <AnimateIn variant="fadeRight">
                        <div>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-0.5 w-12 bg-[var(--accent-primary)]" />
                                <span className="text-[var(--accent-primary)] font-bold tracking-[0.3em] text-xs uppercase">Compliance Legal</span>
                            </div>
                            <h2 className="text-4xl md:text-6xl font-heading font-bold mb-8 leading-[1.1] text-white">
                                {t("public.landingpage.rouanetTitle", "Democratize o Acesso com a Lei Rouanet")}
                            </h2>
                            <p className="text-xl text-[#f5e6d3]/60 mb-12 leading-relaxed font-body">
                                {t("public.landingpage.rouanetDesc", "Nossa plataforma garante 100% de conformidade com a IN MinC 01/2023, automatizando a aprovação de contas com suítes nativas de acessibilidade.")}
                            </p>

                            <div className="space-y-8">
                                {[
                                    { icon: <Ear />, title: "Intérprete de Libras", sub: "Vídeos nativos sincronizados em cada obra." },
                                    { icon: <Eye />, title: "Audiodescrição High-Fi", sub: "Roteiros narrativos imersivos de alta qualidade." },
                                    { icon: <Shield />, title: "Geração de Certificados", sub: "Relatórios de impacto para prestação de contas." }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-6 group">
                                        <div className="w-14 h-14 shrink-0 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[var(--accent-primary)] group-hover:bg-[var(--accent-primary)] group-hover:text-black transition-all">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold mb-1 text-white">{item.title}</h4>
                                            <p className="text-sm text-[#f5e6d3]/40">{item.sub}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </AnimateIn>

                    <AnimateIn variant="fadeLeft">
                        <div className="relative">
                            <div className="absolute -inset-10 bg-[var(--accent-primary)]/10 blur-[100px] rounded-full animate-pulse" />
                            <div className="relative p-1 bg-gradient-to-br from-white/10 to-transparent rounded-[50px] shadow-2xl">
                                <div className="p-12 lg:p-16 bg-[#0a0a14] rounded-[48px] border border-white/5 text-center">
                                    <Badge variant="glass" className="mb-8">Consul-Tech Cultural</Badge>
                                    <h3 className="text-3xl font-heading font-bold mb-6 text-white">Suporte na Produção de Conteúdo</h3>
                                    <p className="text-[#f5e6d3]/60 mb-12 text-lg">
                                        Oferecemos a produção completa de vídeos de Libras e Áudio-guias profissionais para o seu museu.
                                    </p>
                                    <Button 
                                        variant="outline" 
                                        size="lg" 
                                        className="w-full h-16 text-lg border-[var(--accent-primary)]/30 hover:bg-[var(--accent-primary)] hover:text-black"
                                        onClick={() => scrollToSection("contato")}
                                    >
                                        Agendar Consultoria
                                    </Button>
                                    <div className="mt-10 flex flex-col gap-4 text-xs tracking-widest opacity-30 font-bold uppercase">
                                        <div className="flex items-center justify-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                                            Especialistas Disponíveis
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </AnimateIn>
                </div>
            </section>

            {/* SEÇÃO CONTATO - MINIMALISTA */}
            <section id="contato" className="py-40 px-6 max-w-4xl mx-auto">
                <AnimateIn variant="fadeUp">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-white">Pronto para digitalizar?</h2>
                        <p className="text-[#f5e6d3]/50 text-lg">Tire suas dúvidas sobre implantação, planos e prazos de produção.</p>
                    </div>
                </AnimateIn>
                <div className="p-10 md:p-16 bg-white/[0.02] border border-white/5 rounded-[50px] backdrop-blur-3xl shadow-glow">
                    <ContactForm />
                </div>
            </section>

            {/* CTA FINAL - MASSIVO */}
            <section className="py-40 px-6 text-center border-t border-white/5 relative bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat">
                <AnimateIn variant="scaleIn">
                    <h2 className="text-5xl md:text-8xl font-heading font-black mb-12 text-white leading-none">A Revolução <br /> é agora.</h2>
                    <p className="max-w-2xl mx-auto mb-16 text-xl text-[#f5e6d3]/50 leading-relaxed italic">
                        "Tecnologia não é sobre substituir a história, mas sobre garantir que ela nunca seja esquecida."
                    </p>
                    <div className="flex flex-col md:flex-row justify-center gap-8">
                        <Button
                            size="lg"
                            className="h-20 px-20 text-2xl font-black rounded-3xl"
                            onClick={() => scrollToSection("contato")}
                        >
                            Criar Espaço Digital
                        </Button>
                    </div>
                </AnimateIn>
            </section>

            {/* FOOTER */}
            <footer className="py-24 px-6 border-t border-white/5 bg-[#05050c] relative z-10">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-20">
                    <div className="max-w-sm">
                        <div className="text-3xl font-heading font-black text-white mb-8 flex items-center gap-3">
                            <TenantLogo size={42} showText={false} />
                            Cultura Viva
                        </div>
                        <p className="text-[#f5e6d3]/40 text-sm leading-relaxed mb-10">
                            Líder nacional em digitalização de patrimônio histórico 4.0. <br />
                            Acessibilidade, Gamificação e Gestão de Dados para Instituições de Excelência.
                        </p>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[var(--accent-primary)] hover:text-black transition-colors cursor-pointer"><Users size={18} /></div>
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[var(--accent-primary)] hover:text-black transition-colors cursor-pointer"><Globe size={18} /></div>
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[var(--accent-primary)] hover:text-black transition-colors cursor-pointer"><Mail size={18} /></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-16 md:gap-32 w-full md:w-auto">
                        <div>
                            <h4 className="font-bold text-xs uppercase tracking-[0.3em] text-[var(--accent-primary)] mb-8">Plataforma</h4>
                            <ul className="space-y-6 text-sm text-[#f5e6d3]/70 font-semibold">
                                <li className="hover:text-white transition-colors cursor-pointer">Pulse Hub Admin</li>
                                <li className="hover:text-white transition-colors cursor-pointer">Web App Visitante</li>
                                <li className="hover:text-white transition-colors cursor-pointer">Módulo Municipal</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-xs uppercase tracking-[0.3em] text-[var(--accent-primary)] mb-8">Empresa</h4>
                            <ul className="space-y-6 text-sm text-[#f5e6d3]/70 font-semibold">
                                <li className="hover:text-white transition-colors cursor-pointer">Sobre Nós</li>
                                <li className="hover:text-white transition-colors cursor-pointer">Consultoria</li>
                                <li className="hover:text-white transition-colors cursor-pointer">Privacidade</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-32 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 opacity-20 text-[10px] uppercase font-bold tracking-widest text-center md:text-left">
                    <span>&copy; {new Date().getFullYear()} Cultura Viva Tecnologia. Todos os direitos reservados.</span>
                    <span>Selo de Acessibilidade Digital W3C Platinum</span>
                </div>
            </footer>
        </div>
    );
};
