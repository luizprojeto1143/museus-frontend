import React, { useState } from "react";
import { Bell, Send, Loader2, Smartphone, Globe, Info } from "lucide-react";
import { api } from "../../../api/client";
import { Button } from "../../../components/ui/Button";
import { toast } from "react-hot-toast";
import "./AdminShared.css";


export const AdminNotifications: React.FC = () => {
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [url, setUrl] = useState("/");
    const [sending, setSending] = useState(false);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title || !body) {
            toast.error("Título e corpo são obrigatórios");
            return;
        }

        try {
            setSending(true);
            const res = await api.post("/notifications/broadcast", {
                title,
                body,
                url
            });

            toast.success(`Notificação enviada! Dispositivos: ${res.data.totalDevices || "Processando..."}`);
            setTitle("");
            setBody("");
            setUrl("/");
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.error || "Erro ao enviar notificação";
            toast.error(msg);
        } finally {
            setSending(false);
        }
    };

    const handleTest = async () => {
        try {
            setSending(true);
            await api.post("/notifications/test");
            toast.success("Notificação de teste enviada para seus dispositivos!");
        } catch (error: any) {
            toast.error("Erro ao enviar teste. Certifique-se de ter um dispositivo registrado.");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-white font-serif">Notificações Push</h1>
                    <p className="text-zinc-400">Envie mensagens em tempo real para todos os usuários do seu museu/instituição.</p>
                </div>
                <Button variant="outline" onClick={handleTest} disabled={sending} leftIcon={<Smartphone size={18} />}>
                    Testar em mim
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <form onSubmit={handleSend} className="bg-zinc-900/40 border border-white/10 rounded-2xl p-8 shadow-md shadow-black/20 space-y-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Send className="text-amber-500" size={20} /> Nova Mensagem
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-zinc-200 mb-2">Título da Notificação</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full border border-white/10 rounded-xl px-4 py-2 focus:border-amber-500 transition-colors outline-none"
                                placeholder="Ex: Exposição Nova Amanhã!"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-zinc-200 mb-2">Mensagem (Corpo)</label>
                            <textarea
                                value={body}
                                onChange={e => setBody(e.target.value)}
                                className="w-full border border-white/10 rounded-xl px-4 py-2 focus:border-amber-500 transition-colors outline-none resize-none"
                                placeholder="Confira nossa nova ala de arte contemporânea..."
                                rows={3}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-zinc-200 mb-2">Link de Destino (URL)</label>
                            <div className="flex gap-2">
                                <span className="bg-zinc-800/50 px-3 py-2 rounded-xl text-zinc-500 text-sm flex items-center">/</span>
                                <input
                                    type="text"
                                    value={url.startsWith('/') ? url.slice(1) : url}
                                    onChange={e => setUrl('/' + e.target.value)}
                                    className="flex-1 border border-white/10 rounded-xl px-4 py-2 focus:border-amber-500 transition-colors outline-none"
                                    placeholder="eventos/meu-evento"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button
                            className="w-full h-12 text-lg"
                            type="submit"
                            disabled={sending}
                            leftIcon={sending ? <Loader2 className="animate-spin" size={20} /> : <Bell size={20} />}
                        >
                            {sending ? "Enviando..." : "Disparar para Todos"}
                        </Button>
                    </div>
                </form>

                <div className="space-y-6">
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6">
                        <h3 className="text-amber-400 font-bold flex items-center gap-2 mb-3">
                            <Info size={18} /> Boas Práticas
                        </h3>
                        <ul className="text-amber-300 text-sm space-y-2 list-disc pl-4">
                            <li>Seja breve e direto: notificações curtas têm maior taxa de clique.</li>
                            <li>Use emojis para chamar a atenção, mas sem exageros.</li>
                            <li>Sempre teste o envio em si mesmo antes de disparar para toda a base.</li>
                            <li>A mensagem será enviada para todos os dispositivos (Android, iOS e Web) registrados.</li>
                        </ul>
                    </div>

                    <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Smartphone size={100} />
                        </div>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Globe className="text-amber-500" size={20} /> Prévia (Web/Android)
                        </h3>
                        <div className="bg-zinc-900/40 border border-gold/20/10 backdrop-blur-md rounded-xl p-4 border border-white/10 max-w-xs mx-auto">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-5 h-5 bg-amber-500 rounded flex items-center justify-center text-[10px] font-bold">M</div>
                                <span className="text-[10px] opacity-70">Museus Platform • Agora</span>
                            </div>
                            <div className="font-bold text-sm truncate">{title || "Título da sua notificação"}</div>
                            <div className="text-xs opacity-80 line-clamp-2">{body || "Aqui aparecerá o texto da sua mensagem para os usuários."}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
