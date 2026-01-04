import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingBag } from 'lucide-react';
import { ProductGrid } from '../../../components/shop/ShopComponents';

/**
 * Visitor Shop Page
 * Displays museum shop products for purchasing
 */
export const ShopPage: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="shop-page">
            <header className="page-header">
                <div className="header-icon">
                    <ShoppingBag size={32} />
                </div>
                <div>
                    <h1>{t('visitor.shop.title', 'Loja do Museu')}</h1>
                    <p className="subtitle">
                        {t('visitor.shop.subtitle', 'Leve uma lembrança especial para casa')}
                    </p>
                </div>
            </header>

            <ProductGrid />

            <style>{`
                .shop-page {
                    padding: 20px;
                }
                
                .page-header {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    margin-bottom: 24px;
                }
                
                .header-icon {
                    width: 64px;
                    height: 64px;
                    border-radius: 16px;
                    background: linear-gradient(135deg, #22c55e, #16a34a);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                }
                
                .page-header h1 {
                    margin: 0;
                    font-size: 1.5rem;
                    color: var(--fg-main, #f3f4f6);
                }
                
                .subtitle {
                    margin: 4px 0 0;
                    color: var(--fg-muted, #9ca3af);
                }
            `}</style>
        </div>
    );
};
