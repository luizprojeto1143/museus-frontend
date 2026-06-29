import React from "react";

interface HubCulturalProgressProps {
  totalExploration: number;
  citiesVisited: number;
  museumsExplored: number;
  visitor: { achievements: number; stamps: number; name: string; email: string } | null;
}

export const HubCulturalProgress: React.FC<HubCulturalProgressProps> = ({ 
  totalExploration, 
  citiesVisited, 
  museumsExplored, 
  visitor 
}) => {
  return (
    <section className="dashboard-cultural-progress-banner">
      <div className="progress-banner-header flex justify-between items-center mb-6">
        <h3 className="section-title font-bold text-white border-l-2 border-gold-400 pl-3">Seu progresso cultural</h3>
      </div>

      <div className="progress-banner-flex">
        <div className="progress-circular-widget flex items-center gap-4">
          <div className="circular-progress-ring-gold">
            <div className="circular-inner">
              <span className="circular-pct font-black">{totalExploration}%</span>
              <span className="circular-lbl font-semibold">Exploração</span>
            </div>
          </div>
        </div>

        <div className="progress-numeric-stats">
          <div className="progress-stat-col text-left">
            <h4 className="stat-number font-black text-white text-2xl">{citiesVisited}</h4>
            <span className="stat-lbl font-semibold text-xs text-gray-400">Cidades visitadas</span>
          </div>
          <div className="progress-stat-col text-left">
            <h4 className="stat-number font-black text-white text-2xl">{museumsExplored}</h4>
            <span className="stat-lbl font-semibold text-xs text-gray-400">Museus explorados</span>
          </div>
          <div className="progress-stat-col text-left">
            <h4 className="stat-number font-black text-white text-2xl">{visitor?.stamps || 0}</h4>
            <span className="stat-lbl font-semibold text-xs text-gray-400">Obras descobertas</span>
          </div>
          <div className="progress-stat-col text-left">
            <h4 className="stat-number font-black text-white text-2xl">{visitor?.achievements || 0}</h4>
            <span className="stat-lbl font-semibold text-xs text-gray-400">Conquistas</span>
          </div>
        </div>
      </div>
    </section>
  );
};
