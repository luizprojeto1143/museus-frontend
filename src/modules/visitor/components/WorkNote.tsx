import React, { useState } from "react";
import { useTranslation } from "react-i18next";

interface WorkNoteProps {
    workId: string;
}

export const WorkNote: React.FC<WorkNoteProps> = ({ workId }) => {
    const { t } = useTranslation();
    const [note, setNote] = useState(() => {
        const allNotes = JSON.parse(localStorage.getItem("visitor_notes") || "{}");
        return allNotes[workId] || "";
    });
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        const allNotes = JSON.parse(localStorage.getItem("visitor_notes") || "{}");
        if (note.trim()) {
            allNotes[workId] = note;
        } else {
            delete allNotes[workId];
        }
        localStorage.setItem("visitor_notes", JSON.stringify(allNotes));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="card" style={{ padding: "1rem", marginTop: "1rem" }}>
            <h3 className="card-title" style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
                📝 {t("visitor.work.myNotes", "Minhas Anotações")}
            </h3>
            <textarea
                className="form-input"
                rows={3}
                placeholder={t("visitor.work.notesPlaceholder", "Escreva o que achou desta obra...")}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                style={{ width: "100%", resize: "vertical", marginBottom: "0.5rem" }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "0.5rem" }}>
                {saved && <span style={{ color: "green", fontSize: "0.8rem" }}>Salvo!</span>}
                <button className="btn btn-secondary" onClick={handleSave} style={{ padding: "0.25rem 0.75rem", fontSize: "0.85rem" }}>
                    {t("common.save", "Salvar")}
                </button>
            </div>
        </div>
    );
};
