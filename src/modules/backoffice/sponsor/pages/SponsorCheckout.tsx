import { useEffect, useState } from 'react';
import { logger } from "@/utils/logger";

import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../../../api/client';

const Button = ({ children, className, onClick }: unknown) => (
  <button className={className} onClick={onClick}>{children}</button>
);

export function SponsorCheckout() {
  const { t } = useTranslation();
  const { workId } = useParams();
  const [form, setForm] = useState({ sponsorName: '', sponsorEmail: '', sponsorCNPJ: '', tier: 'SHARED', sponsorLogo: '', sponsorUrl: '' });
  const [prices, setPrices] = useState({ exclusivePrice: 500, sharedPrice: 250 });

  useEffect(() => {
    if (workId) {
      api.get(`/sponsor-portal/pricing?workId=${workId}`)
        .then((res: unknown) => setPrices(res.data))
        .catch(console.error);
    }
  }, [workId]);

  const handleSubscribe = async () => {
    try {
      const res = await api.post('/sponsor-portal/subscribe', { ...form, workId });
      window.location.href = res.data.checkoutUrl;
    } catch (err) {
      logger.warn("Alert:", t("sponsor.checkout.error", "Erro ao gerar checkout"));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-xl">
        <h1 className="text-3xl font-black text-gold-400 mb-8">{t("sponsor.checkout.title", "Assinar Patrocínio")}</h1>
        <div className="space-y-4">
          <input 
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-4 min-h-[44px] text-base" 
            placeholder={t("sponsor.checkout.name_placeholder", "Nome do Patrocinador / Empresa")} 
            value={form.sponsorName} 
            onChange={e => setForm({...form, sponsorName: e.target.value})} 
          />
          <input 
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-4 min-h-[44px] text-base" 
            placeholder={t("sponsor.checkout.email_placeholder", "E-mail")} 
            value={form.sponsorEmail} 
            onChange={e => setForm({...form, sponsorEmail: e.target.value})} 
          />
          <input 
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-4 min-h-[44px] text-base" 
            placeholder={t("sponsor.checkout.cnpj_placeholder", "CNPJ")} 
            value={form.sponsorCNPJ} 
            onChange={e => setForm({...form, sponsorCNPJ: e.target.value})} 
          />
          <input 
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-4 min-h-[44px] text-base" 
            placeholder={t("sponsor.checkout.logo_placeholder", "URL da Logomarca (Opcional, formato JPG/PNG)")} 
            value={form.sponsorLogo} 
            onChange={e => setForm({...form, sponsorLogo: e.target.value})} 
          />
          <input 
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-4 min-h-[44px] text-base" 
            placeholder={t("sponsor.checkout.url_placeholder", "URL do seu Site (Opcional)")} 
            value={form.sponsorUrl} 
            onChange={e => setForm({...form, sponsorUrl: e.target.value})} 
          />
          <select 
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-4 min-h-[44px] text-base text-white" 
            value={form.tier} 
            onChange={e => setForm({...form, tier: e.target.value})}
          >
            <option value="SHARED">{t("sponsor.checkout.tier_shared", "Patrocínio Compartilhado (R$ {{price}}/mês)", { price: prices.sharedPrice })}</option>
            <option value="EXCLUSIVE">{t("sponsor.checkout.tier_exclusive", "Patrocínio Exclusivo (R$ {{price}}/mês)", { price: prices.exclusivePrice })}</option>
          </select>
          <Button className="w-full bg-gold-500 text-slate-900 font-bold h-12 rounded-lg mt-4" onClick={handleSubscribe}>{t("sponsor.checkout.pay_btn", "Ir para Pagamento")}</Button>
        </div>
      </div>
    </div>
  );
}
