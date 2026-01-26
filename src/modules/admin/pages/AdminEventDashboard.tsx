import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../../api/client';
import { useAuth } from '../../auth/AuthContext';
import { Users, DollarSign, Calendar, Eye, Settings, QrCode } from 'lucide-react';

interface EventData {
    id: string;
    title: string;
    startDate: string;
}

interface TicketInfo {
    id: string;
    quantity: number;
    sold: number;
    price: number;
}

export const AdminEventDashboard: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { tenantId } = useAuth();
    const [event, setEvent] = useState<EventData | null>(null);
    const [stats, setStats] = useState({
        ticketsSold: 0,
        totalTickets: 0,
        revenue: 0,
        views: 1240, // Mocked for now
        recentRegistrations: [] as Array<{ id: string; name: string }>
    });

    useEffect(() => {
        if (id && tenantId) {
            // Fetch Event
            api.get(`/events/${id}`).then(res => setEvent(res.data)).catch(console.error);

            // Fetch Tickets to calc total
            api.get(`/events/${id}/tickets`).then(res => {
                const tickets = res.data as TicketInfo[];
                const total = tickets.reduce((acc: number, t) => acc + t.quantity, 0);
                const sold = tickets.reduce((acc: number, t) => acc + t.sold, 0);
                // Calculate simple revenue based on tickets sold (approx) if backend doesn't give precise
                // Ideally backend gives this. We'll sum up price * sold for now.
                const rev = tickets.reduce((acc: number, t) => acc + (t.sold * Number(t.price)), 0);

                setStats(prev => ({ ...prev, totalTickets: total, ticketsSold: sold, revenue: rev }));
            }).catch(console.error);

            // Fetch recent registrations (mocked or real endpoint if exists)
            // api.get(`/events/${id}/registrations?limit=5`).then...
        }
    }, [id, tenantId]);

    if (!event) return <div className="p-8">Carregando...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
                    <div className="flex items-center gap-2 text-gray-500 mt-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(event.startDate).toLocaleDateString()}</span>
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-semibold">
                            Publicado
                        </span>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link to={`/admin/eventos/${id}/checkin`} className="btn btn-secondary flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                        <QrCode className="w-4 h-4" /> Check-in
                    </Link>
                    <Link to={`/admin/eventos/${id}`} className="btn flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
                        <Settings className="w-4 h-4" /> Editar
                    </Link>
                </div>
            </div>

            {/* Sales Analytics - TODO: Implement widget */}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Ingressos Vendidos</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-2">
                                {stats.ticketsSold} <span className="text-gray-400 text-lg font-normal">/ {stats.totalTickets}</span>
                            </h3>
                        </div>
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Users className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 mt-4">
                        <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${stats.totalTickets > 0 ? (stats.ticketsSold / stats.totalTickets) * 100 : 0}%` }}
                        ></div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Receita Total</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-2">
                                R$ {stats.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </h3>
                        </div>
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                            <DollarSign className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Visualizações</p>
                            <h3 className="text-3xl font-bold text-gray-900 mt-2">
                                {stats.views}
                            </h3>
                        </div>
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                            <Eye className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </div >

            {/* Content Row */}
            < div className="grid grid-cols-1 lg:grid-cols-3 gap-8" >
                {/* Recent Registrations */}
                < div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200" >
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800">Inscrições Recentes</h3>
                        <button className="text-blue-600 text-sm font-medium hover:underline">Ver todas</button>
                    </div>
                    <div className="p-6">
                        {/* Placeholder for table */}
                        <div className="text-center text-gray-500 py-8">
                            Nenhuma inscrição recente.
                        </div>
                    </div>
                </div >

                {/* Quick Actions / Tips */}
                < div className="space-y-6" >
                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white text-center">
                        <QrCode className="w-12 h-12 mx-auto mb-4 opacity-80" />
                        <h3 className="font-bold text-lg mb-2">Check-in Rápido</h3>
                        <p className="text-blue-100 text-sm mb-4">Acesse a câmera para ler QR Codes dos participantes na entrada.</p>
                        <Link to={`/admin/eventos/${id}/checkin`} className="btn bg-white text-blue-700 hover:bg-blue-50 w-full block">
                            Abrir Scanner
                        </Link>
                    </div>
                </div >
            </div >
        </div >
    );
};
