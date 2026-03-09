import { useTranslation } from "react-i18next";
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../../api/client';
import { useAuth } from '../../auth/AuthContext';
import {


    Calendar, MapPin, Users, CheckCircle, XCircle,
    Printer, Download, ChevronLeft, TrendingUp, DollarSign, Star
} from 'lucide-react';
// import { Bar, Doughnut } from 'react-chartjs-2'; // Adding chartjs might be too heavy, let's use simple HTML/CSS bars for MVP
import "./AdminShared.css";

interface TicketBreakdown {
    name: string;
    sold: number;
    revenue: number;
}

interface QuestionStats {
    id: string;
    question: string;
    type: 'STARS' | 'TEXT' | 'CHOICE' | 'NPS';
    totalResponses: number;
    aggregation: {
        average?: number;
        npsScore?: number;
        distribution?: Record<string, number>;
        recentAnswers?: Array<{ answer: string; createdAt: string }>;
    };
}

interface Participant {
    id: string;
    name: string;
    email: string;
    ticketName: string;
    status: 'REGISTERED' | 'CHECKED_IN' | 'CANCELED';
    checkInDate?: string;
}

interface ReportData {
    event: {
        title: string;
        startDate: string;
        location: string | null;
        tenant: string;
    };
    stats: {
        totalRegistrations: number;
        totalCheckedIn: number;
        attendanceRate: number;
        totalRevenue: number;
        ticketsBreakdown: TicketBreakdown[];
    };
    survey: {
        questionsCount: number;
        totalResponses: number;
        overallSatisfaction: number;
        uniqueRespondents: number;
        questions: QuestionStats[];
    };
    participants: Participant[];
}

export const AdminEventReport: React.FC = () => {
  const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const { tenantId } = useAuth();
    const [report, setReport] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id && tenantId) {
            api.get(`/events/${id}/report`)
                .then(res => setReport(res.data))
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [id, tenantId]);

    if (loading) return <div className="p-8">{t("admin.eventreport.carregandoRelatrio", `Carregando relatório...`)}</div>;
    if (!report) return <div className="p-8">{t("admin.eventreport.erroAoCarregarRelatrio", `Erro ao carregar relatório.`)}</div>;

    const { event, stats, survey, participants } = report;

    return (
        <div className="p-8 max-w-6xl mx-auto print:p-0 print:max-w-none bg-zinc-900/60 min-h-screen print:bg-zinc-900/40 border border-gold/20">
            {/* Toolbar - Hidden on Print */}
            <div className="flex justify-between items-center mb-8 print:hidden">
                <div className="flex items-center gap-4">
                    <Link to={`/admin/eventos/${id}`} className="btn btn-ghost text-zinc-400">
                        <ChevronLeft className="w-5 h-5 mr-1" /> Voltar
                    </Link>
                    <h1 className="text-2xl font-bold text-white">{t("admin.eventreport.relatrioDoEvento", `Relatório do Evento`)}</h1>
                </div>
                <button onClick={() => window.print()} className="btn btn-secondary flex items-center gap-2">
                    <Printer className="w-4 h-4" /> Imprimir / PDF
                </button>
            </div>

            {/* Header */}
            <div className="bg-zinc-900/40 p-8 rounded-xl shadow-md shadow-black/20 border border-white/10 mb-6 print:border-none print:shadow-none print:p-0">
                <div className="flex justify-between items-start border-b border-white/5 pb-6 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">{event.title}</h1>
                        <div className="flex gap-6 text-zinc-400">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {new Date(event.startDate).toLocaleDateString()} {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            {event.location && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    {event.location}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-400">{t("admin.eventreport.organizao", `Organização`)}</p>
                        <p className="font-semibold text-zinc-200">{event.tenant}</p>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-4 gap-6 print:grid-cols-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-sm text-blue-600 font-medium mb-1">Inscritos</p>
                        <p className="text-3xl font-bold text-blue-900">{stats.totalRegistrations}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                        <p className="text-sm text-green-600 font-medium mb-1">Presentes</p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-bold text-green-900">{stats.totalCheckedIn}</p>
                            <span className="text-sm font-semibold text-green-700">({stats.attendanceRate}%)</span>
                        </div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                        <p className="text-sm text-purple-600 font-medium mb-1">{t("admin.eventreport.satisfaoGeral", `Satisfação Geral`)}</p>
                        <div className="flex items-center gap-2">
                            <p className="text-3xl font-bold text-purple-900">{survey.overallSatisfaction > 0 ? survey.overallSatisfaction : '-'}</p>
                            {survey.overallSatisfaction > 0 && <Star className="w-5 h-5 text-yellow-500 fill-current" />}
                        </div>
                    </div>
                    <div className="p-4 bg-zinc-900/60 rounded-lg border border-white/5">
                        <p className="text-sm text-zinc-300 font-medium mb-1">Receita</p>
                        <p className="text-3xl font-bold text-white">
                            R$ {stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Survey Results */}
            {survey.questionsCount > 0 && (
                <div className="bg-zinc-900/40 p-8 rounded-xl shadow-md shadow-black/20 border border-white/10 mb-6 print:break-inside-avoid">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        Resultados da Pesquisa
                        <span className="text-sm font-normal text-zinc-400 ml-2">({survey.uniqueRespondents} respondentes)</span>
                    </h2>

                    <div className="space-y-8">
                        {survey.questions.map((q: any) => (
                            <div key={q.id} className="border-b border-white/5 last:border-0 pb-6 last:pb-0 print:break-inside-avoid">
                                <h3 className="font-semibold text-zinc-200 mb-4">{q.question}</h3>

                                {(q.type === 'STARS' || q.type === 'NPS') && (
                                    <div className="bg-zinc-900/60 p-4 rounded-lg">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="text-3xl font-bold text-white">{q.aggregation.average}</div>
                                            <div className="text-sm text-zinc-400">Média<br />de {q.type === 'STARS' ? '5.0' : '10.0'}</div>

                                            {q.type === 'NPS' && (
                                                <div className="ml-8 px-3 py-1 bg-blue-100 text-blue-800 rounded font-bold">
                                                    NPS: {q.aggregation.npsScore}
                                                </div>
                                            )}
                                        </div>

                                        {/* Simple Bar Chart */}
                                        <div className="space-y-2">
                                            {Object.entries(q.aggregation.distribution).map(([key, count]: any) => (
                                                <div key={key} className="flex items-center gap-3 text-sm">
                                                    <span className="w-4 font-bold text-zinc-300">{key}</span>
                                                    <div className="flex-1 h-3 bg-zinc-800 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-blue-500"
                                                            style={{ width: `${(count / q.totalResponses) * 100}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-gray-400 w-10 text-right">{count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {q.type === 'CHOICE' && (
                                    <div className="space-y-2">
                                        {Object.entries(q.aggregation.distribution).map(([key, count]: any) => (
                                            <div key={key} className="flex justify-between items-center p-3 bg-zinc-900/60 rounded border border-white/5">
                                                <span>{key}</span>
                                                <span className="font-bold bg-zinc-900/40 px-2 py-1 rounded shadow-md shadow-black/20 text-zinc-300">{count}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {q.type === 'TEXT' && (
                                    <div className="space-y-2">
                                        {q.aggregation.recentAnswers.map((ans: any, idx: number) => (
                                            <div key={idx} className="p-3 bg-yellow-50 text-yellow-900 rounded italic text-sm border-l-4 border-yellow-300">
                                                "{ans.answer}"
                                            </div>
                                        ))}
                                        {q.totalResponses > 5 && (
                                            <p className="text-xs text-gray-400 text-center mt-2">
                                                Exibindo 5 de {q.totalResponses} respostas
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Participants List - Page Break Before */}
            <div className="bg-zinc-900/40 p-8 rounded-xl shadow-md shadow-black/20 border border-white/10 print:break-before-page">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Users className="w-5 h-5 text-zinc-300" /> Listagem de Participantes
                </h2>

                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10 text-sm text-zinc-400">
                            <th className="py-2 pl-2">Nome</th>
                            <th className="py-2">Ingresso</th>
                            <th className="py-2">Status</th>
                            <th className="py-2 text-right pr-2">Check-in</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {participants.map((p: any) => (
                            <tr key={p.id} className="border-b border-white/5 last:border-0 hover:">
                                <td className="py-3 pl-2">
                                    <div className="font-medium text-white">{p.name}</div>
                                    <div className="text-xs text-gray-400">{p.email}</div>
                                </td>
                                <td className="py-3 text-zinc-300">{p.ticketName}</td>
                                <td className="py-3">
                                    {p.status === 'CHECKED_IN' ? (
                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Presente</span>
                                    ) : (
                                        <span className="px-2 py-1 bg-zinc-800/50 text-zinc-300 rounded-full text-xs">Inscrito</span>
                                    )}
                                </td>
                                <td className="py-3 text-right pr-2 text-zinc-400 font-mono text-xs">
                                    {p.checkInDate ? new Date(p.checkInDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
