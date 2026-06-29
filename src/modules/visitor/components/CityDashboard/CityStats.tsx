import React from "react";

interface CityStatsProps {
  equipmentsCount: number;
  activeEventsCount: number;
  trailsCount: number;
  totalExperiences: number;
}

export const CityStats: React.FC<CityStatsProps> = ({ equipmentsCount, activeEventsCount, trailsCount, totalExperiences }) => {
  return (
    <div className="hero-stats-row flex gap-6 border-t border-white/5 pt-4">
      <div className="hero-stat-item">
        <span className="stat-num font-black text-white text-lg">🏛️ {equipmentsCount}</span>
        <span className="stat-lbl text-[9px] text-gray-500 font-bold uppercase block">Museus</span>
      </div>
      <div className="hero-stat-item">
        <span className="stat-num font-black text-white text-lg">📅 {activeEventsCount}</span>
        <span className="stat-lbl text-[9px] text-gray-500 font-bold uppercase block">Eventos</span>
      </div>
      <div className="hero-stat-item">
        <span className="stat-num font-black text-white text-lg">🧭 {trailsCount}</span>
        <span className="stat-lbl text-[9px] text-gray-500 font-bold uppercase block">Roteiros</span>
      </div>
      <div className="hero-stat-item">
        <span className="stat-num font-black text-white text-lg">➕ {totalExperiences}+</span>
        <span className="stat-lbl text-[9px] text-gray-500 font-bold uppercase block">Experiências</span>
      </div>
    </div>
  );
};
