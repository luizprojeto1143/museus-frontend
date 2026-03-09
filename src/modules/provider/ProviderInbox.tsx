import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from 'react';
import { Mail, Send, Paperclip, DollarSign, Search, MoreVertical, ArrowLeft } from 'lucide-react';
import { Button, Input } from '../../components/ui';
import { inboxService, Conversation, Message } from '../../services/inboxService';
import { useAuth } from '../auth/AuthContext';
import { useLocation } from 'react-router-dom';

export const ProviderInbox: React.FC = () => {
  const { t } = useTranslation();
    const { name: myName } = useAuth();
    const location = useLocation();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);

    useEffect(() => {
        loadConversations();
        const params = new URLSearchParams(location.search);
        const id = params.get('id');
        if (id) setSelectedId(id);
    }, [location.search]);

    const loadConversations = async () => {
        try {
            setLoading(true);
            const data = await inboxService.list();
            setConversations(data);
        } catch (error) {
            console.error("Error loading conversations", error);
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
        } finally {
            setSending(false);
        }
    };

    const activeConversation = conversations.find(c => c.id === selectedId);

    const formatTime = (dateStr: string) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(date);
    };

    return (
        <div className="flex h-[calc(100vh-160px)] bg-[#1a0f2c] border border-[#3b2164] rounded-2xl overflow-hidden shadow-2xl">
            {/* Sidebar List */}
            <div className={`w-full md:w-[350px] border-r border-[#3b2164] flex flex-col ${selectedId ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-6 border-b border-[#3b2164] bg-black/20">
                    <h2 className="text-white font-bold text-xl mb-4">Minhas Mensagens</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b794f4]/50" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar conversa..."
                            className="w-full bg-[#0f0a1a] border border-[#3b2164] rounded-xl py-2 pl-10 pr-4 text-white placeholder-[#b794f4]/30 focus:outline-none focus:border-[#9f7aea] transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="p-8 text-center text-[#b794f4] animate-pulse">Carregando...</div>
                    ) : conversations.map(conv => (
                        <div
                            key={conv.id}
                            onClick={() => handleSelectConversation(conv.id)}
                            className={`p-5 border-b border-[#3b2164]/30 cursor-pointer hover:bg-[#9f7aea]/5 transition-all ${selectedId === conv.id ? 'bg-[#9f7aea]/10 border-r-4 border-r-[#9f7aea]' : ''}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="font-bold text-white tracking-tight">{conv.producer?.name}</h3>
                                <span className="text-[10px] text-[#b794f4]/60 uppercase font-bold">
                                    {new Date(conv.lastMessageAt).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-sm text-[#b794f4] truncate">
                                {conv.messages[conv.messages.length - 1]?.content || "Inicie a conversa..."}
                            </p>
                        </div>
                    ))}

                    {conversations.length === 0 && !loading && (
                        <div className="p-10 text-center text-[#b794f4]/50 flex flex-col items-center gap-4">
                            <Mail size={40} className="opacity-20" />
                            <p className="text-sm italic">Nenhuma conversa encontrada.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col bg-[#0f0a1a]/50 ${!selectedId ? 'hidden md:flex' : 'flex'}`}>
                {activeConversation ? (
                    <>
                        {/* Header */}
                        <div className="p-4 md:px-8 border-b border-[#3b2164] flex justify-between items-center bg-[#1a0f2c]/80 backdrop-blur-md">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setSelectedId(null)} className="md:hidden text-[#9f7aea]">
                                    <ArrowLeft size={24} />
                                </button>
                                <div className="w-10 h-10 bg-[#9f7aea] rounded-full flex items-center justify-center font-bold text-white shadow-lg shadow-[#9f7aea]/20">
                                    {activeConversation.producer?.name?.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">{activeConversation.producer?.name}</h3>
                                    <p className="text-xs text-[#b794f4]">{activeConversation.producer?.email}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="ghost" className="text-[#b794f4]">
                                    <MoreVertical size={18} />
                                </Button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-fixed opacity-90">
                            {activeConversation.messages.map((msg, idx) => {
                                const isMe = msg.senderType === "PROVIDER";
                                const isSystem = msg.senderType === "SYSTEM";

                                if (isSystem) {
                                    return (
                                        <div key={idx} className="flex justify-center my-6">
                                            <span className="bg-[#3b2164]/50 text-[#b794f4] text-[10px] px-4 py-1 rounded-full border border-[#3b2164] uppercase font-bold tracking-widest">
                                                {msg.content}
                                            </span>
                                        </div>
                                    );
                                }

                                return (
                                    <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] p-4 rounded-2xl shadow-lg transition-all hover:scale-[1.01] ${isMe
                                                ? 'bg-[#9f7aea] text-white rounded-tr-none'
                                                : 'bg-[#1a0f2c] text-[#EAE0D5] border border-[#3b2164] rounded-tl-none'
                                            }`}>
                                            {msg.type === "PAYMENT_REQUEST" ? (
                                                <div className="flex flex-col gap-3">
                                                    <div className="flex items-center gap-2 font-black uppercase text-[0.7rem] tracking-widest opacity-80">
                                                        <DollarSign size={16} />{t("provider.providerinbox.solicitaoDePagamento", "Solicitação de Pagamento")}</div>
                                                    <p className="font-bold text-lg">{msg.content}</p>
                                                    <div className={`text-xs p-3 rounded-lg ${isMe ? 'bg-white/10' : 'bg-black/20 text-orange-300'}`}>
                                                        {isMe ? "Você solicitou este pagamento." : "Aguardando pagamento do produtor."}
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="whitespace-pre-wrap text-[0.95rem] leading-relaxed">{msg.content}</p>
                                            )}
                                            <div className={`text-[10px] mt-2 text-right font-bold uppercase tracking-tighter ${isMe ? 'text-white/60' : 'text-[#b794f4]/50'}`}>
                                                {formatTime(msg.createdAt)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Input Area */}
                        <div className="p-6 border-t border-[#3b2164] bg-[#1a0f2c]">
                            <div className="flex gap-3">
                                <Button variant="ghost" className="text-[#b794f4] hover:bg-[#9f7aea]/10 rounded-xl px-3">
                                    <Paperclip size={20} />
                                </Button>
                                <div className="flex-1 relative">
                                    <input
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                        placeholder="Responda ao produtor..."
                                        className="w-full bg-[#0f0a1a] border border-[#3b2164] rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#9f7aea] transition-all pr-12"
                                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={sending || !newMessage.trim()}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9f7aea] hover:text-white transition-colors disabled:opacity-30"
                                    >
                                        <Send size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-[#b794f4]/20 p-10 text-center">
                        <div className="w-24 h-24 bg-[#9f7aea]/5 rounded-full flex items-center justify-center mb-6">
                            <Mail size={48} className="opacity-30" />
                        </div>
                        <h3 className="text-xl font-bold text-white/50 mb-2">{t("provider.providerinbox.centralDeNegociaes", "Central de Negociações")}</h3>
                        <p className="max-w-xs text-sm">{t("provider.providerinbox.selecioneUmaConversaAoLadoPara", "Selecione uma conversa ao lado para responder aos produtores e negociar seus serviços.")}</p>
                    </div>
                )}
            </div>
        </div>
    );
};
