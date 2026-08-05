import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BarChart3, Building2, CalendarDays, Globe2, Library, MapPin, Search, ShieldCheck, Sparkles, Users } from "lucide-react";
import { api } from "../../api/client";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
};

type Indicators = {
  totals: {
    tenants: number;
    equipments: number;
    works: number;
    events: number;
    registrations: number;
    visits: number;
  };
  byCity: Array<{ city: string; state: string; region: string; equipments: number }>;
  byState: Array<{ state: string; region: string; equipments: number }>;
  byRegion: Array<{ region: string; equipments: number }>;
};

type RankingItem = {
  id: string;
  name: string;
  type: string;
  city: string;
  state: string;
  region: string;
  coverUrl?: string;
  visits: number;
  works: number;
  events: number;
  trails: number;
};

type MapItem = {
  id: string;
  name: string;
  type: string;
  city: string;
  state: string;
  region: string;
  lat: number;
  lng: number;
  coverUrl?: string;
  accessibility: { audio: boolean; wheelchair: boolean; libras: boolean };
};

type SearchResult = {
  type: string;
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  url: string;
};

type PublicEvent = {
  id: string;
  title: string;
  startDate: string;
  city?: string;
  state?: string;
  coverUrl?: string;
  registrations: number;
};

type WorkItem = {
  id: string;
  title: string;
  artist?: string;
  imageUrl?: string;
  tenant?: { name: string; slug: string };
  equipment?: { nome: string; cidade: string; estado: string };
};

type ServiceItem = {
  id: string;
  name: string;
  type: string;
  description?: string;
  verified: boolean;
  city?: string;
  state?: string;
  region?: string;
  stats: { bookings: number; reviews: number };
};

type BenefitItem = {
  id: string;
  tenantName: string;
  equipmentName?: string;
  city?: string;
  state?: string;
  region?: string;
  name: string;
  description?: string;
  monthlyPrice: number;
  benefits: string[];
  subscribers: number;
  shopDiscount?: number;
};

const formatNumber = (value?: number) => new Intl.NumberFormat("pt-BR").format(value || 0);

async function getData<T>(url: string, params?: Record<string, unknown>) {
  const { data } = await api.get<ApiEnvelope<T>>(url, { params });
  return data.data;
}

export const NationalCulturePage: React.FC = () => {
  const [query, setQuery] = useState("");
  const [stateFilter, setStateFilter] = useState("");

  const indicators = useQuery({
    queryKey: ["national-indicators"],
    queryFn: () => getData<Indicators>("/public/national/indicators")
  });

  const ranking = useQuery({
    queryKey: ["national-ranking"],
    queryFn: () => getData<RankingItem[]>("/public/national/rankings/equipments", { pageSize: 8 })
  });

  const map = useQuery({
    queryKey: ["national-map", stateFilter],
    queryFn: () => getData<MapItem[]>("/public/national/map", { state: stateFilter || undefined })
  });

  const events = useQuery({
    queryKey: ["national-events", stateFilter],
    queryFn: () => getData<PublicEvent[]>("/public/national/events", { pageSize: 6, state: stateFilter || undefined })
  });

  const works = useQuery({
    queryKey: ["national-collections"],
    queryFn: () => getData<WorkItem[]>("/public/national/digital-collections", { pageSize: 6 })
  });

  const services = useQuery({
    queryKey: ["national-services"],
    queryFn: () => getData<ServiceItem[]>("/public/national/services", { pageSize: 6 })
  });

  const benefits = useQuery({
    queryKey: ["national-benefits", stateFilter],
    queryFn: () => getData<BenefitItem[]>("/memberships/benefits/national", { state: stateFilter || undefined })
  });

  const search = useQuery({
    queryKey: ["national-search", query],
    queryFn: () => getData<{ results: SearchResult[] }>("/public/national/search", { q: query }),
    enabled: query.trim().length >= 2
  });

  const states = useMemo(() => {
    return indicators.data?.byState.map(item => item.state).filter(Boolean).sort() || [];
  }, [indicators.data]);

  const loading = indicators.isLoading || ranking.isLoading || map.isLoading;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="border-b border-white/10 bg-slate-950">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-8 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white">
              <ArrowLeft size={18} /> Voltar
            </Link>
            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-emerald-300">
              <Globe2 size={18} /> Plataforma nacional
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <h1 className="max-w-4xl text-4xl font-black leading-tight md:text-6xl">
                Cultura Viva Nacional
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300 md:text-lg">
                Indicadores, equipamentos, eventos, acervos e servicos culturais reunidos em uma unica camada publica.
              </p>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar obras, eventos, museus, cidades e servicos"
                className="h-14 w-full rounded-md border border-white/10 bg-white px-12 text-sm font-semibold text-slate-950 outline-none ring-0 placeholder:text-slate-500 focus:border-emerald-400"
              />
            </div>
          </div>

          {query.trim().length >= 2 && (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {(search.data?.results || []).slice(0, 8).map(result => (
                <a key={`${result.type}-${result.id}`} href={result.url} className="rounded-md border border-white/10 bg-white/5 p-4 hover:bg-white/10">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-300">{result.type}</div>
                  <div className="mt-2 font-bold">{result.title}</div>
                  <div className="mt-1 text-sm text-slate-400">{result.subtitle || "Resultado nacional"}</div>
                </a>
              ))}
              {search.isFetched && (search.data?.results.length || 0) === 0 && (
                <div className="rounded-md border border-white/10 bg-white/5 p-4 text-sm text-slate-300">Nenhum resultado encontrado.</div>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        {loading ? (
          <div className="rounded-md border border-white/10 bg-white/5 p-8 text-slate-300">Carregando indicadores nacionais...</div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
              <Metric icon={<Building2 size={20} />} label="Equipamentos" value={indicators.data?.totals.equipments} />
              <Metric icon={<Library size={20} />} label="Obras" value={indicators.data?.totals.works} />
              <Metric icon={<CalendarDays size={20} />} label="Eventos" value={indicators.data?.totals.events} />
              <Metric icon={<Users size={20} />} label="Inscricoes" value={indicators.data?.totals.registrations} />
              <Metric icon={<BarChart3 size={20} />} label="Visitas" value={indicators.data?.totals.visits} />
              <Metric icon={<Globe2 size={20} />} label="Instituicoes" value={indicators.data?.totals.tenants} />
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <section className="rounded-md border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl font-black">Ranking nacional</h2>
                  <select
                    value={stateFilter}
                    onChange={(event) => setStateFilter(event.target.value)}
                    className="h-10 rounded-md border border-white/10 bg-slate-900 px-3 text-sm font-semibold text-white"
                  >
                    <option value="">Todos os estados</option>
                    {states.map(state => <option key={state} value={state}>{state}</option>)}
                  </select>
                </div>

                <div className="mt-4 space-y-3">
                  {(ranking.data || []).map((item, index) => (
                    <div key={item.id} className="flex items-center gap-4 rounded-md bg-white/5 p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-emerald-400 text-sm font-black text-slate-950">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-bold">{item.name}</div>
                        <div className="text-sm text-slate-400">{item.city}/{item.state} - {item.type}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-black">{formatNumber(item.visits)}</div>
                        <div className="text-xs uppercase text-slate-500">visitas</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-md border border-white/10 bg-white/[0.03] p-5">
                <h2 className="text-xl font-black">Mapa publico nacional</h2>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {(map.data || []).slice(0, 8).map(item => (
                    <div key={item.id} className="rounded-md border border-white/10 bg-slate-900/70 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-bold">{item.name}</div>
                          <div className="mt-1 text-sm text-slate-400">{item.city}/{item.state} - {item.region}</div>
                        </div>
                        <MapPin className="text-emerald-300" size={20} />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wider">
                        {item.accessibility.wheelchair && <span className="rounded bg-blue-400/15 px-2 py-1 text-blue-200">PCD</span>}
                        {item.accessibility.libras && <span className="rounded bg-violet-400/15 px-2 py-1 text-violet-200">Libras</span>}
                        {item.accessibility.audio && <span className="rounded bg-amber-400/15 px-2 py-1 text-amber-200">Audio</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              <ListPanel title="Eventos nacionais" items={(events.data || []).map(item => ({
                id: item.id,
                title: item.title,
                subtitle: `${item.city || "Online"}/${item.state || ""} - ${new Date(item.startDate).toLocaleDateString("pt-BR")}`
              }))} />
              <ListPanel title="Acervo digital" items={(works.data || []).map(item => ({
                id: item.id,
                title: item.title,
                subtitle: item.artist || item.equipment?.nome || item.tenant?.name || "Obra publicada"
              }))} />
              <ListPanel title="Servicos culturais" items={(services.data || []).map(item => ({
                id: item.id,
                title: item.name,
                subtitle: `${item.type}${item.verified ? " - verificado" : ""}`
              }))} />
            </div>

            <section className="mt-8 rounded-md border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-black">Clube nacional de beneficios</h2>
                <Sparkles className="text-emerald-300" size={20} />
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                {(benefits.data || []).slice(0, 8).map(item => (
                  <article key={item.id} className="rounded-md border border-white/10 bg-slate-900/70 p-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-300">{item.city || item.region || "Nacional"}{item.state ? `/${item.state}` : ""}</div>
                    <h3 className="mt-2 text-base font-black">{item.name}</h3>
                    <p className="mt-1 text-sm text-slate-400">{item.tenantName}</p>
                    <div className="mt-3 text-2xl font-black">{item.monthlyPrice === 0 ? "Gratis" : item.monthlyPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</div>
                    <div className="mt-3 space-y-2">
                      {item.benefits.slice(0, 3).map((benefit, index) => (
                        <div key={`${item.id}-${index}`} className="text-sm text-slate-300">- {benefit}</div>
                      ))}
                    </div>
                    <div className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                      {formatNumber(item.subscribers)} assinantes{item.shopDiscount ? ` - ${item.shopDiscount}% loja` : ""}
                    </div>
                  </article>
                ))}
                {benefits.isFetched && (benefits.data?.length || 0) === 0 && (
                  <div className="rounded-md border border-dashed border-white/15 p-4 text-sm text-slate-400">Nenhum beneficio publicado para este filtro.</div>
                )}
              </div>
            </section>

            <section className="mt-8 rounded-md border border-white/10 bg-white/[0.03] p-5">
              <h2 className="text-xl font-black">Distribuicao por regiao</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-5">
                {(indicators.data?.byRegion || []).map(region => (
                  <div key={region.region} className="rounded-md bg-white/5 p-4">
                    <div className="text-sm font-bold text-slate-300">{region.region}</div>
                    <div className="mt-2 text-2xl font-black">{formatNumber(region.equipments)}</div>
                    <div className="text-xs uppercase text-slate-500">equipamentos</div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </section>
    </main>
  );
};

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value?: number }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center justify-between text-emerald-300">
        {icon}
        <ShieldCheck size={16} />
      </div>
      <div className="mt-5 text-2xl font-black">{formatNumber(value)}</div>
      <div className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-400">{label}</div>
    </div>
  );
}

function ListPanel({ title, items }: { title: string; items: Array<{ id: string; title: string; subtitle: string }> }) {
  return (
    <section className="rounded-md border border-white/10 bg-white/[0.03] p-5">
      <h2 className="text-xl font-black">{title}</h2>
      <div className="mt-4 space-y-3">
        {items.map(item => (
          <div key={item.id} className="rounded-md bg-white/5 p-4">
            <div className="font-bold">{item.title}</div>
            <div className="mt-1 text-sm text-slate-400">{item.subtitle}</div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="rounded-md border border-dashed border-white/15 p-4 text-sm text-slate-400">Sem registros publicados.</div>
        )}
      </div>
    </section>
  );
}
