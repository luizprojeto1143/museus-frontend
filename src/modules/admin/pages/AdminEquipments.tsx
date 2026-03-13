import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";

type Equipamento = {
    id: string;
    nome: string;
    slug: string;
    tipo: string;
    fotoCapaUrl?: string;
    logoUrl?: string;
    endereco?: string;
    cidade?: string;
};

const typeLabels: Record<string, { label: string; icon: string }> = {
    MUSEUM: { label: "Museu", icon: "🏛️" },
    CULTURAL_SPACE: { label: "Espaço Cultural", icon: "🎭" },
    PRODUCER: { label: "Produtor", icon: "🎬" },
    THEATER: { label: "Teatro", icon: "🎭" },
    GALLERY: { label: "Galeria", icon: "🎨" }
};

export const AdminEquipments: React.FC = () => {
    const { tenantId } = useAuth();
    const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Buscar equipamentos do tenant atual
        api.get("/equipamentos")
            .then(res => {
                setEquipamentos(res.data);
            })
            .catch(err => {
                console.error("Erro ao carregar equipamentos", err);
                setEquipamentos([]);
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                <div>
                    <h1 className="section-title">🏛️ Equipamentos Culturais</h1>

                </div>
                <Link to="/admin/equipamentos/novo" className="btn">
                    + Novo Equipamento
                </Link>
            </div>

            {loading ? (
                <p>Carregando...</p>
            ) : equipamentos.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "2rem" }}>
                    <p>Nenhum equipamento cultural vinculado</p>
                    <Link to="/admin/equipamentos/novo" className="btn" style={{ marginTop: "1rem" }}>
                        Cadastrar primeiro equipamento
                    </Link>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
                    {equipamentos.map(item => {
                        const typeInfo = typeLabels[item.tipo] || { label: item.tipo, icon: "📍" };
                        return (
                            <div key={item.id} className="card">
                                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                                    {item.logoUrl ? (
                                        <img
                                            src={item.logoUrl}
                                            alt={item.nome}
                                            style={{ width: 50, height: 50, borderRadius: "8px", objectFit: "cover" }}
                                        />
                                    ) : (
                                        <div style={{
                                            width: 50, height: 50, borderRadius: "8px",
                                            background: "var(--bg-secondary)",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: "1.5rem"
                                        }}>
                                            {typeInfo.icon}
                                        </div>
                                    )}
                                    <div>
                                        <h3 style={{ margin: 0 }}>{item.nome}</h3>
                                        <span className="chip" style={{ fontSize: "0.75rem" }}>
                                            {typeInfo.icon} {typeInfo.label}
                                        </span>
                                    </div>
                                </div>

                                {item.endereco && (
                                    <p style={{ fontSize: "0.85rem", color: "var(--fg-muted)", marginBottom: "1rem" }}>
                                        📍 {item.endereco}, {item.cidade}
                                    </p>
                                )}

                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                    <Link to={`/admin/equipamentos/${item.id}`} className="btn btn-secondary">
                                        Configurar
                                    </Link>
                                    <Link
                                        to={`/home?equipamentoId=${item.id}`}
                                        className="btn btn-primary"
                                    >
                                        Ver Site
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
