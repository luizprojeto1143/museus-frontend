import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../api/client";
import { toast } from "react-hot-toast";
import { ShieldAlert, Delete } from "lucide-react";
import "./ExitPinModal.css";

interface ExitPinModalProps {
  onClose: () => void;
}

export const ExitPinModal: React.FC<ExitPinModalProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  const deviceId = localStorage.getItem("totem_device_id");
  const deviceToken = localStorage.getItem("totem_device_token");

  const handleKeyPress = (num: string) => {
    if (pin.length < 8) {
      setPin(prev => prev + num);
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleVerify = async () => {
    if (!pin) return;
    setLoading(true);

    try {
      if (deviceId && deviceToken) {
        // Authenticate request using device credentials
        const res = await api.post(`/totem/devices/${deviceId}/verify-pin`, 
          { pin },
          { headers: { "X-Totem-Token": deviceToken } }
        );

        if (res.data.valid) {
          toast.success("Acesso liberado!");
          localStorage.removeItem("totem_device_id");
          localStorage.removeItem("totem_device_token");
          navigate("/admin");
        } else {
          toast.error("PIN incorreto");
          setPin("");
        }
      } else {
        // Fallback for unregistered local totems
        if (pin === "1234") {
          toast.success("Acesso liberado (PIN de emergência)");
          navigate("/admin");
        } else {
          toast.error("PIN incorreto");
          setPin("");
        }
      }
    } catch (error) {
      toast.error("Erro ao verificar PIN com o servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="exit-pin-overlay">
      <div className="exit-pin-card">
        <div className="exit-pin-header">
          <ShieldAlert size={40} className="text-red-500 animate-pulse" />
          <h3>Sair do Modo Kiosk</h3>
          <p>Digite o PIN de segurança do dispositivo.</p>
        </div>

        <div className="pin-display">
          {"•".repeat(pin.length) || <span className="pin-placeholder">PIN</span>}
        </div>

        {/* Numpad */}
        <div className="pin-numpad">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map(n => (
            <button key={n} onClick={() => handleKeyPress(n)} className="numpad-btn">{n}</button>
          ))}
          <button onClick={() => setPin("")} className="numpad-btn action-btn text-red-500">C</button>
          <button onClick={() => handleKeyPress("0")} className="numpad-btn">0</button>
          <button onClick={handleBackspace} className="numpad-btn action-btn"><Delete size={20} /></button>
        </div>

        <div className="pin-actions">
          <button onClick={onClose} className="pin-btn cancel-btn">Voltar</button>
          <button 
            onClick={handleVerify} 
            disabled={loading || !pin}
            className="pin-btn confirm-btn"
          >
            {loading ? "Validando..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
};
