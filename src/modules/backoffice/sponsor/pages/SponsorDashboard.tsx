import { useEffect, useState } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../../../../api/client';

interface WorkSponsorship {
  id: string;
  status: string;
  tier: string;
  work: {
    id: string;
    title: string;
    imageUrl?: string | null;
  };
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

const Button = ({ children, className, ...props }: ButtonProps) => (
  <button className={className} {...props}>{children}</button>
);

export function SponsorDashboard() {
  const { t } = useTranslation();
  const [sponsorships, setSponsorships] = useState<WorkSponsorship[]>([]);
  const [sponsorshipToCancel, setSponsorshipToCancel] = useState<WorkSponsorship | null>(null);

  useEffect(() => {
    api.get<WorkSponsorship[]>('/sponsor-portal/my-work-sponsorships').then((res) => {
      setSponsorships(Array.isArray(res.data) ? res.data : []);
    });
  }, []);

  const handleCancel = async (sponsorship: WorkSponsorship) => {
    await api.delete(`/sponsor-portal/${sponsorship.id}/cancel`);
    setSponsorships((current) => current.filter((item) => item.id !== sponsorship.id));
    setSponsorshipToCancel(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-3xl font-black text-gold-400 mb-8">{t("sponsor.dashboard.title", "Meu Painel de Patrocinios")}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sponsorships.map((s) => (
          <div key={s.id} className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">{s.work.title}</h2>
              <p className="text-sm text-slate-400 mt-1">{t("sponsor.dashboard.status", "Status:")} <span className="text-emerald-400">{s.status}</span></p>
              <p className="text-sm text-slate-400 mt-1">{t("sponsor.dashboard.tier", "Plano:")} {s.tier}</p>
            </div>
            <Button
              className="bg-rose-500/20 text-rose-400 px-4 py-2 rounded-lg font-bold"
              onClick={() => setSponsorshipToCancel(s)}
            >
              {t("sponsor.dashboard.cancel_btn", "Cancelar")}
            </Button>
          </div>
        ))}
      </div>

      {sponsorshipToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6">
          <div className="w-full max-w-md rounded-2xl border border-rose-500/30 bg-slate-900 p-6 shadow-2xl">
            <h2 className="text-xl font-black text-white mb-3">
              {t("sponsor.dashboard.cancel_title", "Cancelar patrocinio")}
            </h2>
            <p className="text-sm text-slate-300 mb-6">
              {t("sponsor.dashboard.cancel_confirm", "Deseja cancelar o patrocinio?")} {sponsorshipToCancel.work.title}
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-bold"
                onClick={() => setSponsorshipToCancel(null)}
              >
                {t("common.cancel", "Cancelar")}
              </Button>
              <Button
                className="px-4 py-2 rounded-lg bg-rose-600 text-white font-bold"
                onClick={() => void handleCancel(sponsorshipToCancel)}
              >
                {t("common.confirm", "Confirmar")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}