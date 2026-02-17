import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash2, DollarSign, Archive, Search, CheckCircle2, XCircle, Image as ImageIcon } from 'lucide-react';
import { api } from '../../../api/client';
import { useAuth } from '../../auth/AuthContext';
import { Input, Button, TextArea } from '../../../components/ui'; // Assuming TextArea exists or use text-area
import "./AdminShared.css";

// Use standard Input/Button/Textarea if available in UI library
// If not, use standard HTML with admin classes

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

export const AdminShop: React.FC = () => {
    const { tenantId } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchProducts();
    }, [tenantId]);

    const fetchProducts = async () => {
        if (!tenantId) return;
        setLoading(true);
        try {
            const res = await api.get(`/shop/products?tenantId=${tenantId}&active=all`);
            setProducts(res.data);
        } catch (error) {
            console.error('Error fetching products:', error);
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

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: products.length,
        active: products.filter(p => p.active).length,
        outOfStock: products.filter(p => p.stock <= 0).length
    };

    return (
        <div className="max-w-[1400px] mx-auto pb-20 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="section-title">🛒 Gestão da Loja</h1>
                    <p className="text-[var(--fg-muted)]">Gerencie os produtos da loja do museu</p>
                </div>
                <Button
                    onClick={() => { setEditingProduct(null); setShowForm(true); }}
                    className="btn-primary"
                    leftIcon={<Plus size={18} />}
                >
                    Novo Produto
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="card flex items-center gap-4 p-6">
                    <div className="p-3 bg-[rgba(212,175,55,0.1)] rounded-xl text-[var(--accent-gold)]">
                        <Package size={24} />
                    </div>
                    <div>
                        <span className="block text-2xl font-bold text-[var(--fg-main)]">{stats.total}</span>
                        <span className="text-sm text-[var(--fg-muted)]">Total de Produtos</span>
                    </div>
                </div>
                <div className="card flex items-center gap-4 p-6">
                    <div className="p-3 bg-green-500/10 rounded-xl text-green-400">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <span className="block text-2xl font-bold text-[var(--fg-main)]">{stats.active}</span>
                        <span className="text-sm text-[var(--fg-muted)]">Produtos Ativos</span>
                    </div>
                </div>
                <div className="card flex items-center gap-4 p-6 border-red-500/20">
                    <div className="p-3 bg-red-500/10 rounded-xl text-red-400">
                        <Archive size={24} />
                    </div>
                    <div>
                        <span className="block text-2xl font-bold text-[var(--fg-main)]">{stats.outOfStock}</span>
                        <span className="text-sm text-[var(--fg-muted)]">Sem Estoque</span>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="mb-8">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--fg-muted)]" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl py-3 pl-10 pr-4 text-[var(--fg-main)] focus:border-[var(--accent-gold)] focus:outline-none transition-colors"
                    />
                </div>
            </div>

            {/* Products Grid */}
            {loading ? (
                <div className="text-center py-20 text-[var(--fg-muted)]">
                    <div className="w-8 h-8 border-2 border-[var(--accent-gold)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    Carregando produtos...
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="card text-center py-20 flex flex-col items-center">
                    <div className="w-16 h-16 bg-[var(--bg-surface)] rounded-full flex items-center justify-center mb-4 text-[var(--fg-muted)]">
                        <Package size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-[var(--fg-main)] mb-1">Nenhum produto encontrado</h3>
                    <p className="text-[var(--fg-muted)]">Tente buscar outro termo ou adicione um novo produto.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map(product => (
                        <div key={product.id} className={`card p-0 overflow-hidden group hover:border-[var(--accent-gold)] transition-colors ${!product.active ? 'opacity-70' : ''}`}>
                            {/* Image Area */}
                            <div className="relative aspect-[4/3] bg-[var(--bg-surface-active)] flex items-center justify-center overflow-hidden">
                                {product.imageUrl ? (
                                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                ) : (
                                    <ImageIcon size={48} className="text-[var(--fg-muted)] opacity-20" />
                                )}
                                {product.stock <= 0 && (
                                    <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                        Esgotado
                                    </div>
                                )}
                                {!product.active && (
                                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                                        <XCircle size={12} /> Inativo
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-[var(--fg-main)] line-clamp-1" title={product.name}>{product.name}</h4>
                                </div>
                                <p className="text-xs text-[var(--fg-muted)] mb-4 font-mono">{product.sku || 'Sem SKU'}</p>

                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-lg font-bold text-green-400">
                                        R$ {Number(product.price).toFixed(2).replace('.', ',')}
                                    </span>
                                    <span className="text-xs text-[var(--fg-muted)] bg-[var(--bg-surface-active)] px-2 py-1 rounded">
                                        Estoque: <span className={product.stock < 5 ? "text-yellow-500 font-bold" : ""}>{product.stock}</span>
                                    </span>
                                </div>

                                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[var(--border-subtle)]">
                                    <button
                                        onClick={() => toggleActive(product)}
                                        className={`flex items-center justify-center py-2 rounded-lg text-xs font-medium transition-colors
                                            ${product.active
                                                ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                                                : 'bg-[var(--bg-surface-active)] text-[var(--fg-muted)] hover:text-white'}
                                        `}
                                        title={product.active ? "Desativar" : "Ativar"}
                                    >
                                        <CheckCircle2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => { setEditingProduct(product); setShowForm(true); }}
                                        className="flex items-center justify-center py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                                        title="Editar"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        className="flex items-center justify-center py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                                        title="Excluir"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Form Modal */}
            {showForm && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6 border-b border-[var(--border-subtle)] pb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-[var(--fg-main)]">
                                {editingProduct ? <Edit size={20} className="text-[var(--accent-gold)]" /> : <Plus size={20} className="text-[var(--accent-gold)]" />}
                                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                            </h2>
                            <button onClick={() => setShowForm(false)} className="text-[var(--fg-muted)] hover:text-white transition-colors">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <ProductForm
                            product={editingProduct}
                            tenantId={tenantId || ''}
                            onClose={() => setShowForm(false)}
                            onSave={() => { setShowForm(false); fetchProducts(); }}
                        />
                    </div>
                </div>
            )}
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
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
                <Input
                    label="Nome do Produto *"
                    value={form.name}
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                    placeholder="Ex: Caneca do Museu"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                    <Input
                        label="Preço R$ *"
                        type="number"
                        step="0.01"
                        value={form.price}
                        onChange={(e) => setForm(f => ({ ...f, price: parseFloat(e.target.value) }))}
                        required
                        leftIcon={<DollarSign size={14} />}
                    />
                </div>
                <div className="form-group">
                    <Input
                        label="Estoque"
                        type="number"
                        value={form.stock}
                        onChange={(e) => setForm(f => ({ ...f, stock: parseInt(e.target.value) }))}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                    <Input
                        label="SKU (Código)"
                        value={form.sku}
                        onChange={(e) => setForm(f => ({ ...f, sku: e.target.value }))}
                        placeholder="COD-001"
                    />
                </div>
                <div className="form-group">
                    <Input
                        label="Categoria"
                        value={form.category}
                        onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))}
                        placeholder="souvenirs, livros..."
                    />
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Descrição</label>
                <textarea
                    className="w-full bg-[rgba(10,6,4,0.6)] border border-[var(--border-default)] rounded-md text-[var(--fg-main)] p-3 focus:border-[var(--accent-gold)] focus:outline-none min-h-[80px]"
                    value={form.description}
                    onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={3}
                />
            </div>

            <div className="form-group">
                <Input
                    label="URL da Imagem"
                    value={form.imageUrl}
                    onChange={(e) => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                    placeholder="https://..."
                />
            </div>

            <div className="flex gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={onClose} className="flex-1 btn-ghost">Cancelar</Button>
                <Button type="submit" isLoading={saving} className="flex-1 btn-primary">
                    {saving ? 'Salvando...' : 'Salvar Produto'}
                </Button>
            </div>
        </form>
    );
};

