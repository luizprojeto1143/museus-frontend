import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../../api/client";
import { getFullUrl } from "../../../utils/url";
import { useIsCityMode, useTenant } from "../../auth/TenantContext";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { BentoSkeleton, WorkCardSkeleton } from "../../../components/ui/SkeletonLoader";
import { pageVariants, staggerItem } from "@/lib/motion";
import { Badge, AnimateIn, PageLoader } from "@/components/ui";
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
  const { t } = useTranslation();
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
    } else if (!tenantId) {
      // Sem tenant, volta para o início (Landing Page)
      navigate("/", { replace: true });
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
        <title>{museumName || tenant?.name || "Cultura Viva"} | {t("visitor.profile.title")}</title>
        <meta name="description" content={t("visitor.home.subtitle")} />
      </Helmet>

      {/* ═══ HERO SECTION ═══════════════ */}
      <motion.section variants={staggerItem} className="home-hero-premium">
        {isCityMode && (
          <Badge variant="glass" size="lg" className="mb-4 text-[var(--accent-primary)]">
            {t("visitor.home.hero.cityBadge")}
          </Badge>
        )}
        <h1 className="hero-title-premium">
          {t("visitor.home.patrimonio")} <br />
          <span className="text-[var(--accent-primary)] italic lowercase font-medium tracking-normal block ml-4 md:ml-12">
            {t("visitor.home.vivo")}
          </span>
        </h1>
        <p className="hero-subtitle-premium">
          {t("visitor.home.subtitle")}
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
              <span className="bento-label">{t("visitor.home.bento.scanner.label")}</span>
              <span className="bento-title">{t("visitor.home.bento.scanner.title")}</span>
            </div>
            <div className="bento-bg bento-gold-gradient"></div>
          </Link>
          
          <Link to="/mapa" className="bento-card tall">
            <div className="bento-icon">📍</div>
            <div className="bento-info">
              <span className="bento-label">{t("visitor.home.bento.map.label")}</span>
              <span className="bento-title">{t("visitor.home.bento.map.title")}</span>
            </div>
          </Link>

          <Link to="/agenda" className="bento-card">
            <div className="bento-icon">🎟️</div>
            <div className="bento-info">
              <span className="bento-label">Global</span>
              <span className="bento-title">Agenda Cultural</span>
            </div>
          </Link>

          <Link to="/eventos" className="bento-card">
            <div className="bento-icon">📅</div>
            <div className="bento-info">
              <span className="bento-label">{t("visitor.home.bento.events.label")}</span>
              <span className="bento-title">{t("visitor.home.bento.events.title")}</span>
            </div>
          </Link>

          <Link to="/trilhas" className="bento-card">
            <div className="bento-icon">🧭</div>
            <div className="bento-info">
              <span className="bento-label">{t("visitor.home.bento.trails.label")}</span>
              <span className="bento-title">{t("visitor.home.bento.trails.title")}</span>
            </div>
          </Link>

          <Link to="/rpg" className="bento-card large">
            <div className="bento-icon">⚔️</div>
            <div className="bento-info">
              <span className="bento-label">{t("visitor.home.bento.rpg.label")}</span>
              <span className="bento-title">{t("visitor.home.bento.rpg.title")}</span>
            </div>
            <div className="bento-bg bento-gold-gradient-rev"></div>
          </Link>

          <Link to="/desafios" className="bento-card">
            <div className="bento-icon">🎯</div>
            <div className="bento-info">
              <span className="bento-label">{t("visitor.home.bento.challenges.label")}</span>
              <span className="bento-title">{t("visitor.home.bento.challenges.title")}</span>
            </div>
          </Link>

          <Link to="/ranking" className="bento-card">
            <div className="bento-icon">🏆</div>
            <div className="bento-info">
              <span className="bento-label">{t("visitor.home.bento.ranking.label")}</span>
              <span className="bento-title">{t("visitor.home.bento.ranking.title")}</span>
            </div>
          </Link>
        </section>
      )}

      {/* ═══ FEATURED GALLERY ═══════════ */}
      <AnimateIn variant="fadeUp" delay={0.1}>
        <section className="gallery-section">
          <div className="section-header">
            <Badge variant="outline" className="mb-3">{t("visitor.home.gallery.badge")}</Badge>
            <h2 className="text-3xl font-[var(--font-heading)] font-bold text-[var(--fg-main)]">{t("visitor.home.gallery.title")}</h2>
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
                    <span className="gallery-artist">{work.artist || t("visitor.home.gallery.unknownArtist")}</span>
                    <h3 className="gallery-title">{work.title}</h3>
                    <p className="gallery-desc">
                      {t("visitor.home.gallery.descriptionFallback")}
                    </p>
                    <span className="gallery-cta">
                      {t("visitor.home.gallery.cta")} <ArrowRight size={14} />
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
