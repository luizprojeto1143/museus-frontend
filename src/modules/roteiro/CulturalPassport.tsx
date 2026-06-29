import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Award, ArrowLeft, Star, Map, Gift } from 'lucide-react';

export const CulturalPassport: React.FC = () => {
  const navigate = useNavigate();

  // Mocked state for the visitor's passport
  const [passport, setPassport] = React.useState<unknown>(null);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    import("../../api/client").then(({ api }) => {
      api.get("/visitors/me/passport").then(res => {
        const data = res.data;
        setPassport({
          level: Math.floor(data.xp / 500) + 1,
          culturaCoins: data.xp,
          stamps: data.stamps.map((s: unknown) => ({ id: s.id, name: s.work?.title || "Local Cultural", date: new Date(s.createdAt).toLocaleDateString("pt-BR"), icon: "🏛️" })),
          nextRewardAt: (Math.floor(data.xp / 500) + 1) * 500
        });
        setLoading(false);
      }).catch(() => {
        setPassport({ level: 1, culturaCoins: 0, stamps: [], nextRewardAt: 500 });
        setLoading(false);
      });
    });
  }, []);

  if (loading) return <div className="min-h-screen bg-[#121212] text-white p-6 pb-24">Carregando Passaporte...</div>;

  const progressPercentage = (passport.culturaCoins / passport.nextRewardAt) * 100;

  return (
    <div className="min-h-screen bg-[#121212] text-white p-6 pb-24 font-sans">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-800 rounded-full text-gray-300">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold">Passaporte Cultural</h1>
      </div>

      {/* Passport Card (Glassmorphism + Gold Gradient) */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-20">
          <Award size={100} />
        </div>
        
        <p className="text-amber-100 font-medium mb-1">Cidadão Cultural Nível {passport.level}</p>
        <div className="flex items-end gap-2 mb-6">
          <span className="text-5xl font-extrabold text-white">{passport.culturaCoins}</span>
          <span className="text-amber-200 font-semibold mb-1">CulturaCoins</span>
        </div>

        {/* Progress Bar */}
        <div className="mb-2 flex justify-between text-sm text-amber-100">
          <span>Progresso para o Nível {passport.level + 1}</span>
          <span>{passport.culturaCoins} / {passport.nextRewardAt}</span>
        </div>
        <div className="w-full bg-black/30 rounded-full h-3">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            className="bg-white rounded-full h-3"
          />
        </div>
      </motion.div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <button className="bg-gray-800 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-gray-700 transition">
          <Gift size={28} className="text-purple-400" />
          <span className="font-semibold">Trocar Coins</span>
        </button>
        <button className="bg-gray-800 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-gray-700 transition">
          <Map size={28} className="text-blue-400" />
          <span className="font-semibold">Ganhar Mais</span>
        </button>
      </div>

      {/* Stamps Gallery */}
      <div className="mt-10">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Star className="text-amber-500" /> Carimbos Conquistados
        </h2>
        <div className="space-y-4">
          {passport.stamps.map((stamp: unknown, i: number) => (
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              key={stamp.id}
              className="bg-gray-800/50 border border-gray-700 p-4 rounded-2xl flex items-center gap-4"
            >
              <div className="w-14 h-14 bg-gray-900 rounded-full flex items-center justify-center text-2xl border-2 border-amber-500/50">
                {stamp.icon}
              </div>
              <div>
                <p className="font-bold text-lg text-white">{stamp.name}</p>
                <p className="text-gray-400 text-sm">Visitado em {stamp.date}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
