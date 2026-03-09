import { useTranslation } from "react-i18next";
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, Sparkles } from 'lucide-react';
import { ProductGrid } from '../../../components/shop/ShopComponents';
import { motion } from 'framer-motion';

/**
 * Visitor Shop Page
 * Displays museum shop products for purchasing
 */
export const ShopPage: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen pb-20 p-4 md:p-8 animate-fadeIn bg-premium-gradient">
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 relative overflow-hidden rounded-[2.5rem] border border-[#463420] shadow-2xl"
            >
                {/* Hero Banner Image */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1554188248-986adbb73be4?q=80&w=2070&auto=format&fit=crop"
                        alt="Museum Shop Hero"
                        className="w-full h-full object-cover opacity-20 scale-110 blur-[2px]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0f0a06] via-[#0f0a06]/80 to-transparent" />
                </div>

                <div className="relative z-10 p-8 md:p-16 flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 text-center md:text-left">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-black uppercase tracking-[0.3em] mb-6"
                        >
                            <Sparkles size={14} />{t("visitor.shoppage.coleoExclusiva", "Coleção Exclusiva")}</motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-5xl md:text-7xl font-bold text-white mb-6 font-serif leading-tight text-gradient-gold"
                        >
                            {t('visitor.shop.title', 'Tesouros do Museu')}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-amber-100/70 text-lg md:text-xl max-w-2xl leading-relaxed mb-8"
                        >
                            {t('visitor.shop.subtitle', 'Explore nossa curadoria de itens exclusivos, livros raros e lembranças que eternizam sua jornada cultural.')}
                        </motion.p>

                        <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#463420] overflow-hidden bg-[#1a1108]">
                                        <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="avatar" />
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm text-gray-400">
                                <span className="text-white font-bold">+500 pessoas</span> compraram esta semana
                            </p>
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ delay: 0.5, type: 'spring' }}
                        className="relative hidden lg:block"
                    >
                        <div className="w-80 h-96 rounded-3xl overflow-hidden border-2 border-amber-500/30 shadow-2xl relative group">
                            <img
                                src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=2070&auto=format&fit=crop"
                                alt="Featured item"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent p-6 flex flex-col justify-end">
                                <p className="text-amber-500 font-bold text-xs uppercase mb-1">Destaque do Mês</p>
                                <h3 className="text-white font-bold text-xl">{t("visitor.shoppage.rplicaArqueolgica", "Réplica Arqueológica")}</h3>
                            </div>
                        </div>
                        {/* Decorative elements */}
                        <div className="absolute -top-6 -right-6 w-24 h-24 bg-amber-500/20 rounded-full blur-3xl animate-pulse" />
                        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />
                    </motion.div>
                </div>
            </motion.header>

            <ProductGrid />
        </div>
    );
};
