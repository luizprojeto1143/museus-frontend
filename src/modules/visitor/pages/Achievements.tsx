
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useGamification } from "../../gamification/context/GamificationContext";
import { Trophy, Lock, CheckCircle2 } from "lucide-react";

export default function Achievements() {
  const { t } = useTranslation();
  const { stats, loading } = useGamification();

  const progress = useMemo(() => {
    if (!stats?.achievements?.length) return 0;
    const unlocked = stats.achievements.filter(a => a.unlockedAt).length;
    return Math.round((unlocked / stats.achievements.length) * 100);
  }, [stats]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 animate-pulse">{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="pb-20 max-w-4xl mx-auto px-4">
      {/* Header with Progress */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {t("visitor.achievements.title", "Suas Conquistas")}
        </h1>
        <p className="text-gray-500 mt-2">
          {t("visitor.achievements.subtitle", "Complete desafios para subir de nível!")}
        </p>

        {/* Progress Bar */}
        <div className="mt-6 max-w-md mx-auto">
          <div className="flex justify-between text-xs font-semibold text-gray-400 mb-1">
            <span>Iniciante</span>
            <span>{progress}% Completo</span>
            <span>Mestre</span>
          </div>
          <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.achievements.length === 0 ? (
          <div className="col-span-full text-center py-12 px-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t("visitor.achievements.emptyTitle", "Ainda sem conquistas")}
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              Explore o museu e interaja com obras para desbloquear medalhas!
            </p>
          </div>
        ) : (
          stats.achievements.map((a, i) => {
            const isUnlocked = !!a.unlockedAt;
            return (
              <div
                key={i}
                className={`relative p-5 rounded-xl border transition-all duration-300 group
                  ${isUnlocked
                    ? "bg-white dark:bg-gray-800 border-blue-100 dark:border-blue-900/30 shadow-sm hover:shadow-md hover:border-blue-300"
                    : "bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 opacity-70"
                  }
                `}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`
                    w-12 h-12 flex items-center justify-center rounded-2xl text-2xl shadow-inner
                    ${isUnlocked ? "bg-blue-50 dark:bg-blue-900/20" : "bg-gray-100 dark:bg-gray-800 grayscale"}
                  `}>
                    {a.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className={`font-bold ${isUnlocked ? "text-gray-900 dark:text-white" : "text-gray-500"}`}>
                      {a.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                      {a.description}
                    </p>

                    {isUnlocked && (
                      <div className="flex items-center gap-1.5 mt-3 text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md w-fit">
                        <CheckCircle2 className="w-3 h-3" />
                        Desbloqueado
                      </div>
                    )}

                    {!isUnlocked && (
                      <div className="flex items-center gap-1.5 mt-3 text-xs font-medium text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md w-fit">
                        <Lock className="w-3 h-3" />
                        Bloqueado
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
