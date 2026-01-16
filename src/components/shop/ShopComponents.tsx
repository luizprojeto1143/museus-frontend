import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, Plus, Minus, Trash2, X } from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../modules/auth/AuthContext';

interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    imageUrl?: string;
    category?: string;
    stock: number;
}

interface CartItem {
    product: Product;
    quantity: number;
}

/**
 * Product Card Component
 */
export const ProductCard: React.FC<{
    product: Product;
    onAddToCart: (product: Product) => void;
}> = ({ product, onAddToCart }) => {
    const isOutOfStock = product.stock <= 0;

    return (
        <div className={`product-card ${isOutOfStock ? 'out-of-stock' : ''}`}>
            {product.imageUrl && (
                <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="product-image"
                />
            )}
            <div className="product-content">
                <h4 className="product-name">{product.name}</h4>
                {product.description && (
                    <p className="product-description">{product.description}</p>
                )}
                <div className="product-footer">
                    <span className="product-price">
                        R$ {Number(product.price).toFixed(2).replace('.', ',')}
                    </span>
                    <button
                        className="add-to-cart-btn"
                        onClick={() => onAddToCart(product)}
                        disabled={isOutOfStock}
                    >
                        {isOutOfStock ? 'Esgotado' : (
                            <>
                                <Plus size={16} />
                                Adicionar
                            </>
                        )}
                    </button>
                </div>
            </div>

            <style>{`
                .product-card {
                    background: var(--bg-card, #1f2937);
                    border-radius: 16px;
                    overflow: hidden;
                    transition: transform 0.2s;
                }
                
                .product-card:hover:not(.out-of-stock) {
                    transform: translateY(-4px);
                }
                
                .product-card.out-of-stock {
                    opacity: 0.6;
                }
                
                .product-image {
                    width: 100%;
                    height: 160px;
                    object-fit: cover;
                }
                
                .product-content {
                    padding: 16px;
                }
                
                .product-name {
                    margin: 0 0 8px;
                    font-size: 1rem;
                    color: var(--fg-main, #f3f4f6);
                }
                
                .product-description {
                    margin: 0 0 12px;
                    font-size: 0.85rem;
                    color: var(--fg-muted, #9ca3af);
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                
                .product-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .product-price {
                    font-size: 1.1rem;
                    font-weight: bold;
                    color: var(--primary-color, #3b82f6);
                }
                
                .add-to-cart-btn {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 8px 16px;
                    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: transform 0.2s;
                }
                
                .add-to-cart-btn:hover:not(:disabled) {
                    transform: scale(1.05);
                }
                
                .add-to-cart-btn:disabled {
                    background: var(--bg-elevated, #374151);
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
};

/**
 * Shopping Cart Component
 */
export const ShoppingCart: React.FC<{
    items: CartItem[];
    onUpdateQuantity: (productId: string, quantity: number) => void;
    onRemove: (productId: string) => void;
    onCheckout: () => void;
}> = ({ items, onUpdateQuantity, onRemove, onCheckout }) => {
    const total = items.reduce(
        (sum, item) => sum + Number(item.product.price) * item.quantity,
        0
    );

    if (items.length === 0) {
        return (
            <div className="cart-empty">
                <ShoppingBag size={48} />
                <p>Seu carrinho está vazio</p>
            </div>
        );
    }

    return (
        <div className="shopping-cart">
            <h3 className="cart-title">
                <ShoppingBag size={20} />
                Carrinho ({items.length})
            </h3>

            <div className="cart-items">
                {items.map(item => (
                    <div key={item.product.id} className="cart-item">
                        {item.product.imageUrl && (
                            <img
                                src={item.product.imageUrl}
                                alt={item.product.name}
                                className="cart-item-image"
                            />
                        )}
                        <div className="cart-item-info">
                            <span className="cart-item-name">{item.product.name}</span>
                            <span className="cart-item-price">
                                R$ {(Number(item.product.price) * item.quantity).toFixed(2).replace('.', ',')}
                            </span>
                        </div>
                        <div className="cart-item-quantity">
                            <button onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}>
                                <Minus size={14} />
                            </button>
                            <span>{item.quantity}</span>
                            <button onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}>
                                <Plus size={14} />
                            </button>
                        </div>
                        <button
                            className="cart-item-remove"
                            onClick={() => onRemove(item.product.id)}
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>

            <div className="cart-footer">
                <div className="cart-total">
                    <span>Total</span>
                    <span className="total-value">
                        R$ {total.toFixed(2).replace('.', ',')}
                    </span>
                </div>
                <button className="checkout-btn" onClick={onCheckout}>
                    Finalizar Pedido
                </button>
            </div>

            <style>{`
                .shopping-cart {
                    background: var(--bg-card, #1f2937);
                    border-radius: 16px;
                    padding: 20px;
                }
                
                .cart-empty {
                    text-align: center;
                    padding: 40px 20px;
                    color: var(--fg-muted, #9ca3af);
                }
                
                .cart-empty p {
                    margin: 12px 0 0;
                }
                
                .cart-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin: 0 0 16px;
                    color: var(--fg-main, #f3f4f6);
                }
                
                .cart-items {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin-bottom: 20px;
                }
                
                .cart-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    background: var(--bg-elevated, #374151);
                    border-radius: 12px;
                }
                
                .cart-item-image {
                    width: 50px;
                    height: 50px;
                    object-fit: cover;
                    border-radius: 8px;
                }
                
                .cart-item-info {
                    flex: 1;
                }
                
                .cart-item-name {
                    display: block;
                    font-size: 0.9rem;
                    color: var(--fg-main, #f3f4f6);
                }
                
                .cart-item-price {
                    font-size: 0.85rem;
                    color: var(--primary-color, #3b82f6);
                    font-weight: 600;
                }
                
                .cart-item-quantity {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .cart-item-quantity button {
                    width: 28px;
                    height: 28px;
                    border-radius: 6px;
                    border: none;
                    background: var(--bg-card, #1f2937);
                    color: var(--fg-main, #f3f4f6);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .cart-item-quantity span {
                    min-width: 24px;
                    text-align: center;
                    color: var(--fg-main, #f3f4f6);
                }
                
                .cart-item-remove {
                    padding: 8px;
                    background: rgba(239, 68, 68, 0.2);
                    border: none;
                    border-radius: 8px;
                    color: #ef4444;
                    cursor: pointer;
                }
                
                .cart-footer {
                    border-top: 1px solid var(--border-color, #374151);
                    padding-top: 16px;
                }
                
                .cart-total {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 16px;
                    font-size: 1rem;
                    color: var(--fg-main, #f3f4f6);
                }
                
                .total-value {
                    font-size: 1.25rem;
                    font-weight: bold;
                    color: var(--primary-color, #3b82f6);
                }
                
                .checkout-btn {
                    width: 100%;
                    padding: 14px;
                    background: linear-gradient(135deg, #22c55e, #16a34a);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: transform 0.2s;
                }
                
                .checkout-btn:hover {
                    transform: scale(1.02);
                }
            `}</style>
        </div>
    );
};

/**
 * Product Grid
 */
export const ProductGrid: React.FC = () => {
    const { tenantId } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCart, setShowCart] = useState(false);

    const fetchProducts = useCallback(async () => {
        try {
            const res = await api.get(`/shop/products?tenantId=${tenantId}`);
            setProducts(res.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    }, [tenantId]);

    useEffect(() => {
        if (tenantId) {
            fetchProducts();
        }
    }, [tenantId, fetchProducts]);

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setCart(prev =>
            prev.map(item =>
                item.product.id === productId
                    ? { ...item, quantity }
                    : item
            )
        );
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.product.id !== productId));
    };

    const handleCheckout = () => {
        // TODO: Implement checkout flow
        alert('Checkout em desenvolvimento. Aguarde a integração com pagamentos.');
    };

    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="shop-container">
            {/* Cart FAB */}
            {cartItemCount > 0 && (
                <button
                    className="cart-fab"
                    onClick={() => setShowCart(!showCart)}
                >
                    <ShoppingBag size={24} />
                    <span className="cart-badge">{cartItemCount}</span>
                </button>
            )}

            {/* Cart Sidebar */}
            {showCart && (
                <div className="cart-overlay" onClick={() => setShowCart(false)}>
                    <div className="cart-sidebar" onClick={e => e.stopPropagation()}>
                        <button className="close-cart" onClick={() => setShowCart(false)}>
                            <X size={24} />
                        </button>
                        <ShoppingCart
                            items={cart}
                            onUpdateQuantity={updateQuantity}
                            onRemove={removeFromCart}
                            onCheckout={handleCheckout}
                        />
                    </div>
                </div>
            )}

            {/* Products Grid */}
            {loading ? (
                <div className="loading-grid">Carregando produtos...</div>
            ) : products.length === 0 ? (
                <div className="empty-shop">
                    <ShoppingBag size={64} />
                    <h3>Loja em breve</h3>
                    <p>Nossos produtos estarão disponíveis em breve!</p>
                </div>
            ) : (
                <div className="products-grid">
                    {products.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onAddToCart={addToCart}
                        />
                    ))}
                </div>
            )}

            <style>{`
                .shop-container {
                    position: relative;
                }
                
                .products-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
                    gap: 20px;
                }
                
                .empty-shop {
                    text-align: center;
                    padding: 60px 20px;
                    color: var(--fg-muted, #9ca3af);
                }
                
                .empty-shop h3 {
                    margin: 16px 0 8px;
                    color: var(--fg-main, #f3f4f6);
                }
                
                .cart-fab {
                    position: fixed;
                    bottom: 100px;
                    right: 80px;
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #22c55e, #16a34a);
                    color: white;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 20px rgba(34, 197, 94, 0.4);
                    z-index: 100;
                }
                
                .cart-badge {
                    position: absolute;
                    top: -4px;
                    right: -4px;
                    width: 24px;
                    height: 24px;
                    background: #ef4444;
                    border-radius: 50%;
                    font-size: 0.75rem;
                    font-weight: bold;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .cart-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: 200;
                }
                
                .cart-sidebar {
                    position: absolute;
                    right: 0;
                    top: 0;
                    bottom: 0;
                    width: 400px;
                    max-width: 90vw;
                    background: var(--bg-page, #111827);
                    padding: 20px;
                    overflow-y: auto;
                }
                
                .close-cart {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    background: transparent;
                    border: none;
                    color: var(--fg-muted, #9ca3af);
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
};
