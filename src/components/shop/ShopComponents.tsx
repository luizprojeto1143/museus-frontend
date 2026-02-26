import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, Plus, Minus, Trash2, X, Copy, Check, QrCode, Ticket, Loader2, ArrowRight, Star, ShieldCheck, Truck, Search, Menu, Package, Clock, CreditCard } from 'lucide-react';
import { api } from '../../api/client';
import { useAuth } from '../../modules/auth/AuthContext';
import { toast } from 'react-hot-toast';
import { Button } from '../../components/ui';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
    id: string;
    name: string;
    description?: string;
    longDescription?: string;
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
    const { name: authName, email: authEmail, tenantId } = useAuth();
    const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
    const [loading, setLoading] = useState(false);

    // Customer Details
    const [name, setName] = useState(authName || '');
    const [email, setEmail] = useState(authEmail || '');
    const [phone, setPhone] = useState('');
    const [cpf, setCpf] = useState('');

    // Payment
    const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'BOLETO'>('PIX');
    const [paymentResult, setPaymentResult] = useState<any>(null);

    // Coupons
    const [redeemedCoupons, setRedeemedCoupons] = useState<any[]>([]);
    const [selectedCouponCode, setSelectedCouponCode] = useState<string>('');

    useEffect(() => {
        api.get('/coupons/available')
            .then(res => {
                // filter only available
                const availableToUse = res.data.redeemed.filter((rc: any) => !rc.usedAt);
                setRedeemedCoupons(availableToUse);
            })
            .catch(console.error);
    }, []);

    const discountAmount = React.useMemo(() => {
        if (!selectedCouponCode) return 0;
        const couponData = redeemedCoupons.find(rc => rc.coupon.code === selectedCouponCode)?.coupon;
        if (!couponData) return 0;
        if (couponData.discountType === 'PERCENTAGE') {
            return total * (Number(couponData.discountValue) / 100);
        }
        return Number(couponData.discountValue);
    }, [selectedCouponCode, total, redeemedCoupons]);

    const finalTotal = Math.max(0, total - discountAmount);

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
                couponCode: selectedCouponCode || undefined,
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

                            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 flex flex-col gap-2">
                                <div className="flex justify-between items-center text-gray-400">
                                    <span>Subtotal ({items.length} itens)</span>
                                    <span>R$ {total.toFixed(2).replace('.', ',')}</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between items-center text-green-400 font-medium">
                                        <span>Desconto (Cupom)</span>
                                        <span>- R$ {discountAmount.toFixed(2).replace('.', ',')}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                                    <span className="text-gray-300 font-bold">Total a Pagar</span>
                                    <span className="text-2xl font-black text-amber-400">R$ {finalTotal.toFixed(2).replace('.', ',')}</span>
                                </div>
                            </div>

                            {redeemedCoupons.length > 0 && (
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-white mb-1">Meus Cupons</label>
                                    <select
                                        value={selectedCouponCode}
                                        onChange={(e) => setSelectedCouponCode(e.target.value)}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-amber-500 focus:outline-none transition-colors"
                                    >
                                        <option value="">Sem cupom</option>
                                        {redeemedCoupons.map((rc) => (
                                            <option key={rc.id} value={rc.coupon.code}>
                                                {rc.coupon.code} - {rc.coupon.discountType === 'PERCENTAGE' ? `${rc.coupon.discountValue}%` : `R$ ${rc.coupon.discountValue}`} de desconto
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

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
                                {loading ? 'Processando...' : `Pagar R$ ${finalTotal.toFixed(2).replace('.', ',')}`}
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
 * Product Detail Drawer
 */
interface ProductDetailDrawerProps {
    product: Product;
    onClose: () => void;
    onAddToCart: (product: Product) => void;
}

const ProductDetailDrawer: React.FC<ProductDetailDrawerProps> = ({ product, onClose, onAddToCart }) => {
    return (
        <div className="fixed inset-0 z-[60] flex justify-end animate-fadeIn">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative w-full max-w-2xl bg-[#0f0a06] h-full shadow-2xl overflow-y-auto custom-scrollbar border-l border-[#463420]"
            >
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white z-10 transition-colors"
                >
                    <X size={24} />
                </button>

                <div className="aspect-video w-full bg-[#1a1108] relative overflow-hidden">
                    {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-800">
                            <ShoppingBag size={80} />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f0a06] to-transparent opacity-60" />
                </div>

                <div className="p-8 md:p-12 -mt-12 relative">
                    <div className="bg-[#1a1108]/90 backdrop-blur-md p-6 rounded-2xl border border-[#463420] shadow-xl mb-8">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold uppercase tracking-widest border border-amber-500/20">
                                {product.category || 'Museum Collection'}
                            </span>
                            {product.stock > 0 && product.stock < 10 && (
                                <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-bold uppercase tracking-widest border border-red-500/20">
                                    Últimas Unidades
                                </span>
                            )}
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-2 leading-tight font-serif">{product.name}</h1>
                        <p className="text-3xl font-bold text-amber-400">R$ {Number(product.price).toFixed(2).replace('.', ',')}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center text-center">
                            <ShieldCheck className="text-amber-500 mb-2" size={24} />
                            <span className="text-xs font-bold text-white uppercase mb-1">Qualidade</span>
                            <span className="text-[10px] text-gray-400">Certificado pelo Museu</span>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center text-center">
                            <Star className="text-amber-500 mb-2" size={24} />
                            <span className="text-xs font-bold text-white uppercase mb-1">Exclusivo</span>
                            <span className="text-[10px] text-gray-400">Item Colecionável</span>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center text-center">
                            <Truck className="text-amber-500 mb-2" size={24} />
                            <span className="text-xs font-bold text-white uppercase mb-1">Entrega</span>
                            <span className="text-[10px] text-gray-400">Envio para todo Brasil</span>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Plus size={18} className="text-amber-500" />
                                Sobre o Produto
                            </h3>
                            <div className="text-gray-300 leading-relaxed space-y-4">
                                <p>{product.description}</p>
                                {product.longDescription && <p>{product.longDescription}</p>}
                                {!product.longDescription && (
                                    <p>Este item exclusivo da nossa loja foi cuidadosamente selecionado para representar a história e a cultura preservadas em nosso museu. Cada detalhe foi pensado para oferecer não apenas um produto, mas uma parte da experiência do visitante para levar para casa.</p>
                                )}
                            </div>
                        </div>

                        <div className="pt-8 border-t border-white/10">
                            <div className="flex items-center justify-between gap-6">
                                <div>
                                    <p className="text-sm text-gray-400 mb-1">Disponibilidade</p>
                                    <p className="text-white font-bold">{product.stock > 0 ? `${product.stock} unidades em estoque` : 'Esgotado'}</p>
                                </div>
                                <Button
                                    onClick={() => onAddToCart(product)}
                                    disabled={product.stock <= 0}
                                    className="flex-1 py-6 text-lg bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold uppercase tracking-wider"
                                >
                                    Adicionar ao Carrinho
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

/**
 * Product Card Component 2.0
 */
export const ProductCard: React.FC<{
    product: Product;
    onAddToCart: (product: Product) => void;
    onOpenDetail: (product: Product) => void;
}> = ({ product, onAddToCart, onOpenDetail }) => {
    const isOutOfStock = product.stock <= 0;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8 }}
            className={`group h-full flex flex-col glass-premium rounded-2xl overflow-hidden transition-all duration-500 hover:border-amber-500/50 ${isOutOfStock ? 'opacity-60 saturate-50' : ''}`}
        >
            <div
                className="relative aspect-[4/5] overflow-hidden bg-gray-900 cursor-pointer"
                onClick={() => onOpenDetail(product)}
            >
                {product.imageUrl ? (
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-800">
                        <ShoppingBag size={60} />
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                    <span className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
                        Ver Detalhes <ArrowRight size={12} />
                    </span>
                </div>

                {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                            Esgotado
                        </span>
                    </div>
                )}

                {!isOutOfStock && product.stock < 10 && (
                    <div className="absolute top-4 right-4">
                        <span className="bg-amber-500 text-black px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter animate-pulse">
                            Baixo Estoque
                        </span>
                    </div>
                )}
            </div>

            <div className="p-6 flex flex-col flex-1">
                <div className="mb-4">
                    <p className="text-[10px] text-amber-500 font-black tracking-[0.2em] mb-1 uppercase opacity-70">
                        {product.category || 'Museum Piece'}
                    </p>
                    <h4
                        className="text-lg font-bold text-white leading-tight group-hover:text-amber-400 transition-colors cursor-pointer font-serif"
                        onClick={() => onOpenDetail(product)}
                    >
                        {product.name}
                    </h4>
                </div>

                <div className="mt-auto flex items-center justify-between gap-4">
                    <div>
                        <p className="text-[10px] text-gray-500 uppercase font-bold mb-0.5">Preço</p>
                        <span className="text-xl font-bold text-white">
                            R$ {Number(product.price).toFixed(2).replace('.', ',')}
                        </span>
                    </div>

                    <button
                        onClick={() => onAddToCart(product)}
                        disabled={isOutOfStock}
                        className={`
                            w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300
                            ${isOutOfStock
                                ? 'bg-gray-800/50 text-gray-600 cursor-not-allowed'
                                : 'bg-amber-500 text-black hover:bg-white hover:scale-110 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] shadow-lg shadow-amber-500/20'
                            }
                        `}
                    >
                        <Plus size={24} />
                    </button>
                </div>
            </div>
        </motion.div>
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
 * Product Grid 2.0
 */
export const ProductGrid: React.FC = () => {
    const { tenantId } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>(() => {
        // Init from localStorage
        const saved = localStorage.getItem(`cart_${tenantId}`);
        return saved ? JSON.parse(saved) : [];
    });
    const [loading, setLoading] = useState(true);
    const [showCart, setShowCart] = useState(false);
    const [showCheckout, setShowCheckout] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

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

    // Persist cart
    useEffect(() => {
        if (tenantId) {
            localStorage.setItem(`cart_${tenantId}`, JSON.stringify(cart));
        }
    }, [cart, tenantId]);

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

    const categories = ['all', ...new Set(products.map(p => p.category || 'Geral'))];

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || (p.category || 'Geral') === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="relative">
            {/* Search and Filters */}
            <div className="mb-10 space-y-6">
                <div className="relative max-w-xl mx-auto">
                    <input
                        type="text"
                        placeholder="O que você está procurando?"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#1a1108] border border-[#463420] rounded-2xl py-4 pl-6 pr-12 text-white focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition-all text-lg shadow-xl"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-amber-500 rounded-xl text-black">
                        <ShoppingBag size={20} />
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all border-2 ${selectedCategory === cat
                                ? 'bg-amber-500 border-amber-500 text-black shadow-lg shadow-amber-500/20 scale-105'
                                : 'bg-[#1a1108] border-[#463420] text-gray-400 hover:border-amber-500/30'
                                }`}
                        >
                            {cat === 'all' ? 'Ver Tudo' : cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Cart FAB */}
            <AnimatePresence>
                {cartItemCount > 0 && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowCart(!showCart)}
                        className="fixed bottom-24 right-6 w-16 h-16 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-2xl shadow-amber-500/40 flex items-center justify-center z-40"
                    >
                        <ShoppingBag size={28} />
                        <span className="absolute -top-1 -right-1 w-7 h-7 bg-white text-black text-[10px] font-black rounded-full flex items-center justify-center border-4 border-[#0f0a06]">
                            {cartItemCount}
                        </span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Cart Sidebar Overlay */}
            <AnimatePresence>
                {showCart && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                            onClick={() => setShowCart(false)}
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 200 }}
                            className="fixed right-0 top-0 bottom-0 w-full max-w-md glass-premium z-[51] shadow-2xl flex flex-col"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center p-6 border-b border-[#463420]">
                                <h2 className="text-xl font-bold flex items-center gap-2 text-white font-serif">
                                    <ShoppingBag className="text-amber-500" /> Seu Carrinho
                                </h2>
                                <button onClick={() => setShowCart(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <ShoppingCart
                                    items={cart}
                                    onUpdateQuantity={updateQuantity}
                                    onRemove={removeFromCart}
                                    onCheckout={handleCheckout}
                                />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Checkout Modal */}
            <AnimatePresence>
                {showCheckout && (
                    <CheckoutModal
                        items={cart}
                        total={total}
                        onClose={() => setShowCheckout(false)}
                        onSuccess={() => {
                            setCart([]); // Clear cart
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Details Drawer */}
            <AnimatePresence>
                {selectedProduct && (
                    <ProductDetailDrawer
                        product={selectedProduct}
                        onClose={() => setSelectedProduct(null)}
                        onAddToCart={(p) => {
                            addToCart(p);
                            setSelectedProduct(null);
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Products Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                    <Loader2 size={40} className="animate-spin text-amber-500 mb-4" />
                    <p className="font-bold tracking-widest uppercase text-xs">Aguarde, carregando acervo...</p>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-[#1a1108]/30 rounded-3xl border-2 border-dashed border-[#463420] animate-fadeIn">
                    <div className="w-20 h-20 bg-amber-500/5 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-500/20">
                        <ShoppingBag size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 font-serif">Nenhum tesouro encontrado</h3>
                    <p className="text-gray-400">Tente buscar por outro termo ou categoria.</p>
                </div>
            ) : (
                <motion.div
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                >
                    {filteredProducts.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onAddToCart={addToCart}
                            onOpenDetail={(p) => setSelectedProduct(p)}
                        />
                    ))}
                </motion.div>
            )}
        </div>
    );
};
