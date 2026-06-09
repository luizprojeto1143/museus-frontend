import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, Play, CheckCircle, CreditCard } from 'lucide-react';
import { api } from '../../api/client';

export const ProviderDetail: React.FC = () => {
  const navigate = useNavigate();
  const { providerId } = useParams<{ providerId: string }>();
  const [activeTab, setActiveTab] = useState<'PRODUCTS' | 'REVIEWS'>('PRODUCTS');
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Mocked data for the provider
  const [provider, setProvider] = useState<any>(null);

  const [products, setProducts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Exemplo de como a integração real funcionará usando o useEffect e a api
  React.useEffect(() => {
    api.get(`/public/providers/${providerId}`)
      .then(res => {
        setProvider(res.data);
        setProducts(res.data.products || []);
        setReviews(res.data.reviews || []);
      })
      .catch(() => {
        setProvider({ name: "Desconhecido", description: "Não encontrado", coverUrl: "", verified: false, rating: 0, reviewsCount: 0 });
      })
      .finally(() => setIsLoading(false));
  }, [providerId]);

  if (isLoading || !provider) return <div className="min-h-screen bg-[#121212] text-white p-6 pb-24">Carregando Prestador...</div>;

  const handleBuy = (product: any) => {
    setSelectedProduct(product);
    setShowCheckout(true);
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans">
      {/* Cover Image */}
      <div className="relative h-64 w-full">
        <img src={provider.coverUrl} alt="Cover" className="w-full h-full object-cover opacity-80" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-[#121212] to-transparent"></div>
        
        <button onClick={() => navigate(-1)} className="absolute top-6 left-6 p-2 bg-black/50 backdrop-blur-md rounded-full text-white">
          <ArrowLeft size={24} />
        </button>
      </div>

      {/* Info Section */}
      <div className="px-6 -mt-10 relative z-10">
        <div className="flex justify-between items-end mb-2">
          <h1 className="text-3xl font-extrabold">{provider.name}</h1>
          {provider.verified && <CheckCircle size={24} className="text-blue-500" />}
        </div>
        <p className="text-amber-400 font-semibold mb-4 text-sm flex items-center gap-1">
          <Star size={16} fill="currentColor" /> {provider.rating} ({provider.reviewsCount} avaliações)
        </p>
        <p className="text-gray-300 leading-relaxed mb-6">{provider.description}</p>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-800 mb-6">
          <button 
            className={`pb-2 px-2 font-semibold transition-colors ${activeTab === 'PRODUCTS' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab('PRODUCTS')}
          >
            Serviços
          </button>
          <button 
            className={`pb-2 px-2 font-semibold transition-colors ${activeTab === 'REVIEWS' ? 'text-amber-500 border-b-2 border-amber-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab('REVIEWS')}
          >
            Vídeos & Avaliações
          </button>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'PRODUCTS' && (
            <motion.div key="products" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="space-y-4">
                {isLoading ? (
                   <p className="text-gray-500 text-center py-8">Carregando serviços...</p>
                ) : products.length === 0 ? (
                   <p className="text-gray-500 text-center py-8">Nenhum serviço cadastrado no momento.</p>
                ) : (
                  products.map(prod => (
                    <div key={prod.id} className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700 flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg text-white">{prod.name}</h3>
                          <p className="text-sm text-gray-400">{prod.desc}</p>
                        </div>
                        <span className="font-bold text-amber-500">R$ {prod.price.toFixed(2)}</span>
                      </div>
                      <button 
                        onClick={() => handleBuy(prod)}
                        className="w-full bg-white text-black font-bold py-2.5 rounded-xl hover:bg-gray-200 transition"
                      >
                        Comprar
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'REVIEWS' && (
            <motion.div key="reviews" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-2 gap-4">
                {isLoading ? (
                   <p className="text-gray-500 col-span-2 text-center py-8">Carregando avaliações...</p>
                ) : reviews.length === 0 ? (
                   <p className="text-gray-500 col-span-2 text-center py-8">Ainda não há avaliações em vídeo para este parceiro.</p>
                ) : (
                  reviews.map((rev, index) => (
                    <div key={rev.id || index} className="relative aspect-[9/16] bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
                      <img src={rev.thumbnailUrl || `https://source.unsplash.com/random/400x700?portrait&sig=${index}`} alt="Video Thumbnail" className="w-full h-full object-cover opacity-60" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Play size={40} className="text-white/80" fill="currentColor" />
                      </div>
                      <div className="absolute bottom-2 left-2 flex items-center gap-1 text-sm font-bold text-white shadow-black drop-shadow-md">
                        <Star size={14} className="text-amber-400" fill="currentColor" /> {rev.rating}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fake Checkout Modal */}
      <AnimatePresence>
        {showCheckout && selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-gray-900 w-full max-w-md rounded-t-3xl p-6 border-t border-gray-800"
            >
              <div className="w-12 h-1.5 bg-gray-700 rounded-full mx-auto mb-6"></div>
              <h2 className="text-xl font-bold mb-2">Finalizar Compra</h2>
              <p className="text-gray-400 mb-6">{selectedProduct.name}</p>
              
              <div className="bg-gray-800 p-4 rounded-xl flex justify-between items-center mb-6 border border-gray-700">
                <span className="text-gray-300">Total a pagar</span>
                <span className="text-2xl font-bold text-amber-500">R$ {selectedProduct.price.toFixed(2)}</span>
              </div>

              <button 
                onClick={() => {
                  alert('Pagamento via Stripe processado com sucesso! Split automático realizado.');
                  setShowCheckout(false);
                }}
                className="w-full bg-[#635BFF] hover:bg-[#4B44E6] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition"
              >
                <CreditCard size={20} /> Pagar com Cartão (Stripe)
              </button>
              <button 
                onClick={() => setShowCheckout(false)}
                className="w-full mt-3 bg-transparent text-gray-500 font-bold py-3 rounded-xl hover:text-white transition"
              >
                Cancelar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
