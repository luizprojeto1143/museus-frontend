import React, { useState } from "react";
import { logger } from "@/utils/logger";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Star, Play, CheckCircle, CreditCard } from "lucide-react";
import { api } from "../../api/client";
import { toast } from "react-hot-toast";

interface ProviderProduct {
  id: string;
  name: string;
  desc?: string | null;
  description?: string | null;
  price?: number | string | null;
}

interface ProviderReview {
  id?: string;
  thumbnailUrl?: string | null;
  rating?: number | string | null;
}

interface ProviderDetailResponse {
  id: string;
  name: string;
  description?: string | null;
  coverUrl?: string | null;
  verified?: boolean;
  rating?: number | string | null;
  reviewsCount?: number | null;
  products?: ProviderProduct[];
  reviews?: ProviderReview[];
}

interface CheckoutResponse {
  checkoutUrl?: string;
  url?: string;
  paymentUrl?: string;
}

export const ProviderDetail: React.FC = () => {
  const navigate = useNavigate();
  const { providerId } = useParams<{ providerId: string }>();
  const [activeTab, setActiveTab] = useState<"PRODUCTS" | "REVIEWS">("PRODUCTS");
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProviderProduct | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [provider, setProvider] = useState<ProviderDetailResponse | null>(null);
  const [products, setProducts] = useState<ProviderProduct[]>([]);
  const [reviews, setReviews] = useState<ProviderReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    api.get<ProviderDetailResponse>(`/public/providers/${providerId}`)
      .then(res => {
        setProvider(res.data);
        setProducts(res.data.products || []);
        setReviews(res.data.reviews || []);
      })
      .catch(error => {
        logger.error("Error fetching provider details", error);
        setProvider(null);
      })
      .finally(() => setIsLoading(false));
  }, [providerId]);

  const handleBuy = (product: ProviderProduct) => {
    setSelectedProduct(product);
    setShowCheckout(true);
  };

  const handleCheckout = async () => {
    if (!providerId || !selectedProduct?.id) return;

    try {
      setCheckoutLoading(true);
      const { data } = await api.post<CheckoutResponse>(`/public/providers/${providerId}/checkout`, {
        productId: selectedProduct.id
      });
      const checkoutUrl = data.checkoutUrl || data.url || data.paymentUrl;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
        return;
      }
      toast.success("Solicitacao de compra registrada.");
      setShowCheckout(false);
    } catch (error) {
      logger.error("Provider checkout failed", error);
      toast.error("Nao foi possivel iniciar o pagamento.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (isLoading) return <div className="min-h-screen bg-[#121212] text-white p-6 pb-24">Carregando prestador...</div>;

  if (!provider) {
    return (
      <div className="min-h-screen bg-[#121212] text-white p-6 pb-24">
        <button onClick={() => navigate(-1)} className="mb-8 p-2 bg-black/50 backdrop-blur-md rounded-full text-white">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold">Prestador nao encontrado</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans">
      <div className="relative h-64 w-full">
        <img src={provider.coverUrl || "/placeholder-image.svg"} alt="Cover" className="w-full h-full object-cover opacity-80" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-[#121212] to-transparent" />
        <button onClick={() => navigate(-1)} className="absolute top-6 left-6 p-2 bg-black/50 backdrop-blur-md rounded-full text-white">
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="px-6 -mt-10 relative z-10">
        <div className="flex justify-between items-end mb-2">
          <h1 className="text-3xl font-extrabold">{provider.name}</h1>
          {provider.verified && <CheckCircle size={24} className="text-blue-500" />}
        </div>
        <p className="text-amber-400 font-semibold mb-4 text-sm flex items-center gap-1">
          <Star size={16} fill="currentColor" /> {provider.rating ?? 0} ({provider.reviewsCount ?? 0} avaliacoes)
        </p>
        <p className="text-gray-300 leading-relaxed mb-6">{provider.description}</p>

        <div className="flex gap-4 border-b border-gray-800 mb-6">
          <button className={`pb-2 px-2 font-semibold transition-colors ${activeTab === "PRODUCTS" ? "text-amber-500 border-b-2 border-amber-500" : "text-gray-500"}`} onClick={() => setActiveTab("PRODUCTS")}>
            Servicos
          </button>
          <button className={`pb-2 px-2 font-semibold transition-colors ${activeTab === "REVIEWS" ? "text-amber-500 border-b-2 border-amber-500" : "text-gray-500"}`} onClick={() => setActiveTab("REVIEWS")}>
            Videos & Avaliacoes
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "PRODUCTS" && (
            <motion.div key="products" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="space-y-4">
                {products.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Nenhum servico cadastrado no momento.</p>
                ) : (
                  products.map(prod => (
                    <div key={prod.id} className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700 flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg text-white">{prod.name}</h3>
                          <p className="text-sm text-gray-400">{prod.desc || prod.description}</p>
                        </div>
                        <span className="font-bold text-amber-500">R$ {Number(prod.price || 0).toFixed(2)}</span>
                      </div>
                      <button onClick={() => handleBuy(prod)} className="w-full bg-white text-black font-bold py-2.5 rounded-xl hover:bg-gray-200 transition">
                        Comprar
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "REVIEWS" && (
            <motion.div key="reviews" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-2 gap-4">
                {reviews.length === 0 ? (
                  <p className="text-gray-500 col-span-2 text-center py-8">Ainda nao ha avaliacoes em video para este parceiro.</p>
                ) : (
                  reviews.map((rev, index) => (
                    <div key={rev.id || index} className="relative aspect-[9/16] bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
                      <img src={rev.thumbnailUrl || "/placeholder-image.svg"} alt="Video Thumbnail" className="w-full h-full object-cover opacity-60" />
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

      <AnimatePresence>
        {showCheckout && selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="bg-gray-900 w-full max-w-md rounded-t-3xl p-6 border-t border-gray-800">
              <div className="w-12 h-1.5 bg-gray-700 rounded-full mx-auto mb-6" />
              <h2 className="text-xl font-bold mb-2">Finalizar Compra</h2>
              <p className="text-gray-400 mb-6">{selectedProduct.name}</p>
              <div className="bg-gray-800 p-4 rounded-xl flex justify-between items-center mb-6 border border-gray-700">
                <span className="text-gray-300">Total a pagar</span>
                <span className="text-2xl font-bold text-amber-500">R$ {Number(selectedProduct.price || 0).toFixed(2)}</span>
              </div>
              <button onClick={handleCheckout} disabled={checkoutLoading} className="w-full bg-[#635BFF] hover:bg-[#4B44E6] disabled:opacity-60 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition">
                <CreditCard size={20} /> {checkoutLoading ? "Iniciando pagamento..." : "Pagar com Cartao"}
              </button>
              <button onClick={() => setShowCheckout(false)} className="w-full mt-3 bg-transparent text-gray-500 font-bold py-3 rounded-xl hover:text-white transition">
                Cancelar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
