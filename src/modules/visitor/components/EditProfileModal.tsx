import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/AuthContext";
import { UserPen, X } from "lucide-react";
import "./EditProfileModal.css";

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
            const baseUrl = import.meta.env.VITE_API_URL || "";
            const response = await fetch(`${baseUrl}/visitors/me`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    email,
                    tenantId,
                    name: newName,
                    newEmail: newEmail
                })
            });

            if (response.ok) {
                if (token && role) {
                    updateSession(token, role, tenantId, newName);

                    const user = JSON.parse(localStorage.getItem("user") || "{}");
                    user.email = newEmail;
                    localStorage.setItem("user", JSON.stringify(user));

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
        <div className="edit-profile-backdrop">
            <div className="edit-profile-modal">
                <button onClick={onClose} className="edit-profile-close-btn">
                    <X size={20} />
                </button>

                <h2 className="edit-profile-title">
                    <UserPen size={24} />
                    {t("visitor.profile.editTitle", "Editar Perfil")}
                </h2>

                <form onSubmit={handleSubmit}>
                    <div className="edit-profile-form-group">
                        <label className="edit-profile-label">
                            {t("visitor.profile.name", "Nome")}
                        </label>
                        <input
                            type="text"
                            className="edit-profile-input"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="edit-profile-form-group">
                        <label className="edit-profile-label">
                            {t("visitor.profile.email", "E-mail")}
                        </label>
                        <input
                            type="email"
                            className="edit-profile-input"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="edit-profile-actions">
                        <button type="button" onClick={onClose} className="edit-profile-cancel-btn">
                            {t("common.cancel", "Cancelar")}
                        </button>
                        <button type="submit" disabled={loading} className="edit-profile-save-btn">
                            {loading ? t("common.saving", "Salvando...") : t("common.save", "Salvar")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
