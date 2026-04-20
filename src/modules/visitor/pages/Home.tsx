import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../../api/client";
import { getFullUrl } from "../../../utils/url";
import { useIsCityMode, useTenant } from "../../auth/TenantContext";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { BentoSkeleton, WorkCardSkeleton } from "../../../components/ui/SkeletonLoader";
import { staggerContainer, staggerItem, fadeInUp, pageVariants, durations } from "@/lib/motion";
import { Badge, Card, AnimateIn, AnimatedCounter, PageLoader } from "@/components/ui";
import { cn } from "@/lib/cn";
import "./Home.css";

interface FeaturedWork {
  id: string;
  title: string;
  artist?: string;
  year?: string;
  imageUrl?: string;
  category?: { name: string } | string;
}


export const Home: React.FC = () => {
  const { tenantId, equipamentoId, role } = useAuth();
  const navigate = useNavigate();
  const isCityMode = useIsCityMode();
  const tenant = useTenant();
  const [featuredWorks, setFeaturedWorks] = useState<FeaturedWork[]>([]);
  const [museumName, setMuseumName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role === "master") { navigate("/master", { replace: true }); return; }
    if (role === "admin") { navigate("/admin", { replace: true }); return; }
  }, [role, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [worksRes, , equipRes] = await Promise.all([
          api.get(`/works?tenantId=${tenantId}&equipamentoId=${equipamentoId}&limit=3`),
          api.get(`/trails?tenantId=${tenantId}&equipamentoId=${equipamentoId}&limit=2`),
          api.get(`/equipamentos/public/${equipamentoId}`).catch(() => ({ data: {} }))
        ]);
        setFeaturedWorks(Array.isArray(worksRes.data) ? worksRes.data : (worksRes.data.data || []));

        if (equipRes.data) {
          setMuseumName(equipRes.data.nome || "");
        }
        
      } catch (err) {
        console.error("Error fetching home data", err);
      } finally {
        setLoading(false);
      }
    };

    if (tenantId && equipamentoId) {
      fetchData();
    } else if (tenantId && !equipamentoId) {
      // Se estamos num tenant mas sem equipamento, vai para selecao
      navigate("/select-museum");
    }
  }, [tenantId, equipamentoId, navigate]);

  const toRoman = (num: number) => {
    const map: Record<string, number> = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
    let res = '';
    for (const key in map) {
      const repeat = Math.floor(num / map[key]);
      num -= repeat * map[key];
      res += key.repeat(repeat);
    }
    return res;
  };

  return (
    <motion.div 
      className="home-container"
      variants={pageVariants}
      initial="initial"
      animate="enter"
      exit="exit"
      role="main"
      aria-busy={loading}
    >
      <Helmet>
        <title>{museumName || tenant?.name || "Cultura Viva"} | Portal do Visitante</title>
        <meta name="description" content={`Bem-vindo ao ${museumName || tenant?.name || "Cultura Viva"}. Explore nosso acervo digital e experiências interativas.`} />
        <meta property="og:title" content={museumName || tenant?.name || "Cultura Viva"} />
        <meta property="og:description" content="Uma jornada cultural imersiva te espera." />
        {tenant?.logoUrl && <meta property="og:image" content={tenant.logoUrl} />}
      </Helmet>

      {/* ═══ HERO SECTION ═══════════════ */}
      <motion.section variants={staggerItem} className="home-hero-premium">
        {isCityMode && (
          <Badge variant="glass" size="lg" className="mb-4 text-[var(--accent-primary)]">
            Secretaria Municipal de Cultura
          </Badge>
        )}
        <h1 className="hero-title-premium">
          {museumName || tenant?.name || "Cultura Viva"}
        </h1>
        <p className="hero-subtitle-premium" style={{ opacity: 0.85 }}>
          Explore o patrimônio cultural através de uma jornada digital imersiva, onde a história e a inovação se encontram.
        </p>
      </motion.section>

      {/* ═══ BENTO ACTIONS ══════════════ */}
      {loading ? (
        <BentoSkeleton />
      ) : (
        <section className="bento-grid">
          <Link to="/scanner" className="bento-card large">
            <div className="bento-icon">📷</div>
            <div className="bento-info">
              <span className="bento-label">Scanner Inteligente</span>
              <span className="bento-title">Decifrar Obra</span>
            </div>
            <div className="bento-bg" style={{ background: 'linear-gradient(45deg, var(--gold), transparent)' }}></div>
          </Link>
          
          <Link to="/mapa" className="bento-card tall">
            <div className="bento-icon">📍</div>
            <div className="bento-info">
              <span className="bento-label">Cartografia Digital</span>
              <span className="bento-title">Explorar Mapa</span>
            </div>
          </Link>

          <Link to="/eventos" className="bento-card">
            <div className="bento-icon">📅</div>
            <div className="bento-info">
              <span className="bento-label">Efemérides</span>
              <span className="bento-title">Eventos</span>
            </div>
          </Link>

          <Link to="/trilhas" className="bento-card">
            <div className="bento-icon">🧭</div>
            <div className="bento-info">
              <span className="bento-label">Roteiros Históricos</span>
              <span className="bento-title">Trilhas</span>
            </div>
          </Link>

          <Link to="/rpg" className="bento-card large">
            <div className="bento-icon">⚔️</div>
            <div className="bento-info">
              <span className="bento-label">Selo de Embaixador</span>
              <span className="bento-title">Minha Jornada RPG</span>
            </div>
            <div className="bento-bg" style={{ background: 'linear-gradient(-45deg, var(--gold), transparent)' }}></div>
          </Link>

          <Link to="/desafios" className="bento-card">
            <div className="bento-icon">🎯</div>
            <div className="bento-info">
              <span className="bento-label">Provas de Saber</span>
              <span className="bento-title">Desafios</span>
            </div>
          </Link>

          <Link to="/ranking" className="bento-card">
            <div className="bento-icon">🏆</div>
            <div className="bento-info">
              <span className="bento-label">Hall da Fama</span>
              <span className="bento-title">Ranking</span>
            </div>
          </Link>
        </section>
      )}

      {/* ═══ FEATURED GALLERY ═══════════ */}
      <AnimateIn variant="fadeUp" delay={0.1}>
        <section className="gallery-section">
          <div className="section-header">
            <Badge variant="outline" className="mb-3">Galeria de Destaques</Badge>
            <h2 className="text-3xl font-[var(--font-heading)] font-bold text-[var(--fg-main)]">Obras Selecionadas</h2>
          </div>

        {loading ? (
          <div className="gallery-grid">
            <WorkCardSkeleton />
            <WorkCardSkeleton />
            <WorkCardSkeleton />
          </div>
        ) : (
          <div className="gallery-grid">
            {featuredWorks.map((work, idx) => (
              <Link key={work.id} to={`/obras/${work.id}`} className="gallery-item-link">
                <article className="gallery-item">
                  <div className="gallery-visual">
                    <div className="gallery-number">{toRoman(idx + 1)}</div>
                    <img src={getFullUrl(work.imageUrl || '')} alt={work.title} className="gallery-img" />
                  </div>
                  <div className="gallery-info">
                    <span className="gallery-artist">{work.artist || 'Artista Desconhecido'}</span>
                    <h3 className="gallery-title">{work.title}</h3>
                    <p className="gallery-desc">
                      Uma peça fundamental do nosso acervo, representando a riqueza artística e o legado histórico preservado neste equipamento.
                    </p>
                    <span className="gallery-cta">
                      Explorar Detalhes <ArrowRight size={14} />
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
        </section>
      </AnimateIn>
    </motion.div>
  );
};
