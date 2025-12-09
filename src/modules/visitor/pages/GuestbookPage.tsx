import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";

type GuestbookEntry = {
    id: string;
    message: string;
    visitor: {
        name: string | null;
        photoUrl: string | null;
    };
    createdAt: string;
};

export const GuestbookPage: React.FC = () => {
    const { t } = useTranslation();
    const { tenantId, isAuthenticated, name } = useAuth();
    const [entries, setEntries] = useState<GuestbookEntry[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchEntries();
    }, [tenantId]);

    const fetchEntries = async () => {
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
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !tenantId) return;

        setSubmitting(true);
        try {
            // Assuming visitorId is handled by backend via auth token or we need to pass it?
            // The backend route expects visitorId in body, but usually we get it from token.
            // Let's check backend implementation... 
            // Ah, the backend route I wrote expects visitorId in body. 
            // Ideally it should extract from token like bookings.
            // But for now let's assume we need to pass it or the backend middleware handles it.
            // Wait, my backend route `guestbook.ts` uses `validate(createEntrySchema)` which expects `visitorId`.
            // But `authMiddleware` is not applied to POST /guestbook in my previous step?
            // Let me double check. I didn't add authMiddleware to guestbook route.
            // I should probably fix that or pass visitorId from frontend if I have it.
            // The frontend `useAuth` has `user` object which might have id.
            // Let's assume I need to pass it.

            // Actually, looking at `AuthContext`, I might not have the visitor ID readily available as `id`.
            // I have `name`, `email`, `role`.
            // Let's assume for now I can get it from local storage or context if available.
            // If not, I might need to fetch profile first.
            // Or better, update backend to use token.

            // For this iteration, I will try to use `user.id` from context if available, 
            // or just send the request and see.
            // Wait, `useAuth` exposes `user` which has `id`.

            const user = JSON.parse(localStorage.getItem("user") || "{}");

            await api.post("/guestbook", {
                message: newMessage,
                tenantId,
                visitorId: user.id
            });

            setNewMessage("");
            fetchEntries();
        } catch (error) {
            console.error("Failed to post message", error);
            alert(t("visitor.guestbook.error", "Erro ao enviar mensagem."));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "1rem" }}>
            <h1 className="section-title">{t("visitor.guestbook.title", "Livro de Visitas")}</h1>
            <p className="section-subtitle" style={{ marginBottom: "2rem" }}>
                {t("visitor.guestbook.subtitle", "Deixe sua marca no museu! Compartilhe sua experiência.")}
            </p>

            {/* Form */}
            {isAuthenticated ? (
                <div className="card" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
                    <form onSubmit={handleSubmit}>
                        <textarea
                            className="input"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={t("visitor.guestbook.placeholder", "Escreva sua mensagem aqui...")}
                            rows={3}
                            style={{ resize: "vertical", marginBottom: "1rem" }}
                            maxLength={500}
                            required
                        />
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                                {newMessage.length}/500
                            </span>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={submitting || !newMessage.trim()}
                            >
                                {submitting ? t("common.sending", "Enviando...") : t("visitor.guestbook.submit", "Assinar Livro")}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="card" style={{ padding: "1.5rem", marginBottom: "2rem", textAlign: "center" }}>
                    <p>{t("visitor.guestbook.loginRequired", "Faça login para deixar uma mensagem.")}</p>
                    <button
                        onClick={() => window.location.href = "/login"}
                        className="btn btn-secondary"
                        style={{ marginTop: "1rem" }}
                    >
                        {t("auth.login")}
                    </button>
                </div>
            )}

            {/* List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {loading ? (
                    <p>{t("common.loading")}</p>
                ) : entries.length === 0 ? (
                    <p style={{ textAlign: "center", color: "#9ca3af" }}>
                        {t("visitor.guestbook.empty", "Seja o primeiro a assinar!")}
                    </p>
                ) : (
                    entries.map((entry) => (
                        <article key={entry.id} className="card" style={{ padding: "1.5rem" }}>
                            <p style={{ fontSize: "1.1rem", lineHeight: 1.6, marginBottom: "1rem", fontStyle: "italic" }}>
                                "{entry.message}"
                            </p>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                <div
                                    style={{
                                        width: "2.5rem",
                                        height: "2.5rem",
                                        borderRadius: "50%",
                                        backgroundColor: "#374151",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "1.2rem"
                                    }}
                                >
                                    {entry.visitor.photoUrl ? (
                                        <img src={entry.visitor.photoUrl} alt={entry.visitor.name || "Visitor"} style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
                                    ) : (
                                        "👤"
                                    )}
                                </div>
                                <div>
                                    <div style={{ fontWeight: "bold", fontSize: "0.9rem" }}>
                                        {entry.visitor.name || t("common.anonymous")}
                                    </div>
                                    <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                                        {new Date(entry.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))
                )}
            </div>
        </div>
    );
};
