import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Send, Paperclip, DollarSign, Search, MoreVertical } from 'lucide-react';
import { Button, Input, Textarea } from '../../components/ui';
import { inboxService, Conversation, Message } from '../../services/inboxService';

export const ProducerInbox: React.FC = () => {
    const { t } = useTranslation();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);

    // Payment Modal State (Placeholder)
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    useEffect(() => {
        loadConversations();
    }, []);

    const loadConversations = async () => {
        try {
            setLoading(true);
            const data = await inboxService.list();
            setConversations(data);
            if (data.length > 0 && !selectedId) {
                // Select first by default if desktop?
                // setSelectedId(data[0].id);
            }
        } catch (error) {
            console.error("Error loading conversations", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectConversation = async (id: string) => {
        setSelectedId(id);
        // In a real app, we might want to fetch full details here if list only returns summary
        // But our backend returns 1 message, so maybe we need to fetch details for full history
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

            // Append message locally
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

    const handlePaymentRequest = async () => {
        // Here we would open a modal to define amount/description
        // For prototype, we just verify the call works
        if (!selectedId) return;
        const amount = Number(prompt("Valor do Pagamento (R$):", "0"));
        if (!amount) return;

        try {
            await inboxService.createPayment(selectedId, amount, "Pagamento de Serviço", "PIX");
            // Refresh conversation to show system message
            handleSelectConversation(selectedId);
            alert("Solicitação de pagamento gerada!");
        } catch (error) {
            alert("Erro ao gerar pagamento");
        }
    };

    const activeConversation = conversations.find(c => c.id === selectedId);

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(date);
    };

    const formatTime = (dateStr: string) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(date);
    };

    return (
        <div className="flex h-[calc(100vh-100px)] bg-[#1a1108] border border-[#d4af37]/20 rounded-lg overflow-hidden">
            {/* Sidebar List */}
            <div className={`w-full md:w-1/3 border-r border-[#d4af37]/20 flex flex-col ${selectedId ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-[#d4af37]/20 bg-[#2c1a0b]/50">
                    <h2 className="text-[#d4af37] font-serif text-xl mb-4">Inbox</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#d4af37]/50" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar conversa..."
                            className="w-full bg-[#1a1108] border border-[#d4af37]/30 rounded-full py-2 pl-10 pr-4 text-[#e5e5e5] focus:outline-none focus:border-[#d4af37]"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {conversations.map(conv => (
                        <div
                            key={conv.id}
                            onClick={() => handleSelectConversation(conv.id)}
                            className={`p-4 border-b border-[#d4af37]/10 cursor-pointer hover:bg-[#d4af37]/5 transition-colors ${selectedId === conv.id ? 'bg-[#d4af37]/10 border-l-2 border-l-[#d4af37]' : ''}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="font-bold text-[#e5e5e5]">{conv.provider.name}</h3>
                                <span className="text-xs text-[#d4af37]/60">
                                    {formatDate(conv.lastMessageAt)}
                                </span>
                            </div>
                            <p className="text-sm text-[#d4af37]/70 truncate">
                                {conv.messages[conv.messages.length - 1]?.content || "Inicie a conversa..."}
                            </p>
                        </div>
                    ))}

                    {conversations.length === 0 && !loading && (
                        <div className="p-8 text-center text-[#d4af37]/50">
                            Nenhuma conversa iniciada.
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`w-full md:w-2/3 flex flex-col bg-[#1a1108] ${!selectedId ? 'hidden md:flex' : 'flex'}`}>
                {activeConversation ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-[#d4af37]/20 flex justify-between items-center bg-[#2c1a0b]/50">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setSelectedId(null)} className="md:hidden text-[#d4af37]">
                                    ←
                                </button>
                                <div>
                                    <h3 className="font-bold text-[#d4af37]">{activeConversation.provider.name}</h3>
                                    <p className="text-xs text-[#d4af37]/60">{activeConversation.provider.email}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={handlePaymentRequest} leftIcon={<DollarSign size={16} />}>
                                    Pagar
                                </Button>
                                <Button size="sm" variant="ghost">
                                    <MoreVertical size={18} />
                                </Button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {activeConversation.messages.map((msg, idx) => {
                                const isMe = msg.senderType === "PRODUCER";
                                const isSystem = msg.senderType === "SYSTEM";

                                if (isSystem) {
                                    return (
                                        <div key={idx} className="flex justify-center my-4">
                                            <span className="bg-[#d4af37]/10 text-[#d4af37] text-xs px-3 py-1 rounded-full border border-[#d4af37]/20">
                                                {msg.content}
                                            </span>
                                        </div>
                                    );
                                }

                                return (
                                    <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] p-3 rounded-2xl ${isMe ? 'bg-[#d4af37] text-[#1a1108] rounded-tr-none' : 'bg-[#2c1a0b] text-[#e5e5e5] border border-[#d4af37]/20 rounded-tl-none'}`}>
                                            {msg.type === "PAYMENT_REQUEST" ? (
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-2 font-bold opacity-80">
                                                        <DollarSign size={16} />{t("producer.producerinbox.solicitaoDePagamento", "Solicitação de Pagamento")}</div>
                                                    <p>{msg.content}</p>
                                                    <Button size="sm" className="mt-2 w-full bg-[#1a1108] text-[#d4af37] border border-[#d4af37]">
                                                        Pagar Agora (Simulado)
                                                    </Button>
                                                </div>
                                            ) : (
                                                <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                                            )}
                                            <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-[#1a1108]/60' : 'text-[#d4af37]/50'}`}>
                                                {formatTime(msg.createdAt)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-[#d4af37]/20 bg-[#2c1a0b]/30">
                            <div className="flex gap-2">
                                <Button variant="ghost" className="text-[#d4af37]/70">
                                    <Paperclip size={20} />
                                </Button>
                                <Input
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    placeholder="Digite sua mensagem..."
                                    className="flex-1 bg-[#1a1108] border-[#d4af37]/30 focus:border-[#d4af37]"
                                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                                />
                                <Button
                                    onClick={handleSendMessage}
                                    disabled={sending || !newMessage.trim()}
                                    className="bg-[#d4af37] text-[#1a1108] hover:bg-[#c5a028]"
                                >
                                    <Send size={18} />
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-[#d4af37]/30">
                        <Mail size={48} className="mb-4 opacity-50" />
                        <p>{t("producer.producerinbox.selecioneUmaConversaParaComear", "Selecione uma conversa para começar")}</p>
                    </div>
                )}
            </div>
        </div>
    );
};
