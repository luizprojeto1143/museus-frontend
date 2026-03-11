import React, { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Edit2, Shield, Gem, Star, Award, Search, Building2 } from "lucide-react";
import { api } from "../../../api/client";
import { useTranslation } from "react-i18next";
import { Button, Input, Select, Badge } from "../../../components/ui";
import { useToast } from "../../../contexts/ToastContext";
import "./MasterShared.css";

interface Skin {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    xpCost: number;
    rarity: string;
    active: boolean;
    tenantId: string | null;
    _count?: { owners: number };
}

interface Tenant {
    id: string;
    name: string;
}

export const MasterSkinManager: React.FC = () => {
    const { t } = useTranslation();
    const { addToast } = useToast();
    const [skins, setSkins] = useState<Skin[]>([]);
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        imageUrl: "",
        xpCost: 500,
        rarity: "COMMON",
        tenantId: "",
        active: true
    });
    const [editingId, setEditingId] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        try {
            const [skinsRes, tenantsRes] = await Promise.all([
                api.get("/skins"),
                api.get("/tenants")
            ]);
            setSkins(skinsRes.data);
            setTenants(tenantsRes.data);
        } catch (err) {
            addToast("Erro ao carregar dados", "error");
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = { ...formData, tenantId: formData.tenantId || null };
            if (editingId) {
                await api.put(`/skins/${editingId}`, payload);
                addToast("Skin atualizada!", "success");
            } else {
                await api.post("/skins", payload);
                addToast("Skin criada!", "success");
            }
            setShowForm(false);
            setEditingId(null);
            setFormData({ name: "", description: "", imageUrl: "", xpCost: 500, rarity: "COMMON", tenantId: "", active: true });
            loadData();
        } catch (err) {
            addToast("Erro ao salvar skin", "error");
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Deseja excluir esta skin?")) return;
        try {
            await api.delete(`/skins/${id}`);
            addToast("Skin removida", "success");
            loadData();
        } catch (err) {
            addToast("Erro ao excluir", "error");
        }
    };

    const getRarityColor = (rarity: string) => {
        switch (rarity) {
            case "COMMON": return "master-icon-blue";
            case "RARE": return "master-icon-purple";
            case "EPIC": return "master-icon-red";
            case "LEGENDARY": return "master-icon-yellow";
            case "EXCLUSIVE": return "master-icon-green";
            default: return "master-icon-blue";
        }
    };

    return (
        <div className="master-page-container">
            <section className="master-hero">
                <span className="master-badge">🎭 Customização Global</span>
                <h1 className="master-title">Gestão de Skins</h1>
                <p className="master-subtitle">Crie itens cosméticos para os visitantes gastarem seu XP e criarem identidade visual.</p>
                <div className="mt-8">
                    <Button onClick={() => setShowForm(true)} leftIcon={<Plus size={20} />}>Nova Skin</Button>
                </div>
            </section>

            {showForm && (
                <div className="master-card mb-8">
                    <form onSubmit={handleSubmit} className="master-form">
                        <h3>{editingId ? "Editar Skin" : "Cadastrar Nova Skin"}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Nome" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                            <Select label="Raridade" value={formData.rarity} onChange={e => setFormData({...formData, rarity: e.target.value})}>
                                <option value="COMMON">Comum</option>
                                <option value="RARE">Raro</option>
                                <option value="EPIC">Épico</option>
                                <option value="LEGENDARY">Lendário</option>
                                <option value="EXCLUSIVE">Exclusivo</option>
                            </Select>
                            <Input label="Custo XP" type="number" value={formData.xpCost} onChange={e => setFormData({...formData, xpCost: Number(e.target.value)})} required />
                            <Select label="Tenant (Vinculo Opcional)" value={formData.tenantId} onChange={e => setFormData({...formData, tenantId: e.target.value})}>
                                <option value="">Global (Todos)</option>
                                {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </Select>
                        </div>
                        <Input label="URL da Imagem" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} />
                        <textarea className="master-input-group textarea" placeholder="Descrição da skin..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} />
                        <div className="flex gap-4">
                            <Button type="submit">{editingId ? "Atualizar" : "Salvar"}</Button>
                            <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="master-grid-3">
                {skins.map(skin => (
                    <div key={skin.id} className="master-card">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`master-icon-wrapper ${getRarityColor(skin.rarity)}`}>
                                <Gem size={24} />
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 hover:bg-white/10 rounded-lg text-blue-400" onClick={() => { setFormData(skin as any); setEditingId(skin.id); setShowForm(true); }}>
                                    <Edit2 size={16} />
                                </button>
                                <button className="p-2 hover:bg-white/10 rounded-lg text-red-400" onClick={() => handleDelete(skin.id)}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="h-40 bg-black/20 rounded-xl mb-4 flex items-center justify-center overflow-hidden border border-white/5">
                             <img src={skin.imageUrl} alt={skin.name} className="h-full object-contain" />
                        </div>
                        <h3>{skin.name}</h3>
                        <p className="master-card-desc">{skin.description}</p>
                        <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/5">
                            <span className="text-yellow-500 font-bold">⭐ {skin.xpCost} XP</span>
                            <span className="text-xs text-slate-500">{skin._count?.owners || 0} donos</span>
                        </div>
                        {skin.tenantId && (
                           <div className="mt-2 flex items-center gap-1 text-[10px] text-blue-400/60 uppercase font-bold">
                               <Building2 size={10} /> {tenants.find(t => t.id === skin.tenantId)?.name || 'Tenant'}
                           </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
