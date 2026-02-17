import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, Sparkles } from 'lucide-react';
import { ProductGrid } from '../../../components/shop/ShopComponents';

/**
 * Visitor Shop Page
 * Displays museum shop products for purchasing
 */
export const ShopPage: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen pb-20 p-4 md:p-8 animate-fadeIn">
            <header className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-[#1a1108] to-[#0f0a05] border border-[#463420] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <ShoppingBag size={120} />
                </div>

                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white">
                        <ShoppingBag size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-amber-400 font-serif flex items-center gap-2">
                            {t('visitor.shop.title', 'Loja do Museu')}
                            <Sparkles size={20} className="text-amber-200" />
                        </h1>
                        <p className="text-amber-100/70 mt-1 text-lg">
                            {t('visitor.shop.subtitle', 'Leve uma lembrança especial para casa')}
                        </p>
                    </div>
                </div>
            </header>

            <ProductGrid />
        </div>
    );
};
