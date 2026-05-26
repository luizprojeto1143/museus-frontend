import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../api/client';
// Fallback for button if it doesn't exist
const Button = ({ children, className, onClick }: any) => (
  <button className={className} onClick={onClick}>{children}</button>
);

export function SponsorLanding() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-black text-gold-400 mb-6">Portal de Patrocínios</h1>
      <p className="text-lg text-slate-300 max-w-2xl text-center mb-8">
        Apoie a cultura viva da sua cidade. Patrocine obras de arte, exposições e peças teatrais para ganhar visibilidade para sua marca.
      </p>
      <div className="flex gap-4">
        <Link to="/patrocinar/obras">
          <Button className="bg-gold-500 text-slate-900 font-bold px-8 py-4 rounded-xl">Explorar Obras</Button>
        </Link>
      </div>
    </div>
  );
}

export function SponsorBrowseWorks() {
  const [works, setWorks] = useState<any[]>([]);

  useEffect(() => {
    api.get('/sponsor-portal/works').then((res: any) => setWorks(res.data));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-3xl font-black text-gold-400 mb-8">Obras Disponíveis para Patrocínio</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {works.map(w => (
          <div key={w.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            {w.imageUrl && <img src={w.imageUrl} alt={w.title} className="w-full h-48 object-cover rounded-lg mb-4" />}
            <h2 className="text-xl font-bold">{w.title}</h2>
            <p className="text-sm text-slate-400 mb-4">{w.tenantName}</p>
            {w.hasExclusiveSponsor ? (
              <span className="bg-rose-500/20 text-rose-400 px-3 py-1 rounded-full text-xs">Patrocínio Exclusivo Ativo</span>
            ) : (
              <Link to={`/patrocinar/checkout/${w.id}`}>
                <Button className="w-full bg-gold-500 text-slate-900 py-2 rounded-lg mt-4 font-bold">Patrocinar</Button>
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SponsorCheckout() {
  const { workId } = useParams();
  const [form, setForm] = useState({ sponsorName: '', sponsorEmail: '', sponsorCNPJ: '', tier: 'SHARED', sponsorLogo: '', sponsorUrl: '' });
  const [prices, setPrices] = useState({ exclusivePrice: 500, sharedPrice: 250 });

  useEffect(() => {
    if (workId) {
      api.get(`/sponsor-portal/pricing?workId=${workId}`)
        .then((res: any) => setPrices(res.data))
        .catch(console.error);
    }
  }, [workId]);

  const handleSubscribe = async () => {
    try {
      const res = await api.post('/sponsor-portal/subscribe', { ...form, workId });
      window.location.href = res.data.checkoutUrl;
    } catch (err) {
      alert("Erro ao gerar checkout");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 flex flex-col items-center">
      <div className="w-full max-w-xl">
        <h1 className="text-3xl font-black text-gold-400 mb-8">Assinar Patrocínio</h1>
        <div className="space-y-4">
          <input 
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3" 
            placeholder="Nome do Patrocinador / Empresa" 
            value={form.sponsorName} 
            onChange={e => setForm({...form, sponsorName: e.target.value})} 
          />
          <input 
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3" 
            placeholder="E-mail" 
            value={form.sponsorEmail} 
            onChange={e => setForm({...form, sponsorEmail: e.target.value})} 
          />
          <input 
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3" 
            placeholder="CNPJ" 
            value={form.sponsorCNPJ} 
            onChange={e => setForm({...form, sponsorCNPJ: e.target.value})} 
          />
          <input 
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3" 
            placeholder="URL da Logomarca (Opcional, formato JPG/PNG)" 
            value={form.sponsorLogo} 
            onChange={e => setForm({...form, sponsorLogo: e.target.value})} 
          />
          <input 
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3" 
            placeholder="URL do seu Site (Opcional)" 
            value={form.sponsorUrl} 
            onChange={e => setForm({...form, sponsorUrl: e.target.value})} 
          />
          <select 
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-white" 
            value={form.tier} 
            onChange={e => setForm({...form, tier: e.target.value})}
          >
            <option value="SHARED">Patrocínio Compartilhado (R$ {prices.sharedPrice}/mês)</option>
            <option value="EXCLUSIVE">Patrocínio Exclusivo (R$ {prices.exclusivePrice}/mês)</option>
          </select>
          <Button className="w-full bg-gold-500 text-slate-900 font-bold h-12 rounded-lg mt-4" onClick={handleSubscribe}>Ir para Pagamento</Button>
        </div>
      </div>
    </div>
  );
}

export function SponsorSuccess() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-black text-emerald-400 mb-6">Patrocínio Confirmado!</h1>
      <p className="text-lg text-slate-300 max-w-md text-center mb-8">
        Obrigado por apoiar a cultura. Sua marca agora ganhará destaque na obra patrocinada!
      </p>
      <Link to="/patrocinar/dashboard">
        <Button className="bg-gold-500 text-slate-900 font-bold px-8 py-4 rounded-xl">Acessar Painel</Button>
      </Link>
    </div>
  );
}

export function SponsorDashboard() {
  const [sponsorships, setSponsorships] = useState<any[]>([]);

  useEffect(() => {
    api.get('/sponsor-portal/my-sponsorships').then((res: any) => setSponsorships(res.data));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-3xl font-black text-gold-400 mb-8">Meu Painel de Patrocínios</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sponsorships.map(s => (
          <div key={s.id} className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">{s.work.title}</h2>
              <p className="text-sm text-slate-400 mt-1">Status: <span className="text-emerald-400">{s.status}</span></p>
              <p className="text-sm text-slate-400 mt-1">Plano: {s.tier}</p>
            </div>
            <Button 
              className="bg-rose-500/20 text-rose-400 px-4 py-2 rounded-lg font-bold"
              onClick={async () => {
                if (window.confirm("Deseja cancelar o patrocínio?")) {
                  await api.delete(`/sponsor-portal/${s.id}/cancel`);
                  window.location.reload();
                }
              }}
            >
              Cancelar
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
