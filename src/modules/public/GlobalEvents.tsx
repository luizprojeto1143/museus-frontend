import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { Calendar, MapPin, Search, ArrowLeft } from "lucide-react";

type Event = {
    id: string;
    title: string;
    description: string;
    startDate: string;
    location?: string;
    coverUrl?: string;
    tenant: { name: string; slug: string };
};

export const GlobalEvents: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        // Fetch public events from all tenants with discovery=true
        api.get("/events?discovery=true")
            .then(res => setEvents(res.data.data || []))
            .catch(err => console.error("Error fetching global events", err))
            .finally(() => setLoading(false));
    }, []);

    const filteredEvents = events.filter(e =>
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.tenant.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1rem", minHeight: "100vh", color: "white" }}>

            {/* Header */}
            <header style={{ marginBottom: "3rem" }}>
                <Link to="/welcome" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--fg-muted)", textDecoration: "none", marginBottom: "1rem" }}>
                    <ArrowLeft size={20} /> Voltar
                </Link>
                <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", background: "linear-gradient(90deg, #d4af37, #f3e5b5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "0.5rem" }}>
                    Agenda Cultural Unificada
                </h1>
                <p style={{ opacity: 0.7, fontSize: "1.1rem" }}>
                    Explore eventos, exposições e oficinas em todos os nossos museus parceiros.
                </p>
            </header>

            {/* Search */}
            <div style={{ position: "relative", marginBottom: "2rem" }}>
                <Search size={20} style={{ position: "absolute", top: "1rem", left: "1rem", opacity: 0.5 }} />
                <input
                    type="text"
                    placeholder="Busque por evento, museu ou cidade..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{
                        width: "100%",
                        padding: "1rem 1rem 1rem 3rem",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "0.75rem",
                        color: "white",
                        fontSize: "1rem"
                    }}
                />
            </div>

            {/* Grid */}
            {loading ? (
                <div style={{ textAlign: "center", padding: "4rem", opacity: 0.5 }}>Carregando agenda...</div>
            ) : filteredEvents.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem", background: "rgba(255,255,255,0.02)", borderRadius: "1rem" }}>
                    <Calendar size={48} style={{ opacity: 0.3, marginBottom: "1rem" }} />
                    <h3 style={{ marginBottom: "0.5rem" }}>Nenhum evento encontrado</h3>
                    <p style={{ opacity: 0.6 }}>Tente buscar com outros termos.</p>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "2rem" }}>
                    {filteredEvents.map(event => (
                        <div key={event.id} className="card-hover-effect" style={{
                            background: "#1e1e24",
                            borderRadius: "1rem",
                            overflow: "hidden",
                            border: "1px solid rgba(255,255,255,0.05)",
                            display: "flex",
                            flexDirection: "column"
                        }}>
                            <div style={{
                                height: "180px",
                                background: event.coverUrl ? `url(${event.coverUrl}) center/cover` : "linear-gradient(135deg, #333, #222)",
                                position: "relative"
                            }}>
                                <span style={{
                                    position: "absolute",
                                    bottom: "1rem",
                                    left: "1rem",
                                    background: "rgba(0,0,0,0.8)",
                                    padding: "0.3rem 0.8rem",
                                    borderRadius: "2rem",
                                    fontSize: "0.75rem",
                                    fontWeight: "bold",
                                    color: "#d4af37",
                                    border: "1px solid #d4af37"
                                }}>
                                    {event.tenant.name}
                                </span>
                            </div>

                            <div style={{ padding: "1.5rem", flex: 1, display: "flex", flexDirection: "column" }}>
                                <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "0.5rem", lineHeight: 1.3 }}>
                                    {event.title}
                                </h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", opacity: 0.7, fontSize: "0.9rem", marginBottom: "1.5rem" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <Calendar size={16} /> {new Date(event.startDate).toLocaleDateString()} at {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <MapPin size={16} /> {event.location || "Local não informado"}
                                    </div>
                                </div>
                                <div style={{ marginTop: "auto" }}>
                                    {/* Note: This assumes deep linking logic - ideally we route to museum specific event page */}
                                    {/* Since we don't have multi-tenant routing perfectly setup in frontend (e.g. subdomains), we might need to route to a generic public event view or handle tenant switching */}
                                    {/* For MVP: Just link to login or standard event details if logged in */}
                                    <button style={{ width: "100%", padding: "0.8rem", background: "var(--primary-color)", color: "white", border: "none", borderRadius: "0.5rem", fontWeight: "bold", cursor: "pointer" }}>
                                        Ver Detalhes
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
