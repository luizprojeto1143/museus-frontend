import React from 'react';
import type { TFunction } from 'i18next';
import type { Terminology } from '../../../hooks/useTerminology';
import { buildEquipmentUrl, buildMuseumMapUrl, buildScannerUrl } from '@/utils/routes';
import { readMuseumCtx } from '@/config/golive';

export interface NavLink {
  to: string;
  label: string;
  icon: React.ReactNode;
  feature: string | null;
}

export const getVisitorLinks = (t: TFunction, term: Terminology, _isCityMode: boolean): NavLink[] => {
  const _t = (key: string, fallback?: string) => t(key, fallback || key);
  const ctx = readMuseumCtx();
  const base = ctx ? buildEquipmentUrl(ctx.citySlug, ctx.equipmentSlug) : null;
  return [
    { to: base || "/hub", label: _t("visitor.sidebar.home", "Início"), icon: "🏠", feature: null },
    { to: base ? `${base}/obras` : "/select-museum", label: term.works, icon: "🎨", feature: "featureWorks" },
    { to: base ? `${base}/eventos` : "/select-museum", label: _t("visitor.sidebar.events"), icon: "📅", feature: "featureEvents" },
    { to: base ? `${base}/trilhas` : "/select-museum", label: term.trails, icon: "🗺️", feature: "featureTrails" },
    { to: ctx ? buildMuseumMapUrl(ctx.citySlug, ctx.equipmentSlug) : "/select-museum", label: _t("visitor.sidebar.map", "Mapa"), icon: "📍", feature: null },
    { to: ctx ? buildScannerUrl(ctx.citySlug, ctx.equipmentSlug) : "/scanner", label: _t("visitor.sidebar.scanner", "Scanner"), icon: "📷", feature: "featureQRCodes" },
    { to: "/passaporte", label: "Passaporte", icon: "🎫", feature: null },
    { to: "/meus-ingressos", label: "Meus Ingressos", icon: "🎫", feature: null },
    { to: "/favoritos", label: _t("visitor.sidebar.favorites", "Favoritos"), icon: "❤️", feature: "featureReviews" },
    { to: "/meus-certificados", label: "Meus Certificados", icon: "🏅", feature: "featureCertificates" },
    { to: "/perfil", label: _t("visitor.sidebar.profile"), icon: "👤", feature: null },
  ];
};
