import React, { useState } from "react";
import { ExitPinModal } from "../components/ExitPinModal";
import { ShieldCheck, LogOut } from "lucide-react";
import "./TotemLayout.css";

interface TotemLayoutProps {
  children: React.ReactNode;
}

export const TotemLayout: React.FC<TotemLayoutProps> = ({ children }) => {
  const [showExitModal, setShowExitModal] = useState(false);

  return (
    <div className="totem-layout-container">
      <header className="totem-top-bar">
        <div className="totem-brand">
          <ShieldCheck size={28} className="text-gold" />
          <span className="totem-title">MODO TOTEM</span>
        </div>
        <button 
          className="totem-exit-btn"
          onClick={() => setShowExitModal(true)}
        >
          <LogOut size={20} />
          <span>Sair do Kiosk</span>
        </button>
      </header>

      <main className="totem-main-view">
        {children}
      </main>

      {showExitModal && (
        <ExitPinModal 
          onClose={() => setShowExitModal(false)}
        />
      )}
    </div>
  );
};
