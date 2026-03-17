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
    characterBaseId: string | null;
    characterBase?: {
        name: string;
    }
    _count?: { owners: number };
}

interface CharacterBase {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    active: boolean;
    tenantId: string | null;
}

interface Tenant {
    id: string;
    name: string;
}

export const MasterSkinManager: React.FC = () => {
    const { t } = useTranslation();
    const { addToast } = useToast();
    const [activeTab, setActiveTab] = useState<"skins" | "characters">("skins");
    const [skins, setSkins] = useState<Skin[]>([]);
    const [characters, setCharacters] = useState<CharacterBase[]>([]);
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
        characterBaseId: "",
        active: true
    });

    // Characters Form State
    const [charForm, setCharForm] = useState({
        name: "",
        description: "",
        imageUrl: "",
        tenantId: "",
        active: true
    });

    const [editingId, setEditingId] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        try {
            const [skinsRes, tenantsRes, charsRes] = await Promise.all([
                api.get("/skins"),
                api.get("/tenants"),
                api.get("/characters")
            ]);
            setSkins(skinsRes.data);
            setTenants(tenantsRes.data);
            setCharacters(charsRes.data);
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
                tenantId: skinForm.tenantId || null,
                characterBaseId: skinForm.characterBaseId || null
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

    const handleCharSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = { ...charForm, tenantId: charForm.tenantId || null };
            if (editingId) {
                await api.put(`/characters/${editingId}`, payload);
                addToast("Personagem atualizado!", "success");
            } else {
                await api.post("/characters", payload);
                addToast("Personagem criado!", "success");
            }
            resetForms();
            loadData();
        } catch (err) {
            addToast("Erro ao salvar personagem", "error");
        }
    };

    const resetForms = () => {
        setShowForm(false);
        setEditingId(null);
        setSkinForm({ name: "", description: "", imageUrl: "", xpCost: 500, rarity: "COMMON", tenantId: "", characterBaseId: "", active: true });
        setCharForm({ name: "", description: "", imageUrl: "", tenantId: "", active: true });
    };

    const handleDelete = async (id: string, type: "skin" | "char") => {
        if (!window.confirm(`Deseja excluir este ${type === 'skin' ? 'item' : 'personagem'}?`)) return;
        try {
            await api.delete(type === 'skin' ? `/skins/${id}` : `/characters/${id}`);
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
                <p className="master-subtitle">Gerencie skins cosméticas e os personagens base que os visitantes podem escolher.</p>
                
                <div className="flex gap-4 mt-8">
                    <div className="bg-white/5 p-1 rounded-2xl flex border border-white/5">
                        <button 
                            className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === 'skins' ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            onClick={() => { setActiveTab('skins'); resetForms(); }}
                        >
                            Skins / Loja
                        </button>
                        <button 
                            className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === 'characters' ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            onClick={() => { setActiveTab('characters'); resetForms(); }}
                        >
                            Personagens Base
                        </button>
                    </div>
                    <Button onClick={() => setShowForm(true)} leftIcon={<Plus size={20} />}>
                        Novo {activeTab === 'skins' ? 'Item' : 'Personagem'}
                    </Button>
                </div>
            </section>

            {showForm && (
                <div className="master-card mb-8">
                    <form onSubmit={activeTab === 'skins' ? handleSkinSubmit : handleCharSubmit} className="master-form">
                        <h3>{editingId ? "Editar" : "Cadastrar"} {activeTab === 'skins' ? "Skin" : "Personagem"}</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input 
                                label="Nome" 
                                value={activeTab === 'skins' ? skinForm.name : charForm.name} 
                                onChange={e => activeTab === 'skins' ? setSkinForm({...skinForm, name: e.target.value}) : setCharForm({...charForm, name: e.target.value})} 
                                required 
                            />
                            
                            {activeTab === 'skins' && (
                                <Select label="Raridade" value={skinForm.rarity} onChange={e => setSkinForm({...skinForm, rarity: e.target.value})}>
                                    <option value="COMMON">Comum</option>
                                    <option value="RARE">Raro</option>
                                    <option value="EPIC">Épico</option>
                                    <option value="LEGENDARY">Lendário</option>
                                    <option value="EXCLUSIVE">Exclusivo</option>
                                </Select>
                            )}

                            {activeTab === 'skins' && (
                                <Input label="Custo XP" type="number" value={skinForm.xpCost} onChange={e => setSkinForm({...skinForm, xpCost: Number(e.target.value)})} required />
                            )}

                            {activeTab === 'skins' && (
                                <Select 
                                    label="Personagem Compatível" 
                                    value={skinForm.characterBaseId} 
                                    onChange={e => setSkinForm({...skinForm, characterBaseId: e.target.value})}
                                >
                                    <option value="">Global (Todos)</option>
                                    {characters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </Select>
                            )}

                            <Select 
                                label="Tenant (Opcional)" 
                                value={activeTab === 'skins' ? skinForm.tenantId : charForm.tenantId} 
                                onChange={e => activeTab === 'skins' ? setSkinForm({...skinForm, tenantId: e.target.value}) : setCharForm({...charForm, tenantId: e.target.value})}
                            >
                                <option value="">Global (Todos)</option>
                                {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </Select>
                        </div>

                        <Input 
                            label="URL da Imagem / Spritesheet" 
                            value={activeTab === 'skins' ? skinForm.imageUrl : charForm.imageUrl} 
                            onChange={e => activeTab === 'skins' ? setSkinForm({...skinForm, imageUrl: e.target.value}) : setCharForm({...charForm, imageUrl: e.target.value})} 
                            required
                        />

                        <textarea 
                            className="master-input-group textarea" 
                            placeholder="Descrição..." 
                            value={activeTab === 'skins' ? skinForm.description : charForm.description} 
                            onChange={e => activeTab === 'skins' ? setSkinForm({...skinForm, description: e.target.value}) : setCharForm({...charForm, description: e.target.value})} 
                            rows={3} 
                        />

                        <div className="flex gap-4">
                            <Button type="submit">{editingId ? "Atualizar" : "Salvar"}</Button>
                            <Button variant="outline" onClick={resetForms}>Cancelar</Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="master-grid-3">
                {activeTab === 'skins' ? (
                    skins.map(skin => (
                        <div key={skin.id} className="master-card border-l-4" style={{ borderColor: `var(--rarity-${skin.rarity.toLowerCase()})` }}>
                            <div className="flex justify-between items-start mb-4">
                                <div className={`master-icon-wrapper ${getRarityColor(skin.rarity)}`}>
                                    <Gem size={24} />
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 hover:bg-white/10 rounded-lg text-blue-400" onClick={() => { 
                                        setSkinForm({ 
                                            ...skin, 
                                            tenantId: skin.tenantId || '', 
                                            characterBaseId: skin.characterBaseId || '',
                                            description: skin.description || '' 
                                        }); 
                                        setEditingId(skin.id); 
                                        setShowForm(true); 
                                    }}>
                                        <Edit2 size={16} />
                                    </button>
                                    <button className="p-2 hover:bg-white/10 rounded-lg text-red-400" onClick={() => handleDelete(skin.id, 'skin')}>
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
                                <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${skin.characterBase ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-500/20 text-slate-400'}`}>
                                    {skin.characterBase?.name || "Global"}
                                </span>
                            </div>
                            <div className="flex justify-end mt-1">
                                <span className="text-[10px] text-slate-500">{skin._count?.owners || 0} donos</span>
                            </div>
                            {skin.tenantId && (
                               <div className="mt-2 flex items-center gap-1 text-[10px] text-blue-400 uppercase font-black tracking-widest">
                                   <Building2 size={10} /> {tenants.find(t => t.id === skin.tenantId)?.name}
                               </div>
                            )}
                        </div>
                    ))
                ) : (
                    characters.map(char => (
                        <div key={char.id} className="master-card">
                            <div className="flex justify-between items-start mb-4">
                                <div className="master-icon-wrapper bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                    <Shield size={24} />
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 hover:bg-white/10 rounded-lg text-blue-400" onClick={() => { 
                                        setCharForm({ ...char, tenantId: char.tenantId || '', description: char.description || '' }); 
                                        setEditingId(char.id); 
                                        setShowForm(true); 
                                    }}>
                                        <Edit2 size={16} />
                                    </button>
                                    <button className="p-2 hover:bg-white/10 rounded-lg text-red-400" onClick={() => handleDelete(char.id, 'char')}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="h-40 bg-black/20 rounded-xl mb-4 flex items-center justify-center overflow-hidden border border-white/5 italic text-slate-500 text-xs">
                                 {char.imageUrl ? <img src={char.imageUrl} alt={char.name} className="h-full object-contain" /> : "Sem Imagem"}
                            </div>
                            <h3 className="text-white font-bold">{char.name}</h3>
                            <p className="master-card-desc h-12 overflow-hidden">{char.description}</p>
                            <div className="mt-auto pt-4 border-t border-white/5">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    {char.tenantId ? tenants.find(t => t.id === char.tenantId)?.name : "PERSONAGEM GLOBAL"}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
