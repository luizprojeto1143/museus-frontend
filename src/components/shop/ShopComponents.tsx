
import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, Plus, Minus, Trash2, X, Copy, Check, QrCode, Ticket, Loader2 } from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../modules/auth/AuthContext';
import { toast } from 'react-hot-toast';
import { Button } from '../../components/ui';

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

interface CheckoutModalProps {
    items: CartItem[];
    total: number;
    onClose: () => void;
    onSuccess: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ items, total, onClose, onSuccess }) => {
    const { user, tenantId } = useAuth();
    const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
    const [loading, setLoading] = useState(false);

    // Customer Details
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [cpf, setCpf] = useState((user as any)?.cpf || '');

    // Payment
    const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'BOLETO'>('PIX');
    const [paymentResult, setPaymentResult] = useState<any>(null);

    const handleConfirmOrder = async () => {
        if (!name || !email || !phone) {
            toast.error("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                tenantId,
                customerName: name,
                customerEmail: email,
                customerPhone: phone,
                customerCpf: cpf,
                paymentMethod,
                items: items.map(item => ({
                    productId: item.product.id,
                    quantity: item.quantity
                }))
            };

            const res = await api.post('/shop/orders', payload);
            setPaymentResult(res.data.payment);
            setStep('success');
            onSuccess();
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Erro ao criar pedido.");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copiado!");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-[#1f2937] w-full max-w-lg rounded-2xl border border-gray-700 shadow-2xl overflow-hidden relative max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="p-6 md:p-8">
                    {step === 'details' && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">Finalizar Pedido</h2>
                                <p className="text-gray-400">Confirme seus dados para continuar</p>
                            </div>

                            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-400">Total a pagar</p>
                                    <p className="text-2xl font-bold text-amber-400">R$ {total.toFixed(2).replace('.', ',')}</p>
                                </div>
                                <span className="px-3 py-1 bg-gray-700 rounded-lg text-sm text-gray-300">
                                    {items.length} itens
                                </span>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-white">Seus Dados</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Nome Completo</label>
                                        <input
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-amber-500 focus:outline-none transition-colors"
                                            placeholder="Seu nome completo"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Email</label>
                                        <input
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-amber-500 focus:outline-none transition-colors"
                                            placeholder="seu@email.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Telefone / WhatsApp</label>
                                        <input
                                            value={phone}
                                            onChange={e => setPhone(e.target.value)}
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-amber-500 focus:outline-none transition-colors"
                                            placeholder="(11) 99999-9999"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-white">Pagamento</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setPaymentMethod('PIX')}
                                        className={`flex items-center justify-center gap-2 p-4 rounded-xl border transition-all ${paymentMethod === 'PIX'
                                                ? 'bg-green-500/10 border-green-500 text-green-400'
                                                : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                                            }`}
                                    >
                                        <QrCode size={20} />
                                        <span className="font-medium">Pix</span>
                                    </button>
                                    <button
                                        onClick={() => setPaymentMethod('BOLETO')}
                                        className={`flex items-center justify-center gap-2 p-4 rounded-xl border transition-all ${paymentMethod === 'BOLETO'
                                                ? 'bg-blue-500/10 border-blue-500 text-blue-400'
                                                : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                                            }`}
                                    >
                                        <Ticket size={20} />
                                        <span className="font-medium">Boleto</span>
                                    </button>
                                </div>
                            </div>

                            <Button
                                onClick={handleConfirmOrder}
                                isLoading={loading}
                                className="w-full py-4 text-lg font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black border-none rounded-xl shadow-lg shadow-amber-500/20"
                            >
                                {loading ? 'Processando...' : `Pagar R$ ${total.toFixed(2).replace('.', ',')}`}
                            </Button>
                        </div>
                    )}

                    {step === 'success' && paymentResult && (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-400">
                                <Check size={40} />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Pedido Criado!</h2>
                            <p className="text-gray-400 mb-8">Realize o pagamento para confirmar sua compra.</p>

                            {paymentMethod === 'PIX' && paymentResult.pixQrCode && (
                                <div className="bg-white p-6 rounded-xl mb-6 inline-block">
                                    <img
                                        src={`data:image/png;base64,${paymentResult.pixQrCode}`}
                                        alt="Pix QR Code"
                                        className="w-48 h-48 mx-auto mb-4"
                                    />
                                    <div className="flex gap-2">
                                        <input
                                            value={paymentResult.pixPayload}
                                            readOnly
                                            className="bg-gray-100 border border-gray-300 rounded px-3 py-2 text-sm text-gray-600 w-full font-mono truncate"
                                        />
                                        <button
                                            onClick={() => copyToClipboard(paymentResult.pixPayload)}
                                            className="bg-gray-900 text-white px-3 py-2 rounded text-sm font-medium hover:bg-black transition-colors"
                                        >
                                            <Copy size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {paymentMethod === 'BOLETO' && (
                                <a
                                    href={paymentResult.bankSlipUrl || paymentResult.invoiceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors mb-6"
                                >
                                    <Ticket size={24} /> Visualizar Boleto
                                </a>
                            )}

                            <p className="text-sm text-gray-500 mb-6">Você também receberá os dados por email.</p>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-white font-medium transition-colors"
                            >
                                Fechar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/**
 * Product Card Component
 */
export const ProductCard: React.FC<{
    product: Product;
    onAddToCart: (product: Product) => void;
}> = ({ product, onAddToCart }) => {
    const isOutOfStock = product.stock <= 0;

    return (
        <div className={`group bg-[#1a1c22] border border-gray-800 rounded-2xl overflow-hidden hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 flex flex-col h-full ${isOutOfStock ? 'opacity-60' : ''}`}>
            <div className="relative aspect-[4/3] overflow-hidden bg-gray-900">
                {product.imageUrl ? (
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-700">
                        <ShoppingBag size={48} />
                    </div>
                )}

                {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                            Esgotado
                        </span>
                    </div>
                )}
            </div>

            <div className="p-5 flex flex-col flex-1">
                <div className="mb-2">
                    <p className="text-xs text-amber-500 font-medium tracking-wider mb-1 uppercase">{product.category || 'Geral'}</p>
                    <h4 className="text-lg font-bold text-white leading-tight group-hover:text-amber-400 transition-colors">{product.name}</h4>
                </div>

                {product.description && (
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-1">{product.description}</p>
                )}

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-800">
                    <span className="text-xl font-bold text-white">
                        R$ {Number(product.price).toFixed(2).replace('.', ',')}
                    </span>

                    <button
                        onClick={() => onAddToCart(product)}
                        disabled={isOutOfStock}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all
                            ${isOutOfStock
                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                : 'bg-amber-500 text-black hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/20 active:scale-95'
                            }
                        `}
                    >
                        {isOutOfStock ? 'Indisponível' : (
                            <>
                                <Plus size={16} />
                                Comprar
                            </>
                        )}
                    </button>
                </div>
            </div>
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
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag size={24} />
                </div>
                <p>Seu carrinho está vazio</p>
                <div className="mt-4 px-4 py-2 bg-gray-800 rounded-lg text-xs">
                    Adicione itens para começar
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#1f2937] border-l border-gray-700 h-full flex flex-col">
            <div className="p-6 border-b border-gray-700">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <ShoppingBag size={20} className="text-amber-500" />
                    Seu Carrinho
                    <span className="bg-amber-500 text-black text-xs px-2 py-0.5 rounded-full font-bold ml-auto">
                        {items.length}
                    </span>
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {items.map(item => (
                    <div key={item.product.id} className="bg-gray-800/50 rounded-xl p-3 border border-gray-700 flex gap-3 group hover:border-amber-500/30 transition-colors">
                        <div className="w-16 h-16 rounded-lg bg-gray-900 overflow-hidden flex-shrink-0">
                            {item.product.imageUrl ? (
                                <img
                                    src={item.product.imageUrl}
                                    alt={item.product.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-700">
                                    <ShoppingBag size={20} />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                            <div className="flex justify-between items-start gap-2">
                                <span className="text-sm font-medium text-white truncate leading-tight">{item.product.name}</span>
                                <button
                                    onClick={() => onRemove(item.product.id)}
                                    className="text-gray-500 hover:text-red-400 transition-colors p-1 -mr-1"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>

                            <div className="flex justify-between items-end">
                                <div className="flex items-center gap-2 bg-gray-900 rounded-lg p-1">
                                    <button
                                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                                        className="p-1 hover:text-white text-gray-400 transition-colors"
                                    >
                                        <Minus size={12} />
                                    </button>
                                    <span className="text-xs font-medium w-4 text-center">{item.quantity}</span>
                                    <button
                                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                                        className="p-1 hover:text-white text-gray-400 transition-colors"
                                    >
                                        <Plus size={12} />
                                    </button>
                                </div>
                                <span className="text-amber-400 font-bold text-sm">
                                    R$ {(Number(item.product.price) * item.quantity).toFixed(2).replace('.', ',')}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-6 border-t border-gray-700 bg-[#1a1c22]">
                <div className="flex justify-between items-baseline mb-4">
                    <span className="text-gray-400">Total</span>
                    <span className="text-2xl font-bold text-white">
                        R$ {total.toFixed(2).replace('.', ',')}
                    </span>
                </div>
                <button
                    onClick={onCheckout}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold shadow-lg shadow-amber-500/20 active:scale-95 transition-all text-lg"
                >
                    Finalizar Pedido
                </button>
            </div>
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
    const [showCheckout, setShowCheckout] = useState(false);

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
        toast.success('Adicionado ao carrinho');
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
        setShowCheckout(true);
        setShowCart(false);
    };

    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const total = cart.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);

    return (
        <div className="relative">
            {/* Cart FAB */}
            {cartItemCount > 0 && (
                <button
                    onClick={() => setShowCart(!showCart)}
                    className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-xl shadow-amber-500/30 flex items-center justify-center z-40 transition-transform hover:scale-110 active:scale-95"
                >
                    <ShoppingBag size={24} />
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-[#0a0a0c]">
                        {cartItemCount}
                    </span>
                </button>
            )}

            {/* Cart Sidebar Overlay */}
            {showCart && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
                    onClick={() => setShowCart(false)}
                >
                    <div
                        className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-[#1f2937] shadow-2xl animate-slideLeft"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowCart(false)}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white"
                        >
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

            {/* Checkout Modal */}
            {showCheckout && (
                <CheckoutModal
                    items={cart}
                    total={total}
                    onClose={() => setShowCheckout(false)}
                    onSuccess={() => {
                        setCart([]); // Clear cart
                        // Keep modal open to show payment info
                    }}
                />
            )}

            {/* Products Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                    <Loader2 size={40} className="animate-spin text-amber-500 mb-4" />
                    <p>Carregando produtos...</p>
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-20 bg-[#1a1c22]/50 rounded-3xl border-2 border-dashed border-gray-800">
                    <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-600">
                        <ShoppingBag size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Loja em breve</h3>
                    <p className="text-gray-400">Nossos produtos estarão disponíveis em breve!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onAddToCart={addToCart}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
