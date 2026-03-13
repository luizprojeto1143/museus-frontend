import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGamification } from "../../gamification/context/GamificationContext";
import { useAuth } from "../../auth/AuthContext";
import { Trophy, Lock, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import "./Achievements.css";

export default function Achievements() {
  const { t } = useTranslation();
  const { isGuest } = useAuth();
  const { stats, loading } = useGamification();
  const navigate = useNavigate();

  const progress = useMemo(() => {
    if (!stats?.achievements?.length) return 0;
    const unlocked = stats.achievements.filter(a => a.unlockedAt).length;
    return Math.round((unlocked / stats.achievements.length) * 100);
  }, [stats]);

  if (loading) {
    return (
      <div className="flex justify-center p-40">
        <div className="splash-loader-fill h-1 w-40"></div>
      </div>
    );
  }

  if (isGuest) {
    return (
      <div className="achievements-container py-20">
        <header className="achievements-header-premium text-center items-center">
            <span className="achievements-badge">Caminho do Explorador</span>
            <h1 className="achievements-title-premium">Galeria de Troféus</h1>
            <p className="hero-subtitle-premium max-w-lg mx-auto">
                Cada obra visitada e cada desafio concluído rende uma medalha exclusiva. Crie sua conta para começar sua coleção eterna!
            </p>
            <button
                onClick={() => navigate("/register")}
                className="gallery-cta mt-10"
            >
                Iniciar minha Coleção
            </button>
        </header>
      </div>
    );
  }

  return (
    <div className="achievements-container">
      <header className="achievements-header-premium">
        <span className="achievements-badge">Legado Cultural</span>
        <h1 className="achievements-title-premium">Suas Conquistas</h1>
        <p className="hero-subtitle-premium">
           O registro de sua jornada através do sagrado e do histórico. Complete desafios para ascender em sua hierarquia.
        </p>

        <div className="progress-section-premium mt-6">
          <div className="progress-labels-premium">
            <span>Explorador Iniciante</span>
            <span className="text-gold-hi">{progress}% do Legado</span>
            <span>Mestre das Artes</span>
          </div>
          <div className="progress-track-premium">
            <motion.div
              className="progress-fill-premium"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </header>

      <div className="achievements-grid-premium">
        {stats.achievements.length === 0 ? (
          <div className="workslist-empty py-40 col-span-full">
            <Trophy className="mx-auto mb-6 opacity-20" size={64} />
            <h3 className="text-2xl font-fd text-white mb-2">Vazio Silencioso</h3>
            <p className="text-muted max-w-sm mx-auto">Sua galeria ainda aguarda o seu primeiro feito heroico.</p>
          </div>
        ) : (
          stats.achievements.map((a, i) => {
            const isUnlocked = !!a.unlockedAt;
            return (
              <motion.div
                key={i}
                className={`achievement-card-premium ${isUnlocked ? "unlocked" : "locked"}`}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="achievement-visual-premium">
                  {a.icon}
                </div>

                <div className="achievement-info-premium">
                  <h3 className="achievement-name-premium">{a.title}</h3>
                  <p className="achievement-desc-premium">{a.description}</p>

                  <div className={`status-badge-premium mt-4 ${isUnlocked ? "unlocked" : "locked"}`}>
                    {isUnlocked ? <CheckCircle2 size={10} /> : <Lock size={10} />}
                    {isUnlocked ? 'Relíquia Conquistada' : 'Bloqueado'}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
