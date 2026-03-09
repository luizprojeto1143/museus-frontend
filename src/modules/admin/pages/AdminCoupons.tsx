import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Tag, Check, X, Search } from 'lucide-react';
import { api } from '../../../api/client';
import toast from 'react-hot-toast';
import "./AdminShared.css";


interface Coupon {
    id: string;
    code: string;
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: string;
    xpCost: number | null;
    isActive: boolean;
    description: string | null;
    createdAt: string;
}

export function AdminCoupons() {
  const { t } = useTranslation();
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Form State
    const [code, setCode] = useState('');
    const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
    const [discountValue, setDiscountValue] = useState('');
    const [xpCost, setXpCost] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const { data } = await api.get('/coupons');
            setCoupons(data);
        } catch (error) {
            toast.error('Erro ao buscar cupons');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggle = async (id: string, current: boolean) => {
        try {
            await api.put(`/coupons/${id}/toggle`, { isActive: !current });
            toast.success(current ? 'Cupom desativado' : 'Cupom ativado');
            fetchCoupons();
        } catch (err) {
            toast.error('Erro ao alterar status');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja deletar este cupom? Esta ação é irreversível.')) {
            return;
        }
        try {
            await api.delete(`/coupons/${id}`);
            toast.success('Cupom deletado');
            fetchCoupons();
        } catch (err) {
            toast.error('Erro ao deletar cupom');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code || !discountValue) {
            toast.error('Código e valor do desconto são obrigatórios');
            return;
        }

        try {
            setIsSubmitting(true);
            await api.post('/coupons', {
                code,
                discountType,
                discountValue: Number(discountValue),
                xpCost: xpCost ? Number(xpCost) : null,
                description,
                isActive: true
            });

            toast.success('Cupom criado com sucesso!');
            setIsModalOpen(false);
            resetForm();
            fetchCoupons();
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Erro ao criar cupom');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setCode('');
        setDiscountType('PERCENTAGE');
        setDiscountValue('');
        setXpCost('');
        setDescription('');
    };

    const filteredCoupons = coupons.filter(c =>
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Cupons e Recompensas</h1>
                    <p className="text-zinc-300 mt-1">{t("admin.coupons.gerencieCdigosDeDescontoEDefin", "Gerencie códigos de desconto e defina o custo em XP para visitantes resgatarem.")}</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center space-x-2 bg-gold-dark text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                    <Plus className="w-5 h-5" />
                    <span>Novo Cupom</span>
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder={t("admin.coupons.buscarPorCdigoOuDescrio", "Buscar por código ou descrição...")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
            </div>

            {isLoading ? (
                <div className="text-center py-12">
                    <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
                </div>
            ) : filteredCoupons.length === 0 ? (
                <div className="text-center py-12 bg-zinc-900/40 rounded-xl shadow-md shadow-black/20 border border-white/5">
                    <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-white">Nenhum cupom encontrado</h3>
                    <p className="text-zinc-400 mt-1">Crie um cupom para incentivar seus visitantes.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCoupons.map((coupon) => (
                        <div key={coupon.id} className="bg-zinc-900/40 rounded-xl shadow-md shadow-black/20 border border-white/5 overflow-hidden relative group">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 border-b border-gold/20 flex justify-between items-start">
                                <div className="flex items-center space-x-2">
                                    <Tag className="w-5 h-5 text-gold-light" />
                                    <h3 className="text-lg font-bold text-indigo-900 tracking-wide">{coupon.code}</h3>
                                </div>
                                {/* Active Badge */}
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {coupon.isActive ? 'Ativo' : 'Inativo'}
                                </span>
                            </div>

                            <div className="p-4 space-y-4">
                                {/* Details */}
                                <div>
                                    <div className="text-3xl font-black text-white mb-1">
                                        {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : `R$ ${coupon.discountValue}`}
                                    </div>
                                    <p className="text-sm text-zinc-400">de Desconto</p>
                                </div>

                                {coupon.description && (
                                    <p className="text-sm text-zinc-300 bg-zinc-900/60 p-2 rounded truncate" title={coupon.description}>
                                        {coupon.description}
                                    </p>
                                )}

                                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                    <div className="text-sm">
                                        {coupon.xpCost ? (
                                            <span className="font-semibold text-amber-600 flex items-center space-x-1">
                                                <span>⭐ Custa {coupon.xpCost} XP</span>
                                            </span>
                                        ) : (
                                            <span className="text-zinc-400">{t("admin.coupons.grtisMarketing", "Grátis (Marketing)")}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions Overlay */}
                                <div className="absolute inset-0 bg-zinc-900/40 border border-gold/20/95 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                    <button
                                        onClick={() => handleToggle(coupon.id, coupon.isActive)}
                                        className={`p-2 rounded-full ${coupon.isActive ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}
                                        title={coupon.isActive ? 'Desativar' : 'Ativar'}
                                    >
                                        {coupon.isActive ? <X className="w-5 h-5" /> : <Check className="w-5 h-5" />}
                                    </button>

                                    <button
                                        onClick={() => handleDelete(coupon.id)}
                                        className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                                        title="Excluir"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-zinc-900/40 rounded-xl shadow-xl w-full max-w-md p-6 relative">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-zinc-400"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                            <Tag className="w-6 h-6 text-gold-light" />
                            <span>Criar Cupom</span>
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-200 mb-1">{t("admin.coupons.cdigo", "Código")}</label>
                                <input
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s/g, ''))}
                                    placeholder="GAMER20"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono"
                                    required
                                />
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-zinc-200 mb-1">Tipo de Desconto</label>
                                    <select
                                        value={discountType}
                                        onChange={(e) => setDiscountType(e.target.value as any)}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="PERCENTAGE">Porcentagem (%)</option>
                                        <option value="FIXED">Valor Fixo (R$)</option>
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-zinc-200 mb-1">Valor</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={discountValue}
                                        onChange={(e) => setDiscountValue(e.target.value)}
                                        placeholder={discountType === 'PERCENTAGE' ? "20" : "15.00"}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-200 mb-1">Custo em XP (Opcional)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={xpCost}
                                    step="1"
                                    onChange={(e) => setXpCost(e.target.value)}
                                    placeholder={t("admin.coupons.ex500VazioGrtis", "Ex: 500 (Vazio = Grátis)")}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                                <p className="text-xs text-zinc-400 mt-1">{t("admin.coupons.sePreenchidoOVisitantePoderCom", "Se preenchido, o visitante poderá comprar este cupom usando seu saldo de XP ganho nas interações (ex: Caça ao Tesouro).")}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-200 mb-1">{t("admin.coupons.descrioOpcional", "Descrição (Opcional)")}</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Desconto para quem fechou o roteiro secreto"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="pt-4 flex justify-end space-x-3 border-t">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-zinc-300 hover: rounded-lg"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-gold-dark text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Salvando...' : 'Salvar Cupom'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
