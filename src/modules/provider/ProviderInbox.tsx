import { useTranslation } from "react-i18next";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
    Mail, 
    Send, 
    Paperclip, 
    DollarSign, 
    Search, 
    MoreVertical, 
    ArrowLeft, 
    User, 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    CreditCard,
    Plus,
    X,
    Sparkles
} from 'lucide-react';
import { Button, Input, Card, Badge, AnimateIn } from '@/components/ui';
import { inboxService, Conversation, Message } from '../../services/inboxService';
import { useAuth } from '../auth/AuthContext';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

export const ProviderInbox: React.FC = () => {
    const { t } = useTranslation();
    const { name: myName } = useAuth();
    const location = useLocation();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    
    // Payment Form State
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<"PIX" | "CREDIT_CARD">("PIX");
    const [creatingPayment, setCreatingPayment] = useState(false);

    // Delivery Modal State
    const [showDeliveryModal, setShowDeliveryModal] = useState(false);
    const [nfUrl, setNfUrl] = useState("");
    const [nfNumber, setNfNumber] = useState("");
    const [delivering, setDelivering] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        loadConversations();
        const params = new URLSearchParams(location.search);
        const id = params.get('id');
        if (id) setSelectedId(id);
    }, [location.search]);

    useEffect(() => {
        if (selectedId) scrollToBottom();
    }, [selectedId, conversations]);

    const loadConversations = async () => {
        try {
            setLoading(true);
            const data = await inboxService.list();
            setConversations(data);
        } catch (error) {
            console.error("Error loading conversations", error);
            toast.error("Erro ao carregar mensagens.");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectConversation = async (id: string) => {
        setSelectedId(id);
        try {
            const fullConv = await inboxService.getById(id);
            setConversations(prev => prev.map(c => c.id === id ? fullConv : c));
        } catch (error) {
            console.error("Error fetching details", error);
        }
    };

    const handleSendMessage = async () => {
        if (!selectedId || !newMessage.trim()) return;

        try {
            setSending(true);
            const msg = await inboxService.sendMessage(selectedId, newMessage);
            setNewMessage("");

            setConversations(prev => prev.map(c => {
                if (c.id === selectedId) {
                    return {
                        ...c,
                        messages: [...c.messages, msg],
                        lastMessageAt: new Date().toISOString()
                    };
                }
                return c;
            }));

        } catch (error) {
            console.error("Error sending message", error);
            toast.error("Falha ao enviar mensagem.");
        } finally {
            setSending(false);
        }
    };

    const handleCreatePaymentRequest = async () => {
        if (!selectedId || !amount || !description) {
            toast.error("Preencha todos os campos do pagamento.");
            return;
        }

        try {
            setCreatingPayment(true);
            await inboxService.createPayment(selectedId, parseFloat(amount), description, paymentMethod);
            toast.success("Solicitação de pagamento enviada via Asaas!");
            setShowPaymentModal(false);
            setAmount("");
            setDescription("");
            handleSelectConversation(selectedId); // Refresh conversation
        } catch (error) {
            console.error("Error creating payment", error);
            toast.error("Erro ao gerar solicitação de pagamento.");
        } finally {
            setCreatingPayment(false);
        }
    };

    const handleDeliverService = async () => {
        if (!selectedId || !nfUrl || !nfNumber) {
            toast.error("Preencha a URL da Nota Fiscal e o número.");
            return;
        }

        try {
            setDelivering(true);
            await inboxService.sendMessage(selectedId, `Serviço Entregue!\nNota Fiscal: ${nfNumber}\nLink da NF: ${nfUrl}`);
            toast.success("Serviço entregue e Nota Fiscal enviada!");
            setShowDeliveryModal(false);
            setNfUrl("");
            setNfNumber("");
            handleSelectConversation(selectedId);
        } catch (error) {
            console.error("Error delivering service", error);
            toast.error("Erro ao registrar entrega.");
        } finally {
            setDelivering(false);
        }
    };

    const filteredConversations = useMemo(() => {
        return conversations.filter(c => 
            c.producer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.messages.some(m => m.content.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [conversations, searchTerm]);

    const activeConversation = conversations.find(c => c.id === selectedId);

    const formatTime = (dateStr: string) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(date);
    };

    return (
        <AnimateIn className="flex flex-col h-[calc(100vh-140px)] max-w-7xl mx-auto">
            <div className="flex-1 flex bg-[#0a0a1a] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl relative">
                
                {/* Sidebar List */}
                <div className={`w-full md:w-[380px] border-r border-white/5 flex flex-col z-10 transition-all duration-300 ${selectedId ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-8 border-b border-white/5 bg-white/[0.01]">
                        <h2 className="text-2xl font-black text-white tracking-tighter mb-6 flex items-center gap-3">
                            <Mail className="text-indigo-500" size={24} />
                            Minhas Mensagens
                        </h2>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Buscar produtor ou conteúdo..."
                                className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-white/5">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
                                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Sincronizando...</span>
                            </div>
                        ) : filteredConversations.map(conv => (
                            <motion.div
                                key={conv.id}
                                layout
                                onClick={() => handleSelectConversation(conv.id)}
                                className={`p-6 cursor-pointer transition-all relative group hover:bg-white/[0.03] ${selectedId === conv.id ? 'bg-indigo-500/5' : ''}`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm transition-all group-hover:scale-105 ${selectedId === conv.id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white/5 text-slate-400'}`}>
                                        {conv.producer?.name?.slice(0, 2).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <h3 className={`font-bold text-sm truncate ${selectedId === conv.id ? 'text-white' : 'text-slate-300'}`}>
                                                {conv.producer?.name}
                                            </h3>
                                            <span className="text-[9px] text-slate-600 font-black uppercase whitespace-nowrap ml-2">
                                                {new Date(conv.lastMessageAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className={`text-[11px] truncate ${selectedId === conv.id ? 'text-indigo-300' : 'text-slate-500'}`}>
                                            {conv.messages[conv.messages.length - 1]?.content || "Inicie a conversa estratégica..."}
                                        </p>
                                    </div>
                                </div>
                                {selectedId === conv.id && (
                                    <motion.div layoutId="activeConv" className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500" />
                                )}
                            </motion.div>
                        ))}

                        {filteredConversations.length === 0 && !loading && (
                            <div className="p-12 text-center text-slate-700 flex flex-col items-center gap-4 opacity-50">
                                <Search size={48} />
                                <p className="text-xs font-bold uppercase tracking-widest">Nenhuma conversa encontrada</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className={`flex-1 flex flex-col bg-[#05050a]/50 relative ${!selectedId ? 'hidden md:flex' : 'flex'}`}>
                    {activeConversation ? (
                        <>
                            {/* Header */}
                            <div className="p-6 md:px-10 border-b border-white/5 flex justify-between items-center bg-black/40 backdrop-blur-2xl z-20">
                                <div className="flex items-center gap-5">
                                    <button onClick={() => setSelectedId(null)} className="md:hidden text-indigo-400">
                                        <ArrowLeft size={24} />
                                    </button>
                                    <div className="relative">
                                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-white shadow-xl shadow-indigo-600/20 border border-indigo-400/20">
                                            {activeConversation.producer?.name?.slice(0, 2).toUpperCase()}
                                        </div>
                                        <div className="absolute -right-1 -bottom-1 w-4 h-4 bg-green-500 border-2 border-[#05050a] rounded-full" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white leading-tight">{activeConversation.producer?.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="glass" className="h-4 px-1.5 text-[8px] border-indigo-500/20 text-indigo-400 font-black uppercase">Produtor Cultural</Badge>
                                            <span className="text-[10px] text-slate-500 font-medium italic">{activeConversation.producer?.email}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button 
                                        onClick={() => setShowDeliveryModal(true)}
                                        variant="glass" 
                                        className="hidden sm:flex h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border-indigo-500/10 text-indigo-400 hover:bg-indigo-500/10 mr-2"
                                        leftIcon={<CheckCircle2 size={14} />}
                                    >
                                        Entregar Serviço
                                    </Button>
                                    <Button 
                                        onClick={() => setShowPaymentModal(true)}
                                        variant="glass" 
                                        className="hidden sm:flex h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border-green-500/10 text-green-400 hover:bg-green-500/10"
                                        leftIcon={<DollarSign size={14} />}
                                    >
                                        Solicitar Pagamento
                                    </Button>
                                    <Button variant="glass" className="h-10 w-10 p-0 rounded-xl border-white/5 text-slate-500">
                                        <MoreVertical size={18} />
                                    </Button>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-fixed opacity-90 relative">
                                <AnimatePresence mode="popLayout">
                                    {activeConversation.messages.map((msg, idx) => {
                                        const isMe = msg.senderType === "PROVIDER";
                                        const isSystem = msg.senderType === "SYSTEM";

                                        if (isSystem) {
                                            return (
                                                <motion.div 
                                                    key={idx}
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="flex justify-center my-8"
                                                >
                                                    <span className="bg-indigo-500/5 text-indigo-400/60 text-[9px] px-6 py-1.5 rounded-full border border-indigo-500/10 uppercase font-black tracking-[0.2em] shadow-sm">
                                                        {msg.content}
                                                    </span>
                                                </motion.div>
                                            );
                                        }

                                        return (
                                            <motion.div 
                                                key={idx} 
                                                initial={{ opacity: 0, x: isMe ? 20 : -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className={`max-w-[75%] p-6 rounded-3xl shadow-xl transition-all relative group ${isMe
                                                        ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-none'
                                                        : 'bg-white/[0.03] text-slate-200 border border-white/5 rounded-tl-none backdrop-blur-md'
                                                    }`}>
                                                    
                                                    {msg.type === "PAYMENT_REQUEST" ? (
                                                        <div className="space-y-4 min-w-[240px]">
                                                            <div className="flex items-center gap-3 font-black uppercase text-[10px] tracking-widest opacity-80">
                                                                <div className={`p-2 rounded-lg ${isMe ? 'bg-white/20' : 'bg-green-500/20 text-green-400'}`}>
                                                                    <DollarSign size={16} />
                                                                </div>
                                                                Solicitação Financeira
                                                            </div>
                                                            <div className="text-2xl font-black tracking-tighter">
                                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(msg.content.replace(/[^\d.-]/g, '')) || 0)}
                                                            </div>
                                                            <div className={`p-4 rounded-2xl text-xs font-medium italic ${isMe ? 'bg-white/10' : 'bg-black/30 text-indigo-300'}`}>
                                                                {isMe ? "Aguardando processamento pelo produtor." : "Clique para processar este pagamento."}
                                                            </div>
                                                            {!isMe && (
                                                                <Button className="w-full bg-green-500 text-slate-950 font-black uppercase text-[10px] tracking-widest h-10 rounded-xl">
                                                                    Pagar Agora
                                                                </Button>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <p className="whitespace-pre-wrap text-[15px] leading-relaxed font-medium">{msg.content}</p>
                                                    )}
                                                    
                                                    <div className={`text-[9px] mt-3 flex items-center gap-2 font-black uppercase tracking-widest ${isMe ? 'text-white/40' : 'text-slate-600'}`}>
                                                        <Clock size={10} />
                                                        {formatTime(msg.createdAt)}
                                                        {isMe && <CheckCircle2 size={10} className="text-white/40" />}
                                                    </div>

                                                    {/* Decorative Tail */}
                                                    <div className={`absolute top-0 w-4 h-4 ${isMe ? '-right-2' : '-left-2'}`}>
                                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                            <path d={isMe ? "M0 0 L16 0 L0 16 Z" : "M16 0 L0 0 L16 16 Z"} fill="currentColor" className={isMe ? 'text-indigo-600' : 'text-white/[0.03]'} />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-8 border-t border-white/5 bg-black/40 backdrop-blur-3xl z-20">
                                <div className="flex gap-4 items-end">
                                    <Button variant="glass" className="h-14 w-14 p-0 rounded-2xl border-white/5 text-slate-500 hover:text-white shrink-0">
                                        <Paperclip size={20} />
                                    </Button>
                                    <div className="flex-1 relative group">
                                        <textarea
                                            value={newMessage}
                                            onChange={e => setNewMessage(e.target.value)}
                                            placeholder="Envie uma proposta estratégica..."
                                            className="w-full bg-white/[0.02] border border-white/5 rounded-[24px] py-4 pl-6 pr-16 text-white focus:outline-none focus:border-indigo-500/50 transition-all min-h-[56px] max-h-32 resize-none custom-scrollbar"
                                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                                        />
                                        <button
                                            onClick={handleSendMessage}
                                            disabled={sending || !newMessage.trim()}
                                            className="absolute right-3 bottom-3 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:scale-100"
                                        >
                                            <Send size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-20 text-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
                            <div className="w-32 h-32 bg-indigo-600/5 rounded-[40px] flex items-center justify-center mb-10 relative group">
                                <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-1000" />
                                <Mail size={64} className="text-indigo-500 relative z-10 opacity-40" />
                            </div>
                            <h3 className="text-3xl font-black text-white tracking-tighter mb-4">Terminal de Negociação</h3>
                            <p className="max-w-sm text-slate-500 font-medium leading-relaxed">
                                Selecione um parceiro estratégico para iniciar conversas, enviar propostas e gerenciar faturamentos.
                            </p>
                            
                            {/* Decorative Background Elements */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/[0.02] rounded-full blur-[120px] pointer-events-none" />
                        </div>
                    )}
                </div>
            </div>

            {/* Payment Modal */}
            <AnimatePresence>
                {showPaymentModal && (
                    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                            onClick={() => setShowPaymentModal(false)}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-md bg-[#0a0a1a] border border-white/5 rounded-[40px] p-10 relative z-10 shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-green-500/10 text-green-400 flex items-center justify-center">
                                        <DollarSign size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-white tracking-tight">Solicitar Pagamento</h2>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Transação Segura Asaas</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowPaymentModal(false)} className="text-slate-500 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Valor da Execução (R$)</label>
                                    <input 
                                        type="number"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        placeholder="0,00"
                                        className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-6 text-white text-lg font-black focus:outline-none focus:border-indigo-500/50"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Descrição do Serviço</label>
                                    <textarea 
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        placeholder="Ex: Consultoria em Acessibilidade..."
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl p-6 text-sm text-white focus:outline-none focus:border-indigo-500/50 min-h-[100px] resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button 
                                        onClick={() => setPaymentMethod("PIX")}
                                        className={`h-14 rounded-2xl border transition-all flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest ${paymentMethod === "PIX" ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'}`}
                                    >
                                        <Sparkles size={16} /> PIX
                                    </button>
                                    <button 
                                        onClick={() => setPaymentMethod("CREDIT_CARD")}
                                        className={`h-14 rounded-2xl border transition-all flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest ${paymentMethod === "CREDIT_CARD" ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'}`}
                                    >
                                        <CreditCard size={16} /> Cartão
                                    </button>
                                </div>

                                <Button 
                                    className="w-full h-16 rounded-[24px] bg-indigo-600 text-white font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-indigo-600/20 mt-4"
                                    onClick={handleCreatePaymentRequest}
                                    isLoading={creatingPayment}
                                >
                                    Enviar Solicitação
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delivery Modal */}
            <AnimatePresence>
                {showDeliveryModal && (
                    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                            onClick={() => setShowDeliveryModal(false)}
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-md bg-[#0a0a1a] border border-white/5 rounded-[40px] p-10 relative z-10 shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                                        <CheckCircle2 size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-white tracking-tight">Entregar Serviço</h2>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Upload de Nota Fiscal</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowDeliveryModal(false)} className="text-slate-500 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Número da Nota Fiscal</label>
                                    <input 
                                        type="text"
                                        value={nfNumber}
                                        onChange={e => setNfNumber(e.target.value)}
                                        placeholder="Ex: 2024-001"
                                        className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-6 text-white text-lg font-black focus:outline-none focus:border-indigo-500/50"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Link da Nota Fiscal (PDF)</label>
                                    <input 
                                        type="text"
                                        value={nfUrl}
                                        onChange={e => setNfUrl(e.target.value)}
                                        placeholder="https://meusite.com/nf.pdf"
                                        className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl px-6 text-white text-sm focus:outline-none focus:border-indigo-500/50"
                                    />
                                </div>

                                <Button 
                                    className="w-full h-16 rounded-[24px] bg-indigo-600 text-white font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-indigo-600/20 mt-4"
                                    onClick={handleDeliverService}
                                    isLoading={delivering}
                                >
                                    Confirmar Entrega
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AnimateIn>
    );
};
