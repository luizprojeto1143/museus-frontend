import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../../../api/client';

const Button = ({ children, className, onClick }: unknown) => (
  <button className={className} onClick={onClick}>{children}</button>
);

export function SponsorDashboard() {
  const { t } = useTranslation();
  const [sponsorships, setSponsorships] = useState<any[]>([]);

  useEffect(() => {
    api.get('/sponsor-portal/my-sponsorships').then((res: unknown) => setSponsorships(res.data));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-3xl font-black text-gold-400 mb-8">{t("sponsor.dashboard.title", "Meu Painel de Patrocínios")}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sponsorships.map(s => (
          <div key={s.id} className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">{s.work.title}</h2>
              <p className="text-sm text-slate-400 mt-1">{t("sponsor.dashboard.status", "Status:")} <span className="text-emerald-400">{s.status}</span></p>
              <p className="text-sm text-slate-400 mt-1">{t("sponsor.dashboard.tier", "Plano:")} {s.tier}</p>
            </div>
            <Button 
              className="bg-rose-500/20 text-rose-400 px-4 py-2 rounded-lg font-bold"
              onClick={async () => {
                if (window.confirm(t("sponsor.dashboard.cancel_confirm", "Deseja cancelar o patrocínio?"))) {
                  await api.delete(`/sponsor-portal/${s.id}/cancel`);
                  window.location.reload();
                }
              }}
            >
              {t("sponsor.dashboard.cancel_btn", "Cancelar")}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
