import React from 'react';
import { Camera, Image as ImageIcon, Sparkles } from 'lucide-react';
import './SelfieCapture.css';

interface SelfieCaptureProps {
  onCapture: (file: File) => void;
  isGenerating: boolean;
}

export const SelfieCapture: React.FC<SelfieCaptureProps> = ({ onCapture, isGenerating }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onCapture(file);
    }
  };

  if (isGenerating) {
    return (
      <div className="selfie-loading-card">
        <div className="sparkle-container">
          <Sparkles className="sparkle-icon animating" />
        </div>
        <h3>Criando sua Identidade...</h3>
        <p>A IA está transformando sua selfie em um avatar cartoon épico.</p>
        <div className="loading-progress-bar">
          <div className="progress-fill"></div>
        </div>
        <span className="estimated-time">Tempo estimado: 20 segundos</span>
      </div>
    );
  }

  return (
    <div className="selfie-capture-container">
      <div className="selfie-prompt-header">
        <Sparkles className="text-amber-500" size={24} />
        <h2>Avatar Personalizado com IA</h2>
      </div>
      
      <p className="selfie-description">
        Tire uma selfie e transforme-se em um personagem único deste museu. 
        Nossa IA manterá seus traços em um estilo cartoon 2D incrível.
      </p>

      <div className="capture-actions">
        <label className="capture-btn primary">
          <Camera size={24} />
          <span>Tirar Selfie</span>
          <input 
            type="file" 
            accept="image/*" 
            capture="user" 
            className="hidden" 
            onChange={handleChange} 
            disabled={isGenerating}
          />
        </label>

        <label className="capture-btn secondary">
          <ImageIcon size={20} />
          <span>Escolher da Galeria</span>
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleChange} 
            disabled={isGenerating}
          />
        </label>
      </div>

      <div className="selfie-tips">
        <h4>Dicas para um melhor resultado:</h4>
        <ul>
          <li>Procure um local bem iluminado</li>
          <li>Olhe diretamente para a câmera</li>
          <li>Evite fundos muito poluídos</li>
        </ul>
      </div>
    </div>
  );
};
