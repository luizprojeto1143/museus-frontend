import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash2, DollarSign, Archive, Search } from 'lucide-react';
import { api } from '../../../api/client';
import { useAuth } from '../../auth/AuthContext';

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
        <div className="admin-shop-page">
            <header className="page-header">
                <div>
                    <h1>🛒 Gestão da Loja</h1>
                    <p className="subtitle">Gerencie os produtos da loja do museu</p>
                </div>
                <button className="add-btn" onClick={() => { setEditingProduct(null); setShowForm(true); }}>
                    <Plus size={18} /> Novo Produto
                </button>
            </header>

            {/* Stats */}
            <div className="stats-row">
                <div className="stat-card">
                    <Package size={24} />
                    <div>
                        <span className="stat-value">{stats.total}</span>
                        <span className="stat-label">Produtos</span>
                    </div>
                </div>
                <div className="stat-card">
                    <DollarSign size={24} />
                    <div>
                        <span className="stat-value">{stats.active}</span>
                        <span className="stat-label">Ativos</span>
                    </div>
                </div>
                <div className="stat-card warning">
                    <Archive size={24} />
                    <div>
                        <span className="stat-value">{stats.outOfStock}</span>
                        <span className="stat-label">Sem Estoque</span>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="search-bar">
                <Search size={18} />
                <input
                    type="text"
                    placeholder="Buscar por nome ou SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Products Grid */}
            <div className="products-grid">
                {loading ? (
                    <div className="loading-state">Carregando produtos...</div>
                ) : filteredProducts.length === 0 ? (
                    <div className="empty-state">
                        <Package size={48} />
                        <h3>Nenhum produto cadastrado</h3>
                        <p>Adicione produtos para sua loja virtual</p>
                    </div>
                ) : (
                    filteredProducts.map(product => (
                        <div key={product.id} className={`product-card ${!product.active ? 'inactive' : ''}`}>
                            <div className="product-image">
                                {product.imageUrl ? (
                                    <img src={product.imageUrl} alt={product.name} />
                                ) : (
                                    <Package size={48} />
                                )}
                                {product.stock <= 0 && <div className="out-of-stock-badge">Esgotado</div>}
                            </div>
                            <div className="product-info">
                                <h4>{product.name}</h4>
                                <p className="product-sku">{product.sku || 'Sem SKU'}</p>
                                <div className="product-meta">
                                    <span className="price">R$ {Number(product.price).toFixed(2).replace('.', ',')}</span>
                                    <span className="stock">Estoque: {product.stock}</span>
                                </div>
                            </div>
                            <div className="product-actions">
                                <button
                                    className={`toggle-btn ${product.active ? 'active' : ''}`}
                                    onClick={() => toggleActive(product)}
                                >
                                    {product.active ? '✓ Ativo' : '○ Inativo'}
                                </button>
                                <button className="edit-btn" onClick={() => { setEditingProduct(product); setShowForm(true); }}>
                                    <Edit size={16} />
                                </button>
                                <button className="delete-btn" onClick={() => handleDelete(product.id)}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Form Modal */}
            {showForm && (
                <ProductFormModal
                    product={editingProduct}
                    tenantId={tenantId || ''}
                    onClose={() => setShowForm(false)}
                    onSave={() => { setShowForm(false); fetchProducts(); }}
                />
            )}

            <style>{`
                .admin-shop-page {
                    padding: 24px;
                }
                
                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 24px;
                }
                
                .page-header h1 {
                    margin: 0;
                    font-size: 1.75rem;
                    color: var(--fg-main, #f3f4f6);
                }
                
                .add-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 24px;
                    background: linear-gradient(135deg, #22c55e, #16a34a);
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                }
                
                .stats-row {
                    display: flex;
                    gap: 16px;
                    margin-bottom: 24px;
                }
                
                .stat-card {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 20px;
                    background: var(--bg-card, #1f2937);
                    border-radius: 12px;
                    color: var(--fg-muted, #9ca3af);
                }
                
                .stat-card.warning {
                    border: 1px solid rgba(245, 158, 11, 0.3);
                }
                
                .stat-value {
                    display: block;
                    font-size: 1.5rem;
                    font-weight: bold;
                    color: var(--fg-main, #f3f4f6);
                }
                
                .stat-label {
                    font-size: 0.85rem;
                }
                
                .search-bar {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    background: var(--bg-card, #1f2937);
                    border-radius: 10px;
                    margin-bottom: 20px;
                    color: var(--fg-muted, #9ca3af);
                }
                
                .search-bar input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    color: var(--fg-main, #f3f4f6);
                    font-size: 1rem;
                }
                
                .products-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 16px;
                }
                
                .product-card {
                    background: var(--bg-card, #1f2937);
                    border-radius: 16px;
                    overflow: hidden;
                }
                
                .product-card.inactive {
                    opacity: 0.6;
                }
                
                .product-image {
                    position: relative;
                    height: 150px;
                    background: var(--bg-elevated, #374151);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--fg-muted, #9ca3af);
                }
                
                .product-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                
                .out-of-stock-badge {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    padding: 4px 10px;
                    background: #ef4444;
                    color: white;
                    font-size: 0.75rem;
                    font-weight: bold;
                    border-radius: 4px;
                }
                
                .product-info {
                    padding: 16px;
                }
                
                .product-info h4 {
                    margin: 0 0 4px;
                    color: var(--fg-main, #f3f4f6);
                }
                
                .product-sku {
                    font-size: 0.8rem;
                    color: var(--fg-muted, #9ca3af);
                    margin: 0 0 12px;
                }
                
                .product-meta {
                    display: flex;
                    justify-content: space-between;
                }
                
                .price {
                    font-weight: bold;
                    color: #22c55e;
                }
                
                .stock {
                    font-size: 0.85rem;
                    color: var(--fg-muted, #9ca3af);
                }
                
                .product-actions {
                    display: flex;
                    gap: 8px;
                    padding: 12px 16px;
                    border-top: 1px solid var(--border-color, #374151);
                }
                
                .toggle-btn {
                    flex: 1;
                    padding: 8px;
                    background: var(--bg-elevated, #374151);
                    border: none;
                    border-radius: 6px;
                    color: var(--fg-muted, #9ca3af);
                    cursor: pointer;
                }
                
                .toggle-btn.active {
                    background: rgba(34, 197, 94, 0.2);
                    color: #22c55e;
                }
                
                .edit-btn, .delete-btn {
                    padding: 8px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                }
                
                .edit-btn {
                    background: rgba(59, 130, 246, 0.2);
                    color: #3b82f6;
                }
                
                .delete-btn {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                }
                
                .loading-state, .empty-state {
                    grid-column: 1 / -1;
                    text-align: center;
                    padding: 60px 20px;
                    color: var(--fg-muted, #9ca3af);
                }
            `}</style>
        </div>
    );
};

// Product Form Modal
const ProductFormModal: React.FC<{
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
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2>{product ? 'Editar Produto' : 'Novo Produto'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nome *</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            required
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Preço *</label>
                            <input
                                type="number"
                                step="0.01"
                                value={form.price}
                                onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) }))}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Estoque</label>
                            <input
                                type="number"
                                value={form.stock}
                                onChange={e => setForm(f => ({ ...f, stock: parseInt(e.target.value) }))}
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>SKU</label>
                            <input
                                type="text"
                                value={form.sku}
                                onChange={e => setForm(f => ({ ...f, sku: e.target.value }))}
                            />
                        </div>
                        <div className="form-group">
                            <label>Categoria</label>
                            <input
                                type="text"
                                value={form.category}
                                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                                placeholder="souvenirs, livros..."
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Descrição</label>
                        <textarea
                            value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            rows={3}
                        />
                    </div>
                    <div className="form-group">
                        <label>URL da Imagem</label>
                        <input
                            type="url"
                            value={form.imageUrl}
                            onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                        />
                    </div>
                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="save-btn" disabled={saving}>
                            {saving ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>

                <style>{`
                    .modal-backdrop {
                        position: fixed;
                        inset: 0;
                        background: rgba(0, 0, 0, 0.7);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 1000;
                        padding: 20px;
                    }
                    
                    .modal-content {
                        background: var(--bg-card, #1f2937);
                        border-radius: 16px;
                        padding: 24px;
                        width: 100%;
                        max-width: 500px;
                        max-height: 90vh;
                        overflow-y: auto;
                    }
                    
                    .modal-content h2 {
                        margin: 0 0 20px;
                        color: var(--fg-main, #f3f4f6);
                    }
                    
                    .form-group {
                        margin-bottom: 16px;
                    }
                    
                    .form-group label {
                        display: block;
                        margin-bottom: 6px;
                        font-size: 0.9rem;
                        color: var(--fg-muted, #9ca3af);
                    }
                    
                    .form-group input, .form-group textarea {
                        width: 100%;
                        padding: 12px;
                        background: var(--bg-elevated, #374151);
                        border: 1px solid var(--border-color, #4b5563);
                        border-radius: 8px;
                        color: var(--fg-main, #f3f4f6);
                    }
                    
                    .form-row {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 12px;
                    }
                    
                    .form-actions {
                        display: flex;
                        gap: 12px;
                        margin-top: 24px;
                    }
                    
                    .cancel-btn, .save-btn {
                        flex: 1;
                        padding: 12px;
                        border: none;
                        border-radius: 8px;
                        font-weight: 600;
                        cursor: pointer;
                    }
                    
                    .cancel-btn {
                        background: var(--bg-elevated, #374151);
                        color: var(--fg-muted, #9ca3af);
                    }
                    
                    .save-btn {
                        background: linear-gradient(135deg, #22c55e, #16a34a);
                        color: white;
                    }
                `}</style>
            </div>
        </div>
    );
};
