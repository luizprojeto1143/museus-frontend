import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingBag } from 'lucide-react';
import { ProductGrid } from '../../../components/shop/ShopComponents';
import './Shop.css';

/**
 * Visitor Shop Page
 * Displays museum shop products for purchasing
 */
export const ShopPage: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="shop-page">
            <header className="shop-header">
                <div className="shop-icon-box">
                    <ShoppingBag size={28} />
                </div>
                <div>
                    <h1 className="shop-title">{t('visitor.shop.title', 'Loja do Museu')}</h1>
                    <p className="shop-subtitle">
                        {t('visitor.shop.subtitle', 'Leve uma lembrança especial para casa')}
                    </p>
                </div>
            </header>

            <ProductGrid />
        </div>
    );
};
