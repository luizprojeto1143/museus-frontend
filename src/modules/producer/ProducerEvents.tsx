import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/AuthContext";
import { Calendar, Plus } from "lucide-react";

export const ProducerEvents: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div style={{ padding: "2rem" }}>
            <h1>Meus Projetos</h1>
            <p>Gerencie seus eventos aqui.</p>
            <button onClick={() => navigate("/producer/events/new")}>
                <Plus size={20} /> Novo Projeto
            </button>
        </div>
    );
};
