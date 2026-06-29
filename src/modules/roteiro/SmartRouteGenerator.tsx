import React, { useState } from 'react';
import { logger } from "@/utils/logger";

import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { Zap, Clock, Wallet, Heart, ArrowRight, Loader } from 'lucide-react';
import './SmartRouteGenerator.css';

import { api } from '../../api/client';

export const SmartRouteGenerator: React.FC = () => {
  const navigate = useNavigate();
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  // States
  const [timeAvailable, setTimeAvailable] = useState('120'); // in minutes
  const [budget, setBudget] = useState('MEDIUM');
  const [interests, setInterests] = useState<string[]>([]);

  const handleInterestToggle = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await api.post(`/${tenantSlug}/roteiro/ai-generate`, {
        timeAvailable: parseInt(timeAvailable),
        budget,
        interests
      });
      logger.info("Roteiro Gerado:", response.data);
      setIsGenerating(false);
      navigate(`/${tenantSlug}/roteiro/map`);
    } catch (err: unknown) {
      setIsGenerating(false);
      logger.error(err);
    }
  };

  return (
    <div className="ai-generator-container">
      <AnimatePresence mode="wait">
        {isGenerating ? (
          <motion.div 
            key="generating"
            className="generating-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="ai-core"
            >
              <Loader size={64} />
            </motion.div>
            <h2 className="glitch-text">Processando dados culturais...</h2>
            <p>Cruzando eventos, obras e horários com seu perfil.</p>
          </motion.div>
        ) : (
          <motion.div 
            key="form"
            className="form-state"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
          >
            <div className="header-icon">
              <Zap size={40} color="#d4af37" />
            </div>
            <h1>Roteiro Inteligente</h1>
            <p className="subtitle">Deixe a IA montar seu dia perfeito.</p>

            <div className="form-section">
              <label><Clock size={16} /> Tempo Disponível</label>
              <input 
                type="range" 
                min="60" 
                max="480" 
                step="30"
                value={timeAvailable} 
                onChange={e => setTimeAvailable(e.target.value)} 
              />
              <div className="range-labels">
                <span>1h</span>
                <span className="current-val">{parseInt(timeAvailable) / 60}h</span>
                <span>8h</span>
              </div>
            </div>

            <div className="form-section">
              <label><Wallet size={16} /> Orçamento Planejado</label>
              <div className="budget-selector">
                {['LOW', 'MEDIUM', 'HIGH'].map(b => (
                  <button 
                    key={b}
                    className={`budget-btn ${budget === b ? 'active' : ''}`}
                    onClick={() => setBudget(b)}
                  >
                    {b === 'LOW' ? '$' : b === 'MEDIUM' ? '$$' : '$$$'}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-section">
              <label><Heart size={16} /> Meus Interesses</label>
              <div className="interests-grid">
                {['História', 'Arte Moderna', 'Gastronomia', 'Música', 'Ao Ar Livre', 'Fotografia'].map(interest => (
                  <button 
                    key={interest}
                    className={`interest-chip ${interests.includes(interest) ? 'active' : ''}`}
                    onClick={() => handleInterestToggle(interest)}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>

            <button 
              className="generate-btn"
              disabled={interests.length === 0}
              onClick={handleGenerate}
            >
              Criar Roteiro Mágico <ArrowRight size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
