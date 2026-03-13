import React from 'react';
import { useGamification } from '../../gamification/context/GamificationContext';
import './HUDRPG.css';

export const HUDRPG: React.FC = () => {
  const { currentLevel, nextLevel, stats, progressToNextLevel } = useGamification();

  return (
    <div className="hud">
      <div className="hud-char">
        <div className="hud-avatar">
          <svg viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="18" fill="rgba(201,148,58,.1)" stroke="var(--gold)" strokeWidth="1"/>
            <path d="M20 10 L25 25 L15 25 Z" fill="var(--gold)"/>
          </svg>
        </div>
        <div className="hud-info">
          <div className="hud-lvl">Nv. {currentLevel.level.toString().padStart(2, '0')}</div>
          <div className="hud-class">{currentLevel.title}</div>
        </div>
      </div>
      
      <div className="hud-xp">
        <div className="hud-xp-label">
          <span>{stats.xp} / {nextLevel?.minXp || 'MAX'}</span>
          <span className="gold-text">XP</span>
        </div>
        <div className="hud-xp-bar">
          <div className="hud-xp-fill" style={{ width: `${progressToNextLevel}%` }}></div>
        </div>
      </div>

      <div className="hud-actions">
        <button className="hud-btn" title="Coleção">✨</button>
        <button className="hud-btn" title="Desafios">🎯</button>
      </div>
    </div>
  );
};
