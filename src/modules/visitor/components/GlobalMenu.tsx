import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ChevronDown, ChevronUp, LogOut, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../auth/AuthContext';
import './GlobalMenu.css';

interface GlobalMenuProps {
  isOpen: boolean;
  onClose: () => void;
  links?: unknown[];
  currentPath: string;
}

export const GlobalMenu: React.FC<GlobalMenuProps> = ({ isOpen, onClose, currentPath }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  React.useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [currentPath]); // eslint-disable-line react-hooks/exhaustive-deps

  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(prev => (prev === section ? null : section));
  };

  const handleSwitchCity = () => {
    navigate('/cidades');
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            className="global-menu-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.nav 
            className="global-menu-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="menu-header">
              <div className="menu-brand">
                <span className="brand-dot" />
                <h2>Menu de Exploração</h2>
              </div>
              <button className="menu-close-btn" onClick={onClose}>
                <X size={24} />
              </button>
            </div>

            <div className="menu-content" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              
              {/* 1. INÍCIO */}
              <Link to="/hub" className={`menu-item ${currentPath === '/hub' ? 'active' : ''}`} onClick={onClose}>
                <span className="item-icon">🏠</span>
                <span className="item-label">Início</span>
              </Link>

              {/* 2. EXPLORAR (Sub-menu) */}
              <div className="menu-section-wrapper">
                <button className={`menu-item-header ${expandedSection === 'explorar' ? 'active-header' : ''}`} onClick={() => toggleSection('explorar')}>
                  <span className="item-icon">🔍</span>
                  <span className="item-label">Explorar</span>
                  {expandedSection === 'explorar' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                <AnimatePresence>
                  {expandedSection === 'explorar' && (
                    <motion.div 
                      className="menu-submenu-items"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: 'hidden', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '4px' }}
                    >
                      <Link to="/cidades" className="submenu-item" onClick={onClose}>
                        <span>🏙️ Cidades</span>
                      </Link>
                      <Link to="/obras" className="submenu-item" onClick={onClose}>
                        <span>🎨 Obras</span>
                      </Link>
                      <Link to="/eventos" className="submenu-item" onClick={onClose}>
                        <span>📅 Eventos</span>
                      </Link>
                      <Link to="/trilhas" className="submenu-item" onClick={onClose}>
                        <span>🗺️ Trilhas</span>
                      </Link>
                      <Link to="/loja" className="submenu-item" onClick={onClose}>
                        <span>🛒 Lojas</span>
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 3. MAPA */}
              <Link to="/mapa" className={`menu-item ${currentPath === '/mapa' ? 'active' : ''}`} onClick={onClose}>
                <span className="item-icon">📍</span>
                <span className="item-label">Mapa</span>
              </Link>

              {/* 4. AGENDA */}
              <Link to="/agenda" className={`menu-item ${currentPath === '/agenda' ? 'active' : ''}`} onClick={onClose}>
                <span className="item-icon">🎟️</span>
                <span className="item-label">Agenda</span>
              </Link>

              {/* 5. ROTEIROS */}
              <Link to="/roteiro" className={`menu-item ${currentPath === '/roteiro' ? 'active' : ''}`} onClick={onClose}>
                <span className="item-icon">🗺️</span>
                <span className="item-label">Roteiros</span>
              </Link>

              {/* 6. SCANNER */}
              <Link to="/scanner" className={`menu-item ${currentPath.startsWith('/scanner') ? 'active' : ''}`} onClick={onClose}>
                <span className="item-icon">📷</span>
                <span className="item-label">Scanner</span>
              </Link>

              {/* 7. PASSAPORTE (Sub-menu) */}
              <div className="menu-section-wrapper">
                <button className={`menu-item-header ${expandedSection === 'passaporte' ? 'active-header' : ''}`} onClick={() => toggleSection('passaporte')}>
                  <span className="item-icon">🎫</span>
                  <span className="item-label">Passaporte</span>
                  {expandedSection === 'passaporte' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                <AnimatePresence>
                  {expandedSection === 'passaporte' && (
                    <motion.div 
                      className="menu-submenu-items"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: 'hidden', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '4px' }}
                    >
                      <Link to="/passaporte" className="submenu-item" onClick={onClose}>
                        <span>🎫 Selos</span>
                      </Link>
                      <Link to="/conquistas" className="submenu-item" onClick={onClose}>
                        <span>✨ Conquistas</span>
                      </Link>
                      <Link to="/ranking" className="submenu-item" onClick={onClose}>
                        <span>🏆 Ranking</span>
                      </Link>
                      <Link to="/meus-certificados" className="submenu-item" onClick={onClose}>
                        <span>🏅 Certificados</span>
                      </Link>
                      <Link to="/desafios" className="submenu-item" onClick={onClose}>
                        <span>🎯 Desafios</span>
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 8. INGRESSOS */}
              <Link to="/meus-ingressos" className={`menu-item ${currentPath === '/meus-ingressos' ? 'active' : ''}`} onClick={onClose}>
                <span className="item-icon">🎫</span>
                <span className="item-label">Ingressos</span>
              </Link>

              {/* 9. PERFIL (Sub-menu) */}
              <div className="menu-section-wrapper">
                <button className={`menu-item-header ${expandedSection === 'perfil' ? 'active-header' : ''}`} onClick={() => toggleSection('perfil')}>
                  <span className="item-icon">👤</span>
                  <span className="item-label">Perfil</span>
                  {expandedSection === 'perfil' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                <AnimatePresence>
                  {expandedSection === 'perfil' && (
                    <motion.div 
                      className="menu-submenu-items"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: 'hidden', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '4px' }}
                    >
                      <Link to="/favoritos" className="submenu-item" onClick={onClose}>
                        <span>❤️ Favoritos</span>
                      </Link>
                      <Link to="/perfil" className="submenu-item" onClick={onClose}>
                        <span>⏳ Histórico</span>
                      </Link>
                      <Link to="/meus-ingressos" className="submenu-item" onClick={onClose}>
                        <span>🎫 Ingressos</span>
                      </Link>
                      <Link to="/meus-certificados" className="submenu-item" onClick={onClose}>
                        <span>🏅 Certificados</span>
                      </Link>
                      <Link to="/perfil" className="submenu-item" onClick={onClose}>
                        <span>⚙️ Configurações</span>
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="menu-separator" />

              <div className="menu-actions">
                <button className="action-item" onClick={handleSwitchCity}>
                  <RefreshCcw size={20} className="action-icon" />
                  <span className="action-label">Trocar de Cidade</span>
                </button>
                <button className="action-item logout" onClick={handleLogout}>
                  <LogOut size={20} className="action-icon" />
                  <span className="action-label">Sair da Conta</span>
                </button>
              </div>
            </div>

            <div className="menu-footer">
              <p>© 2026 Cultura Viva • Experiência Institucional de Luxo</p>
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
};
