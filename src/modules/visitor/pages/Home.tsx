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
  const { name, tenantId, equipamentoId, role } = useAuth();
  const navigate = useNavigate();
  const term = useTerminology();
  const isCityMode = useIsCityMode();
  const [featuredWorks, setFeaturedWorks] = useState<FeaturedWork[]>([]);
  const [featuredTrails, setFeaturedTrails] = useState<FeaturedTrail[]>([]);
  const [welcomeAudioUrl, setWelcomeAudioUrl] = useState<string | undefined>(undefined);
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
        const [worksRes, trailsRes, equipRes] = await Promise.all([
          api.get(`/works?tenantId=${tenantId}&equipamentoId=${equipamentoId}&limit=3`),
          api.get(`/trails?tenantId=${tenantId}&equipamentoId=${equipamentoId}&limit=2`),
          api.get(`/equipamentos/public/${equipamentoId}`).catch(() => ({ data: {} }))
        ]);
        setFeaturedWorks(Array.isArray(worksRes.data) ? worksRes.data : (worksRes.data.data || []));
        setFeaturedTrails(Array.isArray(trailsRes.data) ? trailsRes.data : (trailsRes.data.data || trailsRes.data || []));

        if (equipRes.data) {
          setWelcomeAudioUrl(equipRes.data.welcomeAudioUrl ? getFullUrl(equipRes.data.welcomeAudioUrl) : undefined);
          setMuseumName(equipRes.data.nome || "");
        }
        
        console.log(`[Home] Tenant: ${tenantId}, Works found: ${Array.isArray(worksRes.data) ? worksRes.data.length : (worksRes.data.data?.length || 0)}`);
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const toRoman = (num: number) => {
    const map = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
    let res = '';
    for (const key in map) {
      const repeat = Math.floor(num / (map as any)[key]);
      num -= repeat * (map as any)[key];
      res += key.repeat(repeat);
    }
    return res;
  };

  return (
    <motion.div 
      className="home-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ═══ HERO SECTION ═══════════════ */}
      <motion.section variants={itemVariants} className="home-hero-premium">
        <span className="hero-badge-premium">
          Secretaria Municipal de Cultura
        </span>
        <h1 className="hero-title-premium">
          {museumName || "Cultura Viva"}
        </h1>
        <p className="hero-subtitle-premium">
          Explore a alma cultural de Betim através de uma jornada digital imersiva, onde a história encontra o futuro.
        </p>
      </motion.section>

      {/* ═══ BENTO ACTIONS ══════════════ */}
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
      </section>

      {/* ═══ FEATURED GALLERY ═══════════ */}
      <section className="gallery-section">
        <div className="section-header">
          <span className="hero-badge-premium">Galeria de Destaques</span>
          <h2 className="gallery-title">Obras Selecionadas</h2>
        </div>

        {loading ? (
          <div className="flex justify-center p-20">
            <div className="splash-loader-fill h-1 w-40"></div>
          </div>
        ) : (
          <div className="gallery-grid">
            {featuredWorks.map((work, idx) => (
              <article key={work.id} className="gallery-item">
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
                  <Link to={`/obras/${work.id}`} className="gallery-cta">
                    Explorar Detalhes <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );
};
