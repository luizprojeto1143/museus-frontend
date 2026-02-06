import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";

type ChildTenant = {
    id: string;
    name: string;
    slug: string;
    type: string;
    logoUrl?: string;
    address?: string;
};

const typeLabels: Record<string, { label: string; icon: string }> = {
    MUSEUM: { label: "Museu", icon: "🏛️" },
    CULTURAL_SPACE: { label: "Espaço Cultural", icon: "🎭" },
    PRODUCER: { label: "Produtor", icon: "🎬" }
};

export const AdminEquipments: React.FC = () => {
    const { tenantId } = useAuth();
    const [children, setChildren] = useState<ChildTenant[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!tenantId) return;

        // Buscar tenant atual com filhos
        api.get(`/tenants/${tenantId}`)
            .then(async res => {
                const tenant = res.data;
                // Se tiver filhos, buscar detalhes
                if (tenant.children && tenant.children.length > 0) {
                    setChildren(tenant.children);
                } else {
                    // Buscar tenants que têm este como pai
                    const childrenRes = await api.get("/tenants", { params: { parentId: tenantId } });
                    setChildren(childrenRes.data);
                }
            })
            .catch(err => {
                console.error("Erro ao carregar equipamentos", err);
                setChildren([]);
            })
            .finally(() => setLoading(false));
    }, [tenantId]);

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                <div>
                    <h1 className="section-title">🏛️ Equipamentos Culturais</h1>
                    <p className="section-subtitle">Museus, centros culturais e espaços vinculados</p>
                </div>
                <Link to="/admin/equipamentos/novo" className="btn">
                    + Novo Equipamento
                </Link>
            </div>

            {loading ? (
                <p>Carregando...</p>
            ) : children.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "2rem" }}>
                    <p>Nenhum equipamento cultural vinculado</p>
                    <Link to="/admin/equipamentos/novo" className="btn" style={{ marginTop: "1rem" }}>
                        Cadastrar primeiro equipamento
                    </Link>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
                    {children.map(child => {
                        const typeInfo = typeLabels[child.type] || { label: child.type, icon: "📍" };
                        return (
                            <div key={child.id} className="card">
                                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                                    {child.logoUrl ? (
                                        <img
                                            src={child.logoUrl}
                                            alt={child.name}
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
                                        <h3 style={{ margin: 0 }}>{child.name}</h3>
                                        <span className="chip" style={{ fontSize: "0.75rem" }}>
                                            {typeInfo.icon} {typeInfo.label}
                                        </span>
                                    </div>
                                </div>

                                {child.address && (
                                    <p style={{ fontSize: "0.85rem", color: "var(--fg-muted)", marginBottom: "1rem" }}>
                                        📍 {child.address}
                                    </p>
                                )}

                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                    <Link to={`/admin/equipamentos/${child.id}`} className="btn btn-secondary">
                                        Configurar
                                    </Link>
                                    <a
                                        href={`/${child.slug}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-primary"
                                    >
                                        Ver Site
                                    </a>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
