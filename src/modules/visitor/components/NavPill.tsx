import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { buildEquipmentUrl, buildMuseumMapUrl, buildScannerUrl } from '@/utils/routes';
import { readMuseumCtx } from '@/config/golive';
import './NavPill.css';

interface NavPillProps {
  onMenuClick: () => void;
}

export const NavPill: React.FC<NavPillProps> = ({ onMenuClick }) => {
  const location = useLocation();
  const params = useParams<{ citySlug?: string; equipmentSlug?: string }>();
  const ctx = readMuseumCtx();
  const citySlug = params.citySlug || ctx?.citySlug;
  const equipmentSlug = params.equipmentSlug || ctx?.equipmentSlug;
  const base = citySlug && equipmentSlug ? buildEquipmentUrl(citySlug, equipmentSlug) : null;

  const navItems = [
    { to: base || '/hub', label: 'Início', icon: '🏠' },
    { to: base ? `${base}/obras` : '/select-museum', label: 'Obras', icon: '🏜️' },
    { to: citySlug && equipmentSlug ? buildScannerUrl(citySlug, equipmentSlug) : '/scanner', label: 'Scan', icon: '📷' },
    { to: citySlug && equipmentSlug ? buildMuseumMapUrl(citySlug, equipmentSlug) : '/mapa', label: 'Mapa', icon: '📍' },
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
              className={`nav-p-item ${location.pathname === item.to || location.pathname.startsWith(item.to + '/') ? 'active' : ''}`}
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
