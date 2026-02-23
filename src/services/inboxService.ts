import { api } from "../api/client";

export interface Message {
    id: string;
    content: string;
    senderId: string;
    senderType: "PRODUCER" | "PROVIDER" | "SYSTEM";
    type: "TEXT" | "PROPOSAL" | "PAYMENT_REQUEST" | "SYSTEM_ALERT";
    createdAt: string;
    attachments?: string[];
}

export interface Conversation {
    id: string;
    producerId: string;
    providerId: string;
    status: string;
    lastMessageAt: string;
    provider: {
        id: string;
        name: string;
        email: string;
    };
    producer: {
        id: string;
        name: string;
        email: string;
    };
    messages: Message[];
}

export const inboxService = {
    // List all conversations
    list: async () => {
        const response = await api.get<Conversation[]>("/inbox");
        return response.data;
    },

    // Get details
    getById: async (id: string) => {
        const response = await api.get<Conversation>(`/inbox/${id}`);
        return response.data;
    },

    // Start negotiation
    createConversation: async (providerId: string, initialMessage?: string) => {
        const response = await api.post<Conversation>("/inbox", { providerId, initialMessage });
        return response.data;
    },

    // Send message
    sendMessage: async (conversationId: string, content: string, type: "TEXT" | "PROPOSAL" = "TEXT") => {
        const response = await api.post<Message>(`/inbox/${conversationId}/messages`, { content, type });
        return response.data;
    },

    // Create Payment (Asaas)
    createPayment: async (conversationId: string, amount: number, description: string, paymentMethod: "PIX" | "CREDIT_CARD") => {
        const response = await api.post(`/inbox/${conversationId}/payment`, { amount, description, paymentMethod });
        return response.data;
    }
};
