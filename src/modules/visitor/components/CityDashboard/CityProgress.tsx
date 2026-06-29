import React from "react";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui";

interface CityProgressProps {
  explorationPercent: number;
  visitedEquipmentsCount: number;
  totalEquipmentsCount: number;
  registeredEventsCount: number;
  activeEventsCount: number;
  completedTrailsCount: number;
  totalTrailsCount: number;
  equipmentsPercent: number;
  eventsPercent: number;
  trailsPercent: number;
  onNavigate: (path: string) => void;
}

export const CityProgress: React.FC<CityProgressProps> = ({
  explorationPercent,
  visitedEquipmentsCount,
  totalEquipmentsCount,
  registeredEventsCount,
  activeEventsCount,
  completedTrailsCount,
  totalTrailsCount,
  equipmentsPercent,
  eventsPercent,
  trailsPercent,
  onNavigate
}) => {
  return (
    <section className="right-panel-block p-5 border-b border-white/5">
      <span className="block-title text-[9px] text-gray-500 font-black uppercase text-left mb-4 block">Seu progresso na cidade</span>

      <div className="donut-progress-row flex items-center gap-5 my-4">
        <div className="donut-svg-wrapper relative">
          <svg className="radial-donut-ring" viewBox="0 0 100 100">
            <circle className="bg-ring" cx="50" cy="50" r="40" />
            <circle className="progress-ring" cx="50" cy="50" r="40" style={{ strokeDashoffset: 251.2 - (251.2 * explorationPercent) / 100 }} />
          </svg>
          <div className="radial-inner-value flex flex-col items-center justify-center">
            <span className="percent font-black text-white text-lg">{explorationPercent}%</span>
            <span className="lbl text-[8px] text-gold-400 uppercase font-black">Explorado</span>
          </div>
        </div>

        <div className="check-progress-list flex-1 text-left space-y-3">
          <div className="check-progress-item">
            <div className="flex justify-between text-[10px] mb-1 font-bold">
              <span className="label text-gray-400">🏛️ {visitedEquipmentsCount}/{totalEquipmentsCount} {totalEquipmentsCount === 1 ? "Equipamento visitado" : "Equipamentos visitados"}</span>
            </div>
            <div className="progress-track-small">
              <div className="fill-gold" style={{ width: `${equipmentsPercent}%` }}></div>
            </div>
          </div>
          <div className="check-progress-item">
            <div className="flex justify-between text-[10px] mb-1 font-bold">
              <span className="label text-gray-400">📅 {registeredEventsCount}/{activeEventsCount} {activeEventsCount === 1 ? "Evento participado" : "Eventos participados"}</span>
            </div>
            <div className="progress-track-small">
              <div className="fill-gold" style={{ width: `${eventsPercent}%` }}></div>
            </div>
          </div>
          <div className="check-progress-item">
            <div className="flex justify-between text-[10px] mb-1 font-bold">
              <span className="label text-gray-400">🧭 {completedTrailsCount}/{totalTrailsCount} {totalTrailsCount === 1 ? "Roteiro concluído" : "Roteiros concluídos"}</span>
            </div>
            <div className="progress-track-small">
              <div className="fill-gold" style={{ width: `${trailsPercent}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <Button 
        variant="outline" 
        className="view-progress-btn w-full border-gold-400 text-gold-400 font-extrabold uppercase text-xs h-9 rounded-lg mt-3 flex items-center justify-center gap-2 hover:bg-gold-400 hover:text-black"
        onClick={() => onNavigate("/perfil")}
      >
        Ver meu progresso <ChevronRight size={14} />
      </Button>
    </section>
  );
};
