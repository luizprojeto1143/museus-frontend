import React, { useEffect, useState } from 'react';
import './SplashScreen.css';

interface SplashScreenProps {
  name: string;
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ name, onComplete }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onComplete, 800); // Wait for exit animation
    }, 4500);

    return () => clearTimeout(timer);
  }, []); // Only run once on mount

  return (
    <div className={`splash-wrapper ${isExiting ? 'splash-exit' : ''}`}>
      <div className="splash-badge">Secretaria Municipal de Arte e Cultura</div>
      
      <div className="splash-seal">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="48" stroke="url(#g)" strokeWidth="0.5"/>
          <path d="M50 20 L30 80 L70 80 Z" fill="url(#g)" opacity="0.1"/>
          <path d="M50 30 L40 70 L60 70 Z" stroke="url(#g)" strokeWidth="1"/>
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="100" y2="100">
              <stop stopColor="#f0c060"/>
              <stop offset="1" stopColor="#c9943a"/>
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="splash-city">Cultura Viva</div>
      <div className="splash-sub">Betim · Minas Gerais</div>

      <div className="splash-greeting">
        <div className="splash-g-label">Que bom te ver de novo</div>
        <div className="splash-g-text">Bem-vindo, <span className="splash-g-name">{name}</span></div>
      </div>

      <div className="splash-loader">
        <div className="splash-loader-fill"></div>
      </div>
    </div>
  );
};
