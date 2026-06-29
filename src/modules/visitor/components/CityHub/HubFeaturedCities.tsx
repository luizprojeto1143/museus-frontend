import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { getFullUrl } from "../../../../utils/url";
import { CityData } from "../../pages/CityHub";

interface HubFeaturedCitiesProps {
  filteredCities: CityData[];
}

export const HubFeaturedCities: React.FC<HubFeaturedCitiesProps> = ({ filteredCities }) => {
  const navigate = useNavigate();

  return (
    <section className="dashboard-section-row mb-10">
      <div className="section-title-flex flex justify-between items-center mb-6">
        <h3 className="section-title font-bold text-white border-l-2 border-gold-400 pl-3">Cidades em destaque</h3>
        <button className="text-xs text-gold-400 hover:underline">Ver todas &gt;</button>
      </div>

      <div className="dashboard-cities-carousel">
        {filteredCities.length > 0 ? (
          filteredCities.map((c) => (
            <div 
              key={c.id} 
              className="carousel-city-card"
              onClick={() => navigate(`/cidades/${c.slug}`)}
            >
              <div className="carousel-city-img-wrapper">
                <img 
                  src={getFullUrl(c.coverImageUrl || "")} 
                  alt={c.name} 
                  className="carousel-city-img" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder-image.jpg";
                  }}
                />
                <div className="carousel-city-overlay"></div>
                <div className="carousel-city-museum-badge">🏛️</div>
              </div>
              <div className="carousel-city-info flex flex-col p-4 text-left">
                <h4 className="carousel-city-name font-bold text-white text-base">{c.name}</h4>
                <span className="carousel-city-exp-count text-xs text-gray-400">
                  {c.totalExperiences} experiências
                </span>
              </div>
            </div>
          ))
        ) : (
          <div 
            className="carousel-city-card cursor-pointer"
            onClick={() => toast.error("Cidade em manutenção, logo irá ser liberada!!")}
          >
            <div className="carousel-city-img-wrapper">
              <img 
                src="/placeholder-image.jpg" 
                alt="Novas Cidades" 
                className="carousel-city-img opacity-50" 
              />
              <div className="carousel-city-overlay"></div>
              <div className="carousel-city-museum-badge">🏛️</div>
            </div>
            <div className="carousel-city-info flex flex-col p-4 text-left">
              <h4 className="carousel-city-name font-bold text-white text-base">Novas Cidades</h4>
              <span className="carousel-city-exp-count text-xs text-gold-400 font-bold">
                Cidade em manutenção, logo irá ser liberada!!
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
