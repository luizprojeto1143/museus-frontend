import React, { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { Package, Plus, Edit, Trash2, DollarSign, Archive, Search, CheckCircle2, XCircle, Image as ImageIcon, TrendingUp, AlertTriangle, Filter } from 'lucide-react';
import { api } from '../../../api/client';
import { useAuth } from '../../auth/AuthContext';
import { Input, Button } from '../../../components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import "./AdminShared.css";

interface Product {
    id: string;
    name: string;
    description: string | null;
    price: number;
    imageUrl: string | null;
    category: string | null;
    sku: string | null;
    stock: number;
    active: boolean;
}

interface Order {
    id: string;
    total: number;
    status: string;
    createdAt: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: string;
    paymentMethod: string;
    items: Array<{
        product: { name: string };
        quantity: number;
        unitPrice: number;
    }>;
}

export const AdminShop: React.FC = () => {
  const { t } = useTranslation();
    const { tenantId } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [activeView, setActiveView] = useState<'products' | 'orders'>('products');

    useEffect(() => {
        if (tenantId) {
            fetchData();
        }
    }, [tenantId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [productsRes, ordersRes] = await Promise.all([
                api.get(`/shop/products?tenantId=${tenantId}&active=all`),
                api.get(`/shop/orders?tenantId=${tenantId}`)
            ]);
            setProducts(productsRes.data);
            setOrders(ordersRes.data || []);
        } catch (error) {
            console.error('Error fetching shop data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este produto?')) return;
        try {
            await api.delete(`/shop/products/${id}`);
            setProducts(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    const toggleActive = async (product: Product) => {
        try {
            await api.put(`/shop/products/${product.id}`, { active: !product.active });
            setProducts(prev => prev.map(p => p.id === product.id ? { ...p, active: !p.active } : p));
        } catch (error) {
            console.error('Error toggling product:', error);
        }
    };

    const categories = ['all', ...new Set(products.map(p => p.category || 'Geral'))];

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || (p.category || 'Geral') === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const totalRevenue = orders
        .filter(o => o.status === 'PAID')
        .reduce((sum, o) => sum + Number(o.total), 0);

    const lowStockCount = products.filter(p => p.active && p.stock > 0 && p.stock < 10).length;

    const updateOrderStatus = async (orderId: string, status: string) => {
        try {
            await api.patch(`/shop/orders/${orderId}/status`, { status });
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    };

    const stats = [
        {
            label: 'Receita Total',
            value: `R$ ${totalRevenue.toFixed(2).replace('.', ',')}`,
            icon: <TrendingUp size={24} />,
            color: 'text-green-400',
            bg: 'bg-green-500/10'
        },
        {
            label: 'Produtos Ativos',
            value: products.filter(p => p.active).length,
            icon: <Package size={24} />,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10'
        },
        {
            label: 'Baixo Estoque',
            value: lowStockCount,
            icon: <AlertTriangle size={24} />,
            color: 'text-orange-400',
            bg: 'bg-orange-500/10'
        },
        {
            label: 'Sem Estoque',
            value: products.filter(p => p.stock <= 0).length,
            icon: <Archive size={24} />,
            color: 'text-red-400',
            bg: 'bg-red-500/10'
        }
    ];

    return (
        <div className="max-w-[1400px] mx-auto pb-20 animate-fadeIn p-4 md:p-8">
            {/* Premium Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-white mb-2 tracking-tight">SHOP <span className="text-amber-500">CONTROL</span></h1>
                    <p className="text-gray-400 font-medium">{t("admin.shop.ecossistemaDeGestoDeAcervoEVendas", `Ecossistema de gestão de acervo e vendas`)}</p>
                </div>
                <div className="flex gap-4">
                    <Button
                        onClick={() => { setEditingProduct(null); setShowForm(true); }}
                        className="bg-amber-500 hover:bg-amber-600 text-black font-bold h-12 px-8 rounded-xl shadow-lg shadow-amber-500/20"
                        leftIcon={<Plus size={20} />}
                    >
                        Adicionar Item
                    </Button>
                </div>
            </div>

            {/* View Tabs */}
            <div className="flex gap-2 mb-8">
                <button
                    onClick={() => setActiveView('products')}
                    className={`px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all border ${activeView === 'products'
                            ? 'bg-amber-500 border-amber-500 text-black shadow-lg shadow-amber-500/10'
                            : 'bg-zinc-900/40 border border-gold/20/5 border-white/5 text-gray-400 hover:border-white/20'
                        }`}
                >
                    <Package size={16} className="inline mr-2 mb-0.5" /> Produtos ({products.length})
                </button>
                <button
                    onClick={() => setActiveView('orders')}
                    className={`px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all border ${activeView === 'orders'
                            ? 'bg-amber-500 border-amber-500 text-black shadow-lg shadow-amber-500/10'
                            : 'bg-zinc-900/40 border border-gold/20/5 border-white/5 text-gray-400 hover:border-white/20'
                        }`}
                >
                    <DollarSign size={16} className="inline mr-2 mb-0.5" /> Pedidos ({orders.length})
                </button>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="card" style={{ cursor: "pointer", transition: "all 0.2s" }}
                    >
                        <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                            {stat.icon}
                        </div>
                        <span className="text-sm font-bold text-zinc-400 uppercase tracking-widest block mb-1">{stat.label}</span>
                        <span className="text-2xl font-black text-white">{stat.value}</span>
                    </motion.div>
                ))}
            </div>

            {activeView === 'products' ? (
                <>
                    {/* Filters and Search */}
                    <div className="card" style={{ marginBottom: "2rem", display: "flex", gap: "1.5rem", alignItems: "center", flexWrap: "wrap" }}>
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                            <input
                                type="text"
                                placeholder="Pesquisar por nome ou SKU..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:border-amber-500 focus:outline-none transition-all"
                            />
                        </div>

                        <div className="flex items-center gap-4 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                            <Filter className="text-zinc-400 flex-shrink-0" size={20} />
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setFilterCategory(cat)}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all border ${filterCategory === cat
                                        ? 'bg-amber-500 border-amber-500 text-black shadow-lg shadow-amber-500/10'
                                        : 'bg-zinc-900/40 border border-gold/20/5 border-white/5 text-gray-400 hover:border-white/20'
                                        }`}
                                >
                                    {cat === 'all' ? 'Ver Tudo' : cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Products Table/Grid View */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
                            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="font-bold uppercase tracking-widest text-xs">Sincronizando estoque...</p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="card" style={{ textAlign: "center", padding: "6rem 2rem", border: "2px dashed rgba(212,175,55,0.15)" }}>
                            <Package size={60} className="mx-auto text-zinc-200 mb-6 opacity-20" />
                            <h3 className="text-xl font-bold text-white mb-2">Sem resultados para sua busca</h3>
                            <p style={{ color: "#64748b" }}>Tente ajustar seus filtros ou cadastre um novo produto.</p>
                        </div>
                    ) : (
                        <motion.div
                            layout
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        >
                            <AnimatePresence>
                                {filteredProducts.map(product => (
                                    <motion.div
                                        key={product.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="card" style={{ position: "relative", overflow: "hidden", transition: "all 0.3s" }}
                                    >
                                        {/* Actions Overlay */}
                                        <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
                                            <button
                                                onClick={() => { setEditingProduct(product); setShowForm(true); }}
                                                className="w-10 h-10 bg-black/60 backdrop-blur-md text-blue-400 rounded-xl flex items-center justify-center hover:bg-blue-400 hover:text-black transition-all"
                                                title="Editar"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => toggleActive(product)}
                                                className={`w-10 h-10 bg-black/60 backdrop-blur-md rounded-xl flex items-center justify-center transition-all ${product.active ? 'text-green-400 hover:bg-green-400 hover:text-black' : 'text-gray-400 hover:bg-zinc-900/40 border border-gold/20 hover:text-black'
                                                    }`}
                                                title={product.active ? "Desativar" : "Ativar"}
                                            >
                                                {product.active ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="w-10 h-10 bg-black/60 backdrop-blur-md text-red-400 rounded-xl flex items-center justify-center hover:bg-red-400 hover:text-black transition-all"
                                                title="Excluir"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>

                                        {/* Image Section */}
                                        <div className="aspect-[4/5] bg-black/20 relative overflow-hidden">
                                            {product.imageUrl ? (
                                                <img
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-white">
                                                    <ImageIcon size={48} />
                                                </div>
                                            )}

                                            {/* Stock Badge */}
                                            <div className="absolute bottom-4 left-4">
                                                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter border ${product.stock <= 0 ? 'bg-red-500/20 border-red-500 text-red-500' :
                                                    product.stock < 10 ? 'bg-orange-500/20 border-orange-500 text-orange-500' :
                                                        'bg-green-500/20 border-green-500 text-green-500'
                                                    }`}>
                                                    Estoque: {product.stock}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Info Section */}
                                        <div className="p-6">
                                            <div className="mb-2">
                                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">{product.category || 'Museum Piece'}</p>
                                                <h4 className="text-lg font-bold text-white line-clamp-1">{product.name}</h4>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xl font-black text-amber-500">
                                                    R$ {Number(product.price).toFixed(2).replace('.', ',')}
                                                </span>
                                                <span className="text-[10px] font-mono text-zinc-300">{product.sku || 'NO-SKU'}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </>
            ) : (
                /* Orders Section */
                <div style={{ display: "grid", gap: "1rem" }}>
                    {orders.length === 0 ? (
                        <div className="card" style={{ textAlign: "center", padding: "6rem 2rem", border: "2px dashed rgba(212,175,55,0.15)" }}>
                            <DollarSign size={60} className="mx-auto text-zinc-200 mb-6 opacity-20" />
                            <h3 className="text-xl font-bold text-white mb-2">Nenhum pedido ainda</h3>
                            <p style={{ color: "#64748b" }}>{t("admin.shop.osPedidosDosClientesApareceroAqui", `Os pedidos dos clientes aparecerão aqui.`)}</p>
                        </div>
                    ) : (
                        <div className="card" style={{ overflow: "hidden", padding: 0 }}>
                            <table className="w-full text-left">
                                <thead className="bg-black/40 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Pedido</th>
                                        <th className="px-6 py-4">Cliente</th>
                                        <th className="px-6 py-4">{t("admin.shop.endereoDeEntrega", `Endereço de Entrega`)}</th>
                                        <th className="px-6 py-4">Itens</th>
                                        <th className="px-6 py-4">Total</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">{t("admin.shop.ao", `Ação`)}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {orders.map(order => (
                                        <tr key={order.id} className="hover:bg-zinc-900/40 border border-gold/20/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="text-amber-500 font-bold text-xs">#{order.id.slice(-6)}</span>
                                                <p className="text-zinc-400 text-[10px] mt-1">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span style={{ color: "white", fontWeight: 700, fontSize: "0.9rem" }}>{order.customerName}</span>
                                                <p style={{ color: "#64748b", fontSize: "0.75rem" }}>{order.customerEmail}</p>
                                                {order.customerPhone && <p className="text-zinc-300 text-xs">{order.customerPhone}</p>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-gray-300 text-xs max-w-[200px] block truncate" title={order.shippingAddress || 'Retirada'}>
                                                    {order.shippingAddress || <span className="italic text-zinc-300">Retirada no local</span>}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    {order.items?.map((item, idx) => (
                                                        <div key={idx} className="text-xs text-gray-400">
                                                            {item.quantity}x {item.product.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span style={{ color: "white", fontWeight: 700 }}>R$ {Number(order.total).toFixed(2).replace('.', ',')}</span>
                                                <p className="text-zinc-300 text-[10px] uppercase">{order.paymentMethod || 'PIX'}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${order.status === 'PAID' ? 'bg-green-500/10 text-green-400' :
                                                        order.status === 'SHIPPED' ? 'bg-blue-500/10 text-blue-400' :
                                                            order.status === 'DELIVERED' ? 'bg-emerald-500/10 text-emerald-400' :
                                                                order.status === 'CANCELLED' ? 'bg-red-500/10 text-red-400' :
                                                                    'bg-amber-500/10 text-amber-500'
                                                    }`}>
                                                    {order.status === 'PAID' ? 'Pago' :
                                                        order.status === 'SHIPPED' ? 'Enviado' :
                                                            order.status === 'DELIVERED' ? 'Entregue' :
                                                                order.status === 'CANCELLED' ? 'Cancelado' :
                                                                    'Pendente'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                    className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:border-amber-500 focus:outline-none"
                                                >
                                                    <option value="PENDING">Pendente</option>
                                                    <option value="PAID">Pago</option>
                                                    <option value="SHIPPED">Enviado</option>
                                                    <option value="DELIVERED">Entregue</option>
                                                    <option value="CANCELLED">Cancelado</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                            onClick={() => setShowForm(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="card" style={{ position: "relative", width: "100%", maxWidth: "42rem", borderRadius: "1.5rem", padding: "2rem", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 25px 50px rgba(0,0,0,0.5)" }}
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">
                                    {editingProduct ? 'Update Product' : 'New Treasure'}
                                </h2>
                                <button onClick={() => setShowForm(false)} className="w-10 h-10 rounded-full hover:bg-zinc-900/40 border border-gold/20/5 flex items-center justify-center text-zinc-400 transition-colors">
                                    <XCircle size={20} />
                                </button>
                            </div>

                            <ProductForm
                                product={editingProduct}
                                tenantId={tenantId || ''}
                                onClose={() => setShowForm(false)}
                                onSave={() => { setShowForm(false); fetchData(); }}
                            />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Extracted Form Component
const ProductForm: React.FC<{
    product: Product | null;
    tenantId: string;
    onClose: () => void;
    onSave: () => void;
}> = ({ product, tenantId, onClose, onSave }) => {
    const [form, setForm] = useState({
        name: product?.name || '',
        description: product?.description || '',
        price: product?.price || 0,
        imageUrl: product?.imageUrl || '',
        category: product?.category || '',
        sku: product?.sku || '',
        stock: product?.stock || 0,
        active: product?.active ?? true
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (product) {
                await api.put(`/shop/products/${product.id}`, form);
            } else {
                await api.post('/shop/products', { ...form, tenantId });
            }
            onSave();
        } catch (error) {
            console.error('Error saving product:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div style={{ display: "grid", gap: "0.5rem" }}>
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Produto</label>
                    <input
                        value={form.name}
                        onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                        required
                        placeholder={t("admin.shop.nomeDaPea", `Nome da peça`)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-amber-500 focus:outline-none"
                    />
                </div>
                <div style={{ display: "grid", gap: "0.5rem" }}>
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">{t("admin.shop.preo", `Preço`)}</label>
                    <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500" size={18} />
                        <input
                            type="number"
                            step="0.01"
                            value={form.price}
                            onChange={(e) => setForm(f => ({ ...f, price: parseFloat(e.target.value) }))}
                            required
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 pl-12 text-white focus:border-amber-500 focus:outline-none"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div style={{ display: "grid", gap: "0.5rem" }}>
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">SKU</label>
                    <input
                        value={form.sku}
                        onChange={(e) => setForm(f => ({ ...f, sku: e.target.value }))}
                        placeholder="Ex: SKU-001"
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-amber-500 focus:outline-none font-mono"
                    />
                </div>
                <div style={{ display: "grid", gap: "0.5rem" }}>
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Categoria</label>
                    <input
                        value={form.category}
                        onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                        placeholder="Ex: Livros"
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-amber-500 focus:outline-none"
                    />
                </div>
                <div style={{ display: "grid", gap: "0.5rem" }}>
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Estoque</label>
                    <input
                        type="number"
                        value={form.stock}
                        onChange={(e) => setForm(f => ({ ...f, stock: parseInt(e.target.value) }))}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-amber-500 focus:outline-none"
                    />
                </div>
            </div>

            <div style={{ display: "grid", gap: "0.5rem" }}>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">{t("admin.shop.descrio", `Descrição`)}</label>
                <textarea
                    value={form.description}
                    onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={4}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-amber-500 focus:outline-none resize-none"
                />
            </div>

            <div style={{ display: "grid", gap: "0.5rem" }}>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Imagem URL</label>
                <input
                    value={form.imageUrl}
                    onChange={(e) => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                    placeholder="https://sua-imagem.com/foto.jpg"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:border-amber-500 focus:outline-none"
                />
            </div>

            <div className="flex items-center gap-2 py-4">
                <input
                    type="checkbox"
                    id="active"
                    checked={form.active}
                    onChange={(e) => setForm(f => ({ ...f, active: e.target.checked }))}
                    className="w-5 h-5 accent-amber-500"
                />
                <label htmlFor="active" className="text-sm font-bold text-white">{t("admin.shop.publicadoEVisvelNaLoja", `Publicado e visível na loja`)}</label>
            </div>

            <div className="flex gap-4 pt-6">
                <Button type="button" variant="ghost" onClick={onClose} className="flex-1 h-14 rounded-xl border-white/10 hover:bg-zinc-900/40 border border-gold/20/5">Cancelar</Button>
                <Button type="submit" isLoading={saving} className="flex-1 h-14 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold shadow-lg shadow-amber-500/20">
                    {saving ? 'Salvando...' : 'Confirmar Alterações'}
                </Button>
            </div>
        </form>
    );
};
