import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { X, ChevronDown, ChevronUp, LogOut, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../auth/AuthContext';
import { getCityContextLinks, getEquipmentContextLinks } from '../../../config/visitorNavigation.config';
import './GlobalMenu.css';

interface GlobalMenuProps {
  isOpen: boolean;
  onClose: () => void;
  links?: unknown[];
  currentPath?: string; // kept for backward compat but now derived internally
}

export const GlobalMenu: React.FC<GlobalMenuProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { citySlug, equipmentSlug } = useParams();
  const location = useLocation();
  const currentPath = location.pathname;

  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) onClose();
  }, [location.pathname]);

  const toggleSection = (section: string) => {
    setExpandedSection(prev => (prev === section ? null : section));
  };

  const handleSwitchCity = () => {
    onClose();
    navigate('/cidades');
  };

  const handleNavigate = (path: string) => {
    onClose();
    navigate(path);
  };

  const handleLogout = () => {
    onClose();
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
              <button 
                type="button" 
                className="menu-close-btn" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  e.stopPropagation(); 
                  onClose(); 
                }} 
                aria-label="Fechar menu"
              >
                <X size={24} />
              </button>
            </div>

            <div className="menu-content" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button type="button" className={`menu-item ${currentPath === '/hub' ? 'active' : ''}`} onClick={() => handleNavigate('/hub')}>
                <span className="item-icon">🏠</span>
                <span className="item-label">Início</span>
              </button>

              <button type="button" className={`menu-item ${currentPath.startsWith('/cidades') && !citySlug ? 'active' : ''}`} onClick={() => handleNavigate('/cidades')}>
                <span className="item-icon">🌆</span>
                <span className="item-label">Cidades</span>
              </button>

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
                            <button key={link.id} type="button" className="submenu-item" onClick={() => handleNavigate(link.path)}>
                              <span>{link.label}</span>
                            </button>
                          ))
                        ) : (
                          getCityContextLinks(citySlug || '').map(link => (
                            <button key={link.id} type="button" className="submenu-item" onClick={() => handleNavigate(link.path)}>
                              <span>{link.label}</span>
                            </button>
                          ))
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              <button type="button" className={`menu-item ${currentPath === '/scanner' ? 'active' : ''}`} onClick={() => handleNavigate('/scanner')}>
                <span className="item-icon">📷</span>
                <span className="item-label">Scanner Universal</span>
              </button>

              <button type="button" className={`menu-item ${currentPath === '/passaporte' ? 'active' : ''}`} onClick={() => handleNavigate('/passaporte')}>
                <span className="item-icon">🎫</span>
                <span className="item-label">Passaporte</span>
              </button>

              <button type="button" className={`menu-item ${currentPath === '/meus-ingressos' ? 'active' : ''}`} onClick={() => handleNavigate('/meus-ingressos')}>
                <span className="item-icon">🎟️</span>
                <span className="item-label">Ingressos</span>
              </button>

              <button type="button" className={`menu-item ${currentPath === '/rpg' ? 'active' : ''}`} onClick={() => handleNavigate('/rpg')}>
                <span className="item-icon">🗡️</span>
                <span className="item-label">RPG</span>
              </button>

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
                      <button type="button" className="submenu-item" onClick={() => handleNavigate('/favoritos')}>
                        <span>❤️ Favoritos</span>
                      </button>
                      <button type="button" className="submenu-item" onClick={() => handleNavigate('/meus-certificados')}>
                        <span>🏅 Certificados</span>
                      </button>
                      <button type="button" className="submenu-item" onClick={() => handleNavigate('/perfil')}>
                        <span>⚙️ Configurações</span>
                      </button>
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
