import React from "react";
import { toast } from "react-hot-toast";
import { getFullUrl } from "../../../../utils/url";

interface HubHeroBannerProps {
  hubSettings: { title: string; subtitle: string; imageUrl: string } | null;
  hasCities: boolean;
}

export const HubHeroBanner: React.FC<HubHeroBannerProps> = ({ hubSettings, hasCities }) => {
  return (
    <div 
      className="dashboard-hero-banner cursor-pointer" 
      onClick={() => {
        if (!hasCities) {
          toast.error("Cidade em manutenção, logo irá ser liberada!!");
        }
      }}
      style={hubSettings?.imageUrl ? { backgroundImage: `radial-gradient(circle at 0% 0%, rgba(234, 179, 8, 0.05) 0%, transparent 60%), url(${getFullUrl(hubSettings.imageUrl)})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
    >
      <div className="hero-banner-glow"></div>
      <div className="hero-banner-content">
        <span className="hero-welcome-lbl">Bem-vindo ao</span>
        <div className="hero-banner-title-flex flex items-center gap-4">
          <h1 className="hero-title-main font-black">
            {hubSettings?.title ? hubSettings.title.split(" ").slice(0, -1).join(" ") : "Pulse"}{" "}
            <span className="text-gold-400">{hubSettings?.title ? hubSettings.title.split(" ").pop() || "Hub" : "Hub"}</span>
          </h1>
          <div className="heartbeat-pulse-line">
            <span className="heartbeat-pulse"></span>
          </div>
        </div>
        <p className="hero-subtitle-desc" style={{ whiteSpace: 'pre-line' }}>
          {hubSettings?.subtitle || `Conecte-se com a cultura.\nExplore. Descubra. Viva experiências únicas.`}
        </p>
      </div>
    </div>
  );
};
