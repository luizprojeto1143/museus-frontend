import { useEffect, useState } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { logger } from "@/utils/logger";
import { z } from "zod";
import { toast } from "react-hot-toast";

import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../../../api/client';

const sponsorCheckoutSchema = z.object({
  sponsorName: z.string().trim().min(2, "Informe o nome do patrocinador."),
  sponsorEmail: z.string().trim().email("Informe um e-mail valido."),
  sponsorCNPJ: z.string().trim().min(14, "Informe um CNPJ valido."),
  tier: z.enum(["SHARED", "EXCLUSIVE"]),
  sponsorLogo: z.string().trim().url("Informe uma URL valida para a logomarca.").or(z.literal("")),
  sponsorUrl: z.string().trim().url("Informe uma URL valida para o site.").or(z.literal(""))
});

type SponsorshipTier = 'SHARED' | 'EXCLUSIVE';

interface SponsorForm {
  sponsorName: string;
  sponsorEmail: string;
  sponsorCNPJ: string;
  tier: SponsorshipTier;
  sponsorLogo: string;
  sponsorUrl: string;
}

interface SponsorshipAvailability {
  hasExclusiveSponsor: boolean;
  sharedSponsorsCount: number;
  maxSharedSponsors: number;
  sharedSlotsAvailable: number;
  canSponsorShared: boolean;
  canSponsorExclusive: boolean;
}

interface PricingResponse {
  exclusivePrice: number;
  sharedPrice: number;
  availability: SponsorshipAvailability | null;
  maxSharedSponsors: number;
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

const Button = ({ children, className, ...props }: ButtonProps) => (
  <button className={className} {...props}>{children}</button>
);

export function SponsorCheckout() {
  const { t } = useTranslation();
  const { workId } = useParams();
  const [form, setForm] = useState<SponsorForm>({ sponsorName: '', sponsorEmail: '', sponsorCNPJ: '', tier: 'SHARED', sponsorLogo: '', sponsorUrl: '' });
  const [prices, setPrices] = useState<PricingResponse>({ exclusivePrice: 500, sharedPrice: 250, availability: null, maxSharedSponsors: 10 });

  useEffect(() => {
    if (workId) {
      api.get<PricingResponse>(`/sponsor-portal/pricing?workId=${workId}`)
        .then((res) => setPrices(res.data))
        .catch(console.error);
    }
  }, [workId]);

  const availability = prices.availability;
  const canSponsorShared = availability?.canSponsorShared !== false;
  const canSponsorExclusive = availability?.canSponsorExclusive !== false;

  const handleSubscribe = async () => {
    const parsed = sponsorCheckoutSchema.safeParse(form);
    if (!parsed.success) {
      logger.warn("Sponsor checkout validation:", parsed.error.issues);
      toast.error(parsed.error.issues[0]?.message || "Revise os dados do patrocinio.");
      return;
    }

    try {
      const res = await api.post<{ checkoutUrl: string }>('/sponsor-portal/subscribe', { ...parsed.data, workId });
      window.location.href = res.data.checkoutUrl;
    } catch (_err) {
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
            onChange={e => setForm({...form, tier: e.target.value as SponsorshipTier})}
          >
            <option value="SHARED" disabled={!canSponsorShared}>{t("sponsor.checkout.tier_shared", "Patrocínio Compartilhado (R$ {{price}}/mês)", { price: prices.sharedPrice })}</option>
            <option value="EXCLUSIVE" disabled={!canSponsorExclusive}>{t("sponsor.checkout.tier_exclusive", "Patrocínio Exclusivo (R$ {{price}}/mês)", { price: prices.exclusivePrice })}</option>
          </select>
          <p className="text-xs text-slate-400">
            {availability?.hasExclusiveSponsor
              ? "Esta obra ja possui uma cota exclusiva reservada."
              : `${availability?.sharedSlotsAvailable ?? prices.maxSharedSponsors} de ${prices.maxSharedSponsors} cotas compartilhadas disponiveis.`}
          </p>
          <Button className="w-full bg-gold-500 text-slate-900 font-bold h-12 rounded-lg mt-4" onClick={handleSubscribe}>{t("sponsor.checkout.pay_btn", "Ir para Pagamento")}</Button>
        </div>
      </div>
    </div>
  );
}
