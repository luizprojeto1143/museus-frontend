import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/api/client';
import { PageLoader } from '@/components/ui/PageLoader';
import { buildEquipmentUrl } from '@/utils/routes';
import { Card } from '@/components/ui';
import { Helmet } from 'react-helmet-async';
import { MapPin } from 'lucide-react';

export const CityEquipments: React.FC = () => {
  const { citySlug } = useParams<{ citySlug: string }>();
  const navigate = useNavigate();
  const [equipments, setEquipments] = useState<any[]>([]);
  const [cityName, setCityName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCityData = async () => {
      try {
        const res = await api.get("/analytics/municipal-pwa/summary");
        if (res.data && res.data.cities) {
          const city = res.data.cities.find((c: any) => c.slug === citySlug);
          if (city) {
            setEquipments(city.equipments);
            setCityName(city.name);
          }
        }
      } catch (err) {
        console.error("Error loading equipments", err);
      } finally {
        setLoading(false);
      }
    };
    if (citySlug) fetchCityData();
  }, [citySlug]);

  if (loading) return <PageLoader />;

  return (
    <>
      <Helmet>
        <title>Equipamentos de {cityName || citySlug} | Cultura Viva</title>
      </Helmet>
      <div className="min-h-screen p-8 bg-[#070a10]">
        <div className="max-w-7xl mx-auto">
          <button onClick={() => navigate(`/cidades/${citySlug}`)} className="text-gold-400 text-sm font-bold uppercase mb-4 hover:underline">
            &larr; Voltar para {cityName || citySlug}
          </button>
          
          <h1 className="text-3xl font-black text-white mb-2 uppercase">Equipamentos Culturais</h1>
          <p className="text-gray-400 mb-8 flex items-center gap-2"><MapPin size={16}/> {cityName || citySlug}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {equipments.map(eq => (
              <Card 
                key={eq.id} 
                className="cursor-pointer hover:border-gold-400 transition-colors bg-white/5 border-white/10 overflow-hidden"
                onClick={() => navigate(buildEquipmentUrl(citySlug!, eq.slug || eq.id))}
              >
                {eq.coverImageUrl && (
                  <div className="h-40 overflow-hidden">
                    <img src={eq.coverImageUrl} alt={eq.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-4">
                  <h2 className="text-xl font-bold text-white mb-2">{eq.name}</h2>
                  <p className="text-xs text-gray-400 line-clamp-2">{eq.missao || "Espaço de preservação cultural e memória."}</p>
                </div>
              </Card>
            ))}
            {equipments.length === 0 && (
              <div className="col-span-full py-10 text-center text-gray-500">
                Nenhum equipamento cadastrado nesta cidade.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
