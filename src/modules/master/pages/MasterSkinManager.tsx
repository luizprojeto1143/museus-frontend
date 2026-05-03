import React, { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Edit2, Gem, Building2 } from "lucide-react";
import { api } from "../../../api/client";
import { useTranslation } from "react-i18next";
import { Button, Input, Select } from "../../../components/ui";
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
    
    // Skins Form State
    const [skinForm, setSkinForm] = useState({
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

    const handleSkinSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = { 
                ...skinForm, 
                tenantId: skinForm.tenantId || null
            };
            if (editingId) {
                await api.put(`/skins/${editingId}`, payload);
                addToast("Skin atualizada!", "success");
            } else {
                await api.post("/skins", payload);
                addToast("Skin criada!", "success");
            }
            resetForms();
            loadData();
        } catch (err) {
            addToast("Erro ao salvar skin", "error");
        }
    };

    const resetForms = () => {
        setShowForm(false);
        setEditingId(null);
        setSkinForm({ name: "", description: "", imageUrl: "", xpCost: 500, rarity: "COMMON", tenantId: "", active: true });
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm(`Deseja excluir este item?`)) return;
        try {
            await api.delete(`/skins/${id}`);
            addToast("Removido com sucesso", "success");
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

    if (loading) return <div className="p-8 text-center text-white">Carregando...</div>;

    return (
        <div className="master-page-container">
            <section className="master-hero">
                <span className="master-badge">🎭 Customização Global</span>
                <h1 className="master-title">Módulo RPG Master</h1>
                <p className="master-subtitle">Gerencie skins cosméticas que os visitantes podem adquirir na loja.</p>
                
                <div className="flex gap-4 mt-8">
                    <Button onClick={() => setShowForm(true)} leftIcon={<Plus size={20} />}>
                        Novo Item cosmético
                    </Button>
                </div>
            </section>

            {showForm && (
                <div className="master-card mb-8">
                    <form onSubmit={handleSkinSubmit} className="master-form">
                        <h3>{editingId ? "Editar" : "Cadastrar"} Skin</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input 
                                label="Nome" 
                                value={skinForm.name} 
                                onChange={e => setSkinForm({...skinForm, name: e.target.value})} 
                                required 
                            />
                            
                            <Select label="Raridade" value={skinForm.rarity} onChange={e => setSkinForm({...skinForm, rarity: e.target.value})}>
                                <option value="COMMON">Comum</option>
                                <option value="RARE">Raro</option>
                                <option value="EPIC">Épico</option>
                                <option value="LEGENDARY">Lendário</option>
                                <option value="EXCLUSIVE">Exclusivo</option>
                            </Select>

                            <Input label="Custo XP" type="number" value={skinForm.xpCost} onChange={e => setSkinForm({...skinForm, xpCost: Number(e.target.value)})} required />

                            <Select 
                                label="Tenant (Opcional)" 
                                value={skinForm.tenantId} 
                                onChange={e => setSkinForm({...skinForm, tenantId: e.target.value})}
                            >
                                <option value="">Global (Todos)</option>
                                {tenants.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">Imagem / Spritesheet</label>
                            <div className="flex gap-4">
                                <Input 
                                    className="flex-1"
                                    placeholder="URL da Imagem..." 
                                    value={skinForm.imageUrl} 
                                    onChange={e => setSkinForm({...skinForm, imageUrl: e.target.value})} 
                                    required
                                />
                                <div className="relative">
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden" 
                                        id="skin-upload" 
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            
                                            const formData = new FormData();
                                            formData.append("file", file);
                                            
                                            try {
                                                addToast("Fazendo upload...", "info");
                                                const res = await api.post("/upload", formData, {
                                                    headers: { "Content-Type": "multipart/form-data" }
                                                });
                                                setSkinForm({ ...skinForm, imageUrl: res.data.url });
                                                addToast("Upload concluído!", "success");
                                            } catch (err) {
                                                addToast("Erro no upload", "error");
                                            }
                                        }}
                                    />
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        onClick={() => document.getElementById('skin-upload')?.click()}
                                    >
                                        Upload
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <textarea 
                            className="master-input-group textarea mt-4" 
                            placeholder="Descrição..." 
                            value={skinForm.description} 
                            onChange={e => setSkinForm({...skinForm, description: e.target.value})} 
                            rows={3} 
                        />

                        <div className="flex gap-4 mt-6">
                            <Button type="submit">{editingId ? "Atualizar" : "Salvar"}</Button>
                            <Button variant="outline" onClick={resetForms}>Cancelar</Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="master-grid-3">
                {skins.map(skin => (
                    <div key={skin.id} className="master-card border-l-4" style={{ borderColor: `var(--rarity-${skin.rarity.toLowerCase()})` }}>
                        <div className="flex justify-between items-start mb-4">
                            <div className={`master-icon-wrapper ${getRarityColor(skin.rarity)}`}>
                                <Gem size={24} />
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 hover:bg-white/10 rounded-lg text-blue-400" onClick={() => { 
                                    setSkinForm({ 
                                        name: skin.name,
                                        description: skin.description || '',
                                        imageUrl: skin.imageUrl,
                                        xpCost: skin.xpCost,
                                        rarity: skin.rarity,
                                        tenantId: skin.tenantId || '',
                                        active: skin.active
                                    }); 
                                    setEditingId(skin.id); 
                                    setShowForm(true); 
                                }}>
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
                        <h3 className="text-white font-bold">{skin.name}</h3>
                        <p className="master-card-desc h-12 overflow-hidden">{skin.description}</p>
                        <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/5">
                            <span className="text-yellow-500 font-bold">⭐ {skin.xpCost} XP</span>
                            <span className="text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-slate-500/20 text-slate-400">
                                Item Global
                            </span>
                        </div>
                        <div className="flex justify-end mt-1">
                            <span className="text-[10px] text-slate-500">{skin._count?.owners || 0} donos</span>
                        </div>
                        {skin.tenantId && (
                            <div className="mt-2 flex items-center gap-1 text-[10px] text-blue-400 uppercase font-black tracking-widest">
                                <Building2 size={10} /> {tenants.find(item => item.id === skin.tenantId)?.name}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
