import React from "react";
import { Search, Bell } from "lucide-react";

interface CityHeaderProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  authName: string | null;
  activeTitle: string;
}

export const CityHeader: React.FC<CityHeaderProps> = ({ searchQuery, setSearchQuery, authName, activeTitle }) => {
  return (
    <header className="dashboard-top-bar flex justify-between items-center mb-6">
      <div className="search-bar-container max-w-xl flex-1 mr-4">
        <div className="search-bar-wrapper">
          <Search size={18} className="text-gray-400 mr-3" />
          <input 
            type="text" 
            placeholder="Buscar museus, eventos e experiências..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
            <span className="user-profile-name font-bold truncate block">{authName || "Visitante"}</span>
            <span className="user-profile-title font-semibold text-xs text-gold-400 truncate block">{activeTitle}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
