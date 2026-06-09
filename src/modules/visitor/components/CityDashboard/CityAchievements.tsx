import React from "react";
import { useNavigate } from "react-router-dom";
import { Achievement } from "../../types/domain";

interface CityAchievementsProps {
  dbAchievements: Achievement[];
}

export const CityAchievements: React.FC<CityAchievementsProps> = ({ dbAchievements }) => {
  const navigate = useNavigate();

  return (
    <section className="right-panel-block p-5 border-b border-white/5 text-left">
      <div className="flex justify-between items-center mb-4">
        <span className="block-title text-[9px] text-gray-500 font-black uppercase">Conquistas da cidade</span>
        <button className="block-action text-[9px] text-gold-400 font-bold hover:underline" onClick={() => navigate("/conquistas")}>Ver todas</button>
      </div>

      <div className="city-achievements-row flex gap-4 justify-between my-2">
        {dbAchievements.length > 0 ? (
          dbAchievements.slice(0, 4).map((ach, idx) => {
            const colors = ["gold", "purple", "bronze", "dark"];
            const color = colors[idx % 4];
            return (
              <div key={ach.id} className={`achievement-badge-shield ${color}`} title={ach.description || ach.name}>
                {ach.name.includes("Pioneiro") ? "🥇" : ach.name.includes("Mestre") ? "👑" : ach.name.includes("Rotas") ? "🧭" : "🔒"}
              </div>
            );
          })
        ) : (
          <div className="text-center py-2 text-xs text-gray-500 font-semibold w-full">
            Sem conquistas cadastradas
          </div>
        )}
      </div>
    </section>
  );
};
