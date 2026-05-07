import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ChevronRight, LogOut, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../auth/AuthContext';
import './GlobalMenu.css';
import { NavLink } from '../utils/navigation';

interface GlobalMenuProps {
  isOpen: boolean;
  onClose: () => void;
  links: NavLink[];
  currentPath: string;
}

export const GlobalMenu: React.FC<GlobalMenuProps> = ({ isOpen, onClose, links, currentPath }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Categories structure
  const explocacaoPaths = ['/home', '/obras', '/trilhas', '/mapa', '/eventos', '/scanner', '/agenda'];
  const jornadaPaths = ['/rpg', '/perfil', '/colecao', '/meus-certificados', '/meus-ingressos'];
  const socialPaths = ['/desafios', '/ranking', '/loja', '/favoritos', '/chat'];

  const categories = [
    {
      title: 'Exploração',
      items: links.filter(l => explocacaoPaths.includes(l.to))
    },
    {
      title: 'Minha Jornada',
      items: links.filter(l => jornadaPaths.includes(l.to))
    },
    {
      title: 'Social & Mais',
      items: links.filter(l => socialPaths.includes(l.to))
    }
  ];

  // Add any leftover links that are not explicitly categorized
  const categorizedPaths = [...explocacaoPaths, ...jornadaPaths, ...socialPaths];
  const uncategorizedLinks = links.filter(l => !categorizedPaths.includes(l.to));
  if (uncategorizedLinks.length > 0) {
      categories.push({
          title: 'Outros',
          items: uncategorizedLinks
      });
  }

  const handleSwitchMuseum = () => {
    onClose();
    navigate('/select-museum');
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
              <button className="menu-close-btn" onClick={onClose}>
                <X size={24} />
              </button>
            </div>

            <div className="menu-content">
              {categories.map((cat, idx) => (
                <div key={idx} className="menu-category">
                  <h3 className="category-title">{cat.title}</h3>
                  <div className="category-items">
                    {cat.items.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className={`menu-item ${currentPath === item.to ? 'active' : ''}`}
                        onClick={onClose}
                      >
                        <span className="item-icon">{item.icon}</span>
                        <span className="item-label">{item.label}</span>
                        <ChevronRight className="item-chevron" size={16} />
                      </Link>
                    ))}
                  </div>
                </div>
              ))}

              <div className="menu-separator" />

              <div className="menu-actions">
                <button className="action-item" onClick={handleSwitchMuseum}>
                  <RefreshCcw size={20} className="action-icon" />
                  <span className="action-label">Trocar de Museu</span>
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
