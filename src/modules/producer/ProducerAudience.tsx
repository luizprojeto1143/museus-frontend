import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { api } from "../../api/client";
import { Search, Mail, Download, User, ArrowLeft } from "lucide-react";
import { Button, Input } from "../../components/ui";

type Participant = {
    id: string;
    name: string;
    email: string;
    event: string;
    ticketType: string;
    status: "CONFIRMED" | "CHECKED_IN" | "PENDING";
    date: string;
};

export const ProducerAudience: React.FC = () => {
    // Mock Data
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        // Fetch real registrations
        api.get("/registrations")
            .then(res => {
                // Map API response to Participant type
                const data = res.data.map((reg: any) => ({
                    id: reg.id,
                    name: reg.visitor?.name || reg.guestName || "Visitante",
                    email: reg.visitor?.email || reg.guestEmail || "",
                    event: reg.event?.title || "Evento Desconhecido",
                    ticketType: reg.ticket?.name || "Ingresso",
                    status: reg.status,
                    date: reg.createdAt // Used for sorting if needed
                }));
                setParticipants(data);
            })
            .catch(err => console.error("Error fetching audience", err))
            .finally(() => setLoading(false));
    }, []);

    const handleExport = () => {
        const header = ["ID", "Nome", "Email", "Evento", "Ingresso", "Status", "Data"];
        const rows = participants.map(p => [
            p.id,
            `"${p.name}"`,
            p.email,
            `"${p.event}"`,
            p.ticketType,
            p.status,
            p.date
        ]);

        const csvContent = [header.join(","), ...rows.map(r => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `publico-crm-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredParticipants = participants.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="pb-16 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#D4AF37] mb-2 font-serif">Meu Público (CRM)</h1>
                    <p className="text-[#B0A090]">Visualize quem são seus visitantes e exporte dados para marketing.</p>
                </div>
                <Button
                    onClick={handleExport}
                    variant="outline"
                    className="border-[#463420] text-[#B0A090] hover:text-[#EAE0D5] hover:bg-white/5 hover:border-[#D4AF37]/30"
                    leftIcon={<Download size={20} />}
                >
                    Exportar CSV
                </Button>
            </div>

            <div className="bg-[#2c1e10] rounded-2xl border border-[#463420] overflow-hidden shadow-lg shadow-black/20">
                {/* Toolbar */}
                <div className="p-6 border-b border-[#463420] flex gap-4">
                    <div className="relative flex-1">
                        <Input
                            placeholder="Buscar por nome ou email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            leftIcon={<Search size={18} />}
                            className="bg-black/20 border-none text-[#EAE0D5] placeholder:text-[#B0A090]/50"
                        />
                    </div>
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-black/20 text-xs font-bold text-[#B0A090] uppercase tracking-wider">
                    <div className="col-span-4">Nome</div>
                    <div className="col-span-3">Evento</div>
                    <div className="col-span-2">Ingresso</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-1 text-right">Ações</div>
                </div>

                {/* Rows */}
                <div className="divide-y divide-[#463420]">
                    {loading ? (
                        <div className="p-8 text-center text-[#B0A090]">Carregando...</div>
                    ) : filteredParticipants.length === 0 ? (
                        <div className="p-8 text-center text-[#B0A090]">Nenhum participante encontrado.</div>
                    ) : (
                        filteredParticipants.map(p => (
                            <div key={p.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/5 transition-colors">
                                <div className="col-span-4 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-[#B0A090]">
                                        <User size={16} />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-bold text-[#EAE0D5] truncate">{p.name}</div>
                                        <div className="text-xs text-[#B0A090] truncate">{p.email}</div>
                                    </div>
                                </div>
                                <div className="col-span-3 text-sm text-[#EAE0D5]/80 truncate">{p.event}</div>
                                <div className="col-span-2">
                                    <span className="bg-white/5 text-[#B0A090] px-2 py-1 rounded text-xs">
                                        {p.ticketType}
                                    </span>
                                </div>
                                <div className="col-span-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold border ${p.status === "CHECKED_IN"
                                            ? "bg-[#4cd964]/10 text-[#4cd964] border-[#4cd964]/20"
                                            : "bg-[#ffb340]/10 text-[#ffb340] border-[#ffb340]/20"
                                        }`}>
                                        {p.status === "CHECKED_IN" ? "PRESENTE" : "CONFIRMADO"}
                                    </span>
                                </div>
                                <div className="col-span-1 text-right">
                                    <button className="p-2 hover:bg-white/10 rounded-lg text-[#B0A090] transition-colors">
                                        <Mail size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
