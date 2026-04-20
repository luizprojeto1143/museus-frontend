import { useTranslation } from "react-i18next";
import React, { useState } from "react";
import { Mail, Send, CheckCircle, AlertCircle } from "lucide-react";
import { api } from "@/api/client";
import { Button, Input, AnimateIn } from "@/components/ui";

export const ContactForm: React.FC = () => {
    const { t } = useTranslation();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [subject, setSubject] = useState("Consultoria LBI");

    const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("submitting");

        try {
            await api.post("/contact", { name, email, subject, message });
            setStatus("success");
            // Limpa o form
            setName("");
            setEmail("");
            setMessage("");
        } catch (error) {
            console.error(error);
            setStatus("error");
        }
    };

    if (status === "success") {
        return (
            <AnimateIn variant="scaleIn">
                <div role="alert" className="text-center p-12 bg-green-500/10 rounded-[var(--radius-lg)] border border-[var(--status-success)]">
                    <CheckCircle size={48} className="text-[var(--status-success)] mx-auto mb-4" aria-hidden="true" />
                    <h3 className="text-[var(--status-success)] text-xl font-bold mb-2">Mensagem Enviada!</h3>
                    <p className="font-[var(--font-body)] opacity-80">{t("public.contact.nossaEquipeEntrarEmContatoEmBreve", `Nossa equipe entrará em contato em breve.`)}</p>
                    <Button
                        variant="outline"
                        className="mt-6 border-[var(--status-success)] text-[var(--status-success)] hover:bg-[var(--status-success)] hover:text-white"
                        onClick={() => setStatus("idle")}
                    >
                        Enviar outra
                    </Button>
                </div>
            </AnimateIn>
        );
    }

    return (
        <AnimateIn variant="fadeUp">
            <form onSubmit={handleSubmit} className="bg-[var(--bg-surface)] p-10 rounded-[var(--radius-xl)] border border-[var(--border-default)] shadow-2xl relative">
                <h3 className="text-[var(--accent-primary)] text-xl font-bold mb-8 flex items-center gap-3">
                    <Mail size={24} aria-hidden="true" /> Fale com um Consultor
                </h3>

                <div className="space-y-6">
                    <div>
                        <label htmlFor="contact-name" className="block mb-2 text-sm font-bold opacity-70">Nome</label>
                        <Input
                            id="contact-name"
                            required
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Seu nome completo"
                        />
                    </div>

                    <div>
                        <label htmlFor="contact-email" className="block mb-2 text-sm font-bold opacity-70">Email Profissional</label>
                        <Input
                            id="contact-email"
                            required
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="seu@empresa.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="contact-subject" className="block mb-2 text-sm font-bold opacity-70">Assunto</label>
                        <select
                            id="contact-subject"
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                            className="flex h-12 w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-page)] px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-[var(--fg-main)]"
                        >
                            <option value="Consultoria LBI">{t("public.contact.adequaoLeiRouanetLbi", `Adequação Lei Rouanet (LBI)`)}</option>
                            <option value="Comercial">{t("public.contact.planosEPreos", `Planos e Preços`)}</option>
                            <option value="Suporte">{t("public.contact.suporteTcnico", `Suporte Técnico`)}</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="contact-message" className="block mb-2 text-sm font-bold opacity-70">Mensagem</label>
                        <textarea
                            id="contact-message"
                            required
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            rows={4}
                            className="flex min-h-[120px] w-full rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-page)] px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-[var(--fg-main)]"
                            placeholder="Como podemos ajudar sua instituição?"
                        />
                    </div>

                    {status === "error" && (
                        <AnimateIn variant="fadeUp">
                            <div role="alert" className="p-4 bg-red-500/10 border border-[var(--status-error)] rounded-[var(--radius-md)] text-red-400 text-sm flex items-center gap-2">
                                <AlertCircle size={16} aria-hidden="true" /> Erro ao enviar. Tente novamente.
                            </div>
                        </AnimateIn>
                    )}

                    <Button
                        type="submit"
                        isLoading={status === "submitting"}
                        className="w-full h-14 text-base font-bold"
                        rightIcon={status !== "submitting" ? <Send size={18} /> : undefined}
                    >
                        {status === "submitting" ? "Enviando..." : "Enviar Mensagem"}
                    </Button>
                </div>
            </form>
        </AnimateIn>
    );
};
