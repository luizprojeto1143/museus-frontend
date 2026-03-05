import React, { useEffect, useState, useCallback } from "react";
import { api } from "../../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { Loader2, Clock, ChevronLeft, ChevronRight } from "lucide-react";

export const WorkTimeline: React.FC = () => {
    const { tenantId } = useAuth();
    const [works, setWorks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);

    const fetchWorks = useCallback(async () => {
        try {
            const res = await api.get(`/works?tenantId=${tenantId}`);
            // Sort by yearNumeric or year field
            const sorted = (res.data || [])
                .filter((w: any) => w.year || w.yearNumeric)
                .sort((a: any, b: any) => {
                    const yearA = a.yearNumeric || parseInt(a.year) || 0;
                    const yearB = b.yearNumeric || parseInt(b.year) || 0;
                    return yearA - yearB;
                });
            setWorks(sorted);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [tenantId]);

    useEffect(() => {
        if (tenantId) fetchWorks();
    }, [tenantId, fetchWorks]);

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-amber-500" /></div>;

    // Group by period
    const periods = new Map<string, any[]>();
    works.forEach(w => {
        const period = w.period || "Sem Período";
        if (!periods.has(period)) periods.set(period, []);
        periods.get(period)!.push(w);
    });

    const filteredWorks = selectedPeriod
        ? works.filter(w => (w.period || "Sem Período") === selectedPeriod)
        : works;

    const getCentury = (year: string | number | null) => {
        const y = typeof year === 'string' ? parseInt(year) : year;
        if (!y) return "?";
        return `Séc. ${Math.ceil(y / 100)}`;
    };

    return (
        <div className="min-h-screen bg-[#0d0e11] pb-24">
            <div className="px-4 pt-6 pb-4">
                <h1 className="text-2xl font-black text-white flex items-center gap-2">
                    <Clock size={24} className="text-amber-500" /> Linha do Tempo
                </h1>
                <p className="text-gray-500 text-sm mt-1">Explore o acervo cronologicamente</p>
            </div>

            {/* Period Filter */}
            <div className="px-4 mb-6 overflow-x-auto">
                <div className="flex gap-2 pb-2">
                    <button
                        onClick={() => setSelectedPeriod(null)}
                        className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${!selectedPeriod ? 'bg-amber-500 text-black' : 'bg-white/5 text-gray-400'}`}
                    >
                        Todos
                    </button>
                    {Array.from(periods.keys()).map(period => (
                        <button
                            key={period}
                            onClick={() => setSelectedPeriod(period)}
                            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${selectedPeriod === period ? 'bg-amber-500 text-black' : 'bg-white/5 text-gray-400'}`}
                        >
                            {period} ({periods.get(period)!.length})
                        </button>
                    ))}
                </div>
            </div>

            {/* Timeline */}
            <div className="px-4 relative">
                {/* Vertical line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-white/10" />

                <div className="space-y-6">
                    {filteredWorks.map((work, idx) => (
                        <div key={work.id} className="flex gap-4 relative">
                            {/* Dot */}
                            <div className="relative z-10 w-8 flex justify-center shrink-0">
                                <div className="w-4 h-4 rounded-full bg-amber-500 border-2 border-[#0d0e11] mt-3" />
                            </div>

                            {/* Card */}
                            <div className="flex-1 bg-[#1a1c22] border border-white/5 rounded-2xl overflow-hidden hover:border-amber-500/20 transition-colors">
                                <div className="flex">
                                    {work.imageUrl && (
                                        <img src={work.imageUrl} alt={work.title} className="w-24 h-24 object-cover shrink-0" />
                                    )}
                                    <div className="p-4 flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-amber-500 text-xs font-black">{work.year || work.yearNumeric || "?"}</span>
                                            {work.period && <span className="text-[10px] bg-white/5 text-gray-400 px-1.5 py-0.5 rounded">{work.period}</span>}
                                        </div>
                                        <h3 className="text-white font-bold text-sm truncate">{work.title}</h3>
                                        {work.artist && <p className="text-gray-500 text-xs">{work.artist}</p>}
                                        {work.technique && <p className="text-gray-600 text-[10px] mt-1">{work.technique}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredWorks.length === 0 && (
                    <div className="text-center py-20">
                        <Clock size={48} className="mx-auto text-gray-700 mb-4 opacity-20" />
                        <p className="text-gray-500">Nenhuma obra com data cadastrada.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
