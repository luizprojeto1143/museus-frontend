import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../../api/client";
import { getFullUrl } from "../../../utils/url";
import { useTerminology } from "../../../hooks/useTerminology";
import { useIsCityMode } from "../../auth/TenantContext";
import { Camera, Map, Compass, ArrowRight } from "lucide-react";
import { NarrativeAudioGuide } from "../components/NarrativeAudioGuide";
import { motion } from "framer-motion";
import "./Home.css";

interface FeaturedWork {
  id: string;
  title: string;
  artist?: string;
  year?: string;
  imageUrl?: string;
  category?: { name: string } | string;
}

interface FeaturedTrail {
  id: string;
  title: string;
  description?: string;
}

export const Home: React.FC = () => {
  const { t } = useTranslation();
  const { name, tenantId, role } = useAuth();
  const navigate = useNavigate();
  const term = useTerminology();
  const isCityMode = useIsCityMode();
  const [featuredWorks, setFeaturedWorks] = useState<FeaturedWork[]>([]);
  const [featuredTrails, setFeaturedTrails] = useState<FeaturedTrail[]>([]);
  const [welcomeAudioUrl, setWelcomeAudioUrl] = useState<string | null>(null);
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
        const [worksRes, trailsRes, settingsRes] = await Promise.all([
          api.get(`/works?tenantId=${tenantId}&limit=3`),
          api.get(`/trails?tenantId=${tenantId}&limit=2`),
          api.get(`/tenants/${tenantId}/settings`).catch(() => ({ data: {} }))
        ]);
        setFeaturedWorks(Array.isArray(worksRes.data) ? worksRes.data : (worksRes.data.data || []));
        setFeaturedTrails(Array.isArray(trailsRes.data) ? trailsRes.data : (trailsRes.data.data || trailsRes.data || []));

        if (settingsRes.data?.welcomeAudioUrl) {
          setWelcomeAudioUrl(getFullUrl(settingsRes.data.welcomeAudioUrl));
          setMuseumName(settingsRes.data.name || "");
        }
        
        console.log(`[Home] Tenant: ${tenantId}, Works found: ${Array.isArray(worksRes.data) ? worksRes.data.length : (worksRes.data.data?.length || 0)}`);
      } catch (err) {
        console.error("Error fetching home data", err);
      } finally {
        setLoading(false);
      }
    };

    if (tenantId) fetchData();
  }, [tenantId]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      className="home-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* HERO SECTION */}
      <motion.section variants={itemVariants} className="home-hero">
        <div className="hero-content">
          <span className="hero-badge">
            ✨ {t("visitor.home.badge", "Premium Experience")}
          </span>

          <h1 className="hero-title">
            Olá, {name || t("common.visitor", "Viajante")}
          </h1>

          <p className="hero-subtitle">
            {isCityMode
              ? "Descubra os tesouros escondidos e a rica história da nossa cidade através de uma jornada digital imersiva."
              : "Explore séculos de arte e cultura em uma experiência desenhada para encantar seus sentidos."}
          </p>

          <div className="hero-actions">
            <Link to="/scanner" className="hero-btn hero-btn-primary">
              <Camera size={20} />
              Abrir Scanner
            </Link>
            <Link to="/mapa" className="hero-btn hero-btn-secondary">
              <Map size={20} />
              {t("visitor.home.viewMap")}
            </Link>
          </div>
        </div>
      </motion.section>

      {/* ROADMAP 2026 SHOWCASE - PREMIUM GLASS */}
      <motion.section variants={itemVariants} className="roadmap-showcase space-y-8 mb-16">
        <div className="section-header">
          <span className="badge bg-gold-400/20 text-gold-400 self-start">Roadmap 2026</span>
          <h2 className="text-3xl font-black">Uma Nova Era na QS Cultura</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <Link to="/rpg" className="roadmap-card group">
              <div className="text-4xl mb-6 group-hover:scale-110 transition-transform">🗡️</div>
              <h3 className="text-xl font-bold mb-2">Seu Avatar Digital</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Personalize seu herói cultural, evolua níveis e conquiste itens raros no museu.</p>
           </Link>
           <Link to="/comunidade" className="roadmap-card group">
              <div className="text-4xl mb-6 group-hover:scale-110 transition-transform">🏘️</div>
              <h3 className="text-xl font-bold mb-2">Comunidade Viva</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Conecte-se com outros entusiastas, compartilhe fotos e histórias das suas visitas.</p>
           </Link>
           <Link to="/loja" className="roadmap-card group">
              <div className="text-4xl mb-6 group-hover:scale-110 transition-transform">🛒</div>
              <h3 className="text-xl font-bold mb-2">Marketplace Cultural</h3>
              <p className="text-sm text-slate-400 leading-relaxed">Troque seus pontos de experiência por moedas reais do museu e itens exclusivos.</p>
           </Link>
        </div>
      </motion.section>

      {/* WELCOME AUDIO */}
      {welcomeAudioUrl && (
        <motion.section variants={itemVariants} className="mb-16">
          <NarrativeAudioGuide
            audioUrl={welcomeAudioUrl}
            title={museumName || t("visitor.home.welcomeAudio", "Guia de Boas-vindas")}
          />
        </motion.section>
      )}

      {/* FEATURED WORKS */}
      <motion.section variants={itemVariants} className="works-section mb-16">
        <div className="section-header">
          <h2>{term.featuredWorks}</h2>
          <p>Destaques selecionados da nossa curadoria para você.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => <div key={i} className="skeleton-card" />)}
          </div>
        ) : featuredWorks.length > 0 ? (
          <div className="works-grid">
            {featuredWorks.map(work => (
              <article key={work.id} className="work-card">
                <div 
                  className="work-image"
                  style={{ backgroundImage: `url(${getFullUrl(work.imageUrl || '')})` }}
                />
                <div className="work-content">
                  <h3 className="work-title">{work.title}</h3>
                  <p className="work-artist">{work.artist || 'Artista Desconhecido'}</p>
                  <div className="work-chips">
                    <span className="work-chip">{typeof work.category === 'string' ? work.category : work.category?.name || 'Geral'}</span>
                    <span className="work-chip">Acessível</span>
                  </div>
                  <Link to={`/obras/${work.id}`} className="work-btn">
                    Explorar Obra <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">🎨</span>
            <p>Nenhuma obra selecionada no momento.</p>
          </div>
        )}
      </motion.section>

      {/* RECOMMENDATIONS */}
      <motion.section variants={itemVariants} className="trails-section">
        <div className="section-header">
          <h2>{t("visitor.home.recommendedTrails")}</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map(i => <div key={i} className="skeleton-card" style={{ height: 200 }} />)}
          </div>
        ) : featuredTrails.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredTrails.map(trail => (
              <article key={trail.id} className="roadmap-card flex flex-col justify-between group">
                <div>
                   <h3 className="text-xl font-bold text-white mb-2">{trail.title}</h3>
                   <p className="text-slate-400 text-sm mb-8 leading-relaxed line-clamp-2">{trail.description}</p>
                </div>
                <Link to={`/trilhas/${trail.id}`} className="work-btn !w-fit px-8 !bg-white/5 hover:!bg-white/10">
                   Iniciar Jornada <Compass size={16} />
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">🧭</span>
            <p>Descubra novas rotas em breve.</p>
          </div>
        )}
      </motion.section>
    </motion.div>
  );
};
