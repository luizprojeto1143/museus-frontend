import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Button = ({ children, className, onClick }: unknown) => (
  <button className={className} onClick={onClick}>{children}</button>
);

export function SponsorLanding() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-black text-gold-400 mb-6">{t("sponsor.landing.title", "Portal de Patrocínios")}</h1>
      <p className="text-lg text-slate-300 max-w-2xl text-center mb-8">
        {t("sponsor.landing.subtitle", "Apoie a cultura viva da sua cidade. Patrocine obras de arte, exposições e peças teatrais para ganhar visibilidade para sua marca.")}
      </p>
      <div className="flex gap-4">
        <Link to="/patrocinar/obras">
          <Button className="bg-gold-500 text-slate-900 font-bold px-8 py-4 rounded-xl">{t("sponsor.landing.explore", "Explorar Obras")}</Button>
        </Link>
      </div>
    </div>
  );
}
