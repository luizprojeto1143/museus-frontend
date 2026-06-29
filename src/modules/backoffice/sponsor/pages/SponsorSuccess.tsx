import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Button = ({ children, className, onClick }: unknown) => (
  <button className={className} onClick={onClick}>{children}</button>
);

export function SponsorSuccess() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-black text-emerald-400 mb-6">{t("sponsor.success.title", "Patrocínio Confirmado!")}</h1>
      <p className="text-lg text-slate-300 max-w-md text-center mb-8">
        {t("sponsor.success.subtitle", "Obrigado por apoiar a cultura. Sua marca agora ganhará destaque na obra patrocinada!")}
      </p>
      <Link to="/patrocinar/dashboard">
        <Button className="bg-gold-500 text-slate-900 font-bold px-8 py-4 rounded-xl">{t("sponsor.success.dashboard_btn", "Acessar Painel")}</Button>
      </Link>
    </div>
  );
}
