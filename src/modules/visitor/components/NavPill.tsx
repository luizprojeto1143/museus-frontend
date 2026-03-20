import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './NavPill.css';

interface NavPillProps {
  onMenuClick: () => void;
}

export const NavPill: React.FC<NavPillProps> = ({ onMenuClick }) => {
  const location = useLocation();

  const navItems = [
    { to: '/home', label: 'Início', icon: '🏠' },
    { to: '/obras', label: 'Obras', icon: '🏛️' },
    { to: '/scanner', label: 'Scan', icon: '📷' },
    { to: '/mapa', label: 'Mapa', icon: '📍' },
    { to: '/rpg', label: 'RPG', icon: '🗡️' },
    { to: '#menu', label: 'Mais', icon: '☰', isMenu: true },
  ];

  return (
    <nav className="nav-pill-canvas">
      <div className="nav-pill">
        {navItems.map((item) => (
          item.isMenu ? (
            <button
              key="menu-toggle"
              className="nav-p-item"
              onClick={onMenuClick}
            >
              <span className="nav-p-icon">{item.icon}</span>
              <span className="nav-p-label">{item.label}</span>
            </button>
          ) : (
            <Link
              key={item.to}
              to={item.to}
              className={`nav-p-item ${location.pathname === item.to ? 'active' : ''}`}
            >
              <span className="nav-p-icon">{item.icon}</span>
              <span className="nav-p-label">{item.label}</span>
            </Link>
          )
        ))}
      </div>
    </nav>
  );
};
