import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { getFullUrl } from "../../../utils/url";
import { PenTool, User } from "lucide-react";
import "./Guestbook.css";

type GuestbookEntry = {
    id: string;
    message: string;
    visitor: {
        name: string | null;
        photoUrl: string | null;
    };
    createdAt: string;
    isFake?: boolean; // Support for fake visitors if needed
};

export const GuestbookPage: React.FC = () => {
    const { t } = useTranslation();
    const { tenantId, isAuthenticated, email } = useAuth();
    const [entries, setEntries] = useState<GuestbookEntry[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchEntries = useCallback(async () => {
        if (!tenantId) return;
        setLoading(true);
        try {
            const res = await api.get(`/guestbook?tenantId=${tenantId}`);
            setEntries(res.data);
        } catch (error) {
            console.error("Failed to fetch guestbook", error);
        } finally {
            setLoading(false);
        }
    }, [tenantId]);

    useEffect(() => {
        fetchEntries();
    }, [fetchEntries]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!newMessage.trim() || !tenantId) return;

        setSubmitting(true);
        try {
            await api.post("/guestbook", {
                message: newMessage,
                tenantId,
                email: email
            });

            setNewMessage("");
            fetchEntries();
        } catch (error) {
            console.error("Failed to post message", error);
            setError(t("visitor.guestbook.error", "Erro ao enviar mensagem."));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="guestbook-container">
            <header className="guestbook-header">
                <h1 className="guestbook-title">{t("visitor.guestbook.title", "Livro de Visitas")}</h1>
                <p className="guestbook-subtitle">
                    {t("visitor.guestbook.subtitle", "Deixe sua marca no museu! Compartilhe sua experiência.")}
                </p>
            </header>

            {error && (
                <div style={{ padding: "1rem", backgroundColor: "#fee2e2", color: "#ef4444", borderRadius: "0.5rem", marginBottom: "1rem" }}>
                    {error}
                </div>
            )}

            <div className="guestbook-book">
                {/* Simulated Content Area */}

                {/* Writing Area */}
                {isAuthenticated ? (
                    <div className="guestbook-form-card">
                        <form onSubmit={handleSubmit}>
                            <textarea
                                className="guestbook-textarea"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder={t("visitor.guestbook.placeholder", "Escreva sua mensagem aqui...")}
                                rows={3}
                                maxLength={500}
                                required
                            />
                            <div className="guestbook-controls">
                                <span className="guestbook-char-count">
                                    {newMessage.length}/500
                                </span>
                                <button
                                    type="submit"
                                    className="btn-quill"
                                    disabled={submitting || !newMessage.trim()}
                                >
                                    <PenTool size={16} />
                                    {submitting ? t("common.sending", "Escrevendo...") : t("visitor.guestbook.submit", "Assinar")}
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="login-prompt">
                        <p>{t("visitor.guestbook.loginRequired", "Faça login para deixar uma mensagem.")}</p>
                        <button
                            onClick={() => window.location.href = "/login"}
                            className="btn-login-gold"
                        >
                            {t("auth.login")}
                        </button>
                    </div>
                )}

                {/* Read Area */}
                <div className="guestbook-entries">
                    {loading ? (
                        <div className="guestbook-loading">
                            <div className="spinner-ink"></div>
                        </div>
                    ) : entries.length === 0 ? (
                        <p className="guestbook-empty">
                            {t("visitor.guestbook.empty", "Este livro ainda está em branco. Seja o primeiro a assinar!")}
                        </p>
                    ) : (
                        entries.map((entry) => (
                            <article key={entry.id} className="guestbook-entry animate-fadeIn">
                                <p className="guestbook-message">
                                    "{entry.message}"
                                </p>
                                <div className="guestbook-author-row">
                                    <div className="author-avatar">
                                        {entry.visitor.photoUrl ? (
                                            <img src={getFullUrl(entry.visitor.photoUrl) ?? undefined} alt={entry.visitor.name || "Visitor"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        ) : (
                                            <User size={20} color="#463420" />
                                        )}
                                    </div>
                                    <div className="author-info">
                                        <div className="author-name">
                                            {entry.visitor.name || t("common.anonymous")}
                                        </div>
                                        <div className="entry-date">
                                            {new Date(entry.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
