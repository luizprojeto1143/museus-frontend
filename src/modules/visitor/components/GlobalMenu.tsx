import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { X, ChevronDown, ChevronUp, LogOut, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../auth/AuthContext';
import { getCityContextLinks, getEquipmentContextLinks } from '../../../config/visitorNavigation.config';
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
  const { citySlug, equipmentSlug } = useParams();

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
              
              {/* 2. CIDADES */}
              <Link to="/cidades" className={`menu-item ${currentPath.startsWith('/cidades') && !citySlug ? 'active' : ''}`} onClick={onClose}>
                <span className="item-icon">🏙️</span>
                <span className="item-label">Cidades</span>
              </Link>

              {/* 3. CONTEXTO (CIDADE OU MUSEU) */}
              {(citySlug || equipmentSlug) && (
                <div className="menu-section-wrapper">
                  <button className={`menu-item-header ${expandedSection === 'contexto' ? 'active-header' : ''}`} onClick={() => toggleSection('contexto')}>
                    <span className="item-icon">{equipmentSlug ? '🏛️' : '📍'}</span>
                    <span className="item-label">{equipmentSlug ? 'No Museu' : 'Na Cidade'}</span>
                    {expandedSection === 'contexto' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <AnimatePresence>
                    {expandedSection === 'contexto' && (
                      <motion.div 
                        className="menu-submenu-items"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ overflow: 'hidden', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '4px' }}
                      >
                        {equipmentSlug ? (
                          getEquipmentContextLinks(citySlug || '', equipmentSlug).map(link => (
                            <Link key={link.id} to={link.path} className="submenu-item" onClick={onClose}>
                              <span>{link.label}</span>
                            </Link>
                          ))
                        ) : (
                          getCityContextLinks(citySlug || '').map(link => (
                            <Link key={link.id} to={link.path} className="submenu-item" onClick={onClose}>
                              <span>{link.label}</span>
                            </Link>
                          ))
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* 4. SCANNER GLOBAL */}
              <Link to="/scanner" className={`menu-item ${currentPath === '/scanner' ? 'active' : ''}`} onClick={onClose}>
                <span className="item-icon">📷</span>
                <span className="item-label">Scanner Universal</span>
              </Link>

              {/* 5. PASSAPORTE GLOBAL */}
              <Link to="/passaporte" className={`menu-item ${currentPath === '/passaporte' ? 'active' : ''}`} onClick={onClose}>
                <span className="item-icon">🎫</span>
                <span className="item-label">Passaporte</span>
              </Link>

              {/* 6. INGRESSOS */}
              <Link to="/meus-ingressos" className={`menu-item ${currentPath === '/meus-ingressos' ? 'active' : ''}`} onClick={onClose}>
                <span className="item-icon">🎟️</span>
                <span className="item-label">Ingressos</span>
              </Link>

              {/* 7. PERFIL (Sub-menu) */}
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
