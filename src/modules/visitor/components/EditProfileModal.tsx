import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/AuthContext";

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const { name, email, updateSession, token, role, tenantId } = useAuth();
    const [newName, setNewName] = useState(name || "");
    const [newEmail, setNewEmail] = useState(email || "");
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Call backend to update
            const response = await fetch("http://localhost:3000/visitors/me", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email, // Current email to identify
                    tenantId,
                    name: newName,
                    newEmail: newEmail
                })
            });

            if (response.ok) {
                // Update local session
                if (token && role) {
                    updateSession(token, role, tenantId, newName);

                    // Force update email in local storage
                    const user = JSON.parse(localStorage.getItem("user") || "{}");
                    user.email = newEmail;
                    localStorage.setItem("user", JSON.stringify(user));

                    // Reload if email changed to ensure context updates
                    if (email !== newEmail) {
                        window.location.reload();
                    }
                }
            } else {
                console.error("Failed to update profile");
            }
        } catch (error) {
            console.error("Error updating profile", error);
        }

        setLoading(false);
        onClose();
    };

    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem"
        }}>
            <div className="card" style={{ width: "100%", maxWidth: "400px", position: "relative" }}>
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        top: "1rem",
                        right: "1rem",
                        background: "none",
                        border: "none",
                        fontSize: "1.5rem",
                        cursor: "pointer"
                    }}
                >
                    ×
                </button>

                <h2 className="section-title" style={{ marginBottom: "1.5rem" }}>{t("visitor.profile.editTitle", "Editar Perfil")}</h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">{t("visitor.profile.name", "Nome")}</label>
                        <input
                            type="text"
                            className="form-input"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group" style={{ marginTop: "1rem" }}>
                        <label className="form-label">{t("visitor.profile.email", "E-mail")}</label>
                        <input
                            type="email"
                            className="form-input"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
                        <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
                            {t("common.cancel", "Cancelar")}
                        </button>
                        <button type="submit" className="btn" disabled={loading} style={{ flex: 1 }}>
                            {loading ? t("common.saving", "Salvando...") : t("common.save", "Salvar")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
