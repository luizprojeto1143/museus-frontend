import React from "react";
import { Search, Bell } from "lucide-react";

interface HubHeaderProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  authName: string | null;
  levelTitle: string;
}

export const HubHeader: React.FC<HubHeaderProps> = ({ searchTerm, setSearchTerm, authName, levelTitle }) => {
  return (
    <header className="dashboard-top-bar flex justify-between items-center mb-8">
      <div className="search-bar-container max-w-xl flex-1 mr-4">
        <div className="search-bar-wrapper">
          <Search size={18} className="text-gray-400 mr-3" />
          <input 
            type="text" 
            placeholder="Buscar cidades, museus, obras e experiências..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="topbar-search-input"
          />
        </div>
      </div>

      <div className="topbar-user-profile flex items-center gap-4">
        <button className="bell-notification-btn relative">
          <Bell size={20} className="text-gray-400 hover:text-white transition-colors" />
          <span className="bell-badge-pulse"></span>
        </button>
        <div className="user-profile-meta flex items-center gap-3">
          <div className="user-avatar-circular">
            {authName ? authName.charAt(0).toUpperCase() : "V"}
          </div>
          <div className="flex flex-col text-left min-w-0">
            <span className="user-profile-name font-bold block truncate">{authName || "Visitante"}</span>
            <span className="user-profile-title font-semibold text-xs text-gold-400 block truncate">{levelTitle}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
