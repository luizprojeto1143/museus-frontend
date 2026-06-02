import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../../api/client';

const Button = ({ children, className, onClick }: any) => (
  <button className={className} onClick={onClick}>{children}</button>
);

export function SponsorBrowseWorks() {
  const { t } = useTranslation();
  const [works, setWorks] = useState<any[]>([]);

  useEffect(() => {
    api.get('/sponsor-portal/works').then((res: any) => setWorks(res.data));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-3xl font-black text-gold-400 mb-8">{t("sponsor.browse.title", "Obras Disponíveis para Patrocínio")}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {works.map(w => (
          <div key={w.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            {w.imageUrl && <img src={w.imageUrl} alt={w.title} className="w-full h-48 object-cover rounded-lg mb-4" />}
            <h2 className="text-xl font-bold">{w.title}</h2>
            <p className="text-sm text-slate-400 mb-4">{w.tenantName}</p>
            {w.hasExclusiveSponsor ? (
              <span className="bg-rose-500/20 text-rose-400 px-3 py-1 rounded-full text-xs">{t("sponsor.browse.exclusive_active", "Patrocínio Exclusivo Ativo")}</span>
            ) : (
              <Link to={`/patrocinar/checkout/${w.id}`}>
                <Button className="w-full bg-gold-500 text-slate-900 py-2 rounded-lg mt-4 font-bold">{t("sponsor.browse.sponsor_btn", "Patrocinar")}</Button>
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
