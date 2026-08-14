import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../../../api/client';
import { Search, Sparkles, ShieldCheck, Building2, CheckCircle2, ChevronRight, Image as ImageIcon } from 'lucide-react';

interface SponsorableWork {
  id: string;
  title: string;
  imageUrl?: string | null;
  tenantName: string;
  tenantSlug: string;
  hasExclusiveSponsor: boolean;
  sharedSponsorsCount: number;
  maxSharedSponsors: number;
  sharedSlotsAvailable: number;
  canSponsorShared: boolean;
  canSponsorExclusive: boolean;
}

export function SponsorBrowseWorks() {
  const { t } = useTranslation();
  const [works, setWorks] = useState<SponsorableWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'available_exclusive' | 'available_shared'>('all');

  useEffect(() => {
    fetchWorks();
  }, []);

  const fetchWorks = async () => {
    setLoading(true);
    try {
      const res = await api.get<SponsorableWork[]>('/sponsor-portal/works');
      setWorks(res.data || []);
    } catch (err) {
      console.error("Erro ao carregar obras patrocináveis:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredWorks = works.filter(w => {
    const matchesSearch = w.title.toLowerCase().includes(search.toLowerCase()) || 
                          w.tenantName.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (filterType === 'available_exclusive') return w.canSponsorExclusive;
    if (filterType === 'available_shared') return w.canSponsorShared;
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 p-8 border border-amber-500/20 shadow-2xl">
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} /> Fomento à Cultura Nacional
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white italic tracking-tight">
            Patrocinar Obras de Arte & Acervos
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Associe sua marca à preservação do patrimônio cultural. Sua empresa ganha visibilidade contínua no aplicativo, nas placas digitais e totens físicos dos museus.
          </p>
        </div>
        <div className="absolute right-[-20px] bottom-[-20px] opacity-10 pointer-events-none">
          <ShieldCheck size={260} className="text-amber-400" />
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder={t("sponsor.browse.search_placeholder", "Buscar obra ou museu...")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filterType === 'all' 
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' 
                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'
            }`}
          >
            Todas as Obras ({works.length})
          </button>
          <button
            onClick={() => setFilterType('available_exclusive')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filterType === 'available_exclusive' 
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' 
                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'
            }`}
          >
            Cotas Exclusivas Disponíveis
          </button>
          <button
            onClick={() => setFilterType('available_shared')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filterType === 'available_shared' 
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' 
                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'
            }`}
          >
            Cotas Compartilhadas
          </button>
        </div>
      </div>

      {/* Grid of Works */}
      {loading ? (
        <div className="p-20 text-center animate-pulse text-amber-500 font-bold italic">
          Buscando obras disponíveis para patrocínio...
        </div>
      ) : filteredWorks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorks.map((w) => (
            <div 
              key={w.id} 
              className="group bg-slate-900/80 rounded-[28px] border border-slate-800 hover:border-amber-500/40 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5"
            >
              <div>
                {/* Image Container */}
                <div className="relative h-52 bg-slate-950 overflow-hidden">
                  {w.imageUrl ? (
                    <img 
                      src={w.imageUrl} 
                      alt={w.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 bg-slate-950">
                      <ImageIcon size={48} />
                      <span className="text-xs mt-2 font-medium">Acervo Cultural</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    {w.hasExclusiveSponsor ? (
                      <span className="px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                        Patrocínio Exclusivo Ativo
                      </span>
                    ) : w.canSponsorExclusive ? (
                      <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                        ★ Cota Exclusiva Disponível
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                        {w.sharedSlotsAvailable} Cotas Vagas
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                    <Building2 size={14} />
                    <span>{w.tenantName}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                    {w.title}
                  </h3>
                  
                  {/* Quotas Meter */}
                  <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-medium">Cotas Compartilhadas</span>
                      <span className="text-white font-bold">{w.sharedSponsorsCount} / {w.maxSharedSponsors}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-500" 
                        style={{ width: `${(w.sharedSponsorsCount / w.maxSharedSponsors) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-6 pt-0">
                {w.hasExclusiveSponsor || (!w.canSponsorShared && !w.canSponsorExclusive) ? (
                  <button 
                    disabled 
                    className="w-full py-3 rounded-xl bg-slate-800/60 text-slate-500 text-xs font-bold cursor-not-allowed text-center"
                  >
                    Cotas Esgotadas para esta Obra
                  </button>
                ) : (
                  <Link to={`/patrocinar/checkout/${w.id}`}>
                    <button className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/10 hover:shadow-amber-500/25">
                      Patrocinar esta Obra <ChevronRight size={16} />
                    </button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-16 rounded-[32px] bg-slate-900/50 border border-slate-800 text-center space-y-3">
          <CheckCircle2 size={40} className="mx-auto text-slate-600" />
          <h4 className="text-lg font-bold text-white">Nenhuma obra encontrada</h4>
          <p className="text-slate-400 text-xs">Tente ajustar o termo de busca ou selecione outro filtro.</p>
        </div>
      )}
    </div>
  );
}
