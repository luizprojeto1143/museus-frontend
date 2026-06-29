import { useTranslation } from "react-i18next";
import { logger } from "@/utils/logger";

import React, { useState, useEffect } from 'react';
import { Mail, Send, Paperclip, DollarSign, Search, MoreVertical } from 'lucide-react';
import { Button, Input, Textarea } from '../../../components/ui';
import { inboxService, Conversation, Message } from '../../../services/inboxService';

export const ProducerInbox: React.FC = () => {
    const { t } = useTranslation();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);

    // Payment Modal State
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [receiptUrl, setReceiptUrl] = useState("");
    const [processingPayment, setProcessingPayment] = useState(false);

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
            logger.error("Error loading conversations", error);
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
            logger.error("Error fetching details", error);
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
            logger.error("Error sending message", error);
        } finally {
            setSending(false);
        }
    };

    const handlePaymentRequest = async () => {
        if (!selectedId || !paymentAmount || !receiptUrl) {
            logger.warn("Alert:", t("producer.producerinbox.fillPaymentDetails", "Preencha o valor e o link do comprovante!"));
            return;
        }

        try {
            setProcessingPayment(true);
            await inboxService.createPayment(selectedId, Number(paymentAmount), t("producer.producerinbox.paymentDoneMsg", "Pagamento efetuado. Comprovante: {{receiptUrl}}", { receiptUrl }), "PIX");
            // Refresh conversation to show system message
            handleSelectConversation(selectedId);
            setShowPaymentModal(false);
            setPaymentAmount("");
            setReceiptUrl("");
            logger.warn("Alert:", t("producer.producerinbox.paymentRegistered", "Pagamento registrado e comprovante enviado!"));
        } catch (error) {
            logger.warn("Alert:", t("producer.producerinbox.paymentError", "Erro ao registrar pagamento"));
        } finally {
            setProcessingPayment(false);
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
        <div className="flex h-[calc(100vh-100px)] bg-[#1a1108] border border-[var(--accent-primary)]/20 rounded-lg overflow-hidden">
            {/* Sidebar List */}
            <div className={`w-full md:w-1/3 border-r border-[var(--accent-primary)]/20 flex flex-col ${selectedId ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-[var(--accent-primary)]/20 bg-[#2c1a0b]/50">
                    <h2 className="text-[var(--accent-primary)] font-serif text-xl mb-4">{t("producer.producerinbox.inbox", "Inbox")}</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--accent-primary)]/50" size={18} />
                        <input
                            type="text"
                            placeholder={t("producer.producerinbox.searchConversation", "Buscar conversa...")}
                            className="w-full bg-[#1a1108] border border-[var(--accent-primary)]/30 rounded-full py-2 pl-10 pr-4 text-[#e5e5e5] focus:outline-none focus:border-[var(--accent-primary)]"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {conversations.map(conv => (
                        <div
                            key={conv.id}
                            onClick={() => handleSelectConversation(conv.id)}
                            className={`p-4 border-b border-[var(--accent-primary)]/10 cursor-pointer hover:bg-[var(--accent-primary)]/5 transition-colors ${selectedId === conv.id ? 'bg-[var(--accent-primary)]/10 border-l-2 border-l-[var(--accent-primary)]' : ''}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="font-bold text-[#e5e5e5]">{conv.provider.name}</h3>
                                <span className="text-xs text-[var(--accent-primary)]/60">
                                    {formatDate(conv.lastMessageAt)}
                                </span>
                            </div>
                            <p className="text-sm text-[var(--accent-primary)]/70 truncate">
                                {conv.messages[conv.messages.length - 1]?.content || t("producer.producerinbox.startConversation", "Inicie a conversa...")}
                            </p>
                        </div>
                    ))}

                    {conversations.length === 0 && !loading && (
                        <div className="p-8 text-center text-[var(--accent-primary)]/50">
                            {t("producer.producerinbox.noConversation", "Nenhuma conversa iniciada.")}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`w-full md:w-2/3 flex flex-col bg-[#1a1108] ${!selectedId ? 'hidden md:flex' : 'flex'}`}>
                {activeConversation ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-[var(--accent-primary)]/20 flex justify-between items-center bg-[#2c1a0b]/50">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setSelectedId(null)} className="md:hidden text-[var(--accent-primary)]">
                                    ←
                                </button>
                                <div>
                                    <h3 className="font-bold text-[var(--accent-primary)]">{activeConversation.provider.name}</h3>
                                    <p className="text-xs text-[var(--accent-primary)]/60">{activeConversation.provider.email}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => setShowPaymentModal(true)} leftIcon={<DollarSign size={16} />}>
                                    {t("producer.producerinbox.payWithReceipt", "Pagar com Comprovante")}
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
                                            <span className="bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-xs px-3 py-1 rounded-full border border-[var(--accent-primary)]/20">
                                                {msg.content}
                                            </span>
                                        </div>
                                    );
                                }

                                return (
                                    <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] p-3 rounded-2xl ${isMe ? 'bg-[var(--accent-primary)] text-[#1a1108] rounded-tr-none' : 'bg-[#2c1a0b] text-[#e5e5e5] border border-[var(--accent-primary)]/20 rounded-tl-none'}`}>
                                            {msg.type === "PAYMENT_REQUEST" ? (
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-2 font-bold opacity-80">
                                                        <DollarSign size={16} />
                                                        {t("producer.producerinbox.paymentRequest", "Solicitação de Pagamento")}
                                                    </div>
                                                    <p>{msg.content}</p>
                                                    <Button size="sm" className="mt-2 w-full bg-[#1a1108] text-[var(--accent-primary)] border border-[var(--accent-primary)]">
                                                        {t("producer.producerinbox.payNow", "Pagar Agora (Simulado)")}
                                                    </Button>
                                                </div>
                                            ) : (
                                                <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                                            )}
                                            <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-[#1a1108]/60' : 'text-[var(--accent-primary)]/50'}`}>
                                                {formatTime(msg.createdAt)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-[var(--accent-primary)]/20 bg-[#2c1a0b]/30">
                            <div className="flex gap-2">
                                <Button variant="ghost" className="text-[var(--accent-primary)]/70">
                                    <Paperclip size={20} />
                                </Button>
                                <Input
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    placeholder={t("producer.producerinbox.typeMessage", "Digite sua mensagem...")}
                                    className="flex-1 bg-[#1a1108] border-[var(--accent-primary)]/30 focus:border-[var(--accent-primary)]"
                                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                                />
                                <Button
                                    onClick={handleSendMessage}
                                    disabled={sending || !newMessage.trim()}
                                    className="bg-[var(--accent-primary)] text-[#1a1108] hover:bg-[#c5a028]"
                                >
                                    <Send size={18} />
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-[var(--accent-primary)]/30">
                        <Mail size={48} className="mb-4 opacity-50" />
                        <p>{t("producer.producerinbox.selecioneUmaConversaParaComear", `Selecione uma conversa para começar`)}</p>
                    </div>
                )}
            </div>
            
            {showPaymentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                    <div className="bg-[#1a1108] border border-[var(--accent-primary)]/20 rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-[var(--accent-primary)] text-xl font-bold mb-4">{t("producer.producerinbox.registerPayment", "Registrar Pagamento")}</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-[#e5e5e5] mb-1">{t("producer.producerinbox.amount", "Valor (R$)")}</label>
                                <Input 
                                    type="number"
                                    value={paymentAmount}
                                    onChange={e => setPaymentAmount(e.target.value)}
                                    placeholder={t("producer.producerinbox.amountPlaceholder", "Ex: 500.00")}
                                    className="bg-black/50 border-[var(--accent-primary)]/30 text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-[#e5e5e5] mb-1">{t("producer.producerinbox.receiptUrl", "URL do Comprovante")}</label>
                                <Input 
                                    type="text"
                                    value={receiptUrl}
                                    onChange={e => setReceiptUrl(e.target.value)}
                                    placeholder={t("producer.producerinbox.receiptPlaceholder", "https://link.com/comprovante.pdf")}
                                    className="bg-black/50 border-[var(--accent-primary)]/30 text-white"
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <Button variant="ghost" onClick={() => setShowPaymentModal(false)}>{t("producer.producerinbox.cancel", "Cancelar")}</Button>
                                <Button 
                                    className="bg-[var(--accent-primary)] text-[#1a1108]" 
                                    onClick={handlePaymentRequest}
                                    disabled={processingPayment}
                                >
                                    {t("producer.producerinbox.confirmPayment", "Confirmar Pagamento")}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
