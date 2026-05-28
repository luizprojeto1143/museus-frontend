import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { Compass, Map as MapIcon, Star, User, Zap, Navigation, Coffee } from 'lucide-react';
import './RoteiroHome.css';

export const RoteiroHome: React.FC = () => {
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="roteiro-loading">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        >
          <Compass size={48} className="loading-icon" />
        </motion.div>
        <h2>Calculando a melhor experiência...</h2>
      </div>
    );
  }

  return (
    <div className="roteiro-container">
      {/* Hero Section */}
      <motion.div 
        className="roteiro-hero"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="hero-content">
          <h1>Explore a Cultura Viva</h1>
          <p>Seu assistente inteligente de turismo local.</p>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="quick-actions-grid">
        <motion.button 
          className="action-card primary-action"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(`/${tenantSlug}/roteiro/ai-generator`)}
        >
          <Zap size={32} />
          <span>Roteiro IA</span>
          <small>Gere um roteiro perfeito</small>
        </motion.button>

        <motion.button 
          className="action-card secondary-action"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(`/${tenantSlug}/roteiro/map`)}
        >
          <MapIcon size={32} />
          <span>Mapa da Cidade</span>
          <small>Exploração livre</small>
        </motion.button>
      </div>

      {/* Marketplace Teaser */}
      <motion.div 
        className="marketplace-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <div className="section-header">
          <h3>Serviços Locais</h3>
          <button className="view-all">Ver tudo</button>
        </div>
        
        <div className="services-carousel">
          <motion.div className="service-chip" whileHover={{ scale: 1.1 }}>
            <User size={20} />
            Guias Turísticos
          </motion.div>
          <motion.div className="service-chip" whileHover={{ scale: 1.1 }}>
            <Coffee size={20} />
            Gastronomia
          </motion.div>
          <motion.div className="service-chip" whileHover={{ scale: 1.1 }}>
            <Navigation size={20} />
            Transporte
          </motion.div>
          <motion.div className="service-chip" whileHover={{ scale: 1.1 }}>
            <Star size={20} />
            Experiências
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
